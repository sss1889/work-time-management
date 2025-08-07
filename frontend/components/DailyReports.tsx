
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FormField } from './ui/form-field';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { EmptyState } from './ui/empty-state';
import { ErrorState } from './ui/error-state';
import { 
  Calendar, 
  User, 
  Search, 
  Filter, 
  Download,
  Grid3X3,
  List,
  FileText
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DailyReport {
  id: string;
  user_name: string;
  date: string;
  report: string;
  created_at?: string;
}

const DailyReports: React.FC = () => {
  const { dailyReports, fetchDailyReports, loading, error } = useContext(DataContext);
  const { user: currentUser } = useContext(AuthContext);
  
  // フィルタリング・ソート状態
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'user'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDailyReports();
  }, [fetchDailyReports]);

  // データ構造の確認（開発時のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (dailyReports.length > 0) {
        console.log('Daily Reports Sample:', dailyReports[0]);
      }
    }
  }, [dailyReports]);

  // ユーザー一覧の抽出
  const uniqueUsers = useMemo(() => {
    const users = dailyReports.map((report: DailyReport) => report.user_name);
    return [...new Set(users)];
  }, [dailyReports]);

  // フィルタリング・ソート処理
  const filteredAndSortedReports = useMemo(() => {
    let filtered = [...dailyReports] as DailyReport[];
    
    // 検索クエリでフィルタリング
    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.report.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.user_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // ユーザーでフィルタリング
    if (selectedUser !== 'all') {
      filtered = filtered.filter(report => report.user_name === selectedUser);
    }
    
    // 日付でフィルタリング
    if (selectedDate) {
      filtered = filtered.filter(report => {
        // YYYY-MM-DD形式に正規化して比較
        const reportDate = report.date.split('T')[0]; // ISO文字列の場合の時間部分を除去
        return reportDate === selectedDate;
      });
    }
    
    // ソート処理
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === 'desc' 
          ? b.user_name.localeCompare(a.user_name)
          : a.user_name.localeCompare(b.user_name);
      }
    });
    
    return filtered;
  }, [dailyReports, searchQuery, selectedUser, selectedDate, sortBy, sortOrder]);


  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    try {
      // YYYY-MM-DD形式の場合とISO形式の両方に対応
      const cleanDateString = dateString.split('T')[0]; // ISO文字列の場合の時間部分を除去
      const date = parseISO(cleanDateString);
      if (isValid(date)) {
        return format(date, 'M月d日(E)', { locale: ja });
      }
    } catch (error) {
      console.warn('Date parsing failed:', dateString, error);
    }
    // フォールバック: 元の文字列をそのまま表示
    return dateString.split('T')[0];
  };

  // CSVエクスポート
  const exportToCSV = () => {
    const headers = ['日付', 'ユーザー名', '日報'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedReports.map(report => {
        return [
          report.date.split('T')[0], // 日付のみ
          report.user_name,
          `"${report.report.replace(/"/g, '""')}"` // CSVエスケープ
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `日報一覧_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // スケルトンローディング
  const SkeletonCard = () => (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 skeleton"></div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded skeleton"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded skeleton"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded skeleton"></div>
            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded skeleton"></div>
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded skeleton"></div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-foreground">日報一覧</h1>
          <p className="text-muted-foreground mt-1">
            {filteredAndSortedReports.length}件の日報が見つかりました
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="animate-slide-up animate-stagger-1"
          >
            <Filter className="h-4 w-4 mr-2" />
            フィルター
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={filteredAndSortedReports.length === 0}
            className="animate-slide-up animate-stagger-2"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV出力
          </Button>
          
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="px-3"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* フィルターパネル */}
      {showFilters && (
        <Card className="p-6 mb-6 animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField
              label="検索"
              id="search"
              type="text"
              placeholder="キーワードで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">ユーザー</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="all">全てのユーザー</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
            
            <FormField
              label="日付"
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">並び順</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'user')}
                >
                  <option value="date">日付順</option>
                  <option value="user">ユーザー順</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </Button>
              </div>
            </div>
          </div>
          
          {/* フィルターリセット */}
          {(searchQuery || selectedUser !== 'all' || selectedDate) && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedUser('all');
                  setSelectedDate('');
                }}
              >
                フィルターをリセット
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* コンテンツ */}
      {error ? (
        <ErrorState
          title="日報の読み込みに失敗しました"
          description="ネットワーク接続を確認して、もう一度お試しください。"
          error={error}
          onRetry={fetchDailyReports}
        />
      ) : loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredAndSortedReports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="日報が見つかりません"
          description={searchQuery || selectedUser !== 'all' || selectedDate 
            ? 'フィルター条件を変更してみてください。'
            : 'まだ日報が提出されていません。'
          }
          action={searchQuery || selectedUser !== 'all' || selectedDate ? {
            label: 'フィルターをリセット',
            onClick: () => {
              setSearchQuery('');
              setSelectedUser('all');
              setSelectedDate('');
            }
          } : undefined}
        />
      ) : (
        <div className={viewMode === 'card' ? 'space-y-6' : 'space-y-2'}>
          {filteredAndSortedReports.map((report: DailyReport, index) => {
            return viewMode === 'card' ? (
              <Card key={report.id} className={`p-6 animate-slide-up animate-stagger-${Math.min(index + 1, 4)}`}>
                <div className="flex items-start gap-4">
                  {/* アバター */}
                  <Avatar className="border-2 border-background shadow-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {report.user_name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    {/* ヘッダー情報 */}
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-foreground">{report.user_name}</h3>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(report.date)}
                      </Badge>
                    </div>
                    
                    {/* 日報内容 */}
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {report.report}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              /* リスト表示 */
              <Card key={report.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {report.user_name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="font-medium text-foreground truncate">
                      {report.user_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(report.date)}
                    </div>
                    <div className="text-sm text-foreground truncate">
                      {report.report.length > 50 
                        ? `${report.report.substring(0, 50)}...`
                        : report.report
                      }
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyReports;
