import React from 'react';

export default function RoleSelector({ value, onChange }) {
  return (
    <div className="flex gap-3">
      <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer ${value === 'patient' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
        <input type="radio" name="role" value="patient" checked={value === 'patient'} onChange={() => onChange('patient')} />
        <span className="text-sm">Patient</span>
      </label>
      <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer ${value === 'doctor' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
        <input type="radio" name="role" value="doctor" checked={value === 'doctor'} onChange={() => onChange('doctor')} />
        <span className="text-sm">Doctor</span>
      </label>
    </div>
  );
}