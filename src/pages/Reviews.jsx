import { useEffect, useState } from 'react';

export default function Reviews() {
  const [doctorId, setDoctorId] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [items, setItems] = useState([]);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  async function load() {
    if (!doctorId) return;
    const res = await fetch(`/api/reviews/${doctorId}`);
    const d = await res.json();
    if (d.success) setItems(d.data);
  }

  async function save() {
    const res = await fetch('/api/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ doctorId, rating: Number(rating), text })
    });
    const d = await res.json();
    if (d.success) load();
  }

  async function remove(id) {
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json();
    if (d.success) load();
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Reviews</h2>
      <input className="border p-2 w-full" placeholder="Doctor ID" value={doctorId} onChange={(e)=>setDoctorId(e.target.value)} />
      <button className="bg-gray-200 px-3 py-1 rounded" onClick={load}>Load</button>
      {role === 'patient' && (
        <div className="flex gap-2">
          <input className="border p-2" type="number" min="1" max="5" value={rating} onChange={(e)=>setRating(e.target.value)} />
          <input className="border p-2 flex-1" placeholder="Write review" value={text} onChange={(e)=>setText(e.target.value)} />
          <button className="bg-yellow-400 px-3 py-2 rounded" onClick={save}>Save</button>
        </div>
      )}
      <ul className="space-y-2">
        {items.map((r) => (
          <li key={r._id} className="border p-2 flex justify-between">
            <div>
              <div>Rating: {r.rating}</div>
              <div>{r.text}</div>
            </div>
            {role === 'admin' && <button onClick={()=>remove(r._id)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}


