
import React, { useContext, useEffect, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const DailyReports: React.FC = () => {
  const { dailyReports, fetchDailyReports, loading } = useContext(DataContext);

  useEffect(() => {
    fetchDailyReports();
  }, [fetchDailyReports]);

  return (
    <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">日報一覧</h2>
        {loading ? (
            <Card className="p-8 text-center text-slate-500">
                <p>日報を読み込み中...</p>
            </Card>
        ) : (
            <div className="space-y-4">
                {dailyReports.map((report: any) => (
                    <Card key={report.id} className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-primary-600">{report.user_name}</p>
                                <p className="text-xs text-slate-500">{report.date}</p>
                            </div>
                        </div>
                        <p className="mt-3 text-slate-700 text-sm leading-relaxed">{report.report}</p>
                    </Card>
                ))}
                {dailyReports.length === 0 && (
                    <Card className="p-8 text-center text-slate-500">
                        <p>まだ日報が提出されていません。</p>
                    </Card>
                )}
            </div>
        )}
    </div>
  );
};

export default DailyReports;
