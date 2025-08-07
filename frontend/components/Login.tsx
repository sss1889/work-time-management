
import React, { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { toast } from 'sonner';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { FormField } from './ui/form-field';
import { useFormValidation } from '../hooks/useFormValidation';
import { validateEmail, validatePassword } from '../lib/validation';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // バリデーションルールの定義
  const validationRules = useMemo(() => ({
    email: (value: string) => validateEmail(value),
    password: (value: string) => validatePassword(value)
  }), []);

  const {
    formState,
    updateField,
    validateAll,
    getValues,
    isFormValid
  } = useFormValidation(
    {
      email: 'admin@example.com',
      password: 'admin123'
    },
    validationRules
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // フォーム全体をバリデート
    validateAll();
    
    if (!isFormValid) {
      toast.error('入力内容に問題があります', {
        description: '赤色で表示されているエラーを修正してください',
      });
      setLoading(false);
      return;
    }

    try {
      const values = getValues();
      await login(values.email, values.password);
      toast.success('ログインに成功しました');
      navigate('/');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'メールアドレスまたはパスワードが間違っています。';
      toast.error('ログインに失敗しました', {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background animate-fade-in">
      <Card className="w-full max-w-md m-4 animate-scale-in">
        <CardContent className="p-8">
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-2xl font-bold">StarUp勤怠管理システム</h1>
          <p className="text-muted-foreground">アカウントにログインしてください</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="メールアドレス"
            id="email"
            type="email"
            value={formState.email.value}
            onChange={(e) => updateField('email', e.target.value)}
            validation={formState.email.touched ? formState.email.validation : undefined}
            placeholder="example@example.com"
            required
          />
          <FormField
            label="パスワード"
            id="password"
            type="password"
            value={formState.password.value}
            onChange={(e) => updateField('password', e.target.value)}
            validation={formState.password.touched ? formState.password.validation : undefined}
            placeholder="••••••••"
            description="パスワードは6文字以上で入力してください"
            required
          />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !isFormValid}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
          <div className="text-xs text-muted-foreground text-center space-y-2 pt-4">
            <p><strong>管理者:</strong> admin@example.com / admin123</p>
            <p><strong>ユーザー:</strong> test@example.com / test123</p>
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
