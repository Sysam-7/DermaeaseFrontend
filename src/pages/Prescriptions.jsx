import { useEffect, useState } from 'react';

export default function Prescriptions() {
  const [items, setItems] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', notes: '' }]);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetch('/api/prescriptions', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => d.success && setItems(d.data));
  }, []);

  function updateMed(i, key, val) {
    setMedicines((prev) => prev.map((m, idx) => (idx === i ? { ...m, [key]: val } : m)));
  }

  async function createPrescription() {
    const res = await fetch('/api/prescriptions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ patientId, content: { medicines } })
    });
    const d = await res.json();
    if (d.success) setItems((prev) => [d.data, ...prev]);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Prescriptions</h2>
      {role === 'doctor' && (
        <div className="border p-3 space-y-2">
          <input className="border p-2 w-full" placeholder="Patient ID" value={patientId} onChange={(e)=>setPatientId(e.target.value)} />
          {medicines.map((m, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <input className="border p-2" placeholder="Name" value={m.name} onChange={(e)=>updateMed(i,'name',e.target.value)} />
              <input className="border p-2" placeholder="Dosage" value={m.dosage} onChange={(e)=>updateMed(i,'dosage',e.target.value)} />
              <input className="border p-2" placeholder="Notes" value={m.notes} onChange={(e)=>updateMed(i,'notes',e.target.value)} />
            </div>
          ))}
          <button className="bg-gray-200 px-2 py-1 rounded" onClick={()=>setMedicines((p)=>[...p,{name:'',dosage:'',notes:''}])}>Add Medicine</button>
          <button className="bg-yellow-400 px-3 py-2 rounded" onClick={createPrescription}>Create PDF</button>
        </div>
      )}
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p._id} className="border p-2 flex justify-between">
            <div>
              <div>Doctor: {p.doctorId}</div>
              <div>Patient: {p.patientId}</div>
            </div>
            {p.pdfLink && <a className="underline" href={p.pdfLink} target="_blank">Download PDF</a>}
          </li>
        ))}
      </ul>
    </div>
  );
}


