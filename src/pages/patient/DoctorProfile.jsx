import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [booked, setBooked] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API.replace(/\/$/,'')}/doctors/${id}`);
        if (res.ok) {
          const body = await res.json();
          setDoctor(body.data);
        }
      } catch (err) {}
    })();
  }, [id]);

  async function handleBook() {
    setMessage('');
    try {
      const verify = await fetch(`${API.replace(/\/$/,'')}/auth/verify-token`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        credentials: 'include'
      });
      if (!verify.ok) { setMessage('Not authenticated'); return; }
      const vb = await verify.json();
      const patient = vb.data.user;
      const payload = {
        doctorId: id,
        patientUsername: patient.username || patient.name || localStorage.getItem('name') || 'patient',
      };

      const res = await fetch(`${API.replace(/\/$/,'')}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (res.ok && body.success) {
        setBooked(true);
        navigate('/patient/booking-confirmation', {
          state: {
            doctor: { name: doctor?.name, specialty: doctor?.specialty, location: doctor?.location, profilePic: doctor?.profilePic },
            message: 'Appointment booked. Please wait for doctor’s approval.'
          }
        });
      } else {
        setMessage(body.message || 'Booking failed');
      }
    } catch (err) {
      setMessage('Server error');
    }
  }

  if (!doctor) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl bg-white rounded shadow">
      <div className="flex gap-4 items-center">
        <img src={doctor.profilePic || '/Images/doctor-placeholder.png'} alt={doctor.name} className="w-28 h-28 rounded-lg object-cover" />
        <div>
          <h1 className="text-2xl font-semibold">{doctor.name}</h1>
          <p className="text-sm text-gray-600">{doctor.specialty}</p>
          <p className="text-sm text-gray-500">{doctor.location}</p>
        </div>
      </div>

      <div className="mt-6">
        <button onClick={handleBook} disabled={booked} className={`px-4 py-2 rounded ${booked ? 'bg-gray-300' : 'bg-blue-600 text-white'}`}>
          {booked ? 'Booked' : 'Book Consultation'}
        </button>
        {message && <div className="mt-3 text-sm text-green-700">{message}</div>}
      </div>
    </div>
  );
}


