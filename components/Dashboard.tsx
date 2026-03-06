import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AppData, VoucherType, Currency } from '../types.ts';
import { CURRENCY_SYMBOLS } from '../constants.tsx';
import { analyzeFinances } from '../services/geminiService.ts';

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

const MONTH_NAMES_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function formatMonthForInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatMonthLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number);
  if (!m || m < 1 || m > 12) return yyyyMm;
  return `${MONTH_NAMES_AR[m - 1]} ${y}`;
}

function getVoucherMonth(dateStr: string): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const s = dateStr.trim();
  if (s.length >= 7 && s[4] === '-' && s[6] === '-') {
    return s.substring(0, 7);
  }
  const parts = s.split('/');
  if (parts.length < 3) return null;
  const cleanParts = parts.map(p => p.replace(/[٠-٩]/g, d => ARABIC_DIGITS.indexOf(d).toString()));
  const day = parseInt(cleanParts[0], 10);
  const month = parseInt(cleanParts[1], 10);
  const year = parseInt(cleanParts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return null;
  return formatMonthForInput(date);
}

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => formatMonthForInput(new Date()));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const [y] = selectedMonth.split('-').map(Number);
    setPickerYear(y);
  }, [pickerOpen, selectedMonth]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    }
    if (pickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [pickerOpen]);

  const handleSelectMonth = (month1Based: number) => {
    const m = String(month1Based).padStart(2, '0');
    setSelectedMonth(`${pickerYear}-${m}`);
    setPickerOpen(false);
  };

  const handleThisMonth = () => {
    const now = new Date();
    setSelectedMonth(formatMonthForInput(now));
    setPickerYear(now.getFullYear());
    setPickerOpen(false);
  };

  const handleClear = () => {
    handleThisMonth();
  };

  const convertToIQD = (amt: number, curr: Currency, rate?: number) => {
    if (curr === 'IQD' || !curr) return amt;
    const r = rate ?? data.settings.exchangeRate;
    return amt * r;
  };

  const vouchersForMonth = useMemo(() => {
    return data.vouchers.filter(v => getVoucherMonth(v.date) === selectedMonth);
  }, [data.vouchers, selectedMonth]);

  const totals = useMemo(() => {
    const receiptsIQD = vouchersForMonth
      .filter(v => v.type === VoucherType.RECEIPT)
      .reduce((sum, v) => sum + convertToIQD(v.amount, v.currency, v.exchangeRate), 0);

    const allPaymentsIQD = vouchersForMonth
      .filter(v => v.type === VoucherType.PAYMENT)
      .reduce((sum, v) => sum + convertToIQD(v.amount, v.currency, v.exchangeRate), 0);

    const ownerWithdrawalsIQD = vouchersForMonth
      .filter(v => v.type === VoucherType.PAYMENT && v.category === 'OWNER_WITHDRAWAL')
      .reduce((sum, v) => sum + convertToIQD(v.amount, v.currency, v.exchangeRate), 0);

    const operatingExpensesIQD = allPaymentsIQD - ownerWithdrawalsIQD;

    return {
      receipts: receiptsIQD,
      operatingExpenses: operatingExpensesIQD,
      ownerWithdrawals: ownerWithdrawalsIQD,
      balance: receiptsIQD - allPaymentsIQD
    };
  }, [data.settings.exchangeRate, vouchersForMonth]);

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const analysis = await analyzeFinances(data);
    setAiAnalysis(analysis || "");
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center gap-3" ref={pickerRef}>
        <span className="text-gray-600 text-sm font-bold">الشهر</span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 font-bold text-sm hover:border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none min-w-[10rem] justify-between"
            dir="ltr"
          >
            <span>{formatMonthLabel(selectedMonth)}</span>
            <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          {pickerOpen && (
            <div className="absolute top-full left-0 rtl:left-auto rtl:right-0 mt-1 z-50 w-64 min-w-[16rem] bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-gray-100 px-3 py-2 border-b border-gray-200">
                <input
                  type="number"
                  value={pickerYear}
                  onChange={e => setPickerYear(Number(e.target.value) || new Date().getFullYear())}
                  min={2000}
                  max={2100}
                  className="w-full bg-transparent text-center text-gray-700 font-bold text-sm outline-none"
                  dir="ltr"
                />
              </div>
              <div className="p-3 grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
                {MONTH_NAMES_AR.map((name, i) => {
                  const month1 = i + 1;
                  const [selY, selM] = selectedMonth.split('-').map(Number);
                  const isSelected = pickerYear === selY && month1 === selM;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelectMonth(month1)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
                <button type="button" onClick={handleClear} className="text-blue-600 text-sm font-bold hover:underline">
                  مسح
                </button>
                <button type="button" onClick={handleThisMonth} className="text-blue-600 text-sm font-bold hover:underline">
                  هذا الشهر
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* شبكة البطاقات المستجيبة: 1 في الموبايل، 2 في التابلت، 4 في الديسكتوب */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <p className="text-gray-500 text-sm mb-1 font-medium">إجمالي المقبوضات</p>
          <h3 className="text-2xl font-black text-green-600 tracking-tight group-hover:scale-105 transition-transform">{totals.receipts.toLocaleString()} <span className="text-xs font-bold opacity-70">د.ع</span></h3>
          <p className="text-[10px] text-gray-400 mt-1 font-bold">≈ {(totals.receipts / data.settings.exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} $</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <p className="text-gray-500 text-sm mb-1 font-medium">المصاريف التشغيلية</p>
          <h3 className="text-2xl font-black text-red-500 tracking-tight group-hover:scale-105 transition-transform">{totals.operatingExpenses.toLocaleString()} <span className="text-xs font-bold opacity-70">د.ع</span></h3>
          <p className="text-[10px] text-gray-400 mt-1 font-bold">≈ {(totals.operatingExpenses / data.settings.exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} $</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <p className="text-gray-500 text-sm mb-1 font-medium">سحوبات المالك</p>
          <h3 className="text-2xl font-black text-indigo-600 tracking-tight group-hover:scale-105 transition-transform">{totals.ownerWithdrawals.toLocaleString()} <span className="text-xs font-bold opacity-70">د.ع</span></h3>
          <p className="text-[10px] text-gray-400 mt-1 font-bold">≈ {(totals.ownerWithdrawals / data.settings.exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} $</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <p className="text-gray-500 text-sm mb-1 font-medium">الرصيد المتاح</p>
          <h3 className="text-2xl font-black text-purple-600 tracking-tight group-hover:scale-105 transition-transform">{totals.balance.toLocaleString()} <span className="text-xs font-bold opacity-70">د.ع</span></h3>
          <p className="text-[10px] text-gray-400 mt-1 font-bold">≈ {(totals.balance / data.settings.exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} $</p>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-[2.5rem] blur opacity-25"></div>
        <div className="relative bg-gradient-to-br from-purple-900 via-indigo-950 to-black text-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 text-center md:text-right">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center text-2xl mx-auto md:mx-0 animate-pulse">✨</div>
              <div>
                <h4 className="text-xl md:text-2xl font-black tracking-tight">مساعد نقطة المالي (Gemini 3)</h4>
                <p className="text-purple-300 text-[10px] font-bold uppercase tracking-widest">Financial Insights</p>
              </div>
            </div>
            {aiAnalysis ? (
              <div className="bg-white/5 backdrop-blur-md p-5 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 animate-fade-in ring-1 ring-white/20 shadow-inner">
                <p className="text-white text-sm md:text-lg leading-relaxed font-bold italic text-right">"{aiAnalysis}"</p>
              </div>
            ) : (
              <button 
                onClick={handleAiAnalysis}
                disabled={loadingAi}
                className="w-full md:w-auto bg-white text-purple-950 px-8 py-4 rounded-xl font-black text-sm hover:shadow-xl transition-all active:scale-95"
              >
                {loadingAi ? 'جاري تحليل الأداء...' : 'توليد التحليل المالي الذكي'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h4 className="font-black text-gray-800 flex items-center gap-2 mb-6"><span className="text-purple-600 text-xl">📝</span> أحدث عروض الأسعار</h4>
          <div className="space-y-4">
            {data.quotations.slice(0, 4).map(q => (
              <div key={q.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-white border border-transparent hover:border-purple-100 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                   <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center text-lg shadow-sm shrink-0">📄</div>
                   <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{q.clientName}</p>
                    <p className="text-[10px] text-gray-400 font-black">{q.date}</p>
                  </div>
                </div>
                <div className="text-left shrink-0" dir="ltr">
                  <p className="font-black text-sm text-gray-900">{q.total.toLocaleString()} {CURRENCY_SYMBOLS[q.currency]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h4 className="font-black text-gray-800 flex items-center gap-2 mb-6"><span className="text-purple-600 text-xl">🧾</span> أحدث العمليات المالية</h4>
          <div className="space-y-4">
            {data.vouchers.slice(0, 4).map(v => (
              <div key={v.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-white border border-transparent hover:border-purple-100 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm shrink-0 ${v.type === VoucherType.RECEIPT ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {v.type === VoucherType.RECEIPT ? 'IN' : 'OUT'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{v.partyName}</p>
                    <p className="text-[10px] text-gray-400 font-black">{v.date}</p>
                  </div>
                </div>
                <div className="text-left shrink-0" dir="ltr">
                  <p className={`font-black text-sm ${v.type === VoucherType.RECEIPT ? 'text-green-600' : 'text-red-500'}`}>
                    {v.type === VoucherType.RECEIPT ? '+' : '-'}{v.amount.toLocaleString()} {CURRENCY_SYMBOLS[v.currency]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
