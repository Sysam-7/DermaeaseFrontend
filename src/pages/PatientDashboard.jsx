import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import PatientSidebar from '../components/patient/PatientSidebar';
import MyProfile from './patient/MyProfile.jsx';
import { fetchCurrentUser } from '../services/users.js';
import { avatarImageUrl } from '../utils/profileImageUrl.js';
import './PatientDashboard.page.css';

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
  const [patientProfilePic, setPatientProfilePic] = useState('');

  useEffect(() => {
    try {
      const n = localStorage.getItem('name');
      if (n) setPatientName(n.trim());
    } catch (e) {
      console.error('Failed to read name from localStorage', e);
    }
  }, []);

  useEffect(() => {
    function loadProfileAvatar() {
      const t = localStorage.getItem('token');
      if (!t) return;
      fetchCurrentUser(t)
        .then((body) => {
          const pic = body?.data?.profilePic;
          setPatientProfilePic(pic || '');
          if (body?.data?.name) setPatientName(body.data.name.trim());
        })
        .catch(() => {});
    }
    loadProfileAvatar();
    function onProfileUpdated() {
      loadProfileAvatar();
    }
    window.addEventListener('dermaease-profile-updated', onProfileUpdated);
    return () => window.removeEventListener('dermaease-profile-updated', onProfileUpdated);
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

  return (
    <div className="min-h-screen bg-[#F4F1FA] text-[#2D2640] dark:bg-slate-950 dark:text-gray-100">
      <div className="flex min-h-screen items-start">
        <PatientSidebar upcomingBadge={upcomingBadge} />


        <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
          <main className="portal-content min-w-0 flex-1 px-6 py-8 sm:px-10 lg:pr-6">
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
                    src={avatarImageUrl(patientProfilePic, 'patients') || '/Images/Patient.png'}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-[#E8E0F5] dark:ring-slate-600"
                  />
                </div>
              </div>
            </header>

            {path === '/patient/profile' ? (
              <div className="rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:ring-slate-700 sm:p-8">
                <MyProfile />
              </div>
            ) : (
              <>
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
                    src={avatarImageUrl(patientProfilePic, 'patients') || '/Images/Patient.png'}
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
              </>
            )}
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
                    alt=""
                    className="h-auto w-full max-h-52 object-contain p-4"
                  />
                  <div className="border-t border-[#EDE8F5] px-5 pb-5 pt-4 text-center dark:border-slate-700">
                    <h3 className="text-base font-semibold text-[#2D2640] dark:text-gray-100">Need Help?</h3>
                    <p className="mt-2 text-xs text-[#6B6280] dark:text-slate-400 sm:text-sm">
                      Have questions about your prescription or skincare routine? Our support team is here to guide you.
                    </p>
                    <Link
                      to="/contact"
                      className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-[#5B3FA8] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5B3FA8]/25 transition hover:bg-[#4A3289]"
                    >
                      Contact Support
                    </Link>
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
