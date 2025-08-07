
import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { PayType, Role } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(amount);
};

// Icon Components
const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const Payroll: React.FC = () => {
    const { fetchPayrollData } = useContext(DataContext);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [payrollData, setPayrollData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const year = currentDate.getFullYear();
                const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                const monthStr = `${year}-${month}`;
                const data = await fetchPayrollData(monthStr);
                setPayrollData(data);
            } catch (error) {
                console.error('Failed to fetch payroll data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentDate, fetchPayrollData]);

    const goToPreviousMonth = () => {
        setCurrentDate(d => {
            const newDate = new Date(d);
            newDate.setMonth(d.getMonth() - 1);
            return newDate;
        });
    };

    const goToNextMonth = () => {
        setCurrentDate(d => {
            const newDate = new Date(d);
            newDate.setMonth(d.getMonth() + 1);
            return newDate;
        });
    };
    
    const totalPayroll = payrollData?.totalPayroll || 0;
    const employees = payrollData?.payrollData || [];

    return (
        <div className="space-y-6">
            <Card className="p-4 sm:p-6">
                 <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-2">
                    <div className="flex items-center gap-2 sm:gap-4 mx-auto sm:mx-0">
                        <button onClick={goToPreviousMonth} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" aria-label="Previous month">
                            <ChevronLeftIcon />
                        </button>
                        <h3 className="text-lg font-semibold text-slate-800 w-36 text-center" aria-live="polite">
                            {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={goToNextMonth} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" aria-label="Next month">
                            <ChevronRightIcon />
                        </button>
                    </div>
                    
                    <div className="w-full sm:w-auto text-center sm:text-right">
                        <p className="text-slate-600">今月の給与総額</p>
                        <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalPayroll)}</p>
                    </div>
                </div>
            </Card>

            <Card className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">従業員名</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">給与情報</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">月間労働時間</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">月給</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="text-center text-slate-500 py-8">読み込み中...</td>
                            </tr>
                        ) : employees.length > 0 ? employees.map((user: any) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Intl.NumberFormat('ja-JP').format(user.payRate)} JPY / {user.payType === PayType.HOURLY ? 'hr' : 'mo'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.totalHours.toFixed(2)}h</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-semibold">{formatCurrency(user.totalSalary)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center text-slate-500 py-8">選択した月の従業員データが見つかりません。</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default Payroll;
