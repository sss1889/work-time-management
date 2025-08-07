'use client';

import { useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">読み込み中...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // パスに基づいてタイトルを決定
  const pageTitles: { [key: string]: string } = {
    '/dashboard': '勤怠入力',
    '/dashboard/history': '勤怠履歴',
    '/dashboard/reports': '日報一覧',
    '/dashboard/profile': 'プロフィール',
    '/dashboard/settings': '設定',
    '/dashboard/admin': '管理者ダッシュボード',
    '/dashboard/admin/users': 'ユーザー管理',
    '/dashboard/admin/payroll': '給与計算',
  };

  const title = pageTitles[pathname] || '出勤管理システム';

  return (
    <div className="flex h-screen bg-background font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}