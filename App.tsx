
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import QuotationManager from './components/QuotationManager.tsx';
import VoucherManager from './components/VoucherManager.tsx';
import SettingsManager from './components/SettingsManager.tsx';
import UserManager from './components/UserManager.tsx';
import ContractManager from './components/ContractManager.tsx';
import ExpenseManager from './components/ExpenseManager.tsx';
import SMSLogManager from './components/SMSLogManager.tsx'; // إضافة المكون الجديد
import Login from './components/Login.tsx';
import { INITIAL_DATA } from './constants.tsx';
import { AppData, User, SMSLog } from './types.ts';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('noqta_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    localStorage.setItem('noqta_data', JSON.stringify(data));
  }, [data]);

  const syncUpdate = (updater: (prev: AppData) => AppData) => {
    setData(prev => updater(prev));
  };

  // وظيفة إضافة سجل رسالة جديدة
  const addSMSLog = (log: Omit<SMSLog, 'id' | 'timestamp'>) => {
    const newLog: SMSLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('ar-IQ')
    };
    syncUpdate(prev => ({ ...prev, smsLogs: [newLog, ...prev.smsLogs] }));
  };

  if (!user) {
    return <Login users={data.users} settings={data.settings} onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans" dir="rtl">
      <div className="w-64 flex-shrink-0 h-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} settings={data.settings} />
      </div>
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        
        {activeTab === 'quotations' && (
          <QuotationManager 
            quotations={data.quotations} 
            settings={data.settings}
            onAdd={(q) => syncUpdate(prev => ({ ...prev, quotations: [q, ...prev.quotations] }))}
            onDelete={(id) => syncUpdate(prev => ({ ...prev, quotations: prev.quotations.filter(q => q.id !== id) }))}
            onStatusUpdate={(id, status) => syncUpdate(prev => ({ 
              ...prev, 
              quotations: prev.quotations.map(q => q.id === id ? { ...q, status } : q) 
            }))}
            onSMSLog={addSMSLog}
          />
        )}

        {activeTab === 'vouchers' && (
          <VoucherManager 
            vouchers={data.vouchers} 
            settings={data.settings}
            onAdd={(v) => syncUpdate(prev => ({ ...prev, vouchers: [v, ...prev.vouchers] }))}
            onDelete={(id) => syncUpdate(prev => ({ ...prev, vouchers: prev.vouchers.filter(v => v.id !== id) }))}
            onSMSLog={addSMSLog}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseManager 
            vouchers={data.vouchers} 
            settings={data.settings}
            onAdd={(v) => syncUpdate(prev => ({ ...prev, vouchers: [v, ...prev.vouchers] }))}
            onUpdate={(v) => syncUpdate(prev => ({ ...prev, vouchers: prev.vouchers.map(item => item.id === v.id ? v : item) }))}
            onDelete={(id) => syncUpdate(prev => ({ ...prev, vouchers: prev.vouchers.filter(v => v.id !== id) }))}
            onSMSLog={addSMSLog}
          />
        )}

        {activeTab === 'sms-logs' && (
          <SMSLogManager 
            logs={data.smsLogs} 
            onClear={() => syncUpdate(prev => ({ ...prev, smsLogs: [] }))} 
          />
        )}

        {/* ... بقية التبويبات ... */}
        {activeTab === 'contracts' && (
          <ContractManager 
            contracts={data.contracts} 
            settings={data.settings}
            onAdd={(c) => syncUpdate(prev => ({ ...prev, contracts: [c, ...prev.contracts] }))}
            onDelete={(id) => syncUpdate(prev => ({ ...prev, contracts: prev.contracts.filter(c => c.id !== id) }))}
          />
        )}
        {activeTab === 'users' && <UserManager users={data.users} onAdd={(u)=>syncUpdate(p=>({...p, users:[u,...p.users]}))} onDelete={(id)=>syncUpdate(p=>({...p, users:p.users.filter(x=>x.id!==id)}))} />}
        {activeTab === 'settings' && <SettingsManager settings={data.settings} onUpdate={(s)=>syncUpdate(p=>({...p, settings:s}))} />}
      </main>
    </div>
  );
};

export default App;
