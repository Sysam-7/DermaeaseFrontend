import { useEffect, useState } from 'react';
import DoctorCard from '../components/DoctorCard.jsx';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function FindingDoctors() {
  const [q, setQ] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/doctors/specialties`);
        if (res.ok) {
          const body = await res.json();
          setSpecialties(body.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    })();
    search();
  }, []);

  async function search(e) {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (specialty) params.append('specialty', specialty);
      if (location) params.append('location', location);
      if (date) params.append('availableDate', date);

      const res = await fetch(`${API}/doctors?${params.toString()}`, { credentials: 'include' });
      if (res.ok) {
        const body = await res.json();
        setDoctors(body.data || []);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error(err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Find Doctors</h1>
        <Link to="/patient" className="text-sm text-blue-600">Back to Dashboard</Link>
      </header>

      <form onSubmit={search} className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, keyword" className="border p-2 rounded" />
        <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="border p-2 rounded">
          <option value="">All specialties</option>
          {specialties.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City or area" className="border p-2 rounded" />
        <input value={date} onChange={e => setDate(e.target.value)} type="date" className="border p-2 rounded" />
        <div className="col-span-1 sm:col-span-4 mt-2">
          <button type="submit" className="mr-2 px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Searching...' : 'Search'}</button>
          <button type="button" onClick={() => { setQ(''); setSpecialty(''); setLocation(''); setDate(''); search(); }} className="px-4 py-2 border rounded">Reset</button>
        </div>
      </form>

      <div className="space-y-3 mt-4">
        {doctors.length === 0 ? <div className="text-gray-600">No doctors found.</div> : doctors.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}
      </div>
    </div>
  );
}