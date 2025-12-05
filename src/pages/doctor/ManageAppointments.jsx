import { useEffect, useState } from 'react';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API.replace(/\/$/,'')}/appointments/doctor`, {
          credentials: 'include',
        });
        if (res.ok) {
          const body = await res.json();
          setAppointments(body.data ?? body ?? []);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`${API.replace(/\/$/,'')}/appointments/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      }
    } catch (err) {
      // ignore
    }
  }

  if (loading) return <DoctorLayout><div className="p-6">Loading appointments…</div></DoctorLayout>;

  return (
    <DoctorLayout>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Appointments</h2>
        {appointments.length === 0 ? (
          <div className="text-gray-600">No appointments found.</div>
        ) : (
          <div className="space-y-3">
            {appointments.map(app => (
              <div key={app._id} className="p-4 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{app.patientName ?? app.patient?.name ?? 'Unknown'}</div>
                  <div className="text-sm text-gray-600">{new Date(app.date).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Status: {app.status}</div>
                </div>
                <div className="flex gap-2">
                  {app.status !== 'confirmed' && (
                    <button onClick={() => updateStatus(app._id, 'confirmed')} className="px-3 py-1 bg-green-600 text-white rounded">Confirm</button>
                  )}
                  {app.status !== 'completed' && (
                    <button onClick={() => updateStatus(app._id, 'completed')} className="px-3 py-1 bg-blue-600 text-white rounded">Complete</button>
                  )}
                  {app.status !== 'cancelled' && (
                    <button onClick={() => updateStatus(app._id, 'cancelled')} className="px-3 py-1 bg-red-600 text-white rounded">Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}


