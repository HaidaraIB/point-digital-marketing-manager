import React, { useState, useMemo } from 'react';
import { Voucher, VoucherType, AgencySettings, Currency } from '../types.ts';
import { CURRENCY_SYMBOLS } from '../constants.tsx';

interface Props {
  vouchers: Voucher[];
  settings: AgencySettings;
  onAdd: (v: Voucher) => void;
  onDelete: (id: string) => void;
}

const OwnerWithdrawals: React.FC<Props> = ({ vouchers, settings, onAdd, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const withdrawals = useMemo(() =>
    vouchers.filter(v => v.category === 'OWNER_WITHDRAWAL'),
    [vouchers]
  );

  const getEquivalentAmount = (amt: number, curr: Currency, rate?: number) => {
    const r = rate ?? settings.exchangeRate;
    if (curr === 'IQD') return amt / r;
    return amt * r;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description) return;

    setIsSaving(true);

    const newWithdrawal: Voucher = {
      id: `WD-${Date.now().toString().slice(-6)}`,
      type: VoucherType.PAYMENT,
      amount,
      currency,
      partyName: "مالك الوكالة",
      description,
      date: new Date().toLocaleDateString('ar-IQ'),
      category: 'OWNER_WITHDRAWAL',
      exchangeRate: settings.exchangeRate,
    };

    onAdd(newWithdrawal);
    setAmount(0);
    setDescription('');
    setShowForm(false);
    setIsSaving(false);
  };

  const inputClass = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 outline-none text-sm transition-all";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-xl font-bold text-gray-800">سحوبات المالك</h2>
          <p className="text-xs text-gray-500">إدارة المبالغ المسحوبة للأرباح الشخصية</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`px-5 py-2.5 rounded-xl text-white shadow-md text-xs font-black transition-all ${showForm ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {showForm ? 'إلغاء' : 'تسجيل سحب جديد +'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-indigo-50 shadow-xl space-y-4 no-print">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1">العملة</label>
              <select value={currency} onChange={(e)=>setCurrency(e.target.value as Currency)} className={inputClass}>
                <option value="IQD">دينار عراقي (IQD)</option>
                <option value="USD">دولار أمريكي (USD)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1">المبلغ المسحوب</label>
              <input type="number" value={amount === 0 ? '' : amount} onChange={(e)=>setAmount(Number(e.target.value))} className={inputClass} placeholder="0" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1">سبب السحب / البيان</label>
              <input type="text" value={description} onChange={(e)=>setDescription(e.target.value)} className={inputClass} placeholder="أرباح شهرية، مصاريف خاصة..." required />
            </div>
          </div>

          {amount > 0 && (
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-700">القيمة المعادلة (سعر الصرف: {settings.exchangeRate})</span>
              <span className="text-base font-black text-indigo-900">
                {getEquivalentAmount(amount, currency).toLocaleString(undefined, { maximumFractionDigits: 2 })} {CURRENCY_SYMBOLS[currency === 'IQD' ? 'USD' : 'IQD']}
              </span>
            </div>
          )}

          <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            {isSaving ? 'جاري الحفظ...' : 'تأكيد عملية السحب 🏦'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-black text-gray-400">التاريخ</th>
              <th className="p-4 text-xs font-black text-gray-400">السبب</th>
              <th className="p-4 text-xs font-black text-gray-400">المبلغ</th>
              <th className="p-4 text-xs font-black text-gray-400">المعادل</th>
              <th className="p-4 text-xs font-black text-gray-400 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {withdrawals.map(w => (
              <tr key={w.id} className="hover:bg-indigo-50/10 transition-all">
                <td className="p-4 text-xs font-bold text-gray-500">{w.date}</td>
                <td className="p-4 text-sm font-bold text-gray-800">{w.description}</td>
                <td className="p-4 text-sm font-black text-indigo-600">{w.amount.toLocaleString()} {CURRENCY_SYMBOLS[w.currency]}</td>
                <td className="p-4 text-[10px] text-gray-400 font-bold">{getEquivalentAmount(w.amount, w.currency, w.exchangeRate).toLocaleString(undefined, {maximumFractionDigits:2})} {w.currency === 'IQD' ? '$' : 'د.ع'}</td>
                <td className="p-4 text-center">
                  <button onClick={() => onDelete(w.id)} className="text-red-300 hover:text-red-500 transition-colors">🗑️</button>
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan={5} className="p-20 text-center text-gray-300 italic">لا توجد سحوبات مسجلة حتى الآن</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerWithdrawals;
