
import React, { useState } from 'react';
// Added Currency to imports from types.ts
import { Contract, AgencySettings, ContractClause, Currency } from '../types.ts';
// Fixed: Changed CURRENCY to CURRENCY_SYMBOLS as it's the correct export from constants.tsx
import { CURRENCY_SYMBOLS, DEFAULT_CLAUSES } from '../constants.tsx';

interface Props {
  contracts: Contract[];
  settings: AgencySettings;
  onAdd: (c: Contract) => void;
  onDelete: (id: string) => void;
  canEdit?: boolean;
}

const ContractManager: React.FC<Props> = ({ contracts, settings, onAdd, onDelete, canEdit = true }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Form states
  const [partyAName, setPartyAName] = useState(settings.name);
  const [partyATitle, setPartyATitle] = useState('الطرف الأول / وكالة تسويق رقمي');
  const [partyBName, setPartyBName] = useState('');
  const [partyBTitle, setPartyBTitle] = useState('الطرف الثاني / العميل');
  const [subject, setSubject] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  // Added currency state
  const [currency, setCurrency] = useState<Currency>('IQD');
  const [clauses, setClauses] = useState<ContractClause[]>(DEFAULT_CLAUSES);

  const handleAddClause = () => {
    const id = Date.now().toString();
    setClauses([...clauses, { id, title: 'مادة جديدة', content: 'نص المادة القانونية هنا...' }]);
  };

  const handleUpdateClause = (id: string, field: 'title' | 'content', value: string) => {
    setClauses(clauses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleRemoveClause = (id: string) => {
    setClauses(clauses.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fixed: Added the missing currency property to satisfy the Contract interface
    const newContract: Contract = {
      id: `CN-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('ar-IQ'),
      partyAName,
      partyATitle,
      partyBName,
      partyBTitle,
      subject,
      totalValue,
      currency,
      clauses,
      status: 'ACTIVE'
    };
    onAdd(newContract);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setPartyBName('');
    setSubject('');
    setTotalValue(0);
    setCurrency('IQD');
    setClauses(DEFAULT_CLAUSES);
  };

  const handlePrint = () => window.print();

  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none text-sm transition-all";

  if (selectedContract) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between items-center no-print">
          <button onClick={() => setSelectedContract(null)} className="bg-white text-gray-700 px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm">
            <span>←</span> عودة للقائمة
          </button>
          <button onClick={handlePrint} className="bg-purple-600 text-white px-8 py-2 rounded-xl shadow-lg hover:bg-purple-700 flex items-center gap-2 text-sm">
            <span>🖨️</span> طباعة العقد الرسمي (A4)
          </button>
        </div>

        <div className="bg-white mx-auto shadow-2xl print:shadow-none overflow-hidden rounded-xl print:rounded-none" 
             style={{ width: '210mm', minHeight: '297mm', padding: '25mm' }}>
          
          {/* Official Header */}
          <div className="flex justify-between items-start border-b-4 border-gray-800 pb-6 mb-10">
            <div className="text-right space-y-1">
              <h2 className="text-xl font-black text-gray-900">{settings.name}</h2>
              <p className="text-xs text-gray-500">للتسويق الرقمي والحلول المتكاملة</p>
              <p className="text-[10px] text-gray-400">العراق - {settings.address}</p>
            </div>
            <img src={settings.logo} alt="Logo" className="w-20 h-20 object-contain grayscale print:grayscale-0" />
            <div className="text-left text-[10px] font-bold text-gray-400 space-y-1" dir="ltr">
              <p>REF NO: {selectedContract.id}</p>
              <p>DATE: {selectedContract.date}</p>
              <p>CONTRACT TYPE: LEGAL AGREEMENT</p>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-2xl font-black text-gray-900 underline underline-offset-8 decoration-2">عقد اتفاق تقديم خدمات تسويقية</h1>
          </div>

          {/* Legal Intro / Preamble */}
          <div className="mb-10 leading-relaxed text-sm text-gray-800 space-y-6">
            <p className="text-justify font-bold">
              إنه في يوم الموافق {selectedContract.date}، تم إبرام هذا العقد والاتفاق عليه بين كل من:
            </p>
            
            <div className="space-y-4 border-r-4 border-gray-100 pr-6">
              <div>
                <span className="font-black text-gray-900">الطرف الأول:</span> {selectedContract.partyAName}، بصفته {selectedContract.partyATitle}، ويشار إليه في هذا العقد بـ (الوكالة).
              </div>
              <div>
                <span className="font-black text-gray-900">الطرف الثاني:</span> {selectedContract.partyBName}، بصفته {selectedContract.partyBTitle}، ويشار إليه في هذا العقد بـ (العميل).
              </div>
            </div>

            <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
              <p className="font-black text-gray-900 mb-1">التمهيد:</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                حيث أن الطرف الأول وكالة متخصصة في تقديم الحلول الرقمية، وحيث رغب الطرف الثاني في الاستعانة بخبرات الطرف الأول لتنفيذ ( {selectedContract.subject} )، فقد التقت إرادة الطرفين على التعاقد وفقاً للمواد التالية:
              </p>
            </div>
          </div>

          {/* Legal Articles */}
          <div className="space-y-8 mb-16">
            {selectedContract.clauses.map((clause, idx) => (
              <div key={clause.id} className="space-y-2">
                <h4 className="font-black text-gray-900 flex items-center gap-2">
                  <span className="bg-gray-900 text-white w-8 h-8 rounded flex items-center justify-center text-xs">المادة {idx + 1}</span>
                  <span>{clause.title}</span>
                </h4>
                <p className="text-sm text-gray-700 text-justify leading-relaxed pr-10">{clause.content}</p>
              </div>
            ))}
          </div>

          {/* Value Section */}
          <div className="mb-20 p-5 bg-gray-50 border-2 border-gray-900 rounded-xl flex justify-between items-center">
             <span className="font-black text-gray-900 text-sm uppercase">القيمة الإجمالية للعقد:</span>
             {/* Fixed: Used CURRENCY_SYMBOLS with selectedContract.currency */}
             <span className="text-2xl font-black text-gray-900">{selectedContract.totalValue.toLocaleString()} {CURRENCY_SYMBOLS[selectedContract.currency]}</span>
          </div>

          {/* Formal Signatures with Stamp Spaces */}
          <div className="grid grid-cols-2 gap-12 pt-10">
            <div className="space-y-12">
              <div className="text-center">
                <p className="font-black text-gray-900 text-sm mb-4">توقيع وختم الطرف الأول (الوكالة)</p>
                <div className="h-28 w-44 mx-auto border-2 border-dashed border-gray-200 rounded-2xl relative flex items-center justify-center">
                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Official Stamp</span>
                  <img src={settings.logo} className="absolute inset-0 m-auto w-16 opacity-10 grayscale" alt="watermark" />
                </div>
              </div>
              <p className="text-center font-bold text-xs">الاسم: .......................................</p>
            </div>
            
            <div className="space-y-12">
              <div className="text-center">
                <p className="font-black text-gray-900 text-sm mb-4">توقيع الطرف الثاني (العميل)</p>
                <div className="h-28 w-44 mx-auto border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center">
                   <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Signature</span>
                </div>
              </div>
              <p className="text-center font-bold text-xs">الاسم: .......................................</p>
            </div>
          </div>

          {/* Footer Page Numbering */}
          <div className="mt-20 text-center border-t pt-4 text-[10px] text-gray-400 font-bold">
            هذا العقد يتكون من (1) صفحة واحدة فقط وصدرت منه نسختان، نسخة لكل طرف.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-xl font-bold">إدارة العقود القانونية</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2.5 rounded-xl transition-all text-white shadow-md text-sm ${showForm ? 'bg-gray-500' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          {showForm ? 'إلغاء' : 'إنشاء عقد قانوني جديد +'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xl space-y-6 no-print animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-purple-900 border-b pb-2">بيانات الطرف الأول (الوكالة)</h4>
              <input type="text" value={partyAName} onChange={(e) => setPartyAName(e.target.value)} className={inputClass} placeholder="اسم الطرف الأول" required />
              <input type="text" value={partyATitle} onChange={(e) => setPartyATitle(e.target.value)} className={inputClass} placeholder="منصب الطرف الأول" required />
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-purple-900 border-b pb-2">بيانات الطرف الثاني (العميل)</h4>
              <input type="text" value={partyBName} onChange={(e) => setPartyBName(e.target.value)} className={inputClass} placeholder="اسم العميل الكامل" required />
              <input type="text" value={partyBTitle} onChange={(e) => setPartyBTitle(e.target.value)} className={inputClass} placeholder="بصفته (مثلاً: المدير المفوض)" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-4">
             <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 mb-1 block">موضوع الاتفاق (باختصار)</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} placeholder="مثال: إدارة صفحات التواصل الاجتماعي لعام 2024" required />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">العملة</label>
                <select value={currency} onChange={(e)=>setCurrency(e.target.value as Currency)} className={inputClass}>
                  <option value="IQD">دينار عراقي (IQD)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                </select>
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">القيمة الإجمالية</label>
                <input type="number" value={totalValue} onChange={(e) => setTotalValue(Number(e.target.value))} className={inputClass} placeholder="0" required />
             </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-purple-900">المواد القانونية للعقد</h4>
              <button type="button" onClick={handleAddClause} className="text-[10px] bg-purple-50 text-purple-600 px-3 py-1 rounded-full border border-purple-200 hover:bg-purple-600 hover:text-white transition-all">+ إضافة مادة مخصصة</button>
            </div>
            <div className="space-y-3">
              {clauses.map((clause, index) => (
                <div key={clause.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 relative group">
                   <button type="button" onClick={() => handleRemoveClause(clause.id)} className="absolute top-2 left-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                   <div className="flex items-center gap-2 mb-2">
                     <span className="bg-purple-600 text-white w-6 h-6 rounded flex items-center justify-center text-[10px]">م {index + 1}</span>
                     <input 
                      type="text" 
                      value={clause.title} 
                      onChange={(e) => handleUpdateClause(clause.id, 'title', e.target.value)}
                      className="bg-transparent font-bold text-sm w-full outline-none focus:text-purple-600"
                      placeholder="عنوان المادة"
                     />
                   </div>
                   <textarea 
                    value={clause.content} 
                    onChange={(e) => handleUpdateClause(clause.id, 'content', e.target.value)}
                    className="bg-transparent text-xs w-full outline-none resize-none text-gray-500 leading-relaxed"
                    rows={2}
                    placeholder="نص المادة القانونية..."
                   />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all">حفظ وإصدار العقد الرسمي</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        {contracts.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 bg-purple-600 h-full"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 rounded-xl text-xl">🏛️</div>
              {canEdit && <button onClick={() => onDelete(c.id)} className="text-red-400 opacity-0 group-hover:opacity-100 p-1">🗑️</button>}
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{c.partyBName}</h3>
            <p className="text-[10px] text-gray-400 mb-3 truncate">{c.subject}</p>
            <div className="flex justify-between items-center">
              {/* Fixed: Used CURRENCY_SYMBOLS with c.currency */}
              <span className="text-xs font-black text-purple-600">{c.totalValue.toLocaleString()} {CURRENCY_SYMBOLS[c.currency]}</span>
              <button onClick={() => setSelectedContract(c)} className="text-[10px] font-bold bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-purple-600 transition-all">عرض وطباعة</button>
            </div>
          </div>
        ))}
        {contracts.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400 italic bg-white rounded-3xl border-2 border-dashed border-gray-100">
            لا توجد عقود رسمية مسجلة حالياً
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractManager;
