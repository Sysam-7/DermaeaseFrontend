import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getMyAppointments } from '../../services/appointments.js';
import { verifyToken } from '../../services/auth.js';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MyAppointments() {
  const [appts, setAppts] = useState([]);

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
                {a.createdAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    Booked on: {new Date(a.createdAt).toLocaleString()}
                  </div>
                )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


