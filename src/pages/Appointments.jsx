import { useEffect, useState } from 'react';

export default function Appointments() {
  const [items, setItems] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => d.success && setItems(d.data));
    fetch('/api/users/doctors').then(r=>r.json()).then(d=>d.success && setDoctors(d.data));
  }, []);

  async function createAppt() {
    const res = await fetch('/api/appointments', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ doctorId, start, end })
    });
    const d = await res.json();
    if (d.success) setItems((prev) => [...prev, d.data]);
    else alert(d.message);
  }

  async function updateStatus(id, status) {
    const res = await fetch(`/api/appointments/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    const d = await res.json();
    if (d.success) setItems((prev) => prev.map((i) => (i._id === id ? d.data : i)));
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Appointments</h2>
      {role === 'patient' && (
        <div className="space-y-2 border p-3">
          <select className="border p-2 w-full" value={doctorId} onChange={(e)=>setDoctorId(e.target.value)}>
            <option value="">Select Doctor</option>
            {doctors.map((d)=> <option key={d._id} value={d._id}>{d.name} ({d.specialty})</option>)}
          </select>
          <input className="border p-2 w-full" type="datetime-local" value={start} onChange={(e)=>setStart(e.target.value)} />
          <input className="border p-2 w-full" type="datetime-local" value={end} onChange={(e)=>setEnd(e.target.value)} />
          <button className="bg-yellow-400 px-3 py-2 rounded" onClick={createAppt}>Book</button>
        </div>
      )}
      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a._id} className="border p-2 flex justify-between">
            <div>
              <div>{new Date(a.start).toLocaleString()} - {new Date(a.end).toLocaleString()}</div>
              <div>Status: {a.status}</div>
            </div>
            <div className="space-x-2">
              {role === 'doctor' && (
                <>
                  <button onClick={()=>updateStatus(a._id,'approved')} className="px-2 py-1 bg-green-500 text-white rounded">Approve</button>
                  <button onClick={()=>updateStatus(a._id,'rejected')} className="px-2 py-1 bg-red-500 text-white rounded">Reject</button>
                </>
              )}
              {role === 'patient' && (
                <button onClick={()=>updateStatus(a._id,'cancelled')} className="px-2 py-1 bg-gray-300 rounded">Cancel</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


