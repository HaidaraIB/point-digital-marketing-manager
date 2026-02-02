
import React, { useState } from 'react';
import { User, UserRole } from '../types.ts';

interface Props {
  users: User[];
  onAdd: (user: User) => void;
  onDelete: (id: string) => void;
}

const UserManager: React.FC<Props> = ({ users, onAdd, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.ACCOUNTANT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;

    const newUser: User = {
      id: `U-${Date.now().toString().slice(-4)}`,
      name,
      username,
      password,
      role,
      createdAt: new Date().toLocaleDateString('ar-IQ'),
    };

    onAdd(newUser);
    setName('');
    setUsername('');
    setPassword('');
    setShowForm(false);
  };

  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white focus:scale-[1.01] outline-none text-sm transition-all duration-300 focus-glow";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">إدارة فريق العمل</h2>
          <p className="text-gray-500 text-sm">إضافة المحاسبين والمدراء وصلاحيات الوصول</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-white shadow-md active:scale-95 ${showForm ? 'bg-gray-500' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          {showForm ? 'إلغاء' : 'إضافة مستخدم جديد +'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xl space-y-4 animate-fade-in no-print">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-purple-900">الاسم الكامل</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="اسم الموظف"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-purple-900">اسم المستخدم</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                placeholder="username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-purple-900">كلمة المرور</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-purple-900">الدور الوظيفي</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className={inputClass}
              >
                <option value={UserRole.ACCOUNTANT}>محاسب</option>
                <option value={UserRole.ADMIN}>مدير نظام</option>
              </select>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all active:scale-[0.99]"
          >
            تأكيد الإضافة
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group animate-fade-in">
            <div className={`absolute top-0 right-0 w-1.5 h-full ${user.role === UserRole.ADMIN ? 'bg-purple-600' : 'bg-blue-400'}`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl transform transition-transform group-hover:rotate-12">
                {user.role === UserRole.ADMIN ? '👑' : '💼'}
              </div>
              <button 
                onClick={() => onDelete(user.id)}
                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="حذف المستخدم"
              >
                🗑️
              </button>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
              <p className="text-gray-400 text-sm mb-3">@{user.username}</p>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {user.role}
                </span>
                <span className="text-[10px] text-gray-300">منذ {user.createdAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className="p-20 text-center text-gray-400 bg-white rounded-3xl border-2 border-dashed border-gray-100 animate-fade-in">
           لا يوجد مستخدمون مضافون حالياً.
        </div>
      )}
    </div>
  );
};

export default UserManager;
