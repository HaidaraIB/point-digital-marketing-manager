
import React, { useState } from 'react';
import { Quotation, AgencySettings, ServiceItem, QuotationStatus, SMSLog, Currency } from '../types.ts';
import { CURRENCY_SYMBOLS } from '../constants.tsx';
import { sendSMS } from '../services/smsService.ts';
import PhoneInput from './PhoneInput.tsx';
import { QRCodeCanvas } from 'qrcode.react';
import Barcode from 'react-barcode';

interface Props {
  quotations: Quotation[];
  settings: AgencySettings;
  onAdd: (q: Quotation) => Promise<Quotation | null>;
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: QuotationStatus) => void;
  onSMSLog: (log: Omit<SMSLog, 'id' | 'timestamp'>) => void;
  canEdit?: boolean;
}

const QuotationManager: React.FC<Props> = ({ quotations, settings, onAdd, onDelete, onStatusUpdate, onSMSLog, canEdit = true }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [price, setPrice] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const addItem = () => {
    if (!selectedServiceName || price <= 0) return;
    const newItem: ServiceItem = { id: Date.now().toString(), description: selectedServiceName, price, quantity: 1, currency };
    setItems([...items, newItem]);
    setSelectedServiceName('');
    setPrice(0);
  };

  const getEquivalentAmount = (amt: number, curr: Currency, rate?: number) => {
    const r = rate ?? settings.exchangeRate;
    if (curr === 'IQD') return amt / r;
    return amt * r;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || items.length === 0) return;

    setIsSending(true);

    const total = items.reduce((sum, item) => sum + item.price, 0);

    const newQuotation: Quotation = {
      id: `QT-${Date.now().toString().slice(-6)}`,
      clientName,
      clientPhone,
      date: new Date().toLocaleDateString('ar-IQ'),
      items,
      total,
      currency,
      status: QuotationStatus.PENDING,
      exchangeRate: settings.exchangeRate,
    };

    const added = await onAdd(newQuotation);
    const quotationForSms = added || newQuotation;

    if (clientPhone && settings.twilio.isEnabled) {
      const message = `عزيزنا ${clientName}، تم إرسال عرض سعر رسمي من ${settings.name} رقم العرض: ${quotationForSms.id} يرجى مراجعة الواتساب او بريدكم الالكتروني، شكراً لتعاملكم معنا`;
      const result = await sendSMS(settings.twilio, clientPhone, message);
      onSMSLog({
        to: clientPhone,
        body: message,
        status: result.success ? 'SUCCESS' : 'FAILED',
        error: result.error
      });
    }

    setClientName('');
    setClientPhone('');
    setItems([]);
    setShowForm(false);
    setIsSending(false);
  };

  const handlePrint = () => window.print();

  if (selectedQuotation) {
    const rateUsed = selectedQuotation.exchangeRate ?? settings.exchangeRate;
    const eqTotal = getEquivalentAmount(selectedQuotation.total, selectedQuotation.currency, rateUsed);
    const eqSymbol = selectedQuotation.currency === 'IQD' ? CURRENCY_SYMBOLS.USD : CURRENCY_SYMBOLS.IQD;

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center no-print">
          <button onClick={() => setSelectedQuotation(null)} className="bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm">
            <span>←</span> عودة للقائمة
          </button>
          <button onClick={handlePrint} className="bg-black text-white px-8 py-2 rounded-xl shadow-lg hover:bg-gray-900 flex items-center gap-2 text-sm">
            <span>🖨️</span> طباعة عرض السعر
          </button>
        </div>

        <div className="bg-white mx-auto shadow-2xl print:shadow-none p-[20mm] rounded-xl print:rounded-none" style={{ width: '210mm', minHeight: '297mm' }}>
          <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
            <div className="text-right">
              <h1 className="text-2xl font-black text-black">{settings.name}</h1>
              <p className="text-sm text-gray-500">{settings.phone}</p>
            </div>
            <img src={settings.logo} alt="Logo" className="h-20 w-20 object-contain grayscale" />
          </div>

          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-xl font-black text-black mb-1">عرض سعر رقم: {selectedQuotation.id}</h2>
              <p className="text-sm font-bold text-gray-400">التاريخ: {selectedQuotation.date}</p>
            </div>
            <div className="text-left bg-gray-50 p-4 rounded-xl border border-black min-w-[180px]">
              <p className="text-[10px] font-black text-gray-400 uppercase">موجه إلى</p>
              <p className="text-lg font-black text-black">{selectedQuotation.clientName}</p>
            </div>
          </div>

          <table className="w-full mb-10 border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-3 text-right text-sm">تفاصيل الخدمة</th>
                <th className="p-3 text-left text-sm">السعر ({CURRENCY_SYMBOLS[selectedQuotation.currency]})</th>
              </tr>
            </thead>
            <tbody>
              {selectedQuotation.items.map((item) => {
                const serviceInfo = settings.services.find(s => s.name === item.description);
                return (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="p-3">
                      <p className="text-sm text-black font-bold">{item.description}</p>
                      {serviceInfo?.description && (
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{serviceInfo.description}</p>
                      )}
                    </td>
                    <td className="p-3 text-sm font-black text-left">{item.price.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td className="p-4 text-right font-black text-black text-lg">الإجمالي الكلي</td>
                <td className="p-4 text-left font-black text-black text-xl">{selectedQuotation.total.toLocaleString()} {CURRENCY_SYMBOLS[selectedQuotation.currency]}</td>
              </tr>
              <tr className="bg-white">
                <td colSpan={2} className="p-4 text-left font-bold text-gray-400 text-sm">
                  بما يعادل تقريباً: <span className="text-black">{eqTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} {eqSymbol}</span>
                  <span className="text-[10px] block font-normal mt-1">(حسب سعر صرف عند الإصدار: {rateUsed})</span>
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mb-16">
            <h4 className="font-black text-black mb-4 border-r-4 border-black pr-3">الشروط والأحكام:</h4>
            <ul className="space-y-2">
              {settings.quotationTerms.map((term, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex gap-2">
                  <span className="font-bold text-black">•</span> {term}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-20 pt-10 border-t border-gray-200">
            <div className="text-center flex flex-col items-center gap-4">
              <div className="flex gap-4 items-center">
                <div className="p-2 bg-white border border-gray-100 rounded-lg">
                  <QRCodeCanvas value={`QUOTATION:${selectedQuotation.id}`} size={64} />
                </div>
                <div className="scale-75 origin-right">
                  <Barcode value={selectedQuotation.id} height={30} width={1.2} fontSize={10} />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-mono">التحقق من صحة العرض</p>
            </div>
            <div className="text-center">
              <p className="font-black text-black mb-10">توقيع وختم الوكالة</p>
              <div className="h-20 w-40 mx-auto border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center">
                 <img src={settings.logo} className="h-10 opacity-10 grayscale" alt="seal" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 outline-none text-sm transition-all";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-xl font-bold text-gray-800">إدارة عروض الأسعار</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-purple-600 text-white px-4 py-2.5 rounded-xl font-black text-xs">
          {showForm ? 'إلغاء' : 'إضافة عرض جديد +'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-xl border border-purple-50 space-y-4 animate-fade-in no-print">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1">اسم العميل</label>
              <input type="text" value={clientName} onChange={(e)=>setClientName(e.target.value)} className={inputClass} placeholder="الاسم الكامل" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1">رقم الهاتف</label>
              <PhoneInput value={clientPhone} onChange={setClientPhone} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1">عملة العرض</label>
              <select value={currency} onChange={(e)=>setCurrency(e.target.value as Currency)} className={inputClass}>
                <option value="IQD">دينار عراقي (IQD)</option>
                <option value="USD">دولار أمريكي (USD)</option>
              </select>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <select value={selectedServiceName} onChange={(e)=>setSelectedServiceName(e.target.value)} className={`${inputClass} flex-1`}>
                <option value="">اختر الخدمة...</option>
                {settings.services.map((service, idx) => (
                  <option key={idx} value={service.name}>{service.name}</option>
                ))}
              </select>
              <div className="relative w-full md:w-32">
                <input type="number" value={price === 0 ? '' : price} onChange={(e)=>setPrice(Number(e.target.value))} className={`${inputClass} pr-8`} placeholder="السعر" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">{CURRENCY_SYMBOLS[currency]}</span>
              </div>
              <button type="button" onClick={addItem} className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold text-xs w-full md:w-auto">إضافة</button>
            </div>
            <div className="space-y-1">
              {items.map(item => (
                <div key={item.id} className="text-xs font-bold text-gray-600 bg-white p-2.5 border rounded-xl flex justify-between shadow-sm">
                  <span>{item.description}</span>
                  <div className="flex items-center gap-4">
                    <span>{item.price.toLocaleString()} {CURRENCY_SYMBOLS[currency]}</span>
                    <button type="button" onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-300">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isSending || items.length === 0} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg">
            {isSending ? 'جاري الإرسال...' : 'إصدار العرض وإرسال SMS'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden no-print">
         <table className="w-full text-right">
           <thead className="bg-gray-50 border-b">
             <tr className="text-right">
               <th className="p-4 text-xs font-black text-gray-400">العميل</th>
               <th className="p-4 text-xs font-black text-gray-400">الإجمالي</th>
               <th className="p-4 text-xs font-black text-gray-400 text-center">إجراءات</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-50">
             {quotations.map(q => <tr key={q.id} className="hover:bg-gray-50 transition-all">
               <td className="p-4">
                 <p className="text-sm font-bold text-gray-800">{q.clientName}</p>
                 <p className="text-[10px] text-gray-400 font-mono">{q.id}</p>
               </td>
               <td className="p-4">
                 <p className="text-sm font-black text-purple-600">{q.total.toLocaleString()} {CURRENCY_SYMBOLS[q.currency]}</p>
                 <p className="text-[9px] text-gray-400 font-bold">{getEquivalentAmount(q.total, q.currency, q.exchangeRate).toLocaleString(undefined, {maximumFractionDigits:2})} {q.currency === 'IQD' ? '$' : 'د.ع'}</p>
               </td>
               <td className="p-4 flex items-center justify-center gap-2">
                 <button onClick={() => setSelectedQuotation(q)} className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-[10px] font-black">🖨️ طباعة</button>
                 {canEdit && <button onClick={() => onDelete(q.id)} className="text-red-200">🗑️</button>}
               </td>
             </tr>)}
           </tbody>
         </table>
      </div>
    </div>
  );
};

export default QuotationManager;
