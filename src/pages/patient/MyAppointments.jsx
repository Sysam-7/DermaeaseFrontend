import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { getMyAppointments } from '../../services/appointments.js';
import { verifyToken } from '../../services/auth.js';
import FeedbackModal from '../../components/FeedbackModal.jsx';
import { isAppointmentPaid, subscribeToPaymentUpdates } from '../../services/appointmentPayments.js';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function isPaidForAppointment(a) {
  if (!a) return false;
  if (a.paymentStatus === 'paid') return true;
  return isAppointmentPaid(a._id);
}

export default function MyAppointments() {
  const [appts, setAppts] = useState([]);
  const [, bump] = useState(0);
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, doctorId: null, doctorName: '' });
  const [expandedIds, setExpandedIds] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const APPOINTMENTS_PER_PAGE = 10;

  useEffect(() => {
    let socket;
    (async () => {
      try {
        const res = await getMyAppointments(localStorage.getItem('token') || '');
        setAppts(res.data || res);

        const vb = await verifyToken(localStorage.getItem('token') || '');
        if (!vb || vb.success === false) return;
        const user = vb.data?.user;
        if (!user) return;

        socket = io(API, { transports: ['websocket'] });
        socket.on('connect', () => { socket.emit('join', user._id); });
        socket.on('appointment-updated', (appt) => { setAppts(prev => prev.map(p => (p._id === appt._id ? appt : p))); });
      } catch (err) { console.error('MyAppointments socket error', err); }
    })();

    return () => { if (socket) socket.disconnect(); };
  }, []);

  useEffect(() => {
    return subscribeToPaymentUpdates(() => bump((x) => x + 1));
  }, []);

  function formatDateTime(appointment) {
    if (appointment.date) {
      const date = new Date(appointment.date);
      if (appointment.time) {
        const [hours, minutes] = appointment.time.split(':');
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return appointment.createdAt ? new Date(appointment.createdAt).toLocaleString() : 'Date not set';
  }

  function formatRequestSentDate(appointment) {
    if (!appointment?.createdAt) return 'Request time not available';
    const created = new Date(appointment.createdAt);
    if (Number.isNaN(created.getTime())) return 'Request time not available';
    return created.toLocaleString();
  }

  function getStatusColor(status) {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200';
    }
  }

  function isAppointmentPast(appointment) {
    if (!appointment.date) return false;
    const appointmentDate = new Date(appointment.date);
    if (appointment.time) {
      const [hours, minutes] = appointment.time.split(':');
      appointmentDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    }
    return appointmentDate < new Date();
  }

  function canLeaveFeedback(appointment) {
    return appointment.status === 'completed' || 
           (appointment.status === 'confirmed' && isAppointmentPast(appointment));
  }

  function getDisplayStatus(status) {
    return status || 'pending';
  }

  function getStatusLabel(status) {
    const normalized = getDisplayStatus(status);
    if (normalized === 'pending') return 'Request sent (Pending doctor response)';
    if (normalized === 'confirmed') return 'Accepted';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  function getRequestTimestamp(appointment) {
    if (appointment?.createdAt) {
      const created = new Date(appointment.createdAt).getTime();
      if (!Number.isNaN(created)) return created;
    }
    if (appointment?.date) {
      const date = new Date(appointment.date);
      if (appointment.time) {
        const [hours, minutes] = appointment.time.split(':');
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      }
      return date.getTime();
    }
    return 0;
  }

  const sortedAppointments = [...appts].sort(
    (a, b) => getRequestTimestamp(b) - getRequestTimestamp(a)
  );
  const totalPages = Math.max(1, Math.ceil(sortedAppointments.length / APPOINTMENTS_PER_PAGE));
  const startIndex = (currentPage - 1) * APPOINTMENTS_PER_PAGE;
  const paginatedAppointments = sortedAppointments.slice(
    startIndex,
    startIndex + APPOINTMENTS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function handleOpenFeedback(doctorId, doctorName) {
    setFeedbackModal({ isOpen: true, doctorId, doctorName });
  }

  function handleCloseFeedback() {
    setFeedbackModal({ isOpen: false, doctorId: null, doctorName: '' });
  }

  function toggleExpanded(appointmentId) {
    setExpandedIds((prev) => ({
      ...prev,
      [appointmentId]: !prev[appointmentId],
    }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 dark:from-slate-950 dark:to-slate-950 dark:text-gray-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold dark:text-gray-100">My Appointments</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Latest appointment requests appear first. New requests stay as pending until your doctor responds.
        </p>
      {sortedAppointments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-gray-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          No appointments found.
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedAppointments.map(a => {
            const doctorName = a.doctorId?.name || 'Unknown Doctor';
            const doctorSpecialty = a.doctorId?.specialty || '';
            const status = getDisplayStatus(a.status);
            const isExpanded = Boolean(expandedIds[a._id]);
            
            return (
              <div key={a._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4 bg-slate-50/80 px-4 py-3 dark:bg-slate-800/50">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                      Request Sent
                    </p>
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-gray-200">
                      {formatRequestSentDate(a)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(a._id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      aria-label={isExpanded ? 'Hide appointment details' : 'Show appointment details'}
                    >
                      <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>⌄</span>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-3 p-4">
                    <div className="text-lg font-semibold dark:text-gray-100">{doctorName}</div>
                    {doctorSpecialty && (
                      <div className="text-sm text-gray-600 dark:text-slate-400">{doctorSpecialty}</div>
                    )}
                    <div className="text-sm text-gray-700 dark:text-slate-300">
                      <span className="font-medium">Appointment Date & Time:</span> {formatDateTime(a)}
                    </div>
                    {status === 'confirmed' && !isPaidForAppointment(a) && (
                      <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200">
                        Pay your amount to continue to appointment with {doctorName}.
                        <button
                          onClick={() => navigate(`/patient/appointment-payment/${a._id}`)}
                          className="ml-3 rounded bg-purple-600 px-3 py-1.5 text-white hover:bg-purple-700"
                        >
                          Pay Now
                        </button>
                      </div>
                    )}
                    {status === 'confirmed' && isPaidForAppointment(a) && (
                      <div className="mt-2 rounded-md border border-green-200 bg-green-50 p-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300">
                        Payment successful. Appointment with {doctorName} is ready.
                      </div>
                    )}
                    {a.createdAt && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-slate-500">
                        Request created on: {new Date(a.createdAt).toLocaleString()}
                      </div>
                    )}
                    {canLeaveFeedback(a) && a.doctorId?._id && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleOpenFeedback(a.doctorId._id, doctorName)}
                          className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
                        >
                          Leave Feedback & Rating
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Showing {sortedAppointments.length === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + APPOINTMENTS_PER_PAGE, sortedAppointments.length)} of {sortedAppointments.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <span className="text-sm text-slate-700 dark:text-slate-200">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={handleCloseFeedback}
        doctorId={feedbackModal.doctorId}
        doctorName={feedbackModal.doctorName}
        onSuccess={() => {
          // Optionally refresh appointments or show success message
          console.log('Feedback submitted successfully');
        }}
      />
    </div>
  );
}


