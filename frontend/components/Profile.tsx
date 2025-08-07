import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { FormField } from './ui/form-field';
import { useFormValidation, ValidationRule } from '../hooks/useFormValidation';
import { User, Mail, Crown, Calendar, Target, Save } from 'lucide-react';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { updateUser } = useContext(DataContext);
  const [isEditing, setIsEditing] = useState(false);
  
  const goalValidationRules: ValidationRule[] = [
    { type: 'min', value: 0, message: '目標は0以上で入力してください' },
    { type: 'max', value: 10000000, message: '目標は10,000,000円以下で入力してください' }
  ];

  const {
    values: formData,
    errors,
    setValues: setFormData,
    validateField,
    validateAll,
    resetValidation
  } = useFormValidation({
    goal: user?.goal || 0
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({ goal: user?.goal || 0 });
    resetValidation();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ goal: user?.goal || 0 });
    resetValidation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalError = validateField('goal', formData.goal, goalValidationRules);
    if (goalError) return;
    
    if (!validateAll()) return;

    try {
      if (user) {
        await updateUser({ ...user, goal: Number(formData.goal) });
        toast.success('プロフィールを更新しました');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('プロフィールの更新に失敗しました');
    }
  };

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
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">プロフィール</CardTitle>
            {!isEditing && (
              <Button onClick={handleEdit} variant="outline">
                編集
              </Button>
            )}
          </div>
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
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="月間目標収入"
                id="goal"
                type="number"
                value={formData.goal}
                onChange={(e) => setFormData({ goal: Number(e.target.value) })}
                onBlur={() => validateField('goal', formData.goal, goalValidationRules)}
                error={errors.goal}
                placeholder="例: 300000"
                suffix="円"
              />
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  キャンセル
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
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
                <p className="text-sm text-muted-foreground">
                  月間目標収入を設定して、進捗を追跡しましょう。
                </p>
              )}
            </div>
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