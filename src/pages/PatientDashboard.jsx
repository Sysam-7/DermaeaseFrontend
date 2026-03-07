import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import './PatientDashboard.page.css';

export default function PatientDashboard() {
  const [stats, setStats] = useState({
    appointments: 8,
    upcoming: 2,
    doctors: 3,
  });

  useEffect(() => {
    // Optional: fetch stats from API
    // const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // fetch(`${API}/appointments/patient/stats`, { credentials: 'include' })
    //   .then(r => r.ok && r.json())
    //   .then(body => setStats(body))
    //   .catch(() => null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-yellow-100 px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-2">
                Welcome back! <span className="text-2xl">👋</span>
              </h1>
              <p className="text-sm md:text-base text-slate-600">
                Manage your health and appointments all in one place.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 px-6 py-5 flex items-center justify-between hover:shadow-xl transition">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.18em]">Total Appointments</p>
              <p className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">{stats.appointments}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-xl text-blue-600 shadow-sm">
              📅
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 px-6 py-5 flex items-center justify-between hover:shadow-xl transition">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.18em]">Upcoming</p>
              <p className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">{stats.upcoming}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center text-xl text-amber-600 shadow-sm">
              ⏰
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 px-6 py-5 flex items-center justify-between hover:shadow-xl transition">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.18em]">Doctors Consulted</p>
              <p className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">{stats.doctors}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center text-xl text-purple-600 shadow-sm">
              👨‍⚕️
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {/* Left: Quick Actions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 flex items-center gap-2">
              <span className="text-purple-500 text-lg">⚡</span>
              Quick Actions
            </h2>

            {/* Each card is its own box with clear gaps, like the reference image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Find Doctor */}
              <Link to="/patient/find-doctors" className="group">
                <div className="h-full bg-white rounded-2xl shadow-lg border border-yellow-100 px-6 py-6 flex flex-col gap-3 hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-2xl shadow-sm mb-1">
                    🔍
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-900">Find Doctor</h3>
                    <p className="text-sm text-gray-500">
                      Browse and book with available specialists.
                    </p>
                  </div>
                </div>
              </Link>

              {/* Appointments */}
              <Link to="/patient/appointments" className="group">
                <div className="h-full bg-white rounded-2xl shadow-lg border border-yellow-100 px-6 py-6 flex flex-col gap-3 hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-2xl shadow-sm mb-1">
                    📋
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-900">Appointments</h3>
                    <p className="text-sm text-gray-500">
                      View history and manage bookings.
                    </p>
                  </div>
                </div>
              </Link>

              {/* Prescriptions */}
              <Link to="/prescriptions" className="group">
                <div className="h-full bg-white rounded-2xl shadow-lg border border-yellow-100 px-6 py-6 flex flex-col gap-3 hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center text-2xl shadow-sm mb-1">
                    💊
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-900">Prescriptions</h3>
                    <p className="text-sm text-gray-500">
                      Download and view your scripts.
                    </p>
                  </div>
                </div>
              </Link>

              {/* Chat */}
              <Link to="/patient/chat" className="group">
                <div className="h-full bg-white rounded-2xl shadow-lg border border-yellow-100 px-6 py-6 flex flex-col gap-3 hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center text-2xl shadow-sm mb-1">
                    💬
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-900">Chat</h3>
                    <p className="text-sm text-gray-500">
                      Message your doctor directly.
                    </p>
                  </div>
                </div>
              </Link>

              {/* Reviews */}
              <Link to="/reviews" className="group">
                <div className="h-full bg-white rounded-2xl shadow-lg border border-yellow-100 px-6 py-6 flex flex-col gap-3 hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center text-2xl shadow-sm mb-1">
                    ⭐
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-900">Reviews</h3>
                    <p className="text-sm text-gray-500">
                      Leave feedback for your visits.
                    </p>
                  </div>
                </div>
              </Link>

              {/* My Profile */}
              <Link to="/patient/profile" className="group">
                <div className="h-full bg-white rounded-2xl shadow-lg border border-yellow-100 px-6 py-6 flex flex-col gap-3 hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-2xl shadow-sm mb-1">
                    👤
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-gray-900">My Profile</h3>
                    <p className="text-sm text-gray-500">
                      Manage your account settings.
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Right: Support / Need Help (image preserved) */}
          <aside className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">Support</h2>
            <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 p-5 md:p-6 flex flex-col h-full hover:shadow-xl transition">
              <img
                src="/Images/Patient.png"
                alt="Patient illustration"
                className="w-full h-auto max-h-64 object-contain rounded-2xl mb-4"
              />
              <div className="text-center space-y-2">
                <h3 className="text-base md:text-lg font-semibold text-slate-900">Need Help?</h3>
                <p className="text-xs md:text-sm text-slate-600">
                  Have questions about your prescription or skincare routine? Our support team is here to guide you.
                </p>
                <button className="mt-2 inline-flex items-center justify-center w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 transition-all">
                  Contact Support
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
