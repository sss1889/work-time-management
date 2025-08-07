
import React, { useState, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider, DataContext } from './context/DataContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TimeEntry from './components/TimeEntry';
import AttendanceHistory from './components/AttendanceHistory';
import DailyReports from './components/DailyReports';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import Payroll from './components/admin/Payroll';
import { Role } from './types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const MainLayout: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { users, attendanceRecords } = useContext(DataContext);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    const pageTitles: { [key: string]: string } = {
        '/': '勤怠入力',
        '/time-entry': '勤怠入力',
        '/history': '勤怠履歴',
        '/reports': '日報一覧',
        '/admin/dashboard': '管理者ダッシュボード',
        '/admin/users': 'ユーザー管理',
        '/admin/payroll': '月次給与',
    };

    const title = pageTitles[location.pathname] || 'ダッシュボード';

    return (
        <div className="flex h-screen bg-background font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title={title} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
                    <Routes>
                        <Route path="/" element={<Navigate to="/time-entry" replace />} />
                        <Route path="/time-entry" element={<ProtectedRoute><TimeEntry /></ProtectedRoute>} />
                        <Route path="/history" element={<ProtectedRoute><AttendanceHistory /></ProtectedRoute>} />
                        <Route path="/reports" element={<ProtectedRoute><DailyReports /></ProtectedRoute>} />
                        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><UserManagement /></ProtectedRoute>} />
                        <Route path="/admin/payroll" element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><Payroll /></ProtectedRoute>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <DataProvider>
            <HashRouter>
              <Toaster richColors position="top-right" />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={<MainLayout />} />
              </Routes>
            </HashRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;