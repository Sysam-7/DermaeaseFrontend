import PatientPageShell from '../components/patient/PatientPageShell';
import PatientPageHeader from '../components/patient/PatientPageHeader';
import { patientCardStatic, patientBtnPrimary, patientBtnSecondary, patientInput } from '../components/patient/patientTheme';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyAppointments } from '../services/appointments.js';
import FeedbackModal from '../components/FeedbackModal.jsx';

export default function Reviews() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, doctorId: null, doctorName: '' });

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      setLoading(true);
      setError('');
      const res = await getMyAppointments(localStorage.getItem('token') || '');
      const appts = res.data || res || [];
      // Only show past or completed appointments where leaving feedback makes sense
      const now = new Date();
      const filtered = (appts || []).filter((a) => {
        if (!a.date) return false;
        const date = new Date(a.date);
        if (a.time) {
          const [h, m] = a.time.split(':');
          date.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
        }
        return date < now; // only past appointments
      });
      setAppointments(filtered);
    } catch (err) {
      console.error('Failed to load appointments for reviews:', err);
      setError(err.message || 'Failed to load your past appointments');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenFeedback(doctorId, doctorName) {
    setFeedbackModal({ isOpen: true, doctorId, doctorName });
  }

  function handleCloseFeedback() {
    setFeedbackModal({ isOpen: false, doctorId: null, doctorName: '' });
  }

  function formatDateTime(a) {
    if (!a.date) return 'Unknown date';
    const d = new Date(a.date);
    if (a.time) {
      const [h, m] = a.time.split(':');
      d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    }
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <PatientPageShell mainClassName="max-w-5xl mx-auto w-full">
      <PatientPageHeader title="Reviews & Feedback" subtitle="Share your experience with doctors you've visited." />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B3FA8] mx-auto mb-4" />
              <p className="text-gray-600 dark:text-slate-400">Loading your past visits...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/40">
            <h2 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-300">Unable to load visits</h2>
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={loadAppointments}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-slate-900 dark:ring-1 dark:ring-slate-700">
            <div className="mb-3 text-5xl">⭐</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">No visits to review yet</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              After you complete an appointment, you&apos;ll be able to leave a rating and feedback for your doctor here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {appointments.map((a) => {
              const doctorName = a.doctorId?.name || 'Unknown Doctor';
              const specialty = a.doctorId?.specialty || '';
              return (
                <div
                  key={a._id}
                  className="flex flex-col justify-between rounded-2xl border border-yellow-100 bg-white p-5 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{doctorName}</h3>
                        {specialty && (
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{specialty}</p>
                        )}
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {a.status === 'completed' ? 'Completed' : 'Past visit'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      <span className="font-medium text-gray-700 dark:text-slate-300">Visited on:</span>{' '}
                      {formatDateTime(a)}
                    </p>
                  </div>
                  {a.doctorId?._id && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleOpenFeedback(a.doctorId._id, doctorName)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#5B3FA8] text-white text-sm font-semibold hover:bg-[#4A3289] transition shadow-sm hover:shadow-md"
                      >
                        Leave / Edit Review
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={handleCloseFeedback}
        doctorId={feedbackModal.doctorId}
        doctorName={feedbackModal.doctorName}
        onSuccess={() => {
          // Could refresh or show toast – keep simple for now
          console.log('Feedback submitted');
        }}
      />
    </PatientPageShell>
  );
}
