import React from 'react';

export default function AuthInput({ label, type = 'text', value, onChange, name, placeholder, error }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-100 transition ${error ? 'border-red-300' : 'border-gray-200'}`}
      />
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  );
}