import { useEffect, useState } from 'react';

export default function ManageReviews() {
  const [doctorId, setDoctorId] = useState('');
  const [items, setItems] = useState([]);
  const token = localStorage.getItem('token');
  async function load(){ if(!doctorId) return; const r= await fetch(`/api/reviews/${doctorId}`); const d= await r.json(); if(d.success) setItems(d.data); }
  async function remove(id){ await fetch(`/api/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); load(); }
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Manage Reviews</h2>
      <input className="border p-2" placeholder="Doctor ID" value={doctorId} onChange={(e)=>setDoctorId(e.target.value)} />
      <button className="bg-gray-200 px-3 py-1 rounded" onClick={load}>Load</button>
      <ul className="space-y-2">
        {items.map((r)=> (
          <li key={r._id} className="border p-2 flex justify-between">
            <div>{r.rating}★ - {r.text}</div>
            <button onClick={()=>remove(r._id)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}


