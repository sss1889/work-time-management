
import React, { useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import Card from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-500">総労働時間（今期）</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{totalStats.totalHours.toFixed(2)}h</p>
        </Card>
        <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-500">総給与支払額</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{formatCurrency(totalStats.totalSalary)}</p>
        </Card>
        <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-500">アクティブな従業員</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{totalStats.activeEmployees}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">従業員別総労働時間</h3>
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
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">従業員別給与</h3>
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
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
