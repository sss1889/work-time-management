
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

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
      <Card className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">勤怠時間の入力</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="日付"
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
             <Input
              label="休憩（分）"
              id="break"
              type="number"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
              required
              min="0"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="開始時刻"
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              label="終了時刻"
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="report" className="block text-sm font-medium text-slate-700 mb-1">
              本日の報告（今日の作業内容）
            </label>
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
      </Card>
    </div>
  );
};

export default TimeEntry;
