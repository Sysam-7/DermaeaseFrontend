import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import './PatientDashboard.page.css';

function NavIcon({ children }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#5B3FA8] shadow-sm dark:bg-slate-800/90 dark:text-indigo-300">
      {children}
    </span>
  );
}

function CalendarWidget() {
  const today = new Date();
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const label = view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) =>
    d &&
    today.getDate() === d &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  const shift = (delta) => {
    setView(new Date(year, month + delta, 1));
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:shadow-none dark:ring-slate-600">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#2D2640] dark:text-gray-100">Calendar</h3>
        <span className="rounded-full bg-[#F3EEF9] px-3 py-1 text-xs font-medium text-[#5B3FA8] dark:bg-violet-950/60 dark:text-indigo-300">
          {label}
        </span>
      </div>
      <div className="mb-3 flex justify-between gap-2">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="rounded-xl bg-[#F5F2FA] px-3 py-1.5 text-sm font-medium text-[#5B3FA8] transition hover:bg-[#EDE8F5] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-indigo-300"
          aria-label="Previous month"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => shift(1)}
          className="rounded-xl bg-[#F5F2FA] px-3 py-1.5 text-sm font-medium text-[#5B3FA8] transition hover:bg-[#EDE8F5] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-indigo-300"
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#9B8CB8] dark:text-slate-500">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <div
            key={i}
            className={`flex h-8 items-center justify-center rounded-lg text-sm ${
              d
                ? isToday(d)
                  ? 'bg-[#5B3FA8] font-semibold text-white shadow-md'
                  : 'text-[#2D2640] hover:bg-[#F3EEF9] dark:text-gray-200 dark:hover:bg-slate-800'
                : ''
            }`}
          >
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const location = useLocation();
  const [stats, setStats] = useState({
    appointments: 8,
    upcoming: 2,
    doctors: 3,
  });
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    try {
      const n = localStorage.getItem('name');
      if (n) setPatientName(n.trim());
    } catch (e) {
      console.error('Failed to read name from localStorage', e);
    }
  }, []);

  useEffect(() => {
    // Optional: fetch stats from API
    // const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // fetch(`${API}/appointments/patient/stats`, { credentials: 'include' })
    //   .then(r => r.ok && r.json())
    //   .then(body => setStats(body))
    //   .catch(() => null);
  }, []);

  const path = location.pathname;
  const isPatientHome = path === '/patient' || path === '/patient/';
  const upcomingBadge =
    stats.upcoming > 99 ? '99+' : stats.upcoming > 0 ? String(stats.upcoming).padStart(2, '0') : null;

  const navClass = (active) =>
    `relative flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-medium transition overflow-hidden ${
      active
        ? 'bg-[#F3EEF9] text-[#2D2640] shadow-sm dark:bg-violet-950/50 dark:text-gray-100'
        : 'text-[#4B4558] hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800/80'
    }`;

  const rail = (active) =>
    active ? (
      <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[#5B3FA8]" />
    ) : null;

  return (
    <div className="min-h-screen bg-[#F4F1FA] text-[#2D2640] dark:bg-slate-950 dark:text-gray-100">
      <div className="flex min-h-screen">
        <aside className="flex w-[260px] shrink-0 flex-col justify-between border-r border-[#E8E0F5] bg-white px-4 py-8 shadow-[4px_0_32px_rgba(91,63,168,0.06)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
          <div className="min-h-0">
            <div className="mb-10 flex items-center gap-3 px-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5DD6] to-[#5B3FA8] text-lg font-bold text-white shadow-md">
                D
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-[#2D2640] dark:text-gray-100">DermaEase</h2>
                <p className="text-xs text-[#8B7EAE] dark:text-slate-400">Patient portal</p>
              </div>
            </div>

            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9B8CB8] dark:text-slate-500">
              Primary menu
            </p>
            <nav className="flex flex-col gap-1">
              <Link to="/patient" className={navClass(isPatientHome)}>
                {rail(isPatientHome)}
                <NavIcon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </NavIcon>
                Dashboard
              </Link>

              <Link
                to="/patient/find-doctors"
                className={navClass(path.startsWith('/patient/find-doctors'))}
              >
                {rail(path.startsWith('/patient/find-doctors'))}
                <NavIcon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </NavIcon>
                Find Doctor
              </Link>

              <Link
                to="/patient/appointments"
                className={navClass(path.startsWith('/patient/appointments'))}
              >
                {rail(path.startsWith('/patient/appointments'))}
                <NavIcon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </NavIcon>
                <span className="flex-1 text-left">Appointments</span>
                {upcomingBadge && (
                  <span className="rounded-full bg-[#5B3FA8] px-2 py-0.5 text-[11px] font-bold text-white">
                    {upcomingBadge}
                  </span>
                )}
              </Link>

              <Link
                to="/patient/chat"
                className={navClass(path.startsWith('/patient/chat'))}
              >
                {rail(path.startsWith('/patient/chat'))}
                <NavIcon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </NavIcon>
                Chat
              </Link>

              <Link to="/prescriptions" className={navClass(path.startsWith('/prescriptions'))}>
                {rail(path.startsWith('/prescriptions'))}
                <NavIcon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </NavIcon>
                Prescriptions
              </Link>

              <Link to="/reviews" className={navClass(path.startsWith('/reviews'))}>
                {rail(path.startsWith('/reviews'))}
                <NavIcon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </NavIcon>
                Reviews
              </Link>

              <Link
                to="/patient/profile"
                className={navClass(path.startsWith('/patient/profile'))}
              >
                {rail(path.startsWith('/patient/profile'))}
                <NavIcon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </NavIcon>
                My Profile
              </Link>
            </nav>
          </div>

          <div className="mt-8 shrink-0 border-t border-[#EDE8F5] pt-6 dark:border-slate-700">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9B8CB8] dark:text-slate-500">
              Account
            </p>
            <nav className="flex flex-col gap-1">
              <Link
                to="/patient/settings"
                className={navClass(path.startsWith('/patient/settings'))}
              >
                {rail(path.startsWith('/patient/settings'))}
                <NavIcon>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </NavIcon>
                Settings
              </Link>
            </nav>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
          <main className="min-w-0 flex-1 px-6 py-8 sm:px-10 lg:pr-6">
            <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-[#2D2640] dark:text-gray-100 sm:text-3xl">
                  Welcome back! <span className="text-2xl font-normal">👋</span>
                </h1>
                {patientName && (
                  <p className="mt-1 text-[15px] font-medium text-[#5B3FA8] dark:text-indigo-400">{patientName}</p>
                )}
                <p className="mt-1 text-[15px] text-[#6B6280] dark:text-slate-400">
                  Manage your health and appointments all in one place.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <NotificationBell />
                <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-[0_2px_12px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:ring-slate-600">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#2D2640] dark:text-gray-100">{patientName || 'Patient'}</p>
                    <p className="text-xs text-[#8B7EAE] dark:text-slate-400">Member</p>
                  </div>
                  <img
                    src="/Images/Patient.png"
                    alt=""
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-[#E8E0F5] dark:ring-slate-600"
                  />
                </div>
              </div>
            </header>

            <section className="mb-8 flex flex-col items-stretch justify-between gap-6 rounded-3xl bg-gradient-to-br from-[#EDE4FF] via-[#E8DDF8] to-[#DDD0F0] p-8 shadow-[0_8px_32px_rgba(91,63,168,0.12)] dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:shadow-none sm:flex-row sm:items-center">
              <div className="max-w-xl">
                <h2 className="text-xl font-bold text-[#2D2640] dark:text-gray-100 sm:text-2xl">Looking for a specialist?</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5C5470] dark:text-slate-300">
                  Browse dermatologists, book a visit, and message your care team — all from your dashboard.
                </p>
                <Link
                  to="/patient/find-doctors"
                  className="mt-5 inline-flex items-center justify-center rounded-2xl bg-[#5B3FA8] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#5B3FA8]/30 transition hover:bg-[#4A3289]"
                >
                  Book now
                </Link>
              </div>
              <div className="flex shrink-0 justify-center sm:justify-end">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-white/40 blur-xl" />
                  <img
                    src="/Images/Patient.png"
                    alt=""
                    className="relative h-28 w-28 rounded-full border-4 border-white object-cover shadow-xl dark:border-slate-600 sm:h-32 sm:w-32"
                  />
                </div>
              </div>
            </section>

            <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] transition hover:ring-[#D4C8EA] dark:bg-slate-900 dark:ring-slate-700 dark:hover:ring-slate-600">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9B8CB8] dark:text-slate-500">
                    Total Appointments
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#2D2640] dark:text-gray-100 sm:text-3xl">{stats.appointments}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-xl shadow-sm">
                  📅
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] transition hover:ring-[#D4C8EA] dark:bg-slate-900 dark:ring-slate-700 dark:hover:ring-slate-600">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9B8CB8] dark:text-slate-500">Upcoming</p>
                  <p className="mt-2 text-2xl font-bold text-[#2D2640] dark:text-gray-100 sm:text-3xl">{stats.upcoming}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4E0] text-xl shadow-sm">
                  ⏰
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white px-6 py-5 shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] transition hover:ring-[#D4C8EA] dark:bg-slate-900 dark:ring-slate-700 dark:hover:ring-slate-600">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9B8CB8] dark:text-slate-500">
                    Doctors Consulted
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#2D2640] dark:text-gray-100 sm:text-3xl">{stats.doctors}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3EEF9] text-xl shadow-sm">
                  👨‍⚕️
                </div>
              </div>
            </section>

            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#2D2640] dark:text-gray-100 sm:text-xl">
              <span className="text-[#5B3FA8] dark:text-indigo-400" aria-hidden>
                ⚡
              </span>
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/patient/find-doctors"
                className="group flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#5B3FA8] to-[#4330A8] p-6 text-white shadow-[0_8px_28px_rgba(91,63,168,0.35)] transition hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl">🔍</div>
                <h3 className="text-base font-semibold">Find Doctor</h3>
                <p className="mt-1 text-sm text-white/85">Browse and book with available specialists.</p>
              </Link>

              <Link
                to="/patient/appointments"
                className="group flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8A598] to-[#D67B6E] p-6 text-white shadow-[0_8px_28px_rgba(214,123,110,0.35)] transition hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/25 text-2xl">📋</div>
                <h3 className="text-base font-semibold">Appointments</h3>
                <p className="mt-1 text-sm text-white/90">View history and manage bookings.</p>
              </Link>

              <Link
                to="/prescriptions"
                className="group flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8D48A] to-[#D4B85C] p-6 text-[#3D3618] shadow-[0_8px_28px_rgba(212,184,92,0.35)] transition hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/40 text-2xl">💊</div>
                <h3 className="text-base font-semibold">Prescriptions</h3>
                <p className="mt-1 text-sm text-[#5C5428]">Download and view your scripts.</p>
              </Link>

              <Link
                to="/patient/chat"
                className="group flex flex-col rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] transition hover:ring-[#C4B5E0] dark:bg-slate-900 dark:ring-slate-700 dark:hover:ring-slate-600"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EEF9] text-2xl dark:bg-violet-950/50">💬</div>
                <h3 className="text-base font-semibold text-[#2D2640] dark:text-gray-100">Chat</h3>
                <p className="mt-1 text-sm text-[#6B6280] dark:text-slate-400">Message your doctor directly.</p>
              </Link>

              <Link
                to="/reviews"
                className="group flex flex-col rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] transition hover:ring-[#C4B5E0] dark:bg-slate-900 dark:ring-slate-700 dark:hover:ring-slate-600"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF4E0] text-2xl dark:bg-amber-950/40">⭐</div>
                <h3 className="text-base font-semibold text-[#2D2640] dark:text-gray-100">Reviews</h3>
                <p className="mt-1 text-sm text-[#6B6280] dark:text-slate-400">Leave feedback for your visits.</p>
              </Link>

              <Link
                to="/patient/profile"
                className="group flex flex-col rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] transition hover:ring-[#C4B5E0] dark:bg-slate-900 dark:ring-slate-700 dark:hover:ring-slate-600"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F5F0] text-2xl dark:bg-emerald-950/40">👤</div>
                <h3 className="text-base font-semibold text-[#2D2640] dark:text-gray-100">My Profile</h3>
                <p className="mt-1 text-sm text-[#6B6280] dark:text-slate-400">Manage your account settings.</p>
              </Link>
            </div>
          </main>

          <aside className="w-full shrink-0 border-t border-[#E8E0F5] bg-[#F9F7FC] px-6 py-8 dark:border-slate-700 dark:bg-slate-900/80 lg:w-[300px] lg:border-l lg:border-t-0 lg:pl-5 lg:pr-6">
            <div className="space-y-6">
              <CalendarWidget />

              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9B8CB8] dark:text-slate-500">
                  Care options
                </p>
                <div className="space-y-2">
                  <Link
                    to="/patient/find-doctors"
                    className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#E8E0F5] transition hover:ring-[#5B3FA8]/40 dark:bg-slate-900 dark:ring-slate-700"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3EEF9] text-[#5B3FA8] dark:bg-violet-950/50">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#2D2640] dark:text-gray-100">Find a doctor</p>
                      <p className="text-xs text-[#8B7EAE] dark:text-slate-400">Book a consultation</p>
                    </div>
                    <span
                      className="h-5 w-5 shrink-0 rounded-full border-[5px] border-[#5B3FA8] bg-white dark:border-indigo-400 dark:bg-slate-900"
                      aria-hidden
                    />
                  </Link>
                  <Link
                    to="/patient/appointments"
                    className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#E8E0F5] transition hover:ring-[#E8A598]/50 dark:bg-slate-900 dark:ring-slate-700"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEBE8] text-[#D67B6E] dark:bg-rose-950/40">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#2D2640] dark:text-gray-100">My appointments</p>
                      <p className="text-xs text-[#8B7EAE] dark:text-slate-400">View schedule</p>
                    </div>
                    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[#D4C8EA] dark:border-slate-600" aria-hidden />
                  </Link>
                  <Link
                    to="/patient/chat"
                    className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#E8E0F5] transition hover:ring-[#D4B85C]/50 dark:bg-slate-900 dark:ring-slate-700"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF6D8] text-[#B8962E] dark:bg-amber-950/40">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#2D2640] dark:text-gray-100">Messages</p>
                      <p className="text-xs text-[#8B7EAE] dark:text-slate-400">Chat with your doctor</p>
                    </div>
                    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[#D4C8EA] dark:border-slate-600" aria-hidden />
                  </Link>
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-sm font-semibold text-[#2D2640] dark:text-gray-100">Support</h2>
                <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:ring-slate-700">
                  <img
                    src="/Images/Patient.png"
                    alt="Patient illustration"
                    className="h-auto w-full max-h-52 object-contain p-4"
                  />
                  <div className="border-t border-[#EDE8F5] px-5 pb-5 pt-4 text-center dark:border-slate-700">
                    <h3 className="text-base font-semibold text-[#2D2640] dark:text-gray-100">Need Help?</h3>
                    <p className="mt-2 text-xs text-[#6B6280] dark:text-slate-400 sm:text-sm">
                      Have questions about your prescription or skincare routine? Our support team is here to guide you.
                    </p>
                    <button
                      type="button"
                      className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-[#5B3FA8] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5B3FA8]/25 transition hover:bg-[#4A3289]"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
