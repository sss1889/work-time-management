import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { useTheme } from 'next-themes';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Monitor,
  Save,
  Check,
  Globe,
  Clock,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { changePassword } = useContext(DataContext);
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('ja');
  const [timezone, setTimezone] = useState('Asia/Tokyo');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Password change modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setHasChanges(true);
  };

  const handleNotificationToggle = () => {
    setNotifications(!notifications);
    setHasChanges(true);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setHasChanges(true);
  };

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
    setHasChanges(true);
  };

  const handleSave = () => {
    // Here you would typically save settings to backend/localStorage
    toast.success('設定を保存しました');
    setHasChanges(false);
  };

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = (themeName: string) => {
    switch (themeName) {
      case 'light': return 'ライト';
      case 'dark': return 'ダーク';
      default: return 'システム';
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('新しいパスワードが一致しません');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('パスワードは6文字以上で入力してください');
      return;
    }
    
    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('パスワードを変更しました');
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'パスワード変更に失敗しました');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Settings Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-foreground">設定</h1>
          <p className="text-muted-foreground mt-1">
            アプリケーションの設定をカスタマイズできます
          </p>
        </div>
        
        {hasChanges && (
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            変更を保存
          </Button>
        )}
      </div>

      {/* Appearance Settings */}
      <Card className="animate-slide-up animate-stagger-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            外観設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">テーマ</Label>
            <div className="grid grid-cols-3 gap-3">
              {['light', 'dark', 'system'].map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => handleThemeChange(themeName)}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border transition-all
                    ${theme === themeName 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }
                  `}
                >
                  {getThemeIcon(themeName)}
                  <span className="text-sm font-medium">
                    {getThemeLabel(themeName)}
                  </span>
                  {theme === themeName && (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              システムを選択すると、デバイスの設定に従います
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="animate-slide-up animate-stagger-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            通知設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium">デスクトップ通知</Label>
              <p className="text-xs text-muted-foreground">
                勤怠記録やリマインダーの通知を受け取る
              </p>
            </div>
            <Button
              variant={notifications ? "default" : "outline"}
              size="sm"
              onClick={handleNotificationToggle}
            >
              {notifications ? "ON" : "OFF"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card className="animate-slide-up animate-stagger-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            地域設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                言語
              </Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                タイムゾーン
              </Label>
              <Select value={timezone} onValueChange={handleTimezoneChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Tokyo">東京 (UTC+9)</SelectItem>
                  <SelectItem value="Asia/Seoul">ソウル (UTC+9)</SelectItem>
                  <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                  <SelectItem value="America/New_York">ニューヨーク (UTC-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account & Security */}
      <Card className="animate-slide-up animate-stagger-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            アカウント・セキュリティ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                アカウント種別
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant={user?.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {user?.role === 'ADMIN' ? '管理者アカウント' : '一般ユーザー'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                最終ログイン
              </Label>
              <p className="text-sm">
                {new Date().toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Lock className="h-4 w-4 mr-2" />
                  パスワードを変更
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>パスワードの変更</DialogTitle>
                  <DialogDescription>
                    現在のパスワードと新しいパスワードを入力してください
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">現在のパスワード</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="現在のパスワードを入力"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">新しいパスワード</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="新しいパスワードを入力 (6文字以上)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="新しいパスワードを再入力"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setPasswordModalOpen(false)}
                    disabled={passwordLoading}
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={!currentPassword || !newPassword || !confirmPassword || passwordLoading}
                  >
                    {passwordLoading ? '変更中...' : 'パスワードを変更'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="animate-slide-up animate-stagger-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            システム情報
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">アプリバージョン</Label>
              <p className="font-mono">v1.0.0</p>
            </div>
            <div>
              <Label className="text-muted-foreground">最終更新</Label>
              <p>2025年1月</p>
            </div>
            <div>
              <Label className="text-muted-foreground">データベース</Label>
              <p className="text-green-600 dark:text-green-400">接続済み</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;