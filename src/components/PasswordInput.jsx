import React, { useState } from 'react';

function EyeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3.25" />
    </svg>
  );
}

function EyeOffIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 4.24A10.86 10.86 0 0 1 12 4c6 0 9.75 8 9.75 8a17.68 17.68 0 0 1-4.19 5.16M6.61 6.61A17.72 17.72 0 0 0 2.25 12s3.75 8 9.75 8a10.79 10.79 0 0 0 5.03-1.24" />
    </svg>
  );
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Password',
  name,
  required,
  className = '',
  containerClassName = '',
}) {
  const [show, setShow] = useState(false);

  return (
    <div className={`relative ${containerClassName}`}>
      <input
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={className}
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

