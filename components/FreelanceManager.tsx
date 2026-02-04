
import React, { useState, useMemo } from 'react';
import { Freelancer, FreelanceWork, AgencySettings, Currency, VoucherType, Voucher } from '../types.ts';
import { CURRENCY_SYMBOLS } from '../constants.tsx';
import PhoneInput from './PhoneInput.tsx';

interface Props {
  freelancers: Freelancer[];
  works: FreelanceWork[];
  settings: AgencySettings;
  onAddFreelancer: (f: Freelancer) => void;
  onAddWork: (w: FreelanceWork) => void;
  onPayWork: (workIds: string[], voucher: Voucher) => void;
}

const FreelanceManager: React.FC<Props> = ({ freelancers, works, settings, onAddFreelancer, onAddWork, onPayWork }) => {
  const [activeSubTab, setActiveSubTab] = useState<'LIST' | 'WORKS' | 'SETTLEMENT'>('LIST');
  const [showFreelancerForm, setShowFreelancerForm] = useState(false);
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1); // التلقائي هو الشهر السابق
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // States for Freelancer Form
  const [fName, setFName] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fRole, setFRole] = useState<'PHOTOGRAPHER' | 'EDITOR'>('PHOTOGRAPHER');

  // States for Work Form
  const [wFreelancerId, setWFreelancerId] = useState('');
  const [wDesc, setWDesc] = useState('');
  const [wPrice, setWPrice] = useState(0);
  const [wCurrency, setWCurrency] = useState<Currency>('IQD');
  const [wDate, setWDate] = useState(new Date().toISOString().split('T')[0]);

  // Selected for Printing Settlement
  const [printSettlement, setPrintSettlement] = useState<{ freelancer: Freelancer, works: FreelanceWork[], month: string } | null>(null);

  const handleAddFreelancer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName || !fPhone) return;
    const newF: Freelancer = { id: `FL-${Date.now().toString().slice(-4)}`, name: fName, phone: fPhone, role: fRole };
    onAddFreelancer(newF);
    setFName('');
    setFPhone('');
    setShowFreelancerForm(false);
  };

  const handleAddWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wFreelancerId || !wDesc || wPrice <= 0) return;
    const newW: FreelanceWork = {
      id: `WK-${Date.now().toString().slice(-6)}`,
      freelancerId: wFreelancerId,
      description: wDesc,
      date: wDate,
      price: wPrice,
      currency: wCurrency,
      isPaid: false
    };
    onAddWork(newW);
    setWDesc('');
    setWPrice(0);
    setShowWorkForm(false);
  };

  const settlementData = useMemo(() => {
    if (!selectedFreelancerId) return [];
    return works.filter(w => {
      const wMonth = w.date.substring(0, 7);
      return w.freelancerId === selectedFreelancerId && wMonth === selectedMonth && !w.isPaid;
    });
  }, [works, selectedFreelancerId, selectedMonth]);

  const totalSettlement = settlementData.reduce((sum, w) => sum + w.price, 0);

  const confirmPayment = () => {
    if (settlementData.length === 0) return;
    const freelancer = freelancers.find(f => f.id === selectedFreelancerId);
    if (!freelancer) return;

    const voucher: Voucher = {
      id: `VC-FL-${Date.now().toString().slice(-6)}`,
      type: VoucherType.PAYMENT,
      amount: totalSettlement,
      currency: settlementData[0].currency,
      date: new Date().toLocaleDateString('ar-IQ'),
      description: `تسوية مستحقات شهر ${selectedMonth} للمستقل: ${freelancer.name}`,
      partyName: freelancer.name,
      category: 'FREELANCE'
    };

    onPayWork(settlementData.map(w => w.id), voucher);
    alert('تم تسجيل عملية الصرف بنجاح');
  };

  const handlePrintSettlement = () => {
    const f = freelancers.find(fl => fl.id === selectedFreelancerId);
    if (!f || settlementData.length === 0) return;
    setPrintSettlement({ freelancer: f, works: settlementData, month: selectedMonth });
    setTimeout(() => window.print(), 500);
  };

  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 outline-none text-sm";

  if (printSettlement) {
    return (
      <div className="animate-fade-in space-y-4">
        <button onClick={() => setPrintSettlement(null)} className="no-print bg-white px-4 py-2 border rounded-xl text-sm">إغلاق الطباعة</button>
        <div
          className="print-a4-sheet print-freelance-sheet bg-white mx-auto p-[15mm] border border-gray-300 rounded-lg"
          style={{ width: '210mm', minHeight: '148mm' }}
        >
          <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
            <div className="text-right">
              <h2 className="text-xl font-black">{settings.name}</h2>
              <p className="text-xs text-gray-500">قسيمة صرف مستحقات فنية</p>
            </div>
            <img src={settings.logo} className="h-12 w-12 object-contain grayscale" alt="logo" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg text-sm">
            <p><span className="font-bold">المستفيد:</span> {printSettlement.freelancer.name}</p>
            <p><span className="font-bold">التخصص:</span> {printSettlement.freelancer.role === 'PHOTOGRAPHER' ? 'مصور' : 'مونتير'}</p>
            <p><span className="font-bold">مستحقات شهر:</span> {printSettlement.month}</p>
            <p><span className="font-bold">تاريخ الصرف:</span> {new Date().toLocaleDateString('ar-IQ')}</p>
          </div>

          <table className="w-full text-xs border-collapse border border-black mb-6">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-2 text-right">التاريخ</th>
                <th className="border border-black p-2 text-right">وصف العمل (القطعة)</th>
                <th className="border border-black p-2 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {printSettlement.works.map(w => (
                <tr key={w.id}>
                  <td className="border border-black p-2">{w.date}</td>
                  <td className="border border-black p-2">{w.description}</td>
                  <td className="border border-black p-2 text-left">{w.price.toLocaleString()} {CURRENCY_SYMBOLS[w.currency]}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-black bg-gray-100">
                <td colSpan={2} className="border border-black p-2 text-left">الإجمالي المستحق للصرف</td>
                <td className="border border-black p-2 text-left">{printSettlement.works.reduce((s,w)=>s+w.price,0).toLocaleString()} {CURRENCY_SYMBOLS[printSettlement.works[0].currency]}</td>
              </tr>
            </tfoot>
          </table>

          <div className="grid grid-cols-2 gap-10 mt-10">
            <div className="text-center">
              <p className="text-xs font-bold mb-10">توقيع المستلم</p>
              <div className="border-b border-black w-32 mx-auto"></div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold mb-10">إدارة الوكالة</p>
              <div className="border-b border-black w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-2 no-print bg-gray-100 p-1.5 rounded-2xl w-fit">
        <button onClick={() => setActiveSubTab('LIST')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'LIST' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}>الفريق</button>
        <button onClick={() => setActiveSubTab('WORKS')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'WORKS' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}>سجل الأعمال</button>
        <button onClick={() => setActiveSubTab('SETTLEMENT')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'SETTLEMENT' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}>التحاسب الشهري</button>
      </div>

      {activeSubTab === 'LIST' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-800">قائمة المستقلين (فري لانس)</h3>
            <button onClick={() => setShowFreelancerForm(!showFreelancerForm)} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold">إضافة شخص جديد +</button>
          </div>

          {showFreelancerForm && (
            <form onSubmit={handleAddFreelancer} className="bg-white p-6 rounded-3xl border shadow-xl space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="الاسم الكامل" value={fName} onChange={e=>setFName(e.target.value)} className={inputClass} required />
                <PhoneInput value={fPhone} onChange={setFPhone} />
                <select value={fRole} onChange={e=>setFRole(e.target.value as any)} className={inputClass}>
                  <option value="PHOTOGRAPHER">مصور</option>
                  <option value="EDITOR">مونتير</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">حفظ الموظف</button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {freelancers.map(f => (
              <div key={f.id} className="bg-white p-5 rounded-2xl border flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-xl">
                  {f.role === 'PHOTOGRAPHER' ? '📸' : '🎬'}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{f.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{f.role === 'PHOTOGRAPHER' ? 'مصور فوتو/فيديو' : 'مونتير محترف'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'WORKS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-800">إدخال قطع العمل المنفذة</h3>
            <button onClick={() => setShowWorkForm(!showWorkForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">إضافة عمل جديد +</button>
          </div>

          {showWorkForm && (
            <form onSubmit={handleAddWork} className="bg-white p-6 rounded-3xl border shadow-xl space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={wFreelancerId} onChange={e=>setWFreelancerId(e.target.value)} className={inputClass} required>
                  <option value="">اختر الشخص المنفذ...</option>
                  {freelancers.map(f => <option key={f.id} value={f.id}>{f.name} ({f.role})</option>)}
                </select>
                <input type="date" value={wDate} onChange={e=>setWDate(e.target.value)} className={inputClass} required />
              </div>
              <input type="text" placeholder="وصف العمل (مثلاً: مونتاج ريلز شركة بغداد)" value={wDesc} onChange={e=>setWDesc(e.target.value)} className={inputClass} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="سعر القطعة" value={wPrice === 0 ? '' : wPrice} onChange={e=>setWPrice(Number(e.target.value))} className={inputClass} required />
                <select value={wCurrency} onChange={e=>setWCurrency(e.target.value as Currency)} className={inputClass}>
                  <option value="IQD">IQD (دينار)</option>
                  <option value="USD">USD (دولار)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">تسجيل العمل في السجل</button>
            </form>
          )}

          <div className="bg-white rounded-2xl border overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b font-black text-gray-400">
                <tr>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">الشخص</th>
                  <th className="p-4">الوصف</th>
                  <th className="p-4">المبلغ</th>
                  <th className="p-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold">
                {works.map(w => (
                  <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">{w.date}</td>
                    <td className="p-4 text-purple-600">{freelancers.find(f=>f.id === w.freelancerId)?.name}</td>
                    <td className="p-4 text-gray-600">{w.description}</td>
                    <td className="p-4">{w.price.toLocaleString()} {CURRENCY_SYMBOLS[w.currency]}</td>
                    <td className="p-4">
                      {w.isPaid ? <span className="text-green-500">✓ تم الصرف</span> : <span className="text-orange-400">⏳ بانتظار التحاسب</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'SETTLEMENT' && (
        <div className="space-y-6">
          <div className="bg-purple-900 text-white p-8 rounded-3xl shadow-lg">
            <h3 className="text-xl font-black mb-6">التحاسب الشهري للمستقلين</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold opacity-70 mb-1">اختر الشخص</label>
                <select value={selectedFreelancerId} onChange={e=>setSelectedFreelancerId(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl outline-none">
                  <option value="" className="text-gray-900">-- اختر الشخص --</option>
                  {freelancers.map(f => <option key={f.id} value={f.id} className="text-gray-900">{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold opacity-70 mb-1">اختر شهر العمل</label>
                <input type="month" value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl outline-none" />
              </div>
            </div>
          </div>

          {selectedFreelancerId && (
            <div className="bg-white p-6 rounded-3xl border space-y-6 animate-fade-in">
              <div className="flex justify-between items-end border-b pb-4">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase">إجمالي المستحقات غير المدفوعة</p>
                  <h4 className="text-3xl font-black text-gray-900">{totalSettlement.toLocaleString()} {settlementData[0]?.currency ? CURRENCY_SYMBOLS[settlementData[0].currency] : ''}</h4>
                </div>
                <div className="flex gap-2">
                   <button onClick={handlePrintSettlement} disabled={settlementData.length === 0} className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-xs">🖨️ طباعة قسيمة الصرف</button>
                   <button onClick={confirmPayment} disabled={settlementData.length === 0} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg">✅ تأكيد صرف المستحقات</button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase">تفاصيل القطع المنجزة لهذا الشهر:</p>
                {settlementData.map(w => (
                  <div key={w.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-purple-200 transition-all">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{w.description}</p>
                      <p className="text-[10px] text-gray-400">{w.date}</p>
                    </div>
                    <p className="font-black text-purple-600">{w.price.toLocaleString()} {CURRENCY_SYMBOLS[w.currency]}</p>
                  </div>
                ))}
                {settlementData.length === 0 && (
                  <p className="p-10 text-center text-gray-400 font-bold bg-gray-50 rounded-2xl">لا توجد أعمال غير مدفوعة لهذا الشخص في الشهر المختار</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FreelanceManager;
