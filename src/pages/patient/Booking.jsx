import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getDoctors } from '../../services/Aboutdoctors.js';
import { bookAppointment, getAvailableSlots } from '../../services/appointments.js';
import Modal from '../../components/Modal.jsx';

export default function Booking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(params.get('doctorId') || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [workingHours, setWorkingHours] = useState({ start: '', end: '' });
  const [workingDays, setWorkingDays] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  useEffect(() => {
    (async () => {
      try {
        const result = await getDoctors();
        const doctorsList = result.data || result || [];
        setDoctors(doctorsList);
        
        // If doctorId is in URL, set the selected doctor
        if (doctorId) {
          const doctor = doctorsList.find(d => d._id === doctorId);
          if (doctor) {
            setSelectedDoctor(doctor);
            setWorkingHours({
              start: doctor.workingHoursStart || '',
              end: doctor.workingHoursEnd || ''
            });
            setWorkingDays(doctor.workingDays || []);
          }
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
        setDoctors([]);
      }
    })();
  }, [doctorId]);

  // Update selected doctor when doctorId changes
  useEffect(() => {
    if (doctorId) {
      const doctor = doctors.find(d => d._id === doctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
        setWorkingHours({
          start: doctor.workingHoursStart || '',
          end: doctor.workingHoursEnd || ''
        });
        setWorkingDays(doctor.workingDays || []);
      }
    } else {
      setSelectedDoctor(null);
      setWorkingHours({ start: '', end: '' });
      setWorkingDays([]);
    }
  }, [doctorId, doctors]);

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    if (doctorId && date) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [doctorId, date]);

  async function fetchAvailableSlots() {
    if (!doctorId || !date) return;
    
    setLoadingSlots(true);
    setError('');
    try {
      const result = await getAvailableSlots(doctorId, date);
      if (result.success) {
        setAvailableSlots(result.data.slots || []);
        if (result.data.workingHours) {
          setWorkingHours({
            start: result.data.workingHours.start || '',
            end: result.data.workingHours.end || ''
          });
        }
        if (result.data.workingDays) {
          setWorkingDays(result.data.workingDays);
        }
      }
    } catch (err) {
      console.error('Failed to load available slots:', err);
      setError(err.message || 'Failed to load available time slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function showModal(type, title, message) {
    setModal({ isOpen: true, type, title, message });
  }

  function closeModal() {
    setModal({ isOpen: false, type: 'info', title: '', message: '' });
  }

  async function book() {
    const token = localStorage.getItem('token') || '';
    if (!token) {
      showModal('warning', 'Login Required', 'Please log in to book an appointment.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!doctorId) {
      showModal('error', 'Doctor Not Selected', 'Please select a doctor to continue with your booking.');
      return;
    }
    if (!date || !time) {
      showModal('error', 'Missing Information', 'Please select both date and time for your appointment.');
      return;
    }

    // Validate time is in hours or quarters
    const [hours, minutes] = time.split(':');
    const minutesInt = parseInt(minutes, 10);
    if (minutesInt !== 0 && minutesInt !== 15 && minutesInt !== 30 && minutesInt !== 45) {
      showModal('error', 'Invalid Time', 'Time must be in hours or quarters (e.g., 09:00, 09:15, 09:30, 09:45). Random minutes are not allowed.');
      return;
    }

    // Check if selected time is available
    const selectedSlot = availableSlots.find(slot => slot.time === time);
    if (!selectedSlot || !selectedSlot.available) {
      showModal('error', 'Slot Not Available', 'This time slot has already been booked. Please select another available time slot.');
      return;
    }

    try {
      // Use new date/time format
      const payload = { doctorId, date, time };
      const result = await bookAppointment(payload, token);
      
      if (result.success) {
        showModal(
          'success',
          'Appointment Booked Successfully!',
          'Your appointment has been successfully booked. Please wait for the doctor\'s approval. You will be notified once the doctor confirms your appointment.'
        );
        // Reset form and refresh slots
        setTime('');
        await fetchAvailableSlots();
      } else {
        showModal('error', 'Booking Failed', result.message || 'Unable to book appointment. Please try again.');
      }
    } catch (err) {
      let errorMessage = 'Failed to book appointment. Please try again.';
      
      // Handle specific error messages
      if (err.message) {
        if (err.message.includes('already booked')) {
          errorMessage = 'This time slot has already been booked by another patient. Please select a different time.';
        } else if (err.message.includes('working hours')) {
          errorMessage = err.message;
        } else if (err.message.includes('not available on this day')) {
          errorMessage = err.message;
        } else {
          errorMessage = err.message;
        }
      }
      
      showModal('error', 'Booking Error', errorMessage);
      console.error('Booking error:', err);
      // Refresh slots in case of error
      await fetchAvailableSlots();
    }
  }

  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Booking flow</p>
            <h1 className="mt-1 text-3xl font-bold leading-tight text-slate-900">Book your consultation</h1>
            <p className="mt-1 text-sm text-slate-600">Choose your doctor, pick an available date and time, and confirm instantly.</p>
          </div>
          <a
            href="/patient/find-doctors"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md"
          >
            ← Browse doctors
          </a>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-xl backdrop-blur-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" />

              <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-semibold text-slate-900">Appointment details</div>
                <div className="text-sm text-slate-500">Secure, fast booking</div>
              </div>

              <div className="space-y-6 px-6 py-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Doctor</label>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                    <select
                      className="w-full bg-transparent text-sm text-slate-800 outline-none"
                      value={doctorId}
                      onChange={(e)=>setDoctorId(e.target.value)}
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((d)=> <option key={d._id} value={d._id}>{d.name} ({d.specialty})</option>)}
                    </select>
                  </div>
                  {selectedDoctor && (workingHours.start || workingDays.length > 0) && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-900 mb-2">Doctor's Availability:</p>
                      {workingHours.start && workingHours.end && (
                        <p className="text-xs text-blue-700 mb-1">
                          <span className="font-medium">Hours:</span> {workingHours.start} - {workingHours.end}
                        </p>
                      )}
                      {workingDays.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-blue-700 mb-1">Available Days:</p>
                          <div className="flex flex-wrap gap-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                              workingDays.includes(index) && (
                                <span key={index} className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-medium">
                                  {day}
                                </span>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Date</label>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                      <span className="text-slate-400">🗓</span>
                      <input
                        type="date"
                        value={date}
                        onChange={(e)=>setDate(e.target.value)}
                        className="w-full bg-transparent text-sm text-slate-800 outline-none [color-scheme:light]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Time {workingHours.start && workingHours.end && `(Available: ${workingHours.start} - ${workingHours.end})`}
                    </label>
                    {loadingSlots ? (
                      <div className="text-sm text-slate-500 py-2">Loading available slots...</div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => slot.available && setTime(slot.time)}
                            disabled={!slot.available}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                              time === slot.time
                                ? 'bg-indigo-600 text-white shadow-md'
                                : slot.available
                                ? 'bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 border border-slate-200'
                                : 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200 opacity-50'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : doctorId && date ? (
                      <div className="text-sm text-red-600 py-2">
                        {error || 'No available slots. Please select a different date or doctor.'}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 py-2">
                        Select a doctor and date to see available time slots
                      </div>
                    )}
                    {error && (
                      <div className="text-xs text-red-600 mt-1">{error}</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={book}
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                  >
                    Confirm booking
                  </button>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Secure • Fast • Verified doctors
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Summary</p>
                  <h3 className="text-lg font-semibold text-slate-900">Booking overview</h3>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Step 2/2</span>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="text-slate-400">👩‍⚕️</span>
                  <div className="flex-1">
                    <div className="font-semibold">{doctorId ? doctors.find(d => d._id === doctorId)?.name : 'No doctor selected'}</div>
                    <div className="text-xs text-slate-500">{doctorId ? doctors.find(d => d._id === doctorId)?.specialty : 'Pick a doctor to continue'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="text-slate-400">📅</span>
                  <div className="flex-1">
                    <div className="font-semibold">{date || 'No date chosen'}</div>
                    <div className="text-xs text-slate-500">Select a date that works best</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="text-slate-400">⏰</span>
                  <div className="flex-1">
                    <div className="font-semibold">{time || 'No time selected'}</div>
                    <div className="text-xs text-slate-500">Choose your preferred slot</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 px-4 py-3 text-sm font-semibold text-white shadow-md">
                You can always reschedule from your dashboard after booking.
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/70 p-4 text-sm text-slate-700">
              <div className="font-semibold text-indigo-700">Tips</div>
              <ul className="mt-2 space-y-1 list-disc pl-4">
                <li>Arrive 10 minutes early for your consultation.</li>
                <li>Keep your medical history handy.</li>
                <li>For virtual visits, test your camera and mic.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}


