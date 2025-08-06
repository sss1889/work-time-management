import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { AttendanceRecord, PayType, Role, User } from '../types';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Helper to calculate detailed info for a single record
const calculateDailyInfo = (record: AttendanceRecord, user: User | undefined) => {
    if (!user) return { workHours: 0, dailySalary: 0 };

    const start = new Date(`${record.date}T${record.startTime}`);
    let end = new Date(`${record.date}T${record.endTime}`);

    // If end time is before start time, it means the shift crosses midnight
    if (end < start) {
        // Add one day to end time
        end.setDate(end.getDate() + 1);
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { workHours: 0, dailySalary: 0 };
    }

    const durationMs = end.getTime() - start.getTime();
    const workHours = Math.max(0, (durationMs / (1000 * 60 * 60)) - (record.breakMinutes / 60));

    let dailySalary = 0;
    if (user.payType === PayType.HOURLY) {
        dailySalary = workHours * user.payRate;
    } else if (user.payType === PayType.MONTHLY) {
        // Approximate daily rate assuming 22 work days/month.
        const dailyRate = user.payRate / 22;
        dailySalary = workHours > 0 ? dailyRate : 0;
    }

    return {
        workHours,
        dailySalary,
    };
};

// Helper function to calculate total salary for a set of records
const calculateTotalSalary = (records: AttendanceRecord[], user: User | undefined) => {
  if (!user) return 0;
  
  return records.reduce((acc, record) => {
      return acc + calculateDailyInfo(record, user).dailySalary;
  }, 0);
};

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

