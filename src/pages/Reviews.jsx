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
    <div className="min-h-screen bg-gradient-to-b from-white to-yellow-100 px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Reviews & Feedback</h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">
              Share your experience with doctors you&apos;ve visited. Your feedback helps others choose the right care.
            </p>
          </div>
          <Link
            to="/patient/appointments"
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
          >
            View All Appointments
          </Link>
        </header>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your past visits...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Unable to load visits</h2>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={loadAppointments}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-3">⭐</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No visits to review yet</h2>
            <p className="text-gray-600 text-sm">
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
                  className="bg-white rounded-2xl shadow-md border border-yellow-100 p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{doctorName}</h3>
                        {specialty && (
                          <p className="text-xs text-gray-500 mt-0.5">{specialty}</p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                        {a.status === 'completed' ? 'Completed' : 'Past visit'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Visited on:</span>{' '}
                      {formatDateTime(a)}
                    </p>
                  </div>
                  {a.doctorId?._id && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleOpenFeedback(a.doctorId._id, doctorName)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition shadow-sm hover:shadow-md"
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
      </div>

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
    </div>
  );
}
