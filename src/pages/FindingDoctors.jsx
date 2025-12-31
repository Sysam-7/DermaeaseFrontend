import { useEffect, useState } from 'react';
import DoctorCard from '../components/DoctorCard.jsx';
import { Link } from 'react-router-dom';
import { getSpecialties, getDoctors } from '../services/aboutDoctors.js';

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
        const body = await getSpecialties();
        setSpecialties(body.data || body.specialties || []);
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

      const body = await getDoctors(Object.fromEntries(params.entries()));
      setDoctors(body.data || body.doctors || []);
    } catch (err) {
      console.error(err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Patient workspace</p>
            <h1 className="mt-1 text-3xl font-bold leading-tight text-slate-900">Find the right dermatologist</h1>
            <p className="mt-1 text-sm text-slate-600">Search by specialty, location, and availability to book instantly.</p>
          </div>
          <Link
            to="/patient"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md"
          >
            ← Back to dashboard
          </Link>
        </header>

        <div className="relative mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-xl backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" />

          <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-semibold text-slate-900">Refine your search</div>
            <div className="text-sm text-slate-500">
              {loading ? 'Loading doctors…' : `Showing ${doctors.length} doctor${doctors.length === 1 ? '' : 's'}`}
            </div>
          </div>

          <form onSubmit={search} className="grid gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Search</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                <span className="text-slate-400">🔍</span>
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Name, keyword, clinic"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="group">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Specialty</label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                <select
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 outline-none"
                >
                  <option value="">All specialties</option>
                  {specialties.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="group">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Location</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                <span className="text-slate-400">📍</span>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="City or area"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="group">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Availability</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                <span className="text-slate-400">🗓</span>
                <input
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  type="date"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none [color-scheme:light]"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                {loading ? 'Searching…' : 'Search doctors'}
              </button>
              <button
                type="button"
                onClick={() => { setQ(''); setSpecialty(''); setLocation(''); setDate(''); search(); }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
              >
                Reset filters
              </button>
              <div className="ml-auto text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Dermaease</div>
            </div>
          </form>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            Curated matches for your filters
          </div>
          {doctors.length === 0 && !loading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-slate-500 shadow-inner">
              No doctors found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {doctors.map(doc => (
                <DoctorCard key={doc._id} doctor={doc} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}