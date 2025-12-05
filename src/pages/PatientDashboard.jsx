import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Welcome back! 👋</h1>
          <p className="text-gray-600 mt-2">Manage your health and appointments all in one place</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.appointments}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcoming}</p>
              </div>
              <div className="text-4xl">⏰</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Doctors Consulted</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.doctors}</p>
              </div>
              <div className="text-4xl">👨‍⚕️</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Book Appointment Card */}
              <Link to="/patient/find-doctors">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition duration-300 cursor-pointer h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-900">Find Doctor</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Browse and book with available doctors</p>
                </div>
              </Link>

              {/* My Appointments Card */}
              <Link to="/patient/appointments">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition duration-300 cursor-pointer h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">📋</div>
                    <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
                  </div>
                  <p className="text-gray-600 text-sm">View and manage your bookings</p>
                </div>
              </Link>

              {/* Prescriptions Card */}
              <Link to="/prescriptions">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition duration-300 cursor-pointer h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">💊</div>
                    <h3 className="text-lg font-semibold text-gray-900">Prescriptions</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Download and view your prescriptions</p>
                </div>
              </Link>

              {/* Chat Card */}
              <Link to="/patient/chat">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition duration-300 cursor-pointer h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">💬</div>
                    <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Message your doctor directly</p>
                </div>
              </Link>

              {/* Reviews Card */}
              <Link to="/reviews">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition duration-300 cursor-pointer h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">⭐</div>
                    <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Leave feedback for doctors</p>
                </div>
              </Link>

              {/* Profile Card */}
              <Link to="/patient/profile">
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition duration-300 cursor-pointer h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">👤</div>
                    <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Manage your account settings</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Right: Image & Info */}
          <div className="flex flex-col justify-center items-center">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full">
              <img
                src="/Images/Patient.png"
                alt="Patient illustration"
                className="w-full h-auto max-h-80 object-contain mb-6"
              />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Contact our support team if you have any questions or concerns.
                </p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


