import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyToken } from '../../services/auth.js';
import { updateCurrentUser, uploadProfileImage } from '../../services/users.js';
import { profileImageUrl } from '../../utils/profileImageUrl.js';
import { updateWorkingHours } from '../../services/appointments.js';
import DoctorPageShell from '../../components/doctor/DoctorPageShell';
import DoctorPageHeader from '../../components/doctor/DoctorPageHeader';
import { doctorCard, doctorCardStatic, doctorBtnPrimary, doctorBtnSecondary, doctorInput, doctorLabel } from '../../components/doctor/doctorTheme';

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
  const [profilePic, setProfilePic] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const photoInputRef = useRef(null);

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
          setProfilePic(user.profilePic || '');
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

  useEffect(() => {
    if (!pendingPhoto) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(pendingPhoto);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingPhoto]);

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await updateCurrentUser(form, localStorage.getItem('token') || '');
      if (res) {
        if (res.data?.profilePic) setProfilePic(res.data.profilePic);
        setMessage({ type: 'success', text: res.message || 'Profile updated.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Server error.' });
    }
  }

  const savedProfileSrc = profileImageUrl(profilePic);
  const displayProfileSrc = previewUrl || savedProfileSrc;

  function handlePickProfilePhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|gif|webp)$/i.test(file.type)) {
      setMessage({ type: 'error', text: 'Please choose a JPEG, PNG, GIF, or WebP image.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be 5 MB or smaller.' });
      return;
    }
    setMessage(null);
    setPendingPhoto(file);
  }

  async function handleSaveProfilePhoto() {
    if (!pendingPhoto) return;
    setUploadingPhoto(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await uploadProfileImage(pendingPhoto, token);
      if (res?.data?.profilePic) setProfilePic(res.data.profilePic);
      setPendingPhoto(null);
      try {
        window.dispatchEvent(new CustomEvent('dermaease-profile-updated'));
      } catch {
        /* ignore */
      }
      setMessage({
        type: 'success',
        text: res?.message || 'Profile photo saved. Patients will see this on Find Doctors, your profile, and chat.',
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Upload failed.' });
    } finally {
      setUploadingPhoto(false);
    }
  }

  function cancelPendingPhoto() {
    setPendingPhoto(null);
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
    <DoctorPageShell>
      <DoctorPageHeader title="My Profile" subtitle="Manage your profile information and working hours" />

        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 text-center">
              <div className="text-gray-600 dark:text-gray-300">Loading your profile...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Information Section */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Profile Information</h2>

                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-slate-700">
                  <div className="shrink-0">
                    <div className="relative h-28 w-28 rounded-full ring-2 ring-[#E8E0F5] dark:ring-violet-950 overflow-hidden bg-[#F3EEF9] dark:bg-slate-800 flex items-center justify-center">
                      {displayProfileSrc ? (
                        <img src={displayProfileSrc} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-[#5B3FA8] dark:text-indigo-300">
                          {(form.name || form.email || 'D').trim().charAt(0).toUpperCase()}
                        </span>
                      )}
                      {pendingPhoto && (
                        <span className="absolute bottom-1 right-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handlePickProfilePhoto}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="px-5 py-2.5 border-2 border-[#5B3FA8] text-[#5B3FA8] dark:text-indigo-400 dark:border-[#5B3FA8] rounded-lg font-semibold hover:bg-[#F3EEF9] dark:hover:bg-slate-800 transition"
                      >
                        Choose photo
                      </button>
                      <button
                        type="button"
                        disabled={!pendingPhoto || uploadingPhoto}
                        onClick={handleSaveProfilePhoto}
                        className="px-5 py-2.5 bg-[#5B3FA8] text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingPhoto ? 'Saving…' : 'Save photo'}
                      </button>
                      {pendingPhoto && (
                        <button
                          type="button"
                          onClick={cancelPendingPhoto}
                          className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      JPEG, PNG, GIF, or WebP. Max 5 MB. Choose a file, then click Save photo — patients see it on listings and chat.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Name</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5B3FA8] focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5B3FA8] focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Specialty</label>
                      <input
                        type="text"
                        value={form.specialty}
                        onChange={e => setForm({ ...form, specialty: e.target.value })}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5B3FA8] focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        placeholder="e.g., Dermatology"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Location</label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={e => setForm({ ...form, location: e.target.value })}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5B3FA8] focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        placeholder="Enter your location"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Bio</label>
                    <textarea
                      value={form.bio}
                      onChange={e => setForm({ ...form, bio: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5B3FA8] focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                      placeholder="Tell patients about yourself..."
                    />
                  </div>

                  {message && message.text && (
                    <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800' : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800'}`}>
                      {message.text}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#5B3FA8] text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
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
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Working Hours & Days</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Set your working hours and days. Patients will only be able to book appointments during these times.
                </p>
                <form onSubmit={handleSaveWorkingHours} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={workingHours.start}
                        onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5B3FA8] focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        step="900"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">e.g., 07:00</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">End Time</label>
                      <input
                        type="time"
                        value={workingHours.end}
                        onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5B3FA8] focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        step="900"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">e.g., 16:00</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Working Days</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {dayNames.map((day) => (
                        <label
                          key={day.value}
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                            workingDays.includes(day.value)
                              ? 'border-[#5B3FA8] bg-[#F3EEF9] dark:bg-violet-950/40 dark:border-indigo-400'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-slate-700 dark:hover:border-slate-500 dark:hover:bg-slate-800'
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
                            className="w-5 h-5 text-[#5B3FA8] focus:ring-[#5B3FA8] rounded"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{day.label}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Select the days you are available to see patients</p>
                  </div>

                  {message && message.text && (
                    <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800' : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800'}`}>
                      {message.text}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#5B3FA8] text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
                    >
                      Save Working Hours & Days
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
    </DoctorPageShell>
  );
}


