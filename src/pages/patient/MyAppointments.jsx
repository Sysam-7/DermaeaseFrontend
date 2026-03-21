import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { getMyAppointments } from '../../services/appointments.js';
import { verifyToken } from '../../services/auth.js';
import FeedbackModal from '../../components/FeedbackModal.jsx';
import { isAppointmentPaid, subscribeToPaymentUpdates } from '../../services/appointmentPayments.js';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MyAppointments() {
  const [appts, setAppts] = useState([]);
  const [paidMap, setPaidMap] = useState({});
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, doctorId: null, doctorName: '' });
  const navigate = useNavigate();

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
    const refreshPaidState = () => {
      const next = {};
      appts.forEach((a) => {
        next[String(a._id)] = isAppointmentPaid(a._id);
      });
      setPaidMap(next);
    };

    refreshPaidState();
    return subscribeToPaymentUpdates(refreshPaidState);
  }, [appts]);

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

  function getStatusColor(status) {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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

  function handleOpenFeedback(doctorId, doctorName) {
    setFeedbackModal({ isOpen: true, doctorId, doctorName });
  }

  function handleCloseFeedback() {
    setFeedbackModal({ isOpen: false, doctorId: null, doctorName: '' });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Appointments</h1>
      {appts.length === 0 ? (
        <div className="text-gray-600 p-4 bg-gray-50 rounded">No appointments found.</div>
      ) : (
        <div className="space-y-4">
          {appts.map(a => {
            const doctorName = a.doctorId?.name || 'Unknown Doctor';
            const doctorSpecialty = a.doctorId?.specialty || '';
            
            return (
              <div key={a._id} className="p-4 border rounded-lg bg-white shadow-sm">
                <div className="font-semibold text-lg mb-1">{doctorName}</div>
                {doctorSpecialty && (
                  <div className="text-sm text-gray-600 mb-2">{doctorSpecialty}</div>
                )}
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Appointment Date & Time:</span> {formatDateTime(a)}
                </div>
                <div className="inline-block mb-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(a.status)}`}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </div>
                {a.status === 'confirmed' && !paidMap[String(a._id)] && (
                  <div className="mt-2 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                    Pay your amount to continue to appointment with {doctorName}.
                    <button
                      onClick={() => navigate(`/patient/appointment-payment/${a._id}`)}
                      className="ml-3 px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Pay Now
                    </button>
                  </div>
                )}
                {a.status === 'confirmed' && paidMap[String(a._id)] && (
                  <div className="mt-2 p-2 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
                    Payment successful. Appointment with {doctorName} is ready.
                  </div>
                )}
                {a.createdAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    Booked on: {new Date(a.createdAt).toLocaleString()}
                  </div>
                )}
                {canLeaveFeedback(a) && a.doctorId?._id && (
                  <div className="mt-3">
                    <button
                      onClick={() => handleOpenFeedback(a.doctorId._id, doctorName)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition text-sm font-medium"
                    >
                      Leave Feedback & Rating
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
          // Optionally refresh appointments or show success message
          console.log('Feedback submitted successfully');
        }}
      />
    </div>
  );
}


