
import React from 'react';
import { SMSLog } from '../types.ts';
import { DeleteIcon } from './ActionIcons.tsx';

interface Props {
  logs: SMSLog[];
  onClear: () => void;
  canClear?: boolean;
}

const SMSLogManager: React.FC<Props> = ({ logs, onClear, canClear = true }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">سجل إشعارات SMS</h2>
          <p className="text-gray-500 text-sm">تتبع حالة الرسائل المرسلة للعملاء والموظفين</p>
        </div>
        {canClear && (
          <button 
            onClick={onClear}
            className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all"
          >
            <DeleteIcon />
            <span>مسح السجل</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-center">
                <th className="p-4 text-xs font-black text-gray-400">الحالة</th>
                <th className="p-4 text-xs font-black text-gray-400">المستلم</th>
                <th className="p-4 text-xs font-black text-gray-400">محتوى الرسالة</th>
                <th className="p-4 text-xs font-black text-gray-400">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-gray-300 italic">لا توجد عمليات إرسال مسجلة</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {log.status === 'SUCCESS' ? 'تم الإرسال ✓' : 'فشل الإرسال ✕'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs font-bold text-gray-600" dir="ltr">{log.to}</td>
                    <td className="p-4 text-xs text-gray-500 max-w-xs truncate" title={log.body}>{log.body}</td>
                    <td className="p-4 text-[10px] text-gray-400 font-bold">{log.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SMSLogManager;
