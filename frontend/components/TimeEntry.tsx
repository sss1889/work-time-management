
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

const TimeEntry: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { addAttendanceRecord } = useContext(DataContext);
  
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakMinutes, setBreakMinutes] = useState('60');
  const [report, setReport] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    addAttendanceRecord({
      userId: user.id,
      date,
      startTime,
      endTime,
      breakMinutes: parseInt(breakMinutes, 10) || 0,
      report,
    });
    
    setMessage('勤怠時間が正常に記録されました！');
    
    // Reset form
    setDate(today);
    setStartTime('09:00');
    setEndTime('18:00');
    setBreakMinutes('60');
    setReport('');

    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">勤怠時間の入力</CardTitle>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">日付</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break">休憩（分）</Label>
              <Input
                id="break"
                type="number"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(e.target.value)}
                required
                min="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start-time">開始時刻</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">終了時刻</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="report">
              本日の報告（今日の作業内容）
            </Label>
            <textarea
              id="report"
              rows={5}
              className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={report}
              onChange={(e) => setReport(e.target.value)}
              required
              placeholder="例：機能Ｘの開発、チームミーティングへの参加..."
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            {message && <p className="text-green-600 text-sm">{message}</p>}
            <Button type="submit" className="ml-auto">
記録を送信
            </Button>
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeEntry;
