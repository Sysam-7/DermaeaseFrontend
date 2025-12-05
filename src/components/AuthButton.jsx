import React from 'react';

export default function AuthButton({ children, loading, onClick, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center justify-center px-5 py-3 rounded-xl shadow-md text-white bg-gradient-to-r from-green-500 to-amber-200 hover:scale-[1.01] transition ${loading ? 'opacity-80 cursor-wait' : ''} ${className}`}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}