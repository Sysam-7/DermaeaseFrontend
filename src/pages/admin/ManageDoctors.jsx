import { useEffect, useState } from 'react';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const token = localStorage.getItem('token');
  function load(){ fetch('/api/users/doctors').then(r=>r.json()).then(d=>d.success && setDoctors(d.data)); }
  useEffect(() => { load(); }, []);
  async function approve(id){
    await fetch(`/api/users/${id}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    load();
  }
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Manage Doctors</h2>
      <ul className="space-y-2">
        {doctors.map((d)=> (
          <li key={d._id} className="border p-2 flex justify-between">
            <div>{d.name} • {d.specialty} • {d.verified ? 'Verified' : 'Pending'}</div>
            {!d.verified && <button className="bg-yellow-400 px-3 py-1 rounded" onClick={()=>approve(d._id)}>Approve</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}


