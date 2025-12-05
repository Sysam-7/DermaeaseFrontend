import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MyAppointments() {
  const [appts, setAppts] = useState([]);

  useEffect(() => {
    let socket;
    (async () => {
      try {
        const res = await fetch(`${API.replace(/\/$/,'')}/appointments/my`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
          credentials: 'include'
        });
        if (res.ok) {
          const body = await res.json();
          setAppts(body.data || []);
        }

        const verify = await fetch(`${API.replace(/\/$/,'')}/auth/verify-token`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
          credentials: 'include'
        });
        if (!verify.ok) return;
        const vb = await verify.json();
        const user = vb.data.user;
        if (!user) return;

        socket = io(API, { transports: ['websocket'] });
        socket.on('connect', () => { socket.emit('join', user._id); });
        socket.on('appointment-updated', (appt) => { setAppts(prev => prev.map(p => (p._id === appt._id ? appt : p))); });
      } catch (err) { console.error('MyAppointments socket error', err); }
    })();

    return () => { if (socket) socket.disconnect(); };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Appointments</h1>
      {appts.length === 0 ? <div className="text-gray-600">No appointments</div> : (
        <div className="space-y-3">
          {appts.map(a => (
            <div key={a._id} className="p-3 border rounded bg-white">
              <div className="font-medium">Doctor: {a.doctorId?.name || a.doctorId}</div>
              <div className="text-sm text-gray-600">Booked: {new Date(a.createdAt).toLocaleString()}</div>
              <div className="text-sm">Status: {a.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


