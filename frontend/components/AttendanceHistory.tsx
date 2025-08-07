import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { AttendanceRecord, PayType, Role, User } from '../types';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { KPICard } from './ui/kpi-card';
import { ProgressRing } from './ui/progress-ring';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, Target, TrendingUp, ArrowUpDown, Edit2, Check, X } from 'lucide-react';

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

type SortField = 'date' | 'workHours' | 'dailySalary';
type SortOrder = 'asc' | 'desc';

const AttendanceHistory: React.FC = () => {
    const { user: currentUser } = useContext(AuthContext);
    const { users, attendanceRecords, updateAttendanceRecord, fetchUserAttendanceRecords, fetchAttendanceRecords, updateUser } = useContext(DataContext);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
    const [monthlyGoal, setMonthlyGoal] = useState<number>(0);
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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
                toast.success('目標を更新しました！', {
                    description: `月次目標: ${formatCurrency(monthlyGoal)}`,
                });
            } catch (error) {
                toast.error('目標の更新に失敗しました', {
                    description: 'もう一度お試しください',
                });
                console.error('Goal update failed:', error);
            }
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
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

        let filtered = attendanceRecords
            .filter(r => r.userId === selectedUserId)
            .filter(r => {
                const recordDate = new Date(r.date + 'T00:00:00');
                return recordDate.getFullYear() === selectedYear && recordDate.getMonth() === selectedMonth;
            });

        // Sort based on current sort settings
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortField) {
                case 'date':
                    aValue = new Date(a.date).getTime();
                    bValue = new Date(b.date).getTime();
                    break;
                case 'workHours':
                    aValue = displayedUser ? calculateDailyInfo(a, displayedUser).workHours : 0;
                    bValue = displayedUser ? calculateDailyInfo(b, displayedUser).workHours : 0;
                    break;
                case 'dailySalary':
                    aValue = displayedUser ? calculateDailyInfo(a, displayedUser).dailySalary : 0;
                    bValue = displayedUser ? calculateDailyInfo(b, displayedUser).dailySalary : 0;
                    break;
                default:
                    aValue = new Date(a.date).getTime();
                    bValue = new Date(b.date).getTime();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [attendanceRecords, selectedUserId, currentDate, sortField, sortOrder, displayedUser]);

    const totalSalary = useMemo(() => {
        return displayedUser ? calculateTotalSalary(filteredRecords, displayedUser) : 0;
    }, [filteredRecords, displayedUser]);
    
    const totalHours = useMemo(() => {
        if (!displayedUser) return 0;
        return filteredRecords.reduce((acc, record) => {
            const { workHours } = calculateDailyInfo(record, displayedUser);
            return acc + workHours;
        }, 0);
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
        <div className="space-y-6 animate-fade-in">
            <Card className="p-4 sm:p-6 animate-scale-in">
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
                 
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="animate-slide-up animate-stagger-1">
                        <KPICard
                            title="総労働時間"
                            value={`${totalHours.toFixed(1)}h`}
                            icon={Clock}
                            description="今月の累計時間"
                        />
                    </div>
                    <div className="animate-slide-up animate-stagger-2">
                        <KPICard
                            title="累計給与"
                            value={formatCurrency(totalSalary)}
                            icon={TrendingUp}
                            description="今月の収入"
                        />
                    </div>
                    <div className="animate-slide-up animate-stagger-3">
                        <KPICard
                            title="達成率"
                            value={`${achievementPercentage}%`}
                            icon={Target}
                            description="目標達成率"
                            valueClassName={achievementPercentage >= 100 ? "text-green-600 dark:text-green-400" : "text-primary"}
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
                    <div className="lg:col-span-1 flex items-center justify-center">
                        <ProgressRing
                            progress={achievementPercentage}
                            size={160}
                            strokeWidth={12}
                            color={achievementPercentage >= 100 ? "#10b981" : "hsl(var(--primary))"}
                        />
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
                             <Label htmlFor="monthly-goal">月次目標を設定（円）</Label>
                             <Input
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
                                    variant="default"
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
                <Card className="p-4 sm:p-6 animate-slide-up animate-stagger-2">
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

            <Card className="animate-slide-up animate-stagger-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        勤怠履歴詳細
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">記録が見つかりませんでした</p>
                            <p className="text-sm">選択した月の勤怠記録がありません</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead 
                                            className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                                            onClick={() => handleSort('date')}
                                        >
                                            <div className="flex items-center gap-2">
                                                日付
                                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                                            </div>
                                        </TableHead>
                                        <TableHead>時間</TableHead>
                                        <TableHead>休憩（分）</TableHead>
                                        <TableHead 
                                            className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                                            onClick={() => handleSort('workHours')}
                                        >
                                            <div className="flex items-center gap-2">
                                                労働時間
                                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer select-none hover:bg-muted/50 transition-colors text-right"
                                            onClick={() => handleSort('dailySalary')}
                                        >
                                            <div className="flex items-center justify-end gap-2">
                                                日給
                                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                                            </div>
                                        </TableHead>
                                        {currentUser.role === Role.ADMIN && <TableHead className="text-right">操作</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRecords.map(record => {
                                        const isEditing = editingRecord?.id === record.id;
                                        const { workHours, dailySalary } = calculateDailyInfo(record, displayedUser);
                                        
                                        return (
                                            <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-medium">
                                                    {isEditing ? (
                                                        <Input 
                                                            type="date" 
                                                            value={editingRecord.date} 
                                                            onChange={e => setEditingRecord({...editingRecord, date: e.target.value})}
                                                            className="w-full"
                                                        />
                                                    ) : (
                                                        new Date(record.date).toLocaleDateString('ja-JP')
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <Input 
                                                                type="time" 
                                                                value={editingRecord.startTime} 
                                                                onChange={e => setEditingRecord({...editingRecord, startTime: e.target.value})}
                                                                className="w-full sm:w-24"
                                                            />
                                                            <span className="hidden sm:flex items-center">-</span>
                                                            <Input 
                                                                type="time" 
                                                                value={editingRecord.endTime} 
                                                                onChange={e => setEditingRecord({...editingRecord, endTime: e.target.value})}
                                                                className="w-full sm:w-24"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                                            <span>{record.startTime}</span>
                                                            <span className="hidden sm:inline">-</span>
                                                            <span>{record.endTime}</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <Input 
                                                            type="number" 
                                                            value={editingRecord.breakMinutes} 
                                                            onChange={e => setEditingRecord({...editingRecord, breakMinutes: parseInt(e.target.value)})}
                                                            className="w-20"
                                                            min="0"
                                                        />
                                                    ) : (
                                                        `${record.breakMinutes}分`
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{workHours.toFixed(1)}時間</span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(dailySalary)}
                                                </TableCell>
                                                {currentUser.role === Role.ADMIN && (
                                                    <TableCell className="text-right">
                                                        {isEditing ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button 
                                                                    onClick={handleSave} 
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    onClick={() => setEditingRecord(null)} 
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button 
                                                                onClick={() => handleEdit(record)} 
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AttendanceHistory;