const AttendanceHistory: React.FC = () => {
    const { user: currentUser } = useContext(AuthContext);
    const { users, attendanceRecords, updateAttendanceRecord, fetchUserAttendanceRecords, fetchAttendanceRecords, updateUser } = useContext(DataContext);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
    const [monthlyGoal, setMonthlyGoal] = useState<number>(0);

    // Set initial selectedUserId when users or currentUser changes
    useEffect(() => {
        if (currentUser && users.length > 0) {
            if (currentUser.role === Role.ADMIN && !selectedUserId) {
                // For admin, select the first available user
                setSelectedUserId(users.find(u => u.role === Role.USER)?.id || users[0]?.id || '');
            } else if (currentUser.role === Role.USER && !selectedUserId) {
                // For regular users, select themselves
                setSelectedUserId(currentUser.id);
            }
        }
    }, [currentUser, users, selectedUserId]);

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

    const handleEdit = (record: AttendanceRecord) => {
      setEditingRecord({ ...record });
    };

    const handleSave = () => {
        if (editingRecord) {
            updateAttendanceRecord(editingRecord);
            setEditingRecord(null);
        }
    };

    const handleGoalUpdate = async () => {
        if (displayedUser && monthlyGoal !== (displayedUser.goal || 0)) {
            try {
                const updatedUser = { ...displayedUser, goal: monthlyGoal };
                await updateUser(updatedUser);
                alert('目標が更新されました！');
            } catch (error) {
                alert('目標の更新に失敗しました。');
                console.error('Goal update failed:', error);
            }
        }
    };
    
    const displayedUser = useMemo(() => {
        return users.find(u => u.id === selectedUserId);
    }, [selectedUserId, users]);

    useEffect(() => {
        if (displayedUser) {
            // Use the user's saved goal, or calculate a default if no goal is set
            if (displayedUser.goal && displayedUser.goal > 0) {
                setMonthlyGoal(displayedUser.goal);
            } else {
                // Default goal calculation
                if (displayedUser.payType === PayType.MONTHLY) {
                    setMonthlyGoal(displayedUser.payRate);
                } else {
                    // Default goal for hourly: 22 working days, 8 hours/day
                    const estimatedGoal = displayedUser.payRate * 8 * 22;
                    setMonthlyGoal(estimatedGoal);
                }
            }
        }
    }, [displayedUser]);

    // Fetch attendance records when selectedUserId or currentDate changes
    useEffect(() => {
        if (selectedUserId && currentUser) {
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const monthStr = `${year}-${month}`;
            
            if (currentUser.role === Role.ADMIN && selectedUserId !== currentUser.id) {
                // Admin viewing other user's records
                fetchUserAttendanceRecords(selectedUserId, monthStr);
            } else {
                // User viewing their own records or admin viewing their own
                fetchAttendanceRecords(monthStr);
            }
        }
    }, [selectedUserId, currentDate, currentUser, fetchUserAttendanceRecords, fetchAttendanceRecords]);

    const filteredRecords = useMemo(() => {
        const selectedYear = currentDate.getFullYear();
        const selectedMonth = currentDate.getMonth();

        return attendanceRecords
            .filter(r => r.userId === selectedUserId)
            .filter(r => {
                const recordDate = new Date(r.date + 'T00:00:00');
                return recordDate.getFullYear() === selectedYear && recordDate.getMonth() === selectedMonth;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [attendanceRecords, selectedUserId, currentDate]);

    const totalSalary = useMemo(() => {
        return displayedUser ? calculateTotalSalary(filteredRecords, displayedUser) : 0;
    }, [filteredRecords, displayedUser]);
    
    const barChartData = useMemo(() => {
        if (!displayedUser) return [];
        // filteredRecords is sorted descending, so we reverse it to process chronologically
        return [...filteredRecords].reverse().map(record => {
            const { dailySalary } = calculateDailyInfo(record, displayedUser);
            return {
                date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                dailySalary: parseFloat(dailySalary.toFixed(0)),
            };
        });
    }, [filteredRecords, displayedUser]);
    
    const pieChartData = useMemo(() => {
        const achieved = totalSalary;
        // If goal is 0, treat it as a full circle of the achieved amount.
        if (monthlyGoal <= 0) {
            return [{ name: 'Achieved', value: achieved > 0 ? achieved : 1 }];
        }
        const remaining = Math.max(0, monthlyGoal - achieved);
        return [
            { name: 'Achieved', value: achieved },
            { name: 'Remaining', value: remaining },
        ];
    }, [totalSalary, monthlyGoal]);

    const PIE_COLORS = ['#3b82f6', '#e5e7eb'];
    const achievementPercentage = monthlyGoal > 0 ? Math.round((totalSalary / monthlyGoal) * 100) : 0;

    if (!currentUser) return null;

    return (
        <div className="space-y-6">
            <Card className="p-4 sm:p-6">
                 <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-2 mb-6">
                    {currentUser.role === Role.ADMIN && (
                        <div className="w-full sm:w-auto">
                            <label htmlFor="user-select" className="block text-sm font-medium text-slate-700 mb-1">従業員</label>
                            <select id="user-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2 sm:gap-4 mx-auto">
                        <button onClick={goToPreviousMonth} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                            <ChevronLeftIcon />
                        </button>
                        <h3 className="text-lg font-semibold text-slate-800 w-36 text-center">
                            {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={goToNextMonth} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                            <ChevronRightIcon />
                        </button>
                    </div>
                 </div>
                 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
                    <div className="lg:col-span-1 relative flex items-center justify-center h-40">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieChartData} dataKey="value" innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={450} cornerRadius={5} paddingAngle={monthlyGoal > 0 && totalSalary > 0 ? 2 : 0}>
                                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                </Pie>
                            </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute flex flex-col items-center justify-center text-center">
                             <span className="text-3xl font-bold text-slate-800">{achievementPercentage}%</span>
                             <span className="text-sm text-slate-500 mt-1">達成率</span>
                         </div>
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800">月次目標進捗</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500">現在の収入</p>
                                <p className="text-xl font-bold text-primary-600">{formatCurrency(totalSalary)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">目標額</p>
                                <p className="text-xl font-bold text-slate-700">{formatCurrency(monthlyGoal)}</p>
                            </div>
                        </div>
                        <div>
                             <Input
                                label="月次目標を設定（円）"
                                id="monthly-goal"
                                type="number"
                                value={monthlyGoal}
                                onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                                placeholder="例： 400000"
                                step="10000"
                             />
                             <div className="mt-2">
                                <Button 
                                    onClick={handleGoalUpdate}
                                    variant="primary"
                                    disabled={!displayedUser || monthlyGoal === (displayedUser.goal || 0)}
                                >
                                    目標を確定
                                </Button>
                             </div>
                        </div>
                    </div>
                </div>
            </Card>

            {filteredRecords.length > 0 && (
                <Card className="p-4 sm:p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">日別収入</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={(value) => `¥${value/1000}k`} />
                            <Tooltip
                                cursor={{fill: 'rgba(219, 234, 254, 0.5)'}}
                                formatter={(value: number) => [formatCurrency(value), '収入']}
                                labelFormatter={(label) => `日付: ${label}`}
                             />
                            <Bar dataKey="dailySalary" fill="#3b82f6" name="日別収入" barSize={30} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            )}

            <Card className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">日付</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">時間</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">休憩（分）</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">労働時間</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">日給</th>
                             {currentUser.role === Role.ADMIN && <th scope="col" className="relative px-6 py-3"><span className="sr-only">編集</span></th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredRecords.map(record => {
                             const isEditing = editingRecord?.id === record.id;
                             const { workHours, dailySalary } = calculateDailyInfo(record, displayedUser);
                            
                             return (
                                <tr key={record.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{isEditing ? <Input type="date" value={editingRecord.date} onChange={e => setEditingRecord({...editingRecord, date: e.target.value})} /> : record.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{isEditing ? <div className="flex gap-2"><Input type="time" value={editingRecord.startTime} onChange={e => setEditingRecord({...editingRecord, startTime: e.target.value})} /><Input type="time" value={editingRecord.endTime} onChange={e => setEditingRecord({...editingRecord, endTime: e.target.value})} /></div> : `${record.startTime} - ${record.endTime}`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{isEditing ? <Input type="number" value={editingRecord.breakMinutes} onChange={e => setEditingRecord({...editingRecord, breakMinutes: parseInt(e.target.value)})} /> : record.breakMinutes}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{workHours.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">{formatCurrency(dailySalary)}</td>
                                    {currentUser.role === Role.ADMIN && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <Button onClick={handleSave} variant="primary">保存</Button>
                                                    <Button onClick={() => setEditingRecord(null)} variant="secondary">キャンセル</Button>
                                                </div>
                                            ) : (
                                                <Button onClick={() => handleEdit(record)} variant="secondary">編集</Button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                             )
                        })}
                    </tbody>
                </table>
                 {filteredRecords.length === 0 && <p className="text-center text-slate-500 py-8">選択した月の記録は見つかりませんでした。</p>}
            </Card>
        </div>
    );
};

export default AttendanceHistory;