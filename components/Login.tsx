
import React, { useState } from 'react';
import { User, AgencySettings } from '../types.ts';

interface Props {
  users: User[];
  settings: AgencySettings;
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ users, settings, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && (u.password === password || (!u.password && password === '123')));
    
    if (user) {
      onLogin(user);
    } else {
      setError('خطأ في اسم المستخدم أو كلمة المرور');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-purple-50">
        <div className="bg-gradient-to-br from-purple-700 to-violet-900 p-10 text-center text-white relative">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-white rounded-3xl mb-6 shadow-xl flex items-center justify-center p-2 overflow-hidden transform hover:scale-105 transition-transform">
              <img src={settings.logo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <h1 className="text-2xl font-black mb-1">{settings.name}</h1>
            <p className="text-purple-200 text-sm opacity-80 uppercase tracking-widest font-bold">نظام الإدارة المالية</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        </div>

        <div className="p-10 space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-purple-900 mb-2 uppercase tracking-wide pr-1">اسم المستخدم</label>
              <div className="relative group">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg grayscale group-focus-within:grayscale-0 transition-all">👤</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm font-bold"
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-purple-900 mb-2 uppercase tracking-wide pr-1">كلمة المرور</label>
              <div className="relative group">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg grayscale group-focus-within:grayscale-0 transition-all">🔒</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm font-bold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl border border-red-100 font-bold text-center animate-pulse">
                ⚠️ {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              دخول للنظام
              <span className="text-xl">⚡</span>
            </button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              جميع الحقوق محفوظة لوكالة نقطة &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
