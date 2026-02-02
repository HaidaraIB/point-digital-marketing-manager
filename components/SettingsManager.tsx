
import React, { useState, useRef } from 'react';
import { AgencySettings } from '../types.ts';

interface Props {
  settings: AgencySettings;
  onUpdate: (settings: AgencySettings) => void;
}

const SettingsManager: React.FC<Props> = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState<AgencySettings>(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('twilio.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        twilio: { ...prev.twilio, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: name === 'exchangeRate' ? Number(value) : value }));
    }
  };

  const handleToggleTwilio = () => {
    setFormData(prev => ({
      ...prev,
      twilio: { ...prev.twilio, isEnabled: !prev.twilio.isEnabled }
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { name: 'خدمة جديدة', description: 'وصف الخدمة هنا' }]
    }));
  };

  const updateService = (index: number, field: 'name' | 'description', value: string) => {
    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setFormData(prev => ({ ...prev, services: newServices }));
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const addTerm = () => {
    setFormData(prev => ({
      ...prev,
      quotationTerms: [...prev.quotationTerms, 'شرط جديد يضاف لعرض السعر']
    }));
  };

  const updateTerm = (index: number, value: string) => {
    const newTerms = [...formData.quotationTerms];
    newTerms[index] = value;
    setFormData(prev => ({ ...prev, quotationTerms: newTerms }));
  };

  const removeTerm = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quotationTerms: prev.quotationTerms.filter((_, i) => i !== index)
    }));
  };

  const save = () => {
    onUpdate(formData);
    alert('تم حفظ كافة الإعدادات بنجاح!');
  };

  const inputClass = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white outline-none text-sm transition-all duration-300";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-800 to-violet-900 p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">إعدادات النظام</h2>
            <p className="opacity-70 text-sm font-bold">تخصيص الهوية، الخدمات، والربط التقني</p>
          </div>
          <div className="relative group">
            <img src={formData.logo} alt="Logo" className="h-20 w-20 bg-white rounded-2xl object-cover shadow-2xl border-4 border-white/20" />
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          {/* قسم المالية والعملات */}
          <div>
            <h3 className="text-sm font-black text-purple-900 mb-4 border-r-4 border-purple-600 pr-3">الإعدادات المالية وسعر الصرف</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
              <div>
                <label className="block text-xs font-black mb-2 text-yellow-800 uppercase">سعر الصرف اليومي (1$ مقابل د.ع)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="exchangeRate" 
                    value={formData.exchangeRate} 
                    onChange={handleChange} 
                    className={`${inputClass} !bg-white border-yellow-200 focus:ring-yellow-500/10 text-lg font-black`} 
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-yellow-600">دينار</span>
                </div>
                <p className="mt-2 text-[10px] text-yellow-700 font-bold">يستخدم هذا السعر للتحويل التلقائي بين العملات في كافة أجزاء النظام.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-purple-900 mb-4 border-r-4 border-purple-600 pr-3">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black mb-2 text-gray-500 uppercase">اسم الوكالة</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-black mb-2 text-gray-500 uppercase">رابط الشعار (URL)</label>
                <input type="text" name="logo" value={formData.logo} onChange={handleChange} className={inputClass} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-black mb-2 text-gray-500 uppercase">رقم الهاتف الرسمي</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-black mb-2 text-gray-500 uppercase">البريد الإلكتروني</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-black mb-2 text-gray-500 uppercase">العنوان الفعلي</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* الخدمات */}
          <div className="border-t pt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-purple-900 border-r-4 border-purple-600 pr-3">الخدمات المقدمة</h3>
              <button onClick={addService} className="text-[10px] bg-purple-50 text-purple-600 px-4 py-2 rounded-xl font-black border border-purple-100 hover:bg-purple-600 hover:text-white transition-all">
                + إضافة خدمة جديدة
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.services.map((service, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                  <button onClick={() => removeService(index)} className="absolute top-2 left-2 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  <input 
                    type="text" 
                    value={service.name} 
                    onChange={(e) => updateService(index, 'name', e.target.value)}
                    className="w-full bg-transparent font-black text-sm text-gray-800 outline-none mb-1"
                    placeholder="اسم الخدمة"
                  />
                  <input 
                    type="text" 
                    value={service.description} 
                    onChange={(e) => updateService(index, 'description', e.target.value)}
                    className="w-full bg-transparent text-xs text-gray-500 outline-none"
                    placeholder="وصف مختصر للخدمة"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-purple-900 border-r-4 border-purple-600 pr-3">شروط وأحكام عروض الأسعار</h3>
              <button onClick={addTerm} className="text-[10px] bg-purple-50 text-purple-600 px-4 py-2 rounded-xl font-black border border-purple-100 hover:bg-purple-600 hover:text-white transition-all">
                + إضافة بند جديد
              </button>
            </div>
            <div className="space-y-3">
              {formData.quotationTerms.map((term, index) => (
                <div key={index} className="flex gap-3 items-start group">
                  <span className="mt-2 text-purple-300 font-black text-xs">#{index + 1}</span>
                  <textarea 
                    value={term} 
                    onChange={(e) => updateTerm(index, e.target.value)}
                    className={`${inputClass} !p-2 min-h-[60px]`}
                  />
                  <button onClick={() => removeTerm(index)} className="mt-2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                </div>
              ))}
            </div>
          </div>

          {/* Twilio */}
          <div className="border-t pt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-purple-900 border-r-4 border-purple-600 pr-3 flex items-center gap-2">
                ربط إشعارات SMS (Twilio)
              </h3>
              <button 
                onClick={handleToggleTwilio}
                className={`px-4 py-2 rounded-full text-[10px] font-black transition-all ${formData.twilio.isEnabled ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}
              >
                {formData.twilio.isEnabled ? 'الربط مفعل ✅' : 'الربط معطل ❌'}
              </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50/50 p-6 rounded-2xl border border-purple-100 transition-opacity ${!formData.twilio.isEnabled && 'opacity-40 pointer-events-none'}`}>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-500 mb-1">Account SID</label>
                <input 
                  type="text" 
                  name="twilio.accountSid" 
                  value={formData.twilio.accountSid} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1">Auth Token</label>
                <input 
                  type="password" 
                  name="twilio.authToken" 
                  value={formData.twilio.authToken} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="••••••••••••••••••••"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-1">رقم الإرسال (Twilio Number)</label>
                <input 
                  type="text" 
                  name="twilio.fromNumber" 
                  value={formData.twilio.fromNumber} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="+123456789"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-500 mb-1">اسم المرسل (Sender ID)</label>
                <input 
                  type="text" 
                  name="twilio.senderName" 
                  value={formData.twilio.senderName} 
                  onChange={handleChange} 
                  className={inputClass} 
                  placeholder="NOQTA"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t">
            <button 
              onClick={save}
              className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-purple-100 hover:bg-purple-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <span>💾</span> حفظ كافة الإعدادات والبيانات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
