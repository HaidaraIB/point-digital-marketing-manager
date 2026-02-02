
import React, { useState } from 'react';
import { COUNTRY_CODES } from '../constants.tsx';

interface Props {
  value: string;
  onChange: (fullNumber: string) => void;
  placeholder?: string;
}

const PhoneInput: React.FC<Props> = ({ value, onChange, placeholder }) => {
  const [selectedCode, setSelectedCode] = useState(COUNTRY_CODES[0].code);
  const [localNumber, setLocalNumber] = useState('');

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // أرقام فقط
    if (val.startsWith('0')) val = val.substring(1); // إزالة الصفر البادئ إذا وجد
    setLocalNumber(val);
    onChange(`${selectedCode}${val}`);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCode(e.target.value);
    onChange(`${e.target.value}${localNumber}`);
  };

  return (
    <div className="flex gap-1" dir="ltr">
      <select 
        value={selectedCode}
        onChange={handleCodeChange}
        className="p-2.5 bg-gray-100 border border-gray-200 rounded-l-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500"
      >
        {COUNTRY_CODES.map(c => (
          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
        ))}
      </select>
      <input 
        type="tel"
        value={localNumber}
        onChange={handleNumberChange}
        className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-r-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-bold tracking-widest"
        placeholder={placeholder || '770 000 0000'}
      />
    </div>
  );
};

export default PhoneInput;
