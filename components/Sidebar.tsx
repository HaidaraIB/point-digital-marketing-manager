
import React from 'react';
import { AgencySettings } from '../types.ts';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: AgencySettings;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, settings }) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
    { id: 'quotations', label: 'عروض الأسعار', icon: '📝' },
    { id: 'vouchers', label: 'الوصولات', icon: '🧾' },
    { id: 'expenses', label: 'المصاريف والرواتب', icon: '💸' },
    { id: 'contracts', label: 'العقود', icon: '🖋️' },
    { id: 'sms-logs', label: 'سجل الرسائل', icon: '💬' }, // العنصر الجديد
    { id: 'users', label: 'المستخدمين', icon: '👥' },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
  ];

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col no-print shadow-xl md:shadow-none">
      <div className="p-6 border-b border-gray-100 flex flex-col items-center">
        <img src={settings.logo} alt="Agency Logo" className="w-16 h-16 rounded-2xl mb-4 shadow-md object-cover" />
        <span className="font-bold text-gray-900 text-center text-sm">{settings.name}</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-xl p-3 text-[10px] text-gray-500">
          <p>المشغل: وكالة نقطة</p>
          <p>الإصدار: 1.3.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
