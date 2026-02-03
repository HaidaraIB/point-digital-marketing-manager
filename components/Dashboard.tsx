
import React, { useState, useMemo } from 'react';
import { AppData, VoucherType, Currency } from '../types.ts';
import { CURRENCY_SYMBOLS } from '../constants.tsx';
import { analyzeFinances } from '../services/geminiService.ts';

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  const convertToIQD = (amt: number, curr: Currency) => {
    if (curr === 'IQD' || !curr) return amt;
    return amt * data.settings.exchangeRate;
  };

  const totals = useMemo(() => {
    const receiptsIQD = data.vouchers
      .filter(v => v.type === VoucherType.RECEIPT)
      .reduce((sum, v) => sum + convertToIQD(v.amount, v.currency), 0);

    const allPaymentsIQD = data.vouchers
      .filter(v => v.type === VoucherType.PAYMENT)
      .reduce((sum, v) => sum + convertToIQD(v.amount, v.currency), 0);

    const ownerWithdrawalsIQD = data.vouchers
      .filter(v => v.type === VoucherType.PAYMENT && v.category === 'OWNER_WITHDRAWAL')
      .reduce((sum, v) => sum + convertToIQD(v.amount, v.currency), 0);

    const operatingExpensesIQD = allPaymentsIQD - ownerWithdrawalsIQD;

    return {
      receipts: receiptsIQD,
      operatingExpenses: operatingExpensesIQD,
      ownerWithdrawals: ownerWithdrawalsIQD,
      balance: receiptsIQD - allPaymentsIQD
    };
  }, [data]);

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const analysis = await analyzeFinances(data);
    setAiAnalysis(analysis || "");
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-gradient-to-br from-purple-900 via-indigo-950 to-black text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/20 animate-pulse">✨</div>
              <div>
                <h4 className="text-2xl font-black tracking-tight">مساعد نقطة الذكي (Gemini 3)</h4>
                <p className="text-purple-300 text-xs font-bold uppercase tracking-widest">Financial Intelligence</p>
              </div>
            </div>
            {aiAnalysis ? (
              <div className="bg-white/5 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 animate-fade-in ring-1 ring-white/20 shadow-inner">
                <p className="text-white text-base md:text-lg leading-relaxed font-bold italic text-right">"{aiAnalysis}"</p>
              </div>
            ) : (
              <button 
                onClick={handleAiAnalysis}
                disabled={loadingAi}
                className="bg-white text-purple-950 px-10 py-5 rounded-2xl font-black text-sm md:text-base hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all flex items-center gap-4 active:scale-95"
              >
                {loadingAi ? 'جاري معالجة البيانات...' : 'توليد التحليل المالي الذكي'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="font-black text-gray-800 flex items-center gap-2 mb-6"><span className="text-purple-600 text-xl">📝</span> أحدث عروض الأسعار</h4>
          <div className="space-y-4">
            {data.quotations.slice(0, 4).map(q => (
              <div key={q.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-transparent hover:border-purple-100 hover:bg-white transition-all group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">📄</div>
                   <div>
                    <p className="font-bold text-gray-800 text-sm">{q.clientName}</p>
                    <p className="text-[10px] text-gray-400 font-black">{q.date}</p>
                  </div>
                </div>
                <div className="text-left" dir="ltr">
                  <p className="font-black text-sm text-gray-900">{q.total.toLocaleString()} {CURRENCY_SYMBOLS[q.currency]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="font-black text-gray-800 flex items-center gap-2 mb-6"><span className="text-purple-600 text-xl">🧾</span> أحدث العمليات المالية</h4>
          <div className="space-y-4">
            {data.vouchers.slice(0, 4).map(v => (
              <div key={v.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-transparent hover:border-purple-100 hover:bg-white transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${v.type === VoucherType.RECEIPT ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {v.type === VoucherType.RECEIPT ? 'IN' : 'OUT'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm truncate max-w-[150px]">{v.partyName}</p>
                  </div>
                </div>
                <div className="text-left" dir="ltr">
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
