import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { verifyToken } from '../../services/auth.js';
import { updateCurrentUser } from '../../services/users.js';
import { updateWorkingHours } from '../../services/appointments.js';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    specialty: '',
    location: '',
    bio: '',
  });
  const [workingHours, setWorkingHours] = useState({
    start: '',
    end: '',
  });
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5]); // Default: Mon-Fri
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const dayNames = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const body = await verifyToken(localStorage.getItem('token') || '');
        const user = body?.data?.user ?? body?.user;
        if (user) {
          setForm(f => ({ ...f,
            name: user.name || '',
            email: user.email || '',
            specialty: user.specialty || '',
            location: user.location || '',
            bio: user.bio || '',
          }));
          setWorkingHours({
            start: user.workingHoursStart || '',
            end: user.workingHoursEnd || '',
          });
          setWorkingDays(user.workingDays && user.workingDays.length > 0 ? user.workingDays : [1, 2, 3, 4, 5]);
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await updateCurrentUser(form, localStorage.getItem('token') || '');
      if (res) {
        setMessage({ type: 'success', text: res.message || 'Profile updated.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Server error.' });
    }
  }

  async function handleSaveWorkingHours(e) {
    e.preventDefault();
    setMessage(null);
    
    if (!workingHours.start || !workingHours.end) {
      setMessage({ type: 'error', text: 'Please provide both start and end times.' });
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(workingHours.start) || !timeRegex.test(workingHours.end)) {
      setMessage({ type: 'error', text: 'Invalid time format. Use HH:MM format (e.g., 07:00).' });
      return;
    }

    // Validate start < end
    const startMinutes = parseInt(workingHours.start.split(':')[0], 10) * 60 + parseInt(workingHours.start.split(':')[1], 10);
    const endMinutes = parseInt(workingHours.end.split(':')[0], 10) * 60 + parseInt(workingHours.end.split(':')[1], 10);
    if (startMinutes >= endMinutes) {
      setMessage({ type: 'error', text: 'Start time must be before end time.' });
      return;
    }

    if (workingDays.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one working day.' });
      return;
    }

    try {
      const token = localStorage.getItem('token') || '';
      const res = await updateWorkingHours({ ...workingHours, workingDays }, token);
      if (res && res.success) {
        setMessage({ type: 'success', text: res.message || 'Working hours updated successfully.' });
      } else {
        setMessage({ type: 'error', text: res?.message || 'Failed to update working hours.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Server error.' });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-yellow-100 flex">
      {/* Sidebar - Same as DoctorDashboard */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-200 p-6 flex flex-col justify-between min-h-screen">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-10">DermaEase</h2>

          <nav className="flex flex-col gap-4">
            <Link
              to="/doctor/dashboard"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              Dashboard
            </Link>

            <Link
              to="/doctor/profile"
              className="flex items-center gap-3 p-3 rounded-xl bg-yellow-100 text-gray-900 font-semibold shadow-sm hover:shadow-md transition"
            >
              My Profile
            </Link>

            <Link
              to="/doctor/manage-appointments"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              Appointments
            </Link>

            <Link
              to="/doctor/chats"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              Chats
            </Link>

            <Link
              to="/doctor/feedback"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              Feedback
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-4 mt-10">
          <Link
            to="/doctor/settings"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
          >
            Settings
          </Link>

          <Link
            to="/logout"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 font-medium transition"
          >
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600 text-lg">Manage your profile information and working hours</p>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="text-gray-600">Loading your profile...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Information Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Specialty</label>
                      <input
                        type="text"
                        value={form.specialty}
                        onChange={e => setForm({ ...form, specialty: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g., Dermatology"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={e => setForm({ ...form, location: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter your location"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={form.bio}
                      onChange={e => setForm({ ...form, bio: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Tell patients about yourself..."
                    />
                  </div>

                  {message && message.text && (
                    <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                      {message.text}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
                    >
                      Save Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/doctor/dashboard')}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {/* Working Hours & Days Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Working Hours & Days</h2>
                <p className="text-gray-600 mb-6">
                  Set your working hours and days. Patients will only be able to book appointments during these times.
                </p>
                <form onSubmit={handleSaveWorkingHours} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={workingHours.start}
                        onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        step="900"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">e.g., 07:00</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                      <input
                        type="time"
                        value={workingHours.end}
                        onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        step="900"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">e.g., 16:00</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Working Days</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {dayNames.map((day) => (
                        <label
                          key={day.value}
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                            workingDays.includes(day.value)
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={workingDays.includes(day.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setWorkingDays([...workingDays, day.value].sort());
                              } else {
                                setWorkingDays(workingDays.filter(d => d !== day.value));
                              }
                            }}
                            className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">{day.label}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Select the days you are available to see patients</p>
                  </div>

                  {message && message.text && (
                    <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                      {message.text}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
                    >
                      Save Working Hours & Days
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


