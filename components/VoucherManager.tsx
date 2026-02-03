
import React, { useState } from 'react';
import { Voucher, VoucherType, AgencySettings, SMSLog, Currency } from '../types.ts';
import { CURRENCY_SYMBOLS } from '../constants.tsx';
import { sendSMS } from '../services/smsService.ts';
import PhoneInput from './PhoneInput.tsx';

interface Props {
  vouchers: Voucher[];
  settings: AgencySettings;
  onAdd: (v: Voucher) => void;
  onDelete: (id: string) => void;
  onSMSLog: (log: Omit<SMSLog, 'id' | 'timestamp'>) => void;
  canEdit?: boolean;
}

const VoucherManager: React.FC<Props> = ({ vouchers, settings, onAdd, onDelete, onSMSLog, canEdit = true }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [type, setType] = useState<VoucherType>(VoucherType.RECEIPT);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);

  const getEquivalentAmount = (amt: number, curr: Currency) => {
    if (curr === 'IQD') return amt / settings.exchangeRate;
    return amt * settings.exchangeRate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || amount <= 0 || !description) return;

    setIsSending(true);

    const newVoucher: Voucher = {
      id: `VC-${Date.now().toString().slice(-6)}`,
      type,
      amount,
      currency,
      partyName,
      partyPhone,
      description,
      date: new Date().toLocaleDateString('ar-IQ'),
      category: 'VOUCHER'
    };

    if (type === VoucherType.RECEIPT && partyPhone && settings.twilio.isEnabled) {
      const message = `مرحباً ${partyName}،\nتم استلام دفعة مالية بقيمة ${amount.toLocaleString()} ${CURRENCY_SYMBOLS[currency]} لسبب: ${description}.\nرقم الوصل: ${newVoucher.id}\nشكراً لتعاملكم مع ${settings.twilio.senderName}`;
      const success = await sendSMS(settings.twilio, partyPhone, message);
      onSMSLog({
        to: partyPhone,
        body: message,
        status: success ? 'SUCCESS' : 'FAILED'
      });
    }

    onAdd(newVoucher);
    setAmount(0);
    setPartyName('');
    setPartyPhone('');
    setDescription('');
    setShowForm(false);
    setIsSending(false);
  };

  const handlePrint = () => window.print();

  const renderVoucherContent = (voucher: Voucher, copyType: string) => {
    const eqAmt = getEquivalentAmount(voucher.amount, voucher.currency);
    const eqCurr = voucher.currency === 'IQD' ? 'USD' : 'IQD';

    return (
      <div className="relative bg-white p-[10mm] border-[6px] border-double border-gray-300 h-[148.5mm] flex flex-col justify-between overflow-hidden">
        <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase z-10">
          {copyType}
        </div>

        <div>
          <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
            <div className="text-right">
              <h1 className="text-xl font-black text-black leading-none mb-1">{settings.name}</h1>
              <p className="text-[10px] text-gray-500">{settings.phone} • {settings.email}</p>
            </div>
            <div className="text-center px-4">
              <h2 className="text-2xl font-black text-black border-b-2 border-black inline-block px-3">
                {voucher.type === VoucherType.RECEIPT ? 'وصل قبض' : 'وصل صرف'}
              </h2>
            </div>
            <img src={settings.logo} alt="Logo" className="h-14 w-14 object-contain grayscale" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex gap-2 items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase">Voucher ID:</span>
              <span className="text-sm font-black text-black">{voucher.id}</span>
            </div>
            <div className="flex gap-2 items-center justify-end">
              <span className="text-[10px] font-black text-gray-400 uppercase">Date:</span>
              <span className="text-sm font-black text-black">{voucher.date}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-dashed border-gray-300 pb-1">
              <span className="text-[10px] font-black text-gray-400 min-w-[100px]">
                {voucher.type === VoucherType.RECEIPT ? 'استلمنا من السيد/ة:' : 'صرفنا إلى السيد/ة:'}
              </span>
              <span className="text-base font-black text-black flex-1">{voucher.partyName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-dashed border-gray-300 pb-1">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-gray-400 min-w-[100px]">مبلغ وقدره:</span>
                <span className="text-xl font-black text-black">{voucher.amount.toLocaleString()} {CURRENCY_SYMBOLS[voucher.currency]}</span>
              </div>
              <div className="bg-gray-50 px-3 py-1 rounded border border-gray-100">
                <span className="text-[9px] font-bold text-gray-400 ml-2">ما يعادله:</span>
                <span className="text-xs font-black text-gray-600">{eqAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })} {CURRENCY_SYMBOLS[eqCurr]}</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-[10px] font-black text-gray-400 min-w-[100px]">وذلك عن:</span>
              <span className="text-xs font-bold text-gray-700 flex-1 leading-relaxed">{voucher.description}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 pt-8 mt-4 border-t-2 border-gray-100">
          <div className="text-center">
            <p className="font-black text-[11px] text-black mb-6">توقيع المستلم</p>
            <div className="border-b border-gray-200 w-full h-6"></div>
          </div>
          <div className="text-center">
            <p className="font-black text-[11px] text-black mb-6">المحاسب (الختم)</p>
            <div className="border border-dashed border-gray-200 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <img src={settings.logo} className="h-8 opacity-5 grayscale" alt="watermark" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedVoucher) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center no-print">
          <button onClick={() => setSelectedVoucher(null)} className="bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm">
            <span>←</span> عودة للقائمة
          </button>
          <button onClick={handlePrint} className="bg-black text-white px-8 py-2 rounded-xl shadow-lg hover:bg-gray-900 flex items-center gap-2 text-sm">
            <span>🖨️</span> طباعة النسختين (A4)
          </button>
        </div>

        <div className="bg-white mx-auto shadow-2xl print:shadow-none rounded-xl print:rounded-none overflow-hidden" style={{ width: '210mm', height: '297mm' }}>
          {renderVoucherContent(selectedVoucher, "نسخة العميل")}
          <div className="relative h-0 border-t-2 border-dashed border-gray-300 no-print">
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[8px] font-black text-gray-300 uppercase">Cut Here / مقص</span>
          </div>
          <div className="hidden print:block h-0 border-t border-dashed border-gray-400"></div>
          {renderVoucherContent(selectedVoucher, "نسخة الشركة")}
        </div>
      </div>
    );
  }

  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 outline-none text-sm transition-all";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-xl font-bold text-gray-800">الوصولات المالية</h2>
        <button onClick={() => setShowForm(!showForm)} className={`px-4 py-2.5 rounded-xl text-white shadow-md text-xs font-black active:scale-95 transition-all ${showForm ? 'bg-gray-500' : 'bg-purple-600'}`}>
          {showForm ? 'إلغاء' : 'إصدار وصل جديد +'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-purple-50 shadow-xl space-y-4 animate-fade-in no-print">
          <div className="flex gap-3">
            <button type="button" onClick={() => setType(VoucherType.RECEIPT)} className={`flex-1 py-3 rounded-xl border-2 font-black text-sm transition-all ${type === VoucherType.RECEIPT ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-gray-50 text-gray-400 border-transparent'}`}>وصل قبض ↓</button>
            <button type="button" onClick={() => setType(VoucherType.PAYMENT)} className={`flex-1 py-3 rounded-xl border-2 font-black text-sm transition-all ${type === VoucherType.PAYMENT ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-gray-50 text-gray-400 border-transparent'}`}>وصل صرف ↑</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1">اسم الطرف الآخر</label>
              <input type="text" value={partyName} onChange={(e) => setPartyName(e.target.value)} className={inputClass} placeholder="الاسم" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1">رقم الهاتف المستلم</label>
              <PhoneInput value={partyPhone} onChange={setPartyPhone} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1">العملة</label>
              <select value={currency} onChange={(e)=>setCurrency(e.target.value as Currency)} className={inputClass}>
                <option value="IQD">دينار عراقي (IQD)</option>
                <option value="USD">دولار أمريكي (USD)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1">المبلغ</label>
              <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={inputClass} placeholder="0" required />
            </div>
          </div>

          {amount > 0 && (
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex justify-between items-center">
              <span className="text-xs font-bold text-purple-700">القيمة المعادلة (سعر الصرف: {settings.exchangeRate})</span>
              <span className="text-base font-black text-purple-900">
                {getEquivalentAmount(amount, currency).toLocaleString(undefined, { maximumFractionDigits: 2 })} {CURRENCY_SYMBOLS[currency === 'IQD' ? 'USD' : 'IQD']}
              </span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-400 mb-1">سبب القبض / الصرف</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="اكتب تفاصيل سبب العملية المالية هنا..." rows={2} required />
          </div>
          <button type="submit" disabled={isSending} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center gap-2">
            {isSending ? 'جاري الحفظ...' : 'تأكيد وإصدار الوصل'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden no-print">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b">
            <tr className="text-right">
              <th className="p-4 text-xs font-black text-gray-400">النوع</th>
              <th className="p-4 text-xs font-black text-gray-400">الطرف</th>
              <th className="p-4 text-xs font-black text-gray-400">المبلغ</th>
              <th className="p-4 text-xs font-black text-gray-400">البيان</th>
              <th className="p-4 text-xs font-black text-gray-400 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {vouchers.map(v => {
              const eqAmt = getEquivalentAmount(v.amount, v.currency);
              const eqCurr = v.currency === 'IQD' ? 'USD' : 'IQD';
              return (
                <tr key={v.id} className="hover:bg-gray-50 transition-all">
                  <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.type === VoucherType.RECEIPT ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{v.type === VoucherType.RECEIPT ? 'قبض' : 'صرف'}</span></td>
                  <td className="p-4 text-sm font-bold text-gray-800">{v.partyName}</td>
                  <td className="p-4 text-sm font-black text-gray-900">{v.amount.toLocaleString()} {CURRENCY_SYMBOLS[v.currency]}</td>
                  <td className="p-4 text-xs text-gray-500 max-w-[200px] truncate">{v.description}</td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    <button onClick={() => setSelectedVoucher(v)} className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-[10px] font-black hover:bg-purple-600 hover:text-white transition-all">🖨️ طباعة</button>
                    {canEdit && <button onClick={() => onDelete(v.id)} className="text-red-300 hover:text-red-600 transition-colors">🗑️</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VoucherManager;
