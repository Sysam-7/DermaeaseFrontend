import PatientPageShell from '../components/patient/PatientPageShell';
import PatientPageHeader from '../components/patient/PatientPageHeader';
import { patientCardStatic, patientBtnPrimary, patientBtnSecondary, patientInput } from '../components/patient/patientTheme';
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
    <PatientPageShell mainClassName="max-w-6xl mx-auto w-full">
      <PatientPageHeader title="Find the right dermatologist" subtitle="Search by specialty, location, and availability to book instantly." />

        <form onSubmit={search} className="grid gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Search</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner transition focus-within:border-[#5B3FA8] focus-within:ring-2 focus-within:ring-[#5B3FA8]/20 dark:border-slate-600 dark:bg-slate-800 dark:focus-within:ring-indigo-900/50">
                <span className="text-slate-400">🔍</span>
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Name, keyword, clinic"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-gray-100 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="group">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Specialty</label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner transition focus-within:border-[#5B3FA8] focus-within:ring-2 focus-within:ring-[#5B3FA8]/20 dark:border-slate-600 dark:bg-slate-800 dark:focus-within:ring-indigo-900/50">
                <select
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 outline-none dark:text-gray-100"
                >
                  <option value="">All specialties</option>
                  {specialties.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="group">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Location</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner transition focus-within:border-[#5B3FA8] focus-within:ring-2 focus-within:ring-[#5B3FA8]/20 dark:border-slate-600 dark:bg-slate-800 dark:focus-within:ring-indigo-900/50">
                <span className="text-slate-400">📍</span>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="City or area"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-gray-100 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="group">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Availability</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner transition focus-within:border-[#5B3FA8] focus-within:ring-2 focus-within:ring-[#5B3FA8]/20 dark:border-slate-600 dark:bg-slate-800 dark:focus-within:ring-indigo-900/50">
                <span className="text-slate-400">🗓</span>
                <input
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  type="date"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-700 sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5B3FA8] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-[#4A3289]"
              >
                {loading ? 'Searching…' : 'Search doctors'}
              </button>
              <button
                type="button"
                onClick={() => { setQ(''); setSpecialty(''); setLocation(''); setDate(''); search(); }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
              >
                Reset filters
              </button>
              <div className="ml-auto text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Dermaease</div>
            </div>
          </form>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            Curated matches for your filters
          </div>
          {doctors.length === 0 && !loading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-slate-500 shadow-inner dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-400">
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
    </PatientPageShell>
  );
}