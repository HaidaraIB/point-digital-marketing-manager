import React from 'react';
import { AgencySettings, User, UserRole } from '../types.ts';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: AgencySettings;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, settings, user }) => {
  const isAccountant = user?.role === UserRole.ACCOUNTANT;
  const allMenuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
    { id: 'quotations', label: 'عروض الأسعار', icon: '📝' },
    { id: 'vouchers', label: 'الوصولات', icon: '🧾' },
    { id: 'expenses', label: 'المصاريف والرواتب', icon: '💸' },
    { id: 'withdrawals', label: 'سحوبات المالك', icon: '🏦' },
    { id: 'contracts', label: 'العقود', icon: '🖋️' },
    { id: 'sms-logs', label: 'سجل الرسائل', icon: '💬' },
    { id: 'users', label: 'المستخدمين', icon: '👥' },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
  ];
  const menuItems = isAccountant
    ? allMenuItems.filter((m) => m.id !== 'withdrawals' && m.id !== 'settings')
    : allMenuItems;

  return (
    <div className="h-full bg-white flex flex-col no-print border-l lg:border-l-0 border-gray-100">
      <div className="p-6 border-b border-gray-50 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-purple-100 rounded-3xl blur-lg group-hover:blur-xl transition-all opacity-40"></div>
          <img src={settings.logo} alt="Agency Logo" className="relative w-20 h-20 rounded-2xl mb-4 shadow-sm object-contain bg-white p-2" />
        </div>
        <span className="font-black text-purple-900 text-center text-sm tracking-tight">{settings.name}</span>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTab === item.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-100 translate-x-1'
                : 'text-gray-500 hover:bg-purple-50 hover:text-purple-700'
            }`}
          >
            <span className="text-xl shrink-0">{item.icon}</span>
            <span className="font-bold text-xs md:text-sm whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-50">
        <div className="bg-gray-50 rounded-2xl p-4 text-[10px] text-gray-400 font-bold">
          <p className="flex justify-between mb-1"><span>النظام:</span> <span className="text-purple-600">نقطة v2.0</span></p>
          <p className="flex justify-between"><span>الحالة:</span> <span className="text-green-500">متصل ⚡</span></p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
