import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, Mail, Crown, Calendar, Target, Lock } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useContext(AuthContext);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ユーザー情報を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Profile Header */}
      <Card className="animate-slide-up">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">プロフィール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {user.name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-foreground">{user.name}</h2>
                {user.role === 'ADMIN' && (
                  <Badge variant="secondary">
                    <Crown className="h-3 w-3 mr-1" />
                    管理者
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                
                {user.createdAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>登録日: {formatDate(user.createdAt)}</span>
                  </div>
                )}
                
                {user.updatedAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>最終更新: {formatDate(user.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Setting */}
      <Card className="animate-slide-up animate-stagger-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            目標設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                月間目標収入
              </Label>
              <p className="text-2xl font-bold text-foreground">
                {user.goal ? new Intl.NumberFormat('ja-JP').format(user.goal) : 0} 円
              </p>
            </div>
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          
          {!user.goal && (
            <p className="text-sm text-muted-foreground mt-4">
              月間目標収入は管理者が設定します。
            </p>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="animate-slide-up animate-stagger-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            アカウント情報
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                ユーザーID
              </Label>
              <p className="text-sm font-mono bg-muted/30 px-3 py-2 rounded">
                {user.id}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                権限レベル
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {user.role === 'ADMIN' ? '管理者' : 'ユーザー'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                給与形態
              </Label>
              <p className="text-sm">
                {user.payType === 'HOURLY' ? '時給制' : '月給制'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                給与レート
              </Label>
              <p className="text-sm">
                {new Intl.NumberFormat('ja-JP').format(user.payRate)} JPY / {user.payType === 'HOURLY' ? '時間' : '月'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;