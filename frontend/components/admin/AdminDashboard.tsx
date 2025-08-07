
import React, { useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { KPICard } from '../ui/kpi-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Clock, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { dashboardData, loading } = useContext(DataContext);

  const totalStats = {
    totalHours: dashboardData?.totalHours || 0,
    totalSalary: dashboardData?.totalSalary || 0,
    activeEmployees: dashboardData?.activeEmployees || 0,
  };

  const employeeData = dashboardData?.employeeData || [];

  const formatCurrency = (value: number) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">ダッシュボードデータを読み込み中...</p>
      </div>
    );
  }

  // Simple trend data for existing metrics
  const mockTrend = { value: 12.5, label: "先月比" };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="animate-slide-up animate-stagger-1">
          <KPICard
            title="総労働時間"
            value={`${totalStats.totalHours.toFixed(1)}h`}
            icon={Clock}
            description="今月の累計時間"
            trend={mockTrend}
          />
        </div>
        <div className="animate-slide-up animate-stagger-2">
          <KPICard
            title="総給与額"
            value={formatCurrency(totalStats.totalSalary)}
            icon={TrendingUp}
            description="今月の支払累計"
            trend={{ value: 8.3, label: "先月比" }}
          />
        </div>
        <div className="animate-slide-up animate-stagger-3">
          <KPICard
            title="アクティブユーザー"
            value={totalStats.activeEmployees}
            icon={Users}
            description="現在の登録ユーザー数"
          />
        </div>
      </div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>従業員別総労働時間</CardTitle>
          </CardHeader>
          <CardContent>
          {employeeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalHours" fill="#3b82f6" name="総労働時間" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
              <p>従業員データがありません</p>
            </div>
          )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>従業員別給与</CardTitle>
          </CardHeader>
          <CardContent>
          {employeeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `¥${value/1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="totalSalary" fill="#16a34a" name="給与" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
              <p>従業員データがありません</p>
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
