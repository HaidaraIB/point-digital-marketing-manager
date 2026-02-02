import React, { useState, useEffect, useCallback } from 'react';
import { AppData, Quotation, Voucher, Contract, AgencySettings, User, QuotationStatus, SMSLog } from './types.ts';
import { INITIAL_DATA } from './constants.tsx';
import { isApiEnabled } from './services/api.ts';
import { getCurrentUser, logoutApi } from './services/authService.ts';
import * as dataService from './services/dataService.ts';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import QuotationManager from './components/QuotationManager.tsx';
import VoucherManager from './components/VoucherManager.tsx';
import SettingsManager from './components/SettingsManager.tsx';
import UserManager from './components/UserManager.tsx';
import ContractManager from './components/ContractManager.tsx';
import ExpenseManager from './components/ExpenseManager.tsx';
import SMSLogManager from './components/SMSLogManager.tsx';
import Login from './components/Login.tsx';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiError, setApiError] = useState<string | null>(null);

  const STORAGE_KEY = 'noqta_data';
  const useApi = isApiEnabled();

  const loadInitial = useCallback(async () => {
    try {
      if (useApi) {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          sessionStorage.setItem('noqta_user', JSON.stringify(currentUser));
          const appData = await dataService.fetchAppData();
          if (appData) setData(appData);
        }
      } else {
        const savedUser = sessionStorage.getItem('noqta_user');
        if (savedUser) setUser(JSON.parse(savedUser));
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (!parsed.contracts) parsed.contracts = [];
          if (!parsed.smsLogs) parsed.smsLogs = [];
          setData(parsed);
        }
      }
    } catch (e) {
      console.error('Data restore failed', e);
      setApiError(useApi ? 'فشل الاتصال بالخادم' : null);
    } finally {
      setLoading(false);
    }
  }, [useApi]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const saveToLocal = (newData: AppData) => {
    if (useApi) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  };

  const syncUpdate = (updater: (prev: AppData) => AppData) => {
    setData(prev => {
      const next = updater(prev);
      saveToLocal(next);
      return next;
    });
  };

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    sessionStorage.setItem('noqta_user', JSON.stringify(loggedInUser));
    if (useApi) {
      try {
        const appData = await dataService.fetchAppData();
        if (appData) setData(appData);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('noqta_user');
    if (useApi) logoutApi();
  };

  const addSMSLog = async (log: Omit<SMSLog, 'id' | 'timestamp'>) => {
    if (useApi) {
      try {
        const created = await dataService.createSmsLog(log);
        if (created) setData(prev => ({ ...prev, smsLogs: [created, ...prev.smsLogs] }));
      } catch (e) {
        console.error(e);
      }
    } else {
      const newLog: SMSLog = {
        ...log,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString('ar-IQ'),
      };
      syncUpdate(prev => ({ ...prev, smsLogs: [newLog, ...prev.smsLogs] }));
    }
  };

  const handleClearSmsLogs = async () => {
    if (useApi) {
      try {
        await dataService.clearSmsLogs();
        setData(prev => ({ ...prev, smsLogs: [] }));
      } catch (e) {
        console.error(e);
      }
    } else {
      syncUpdate(prev => ({ ...prev, smsLogs: [] }));
    }
  };

  const handleAddQuotation = async (q: Quotation) => {
    if (useApi) {
      try {
        const payload = {
          clientName: q.clientName,
          clientPhone: q.clientPhone,
          date: q.date,
          items: q.items.map(i => ({ description: i.description, price: i.price, quantity: i.quantity, currency: i.currency })),
          status: q.status,
          note: q.note,
          currency: q.currency,
        };
        const created = await dataService.createQuotation(payload);
        if (created) setData(prev => ({ ...prev, quotations: [created, ...prev.quotations] }));
      } catch (e) {
        console.error(e);
      }
    } else {
      syncUpdate(prev => ({ ...prev, quotations: [q, ...prev.quotations] }));
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    if (useApi) {
      const ok = await dataService.deleteQuotation(id);
      if (ok) setData(prev => ({ ...prev, quotations: prev.quotations.filter(q => q.id !== id) }));
    } else {
      syncUpdate(prev => ({ ...prev, quotations: prev.quotations.filter(q => q.id !== id) }));
    }
  };

  const handleQuotationStatusUpdate = async (id: string, status: QuotationStatus) => {
    if (useApi) {
      const updated = await dataService.setQuotationStatus(id, status);
      if (updated) setData(prev => ({ ...prev, quotations: prev.quotations.map(q => q.id === id ? updated : q) }));
    } else {
      syncUpdate(prev => ({ ...prev, quotations: prev.quotations.map(q => q.id === id ? { ...q, status } : q) }));
    }
  };

  const handleAddVoucher = async (v: Voucher) => {
    if (useApi) {
      try {
        const payload = {
          type: v.type,
          amount: v.amount,
          currency: v.currency,
          date: v.date,
          description: v.description,
          partyName: v.partyName,
          partyPhone: v.partyPhone,
          category: v.category,
        };
        const created = await dataService.createVoucher(payload);
        if (created) setData(prev => ({ ...prev, vouchers: [created, ...prev.vouchers] }));
      } catch (e) {
        console.error(e);
      }
    } else {
      syncUpdate(prev => ({ ...prev, vouchers: [v, ...prev.vouchers] }));
    }
  };

  const handleUpdateVoucher = async (v: Voucher) => {
    if (useApi) {
      try {
        const payload = {
          type: v.type,
          amount: v.amount,
          currency: v.currency,
          date: v.date,
          description: v.description,
          partyName: v.partyName,
          partyPhone: v.partyPhone,
          category: v.category,
        };
        const updated = await dataService.updateVoucher(v.id, payload);
        if (updated) setData(prev => ({ ...prev, vouchers: prev.vouchers.map(item => item.id === v.id ? updated : item) }));
      } catch (e) {
        console.error(e);
      }
    } else {
      syncUpdate(prev => ({ ...prev, vouchers: prev.vouchers.map(item => item.id === v.id ? v : item) }));
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (useApi) {
      const ok = await dataService.deleteVoucher(id);
      if (ok) setData(prev => ({ ...prev, vouchers: prev.vouchers.filter(v => v.id !== id) }));
    } else {
      syncUpdate(prev => ({ ...prev, vouchers: prev.vouchers.filter(v => v.id !== id) }));
    }
  };

  const handleAddContract = async (c: Contract) => {
    if (useApi) {
      try {
        const payload = {
          date: c.date,
          partyAName: c.partyAName,
          partyATitle: c.partyATitle,
          partyBName: c.partyBName,
          partyBTitle: c.partyBTitle,
          subject: c.subject,
          totalValue: c.totalValue,
          currency: c.currency,
          clauses: c.clauses.map(x => ({ title: x.title, content: x.content })),
          status: c.status,
        };
        const created = await dataService.createContract(payload);
        if (created) setData(prev => ({ ...prev, contracts: [created, ...prev.contracts] }));
      } catch (e) {
        console.error(e);
      }
    } else {
      syncUpdate(prev => ({ ...prev, contracts: [c, ...prev.contracts] }));
    }
  };

  const handleDeleteContract = async (id: string) => {
    if (useApi) {
      const ok = await dataService.deleteContract(id);
      if (ok) setData(prev => ({ ...prev, contracts: prev.contracts.filter(c => c.id !== id) }));
    } else {
      syncUpdate(prev => ({ ...prev, contracts: prev.contracts.filter(c => c.id !== id) }));
    }
  };

  const handleAddUser = async (u: User) => {
    if (useApi) {
      try {
        const payload = { name: u.name!, username: u.username, password: u.password || '', role: u.role === 'مدير نظام' ? 'ADMIN' : 'ACCOUNTANT' };
        const created = await dataService.createUser(payload);
        if (created) setData(prev => ({ ...prev, users: [created, ...prev.users] }));
      } catch (e) {
        console.error(e);
      }
    } else {
      syncUpdate(prev => ({ ...prev, users: [u, ...prev.users] }));
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (useApi) {
      const ok = await dataService.deleteUser(id);
      if (ok) setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
    } else {
      syncUpdate(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
    }
  };

  const handleUpdateSettings = async (s: AgencySettings) => {
    if (useApi) {
      const updated = await dataService.updateSettings(s);
      if (updated) setData(prev => ({ ...prev, settings: updated }));
      else {
        const created = await dataService.createSettings(s);
        if (created) setData(prev => ({ ...prev, settings: created }));
      }
    } else {
      syncUpdate(prev => ({ ...prev, settings: s }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50" dir="rtl">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-purple-900 animate-pulse">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Login
        users={data.users}
        settings={data.settings}
        onLogin={handleLogin}
        useApi={useApi}
        apiError={apiError}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans" dir="rtl">
      <div className="w-64 flex-shrink-0 h-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} settings={data.settings} />
      </div>
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-6 flex justify-between items-center no-print">
          <h1 className="text-xl font-bold text-gray-800">أهلاً بك، {user.name.split(' ')[0]}</h1>
          <button onClick={handleLogout} className="text-xs bg-gray-100 hover:bg-red-50 hover:text-red-500 px-3 py-2 rounded-lg font-bold transition-all text-gray-500">
            تسجيل الخروج
          </button>
        </header>

        {activeTab === 'dashboard' && <Dashboard data={data} />}

        {activeTab === 'quotations' && (
          <QuotationManager
            quotations={data.quotations}
            settings={data.settings}
            onAdd={handleAddQuotation}
            onDelete={handleDeleteQuotation}
            onStatusUpdate={handleQuotationStatusUpdate}
            onSMSLog={addSMSLog}
          />
        )}

        {activeTab === 'vouchers' && (
          <VoucherManager
            vouchers={data.vouchers}
            settings={data.settings}
            onAdd={handleAddVoucher}
            onDelete={handleDeleteVoucher}
            onSMSLog={addSMSLog}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseManager
            vouchers={data.vouchers}
            settings={data.settings}
            onAdd={handleAddVoucher}
            onUpdate={handleUpdateVoucher}
            onDelete={handleDeleteVoucher}
            onSMSLog={addSMSLog}
          />
        )}

        {activeTab === 'sms-logs' && (
          <SMSLogManager logs={data.smsLogs} onClear={handleClearSmsLogs} />
        )}

        {activeTab === 'contracts' && (
          <ContractManager
            contracts={data.contracts}
            settings={data.settings}
            onAdd={handleAddContract}
            onDelete={handleDeleteContract}
          />
        )}

        {activeTab === 'users' && (
          <UserManager users={data.users} onAdd={handleAddUser} onDelete={handleDeleteUser} />
        )}

        {activeTab === 'settings' && (
          <SettingsManager settings={data.settings} onUpdate={handleUpdateSettings} />
        )}
      </main>
    </div>
  );
};

export default App;
