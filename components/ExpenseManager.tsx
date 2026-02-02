
import React, { useState, useMemo } from 'react';
import { Voucher, VoucherType, AgencySettings, SMSLog, Currency } from '../types.ts';
import { CURRENCY_SYMBOLS } from '../constants.tsx';
import { sendSMS } from '../services/smsService.ts';
import PhoneInput from './PhoneInput.tsx';

interface Props {
  vouchers: Voucher[];
  settings: AgencySettings;
  onAdd: (v: Voucher) => void;
  onUpdate: (v: Voucher) => void;
  onDelete: (id: string) => void;
  onSMSLog: (log: Omit<SMSLog, 'id' | 'timestamp'>) => void;
}

const ExpenseManager: React.FC<Props> = ({ vouchers, settings, onAdd, onUpdate, onDelete, onSMSLog }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expenseType, setExpenseType] = useState<'DAILY' | 'SALARY'>('DAILY');
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [salaryMonth, setSalaryMonth] = useState('');
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [reportType, setReportType] = useState<'NONE' | 'WEEKLY' | 'MONTHLY'>('NONE');

  const expenseVouchers = useMemo(() => 
    vouchers.filter(v => v.category === 'DAILY' || v.category === 'SALARY'),
    [vouchers]
  );

  const getEquivalentAmount = (amt: number, curr: Currency) => {
    if (curr === 'IQD') return amt / settings.exchangeRate;
    return amt * settings.exchangeRate;
  };

  const filteredReportData = useMemo(() => {
    if (reportType === 'NONE') return [];
    const now = new Date();
    return expenseVouchers.filter(v => {
      const parts = v.date.split('/');
      if (parts.length < 3) return false;
      const cleanParts = parts.map(p => p.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()));
      const vDate = new Date(parseInt(cleanParts[2]), parseInt(cleanParts[1]) - 1, parseInt(cleanParts[0]));
      if (reportType === 'WEEKLY') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return vDate >= weekAgo;
      } else {
        return vDate.getMonth() === now.getMonth() && vDate.getFullYear() === now.getFullYear();
      }
    });
  }, [expenseVouchers, reportType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || amount <= 0) return;

    setIsSending(true);

    const finalDescription = expenseType === 'SALARY' ? `راتب شهر: ${salaryMonth}` : description;

    const voucherData: Voucher = {
      id: editingId || `EX-${Date.now().toString().slice(-6)}`,
      type: VoucherType.PAYMENT,
      amount,
      currency,
      partyName,
      partyPhone: expenseType === 'SALARY' ? partyPhone : '',
      description: finalDescription,
      date: new Date().toLocaleDateString('ar-IQ'),
      category: expenseType
    };

    if (!editingId && expenseType === 'SALARY' && partyPhone && settings.twilio.isEnabled) {
      const message = `مرحباً ${partyName}،\nتم إيداع راتبك لشهر (${salaryMonth}) بمبلغ ${amount.toLocaleString()} ${CURRENCY_SYMBOLS[currency]}.`;
      await sendSMS(settings.twilio, partyPhone, message);
    }

    if (editingId) onUpdate(voucherData);
    else onAdd(voucherData);

    setIsSending(false);
    setShowForm(false);
    setEditingId(null);
    setAmount(0);
    setPartyName('');
    setSalaryMonth('');
    setDescription('');
  };

  const handleEdit = (v: Voucher) => {
    setEditingId(v.id);
    setExpenseType(v.category as 'DAILY' | 'SALARY');
    setAmount(v.amount);
    setCurrency(v.currency || 'IQD');
    setPartyName(v.partyName);
    setPartyPhone(v.partyPhone || '');
    if (v.category === 'SALARY') {
      setSalaryMonth(v.description.replace('راتب شهر: ', ''));
    } else {
      setDescription(v.description);
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 outline-none text-sm transition-all";

  if (reportType !== 'NONE') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center no-print">
          <button onClick={() => setReportType('NONE')} className="bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm"><span>←</span> عودة</button>
          <button onClick={() => window.print()} className="bg-black text-white px-8 py-2 rounded-xl text-sm"><span>🖨️</span> طباعة التقرير</button>
        </div>
        <div className="bg-white mx-auto p-[20mm] rounded-xl shadow-2xl" style={{ width: '210mm', minHeight: '297mm' }}>
           <h2 className="text-2xl font-black border-b-2 border-black pb-4 mb-6">تقرير المصاريف والرواتب - {reportType === 'WEEKLY' ? 'أسبوعي' : 'شهري'}</h2>
           <table className="w-full text-right border-collapse">
             <thead>
               <tr className="bg-black text-white">
                 <th className="p-3 text-sm">التاريخ</th>
                 <th className="p-3 text-sm">المستفيد</th>
                 <th className="p-3 text-sm">البيان / الشهر</th>
                 <th className="p-3 text-sm">المبلغ</th>
               </tr>
             </thead>
             <tbody>
               {filteredReportData.map(v => (
                 <tr key={v.id} className="border-b">
                   <td className="p-3 text-xs">{v.date}</td>
                   <td className="p-3 text-xs font-bold">{v.partyName}</td>
                   <td className="p-3 text-xs text-gray-600">{v.description}</td>
                   <td className="p-3 text-xs font-black">{v.amount.toLocaleString()} {CURRENCY_SYMBOLS[v.currency]}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-xl font-bold text-gray-800">المصاريف والرواتب</h2>
        <div className="flex gap-2">
          <button onClick={() => setReportType('WEEKLY')} className="bg-white border px-3 py-2 rounded-xl text-[10px] font-bold">تقرير أسبوعي</button>
          <button onClick={() => setReportType('MONTHLY')} className="bg-white border px-3 py-2 rounded-xl text-[10px] font-bold">تقرير شهري</button>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black">
            {showForm ? 'إلغاء' : 'إضافة مصروف +'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-red-50 shadow-xl space-y-4 animate-fade-in no-print">
          <div className="flex gap-3">
             <button type="button" onClick={()=>setExpenseType('DAILY')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${expenseType === 'DAILY' ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>نثريات يومية</button>
             <button type="button" onClick={()=>setExpenseType('SALARY')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${expenseType === 'SALARY' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>راتب موظف</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-[10px] font-black text-gray-400 mb-1">المستفيد / الموظف</label>
              <input type="text" value={partyName} onChange={(e)=>setPartyName(e.target.value)} className={inputClass} placeholder="الاسم الكامل" required />
            </div>
            {expenseType === 'SALARY' && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1">رقم الهاتف (SMS)</label>
                <PhoneInput value={partyPhone} onChange={setPartyPhone} />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1">العملة</label>
              <select value={currency} onChange={(e)=>setCurrency(e.target.value as Currency)} className={inputClass}>
                <option value="IQD">IQD (د.ع)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1">المبلغ</label>
              <input type="number" value={amount === 0 ? '' : amount} onChange={(e)=>setAmount(Number(e.target.value))} className={inputClass} placeholder="0" required />
            </div>
          </div>

          <div>
            {expenseType === 'SALARY' ? (
              <>
                <label className="block text-[10px] font-black text-gray-400 mb-1">عن شهر</label>
                <input type="text" value={salaryMonth} onChange={(e)=>setSalaryMonth(e.target.value)} className={inputClass} placeholder="مثلاً: أيار 2024" required />
              </>
            ) : (
              <>
                <label className="block text-[10px] font-black text-gray-400 mb-1">سبب الصرف (البيان)</label>
                <input type="text" value={description} onChange={(e)=>setDescription(e.target.value)} className={inputClass} placeholder="رصيد انترنت، ضيافة، قرطاسية..." required />
              </>
            )}
          </div>

          {amount > 0 && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500">القيمة المعادلة (سعر الصرف: {settings.exchangeRate})</span>
              <span className="text-base font-black text-gray-900">
                {getEquivalentAmount(amount, currency).toLocaleString(undefined, { maximumFractionDigits: 2 })} {CURRENCY_SYMBOLS[currency === 'IQD' ? 'USD' : 'IQD']}
              </span>
            </div>
          )}

          <button type="submit" disabled={isSending} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg">
            {isSending ? 'جاري الحفظ...' : editingId ? 'تحديث البيانات' : `تأكيد الصرف ${expenseType === 'SALARY' ? 'وإرسال إشعار' : ''}`}
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden no-print">
        <table className="w-full text-right">
           <thead className="bg-gray-50 border-b">
             <tr className="text-right">
               <th className="p-4 text-xs font-black text-gray-400">النوع</th>
               <th className="p-4 text-xs font-black text-gray-400">المستفيد</th>
               <th className="p-4 text-xs font-black text-gray-400">البيان / الشهر</th>
               <th className="p-4 text-xs font-black text-gray-400">المبلغ</th>
               <th className="p-4 text-xs font-black text-gray-400 text-center">إجراءات</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-50">
             {expenseVouchers.map(v => (
               <tr key={v.id} className="hover:bg-gray-50">
                 <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${v.category === 'SALARY' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{v.category === 'SALARY' ? 'راتب' : 'يومية'}</span></td>
                 <td className="p-4 font-bold text-sm text-gray-800">{v.partyName}</td>
                 <td className="p-4 text-xs text-gray-500">{v.description}</td>
                 <td className="p-4 text-sm font-black text-red-600">{v.amount.toLocaleString()} {CURRENCY_SYMBOLS[v.currency]}</td>
                 <td className="p-4 flex items-center justify-center gap-2">
                   <button onClick={() => handleEdit(v)} className="p-2 text-blue-400 hover:scale-110 transition-transform">✏️</button>
                   <button onClick={() => onDelete(v.id)} className="p-2 text-red-300 hover:text-red-500 transition-colors">🗑️</button>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseManager;
