
import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FormField, FormTextArea } from './ui/form-field';
import { useFormValidation } from '../hooks/useFormValidation';
import { 
  validateDate, 
  validateTime, 
  validateTimeRange, 
  validateBreakMinutes 
} from '../lib/validation';

const TimeEntry: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { addAttendanceRecord } = useContext(DataContext);
  
  const today = new Date().toISOString().split('T')[0];
  
  // バリデーションルールの定義
  const validationRules = useMemo(() => ({
    date: (value: string) => validateDate(value),
    startTime: (value: string) => validateTime(value),
    endTime: (value: string, formState: any) => {
      const timeValidation = validateTime(value);
      if (!timeValidation.isValid) return timeValidation;
      
      const startTime = formState?.startTime?.value || '';
      if (startTime) {
        return validateTimeRange(startTime, value);
      }
      return timeValidation;
    },
    breakMinutes: (value: string, formState: any) => {
      const startTime = formState?.startTime?.value || '';
      const endTime = formState?.endTime?.value || '';
      return validateBreakMinutes(value, startTime, endTime);
    },
    report: (value: string) => {
      if (!value.trim()) {
        return { isValid: false, error: '作業内容を入力してください' };
      }
      if (value.length > 1000) {
        return { isValid: false, error: '作業内容は1000文字以内で入力してください' };
      }
      return { isValid: true };
    }
  }), []);

  const {
    formState,
    updateField,
    validateAll,
    getValues,
    isFormValid
  } = useFormValidation(
    {
      date: today,
      startTime: '09:00',
      endTime: '18:00',
      breakMinutes: '60',
      report: ''
    },
    validationRules
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // フォーム全体をバリデート
    validateAll();
    
    if (!isFormValid) {
      toast.error('入力内容に問題があります', {
        description: '赤色で表示されているエラーを修正してください',
      });
      return;
    }

    try {
      const values = getValues();
      await addAttendanceRecord({
        userId: user.id,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        breakMinutes: parseInt(values.breakMinutes, 10) || 0,
        report: values.report,
      });
      
      toast.success('勤怠時間が正常に記録されました！', {
        description: `${values.date} の勤怠記録を保存しました`,
      });

    } catch (error) {
      console.error('Failed to add attendance record:', error);
      toast.error('勤怠記録の保存に失敗しました', {
        description: 'もう一度お試しください',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle className="text-2xl">勤怠時間の入力</CardTitle>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="日付"
              id="date"
              type="date"
              value={formState.date.value}
              onChange={(e) => updateField('date', e.target.value)}
              validation={formState.date.touched ? formState.date.validation : undefined}
              className="animate-stagger-1"
              required
            />
            <FormField
              label="休憩（分）"
              id="break"
              type="number"
              value={formState.breakMinutes.value}
              onChange={(e) => updateField('breakMinutes', e.target.value)}
              validation={formState.breakMinutes.touched ? formState.breakMinutes.validation : undefined}
              className="animate-stagger-2"
              min="0"
              placeholder="60"
              description="休憩時間を分単位で入力"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="開始時刻"
              id="start-time"
              type="time"
              value={formState.startTime.value}
              onChange={(e) => updateField('startTime', e.target.value)}
              validation={formState.startTime.touched ? formState.startTime.validation : undefined}
              className="animate-stagger-3"
              required
            />
            <FormField
              label="終了時刻"
              id="end-time"
              type="time"
              value={formState.endTime.value}
              onChange={(e) => updateField('endTime', e.target.value)}
              validation={formState.endTime.touched ? formState.endTime.validation : undefined}
              className="animate-stagger-4"
              required
            />
          </div>
          <FormTextArea
            label="本日の報告（今日の作業内容）"
            id="report"
            rows={5}
            value={formState.report.value}
            onChange={(e) => updateField('report', e.target.value)}
            validation={formState.report.touched ? formState.report.validation : undefined}
            className="animate-stagger-4"
            placeholder="例：機能Ｘの開発、チームミーティングへの参加..."
            description="今日行った作業内容を詳しく記載してください（1000文字以内）"
            required
          />
          <div className="flex items-center justify-between pt-2 animate-slide-up animate-stagger-4">
            <Button 
              type="submit" 
              className="ml-auto"
              disabled={!isFormValid}
            >
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
