import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  async function handleBook(e) {
    e?.preventDefault();
    if (booked || loading) return;
    setLoading(true);
    try {
      // verify token and get patient info
      const verify = await fetch(`${API.replace(/\/$/,'')}/auth/verify-token`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (!verify.ok) {
        // not authenticated — optional: redirect to login
        setLoading(false);
        return;
      }
      const vb = await verify.json();
      const patient = vb.data.user;

      const payload = {
        doctorId: doctor._id,
        patientUsername: patient?.username || patient?.name || localStorage.getItem('name') || 'patient'
      };

      const res = await fetch(`${API.replace(/\/$/,'')}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(payload)
      });

      const body = await res.json();
      if (res.ok && body.success) {
        setBooked(true);
        // navigate to the booked confirmation page (modern UI)
        navigate('/patient/booking-confirmation', {
          state: {
            doctor: {
              name: doctor.name,
              specialty: doctor.specialty,
              location: doctor.location,
              profilePic: doctor.profilePic
            },
            message: "Appointment booked. Please wait for doctor's approval."
          }
        });
      } else {
        // optional: show error (keep UI unchanged)
        console.error('Booking failed', body);
      }
    } catch (err) {
      console.error('Booking error', err);
    } finally {
      setLoading(false);
    }
  }

  // 4 fallback images (i will later add doctor4.jpg)
  const fallbackImages = [
    "/Images/doctors/doctor1.jpg",
    "/Images/doctors/doctor2.jpg",
    "/Images/doctors/doctor3.jpg",
    "/Images/doctors/doctor4.jpg"
  ];

  // Hash doctor ID to distribute images evenly
  const generateIndex = () => {
    if (!doctor._id) return 0;

    let sum = 0;
    for (let i = 0; i < doctor._id.length; i++) {
      sum += doctor._id.charCodeAt(i);
    }
    return sum % fallbackImages.length; // gives 0,1,2,3
  };

  const fallbackImage = fallbackImages[generateIndex()];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex gap-4 items-center">
      
      <img
        src={
          doctor.profilePic
            ? `/Images/doctors/${doctor.profilePic}` // custom pic from database
            : fallbackImage                           // fallback doctor1–doctor4
        }
        alt={doctor.name}
        className="w-20 h-20 rounded-full object-cover border"
      />

      <div className="flex-1">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">{doctor.name}</h3>
          <div
            className={`text-sm font-medium ${
              doctor.available ? "text-green-600" : "text-gray-500"
            }`}
          >
            {doctor.available ? "Available" : "Busy"}
          </div>
        </div>

        <p className="text-sm text-gray-600">{doctor.specialty || "General"}</p>
        <p className="text-sm text-gray-500">{doctor.location}</p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleBook}
          disabled={booked || loading}
          className={`btn ${booked ? 'btn-disabled' : 'btn-primary'}`}
        >
          {loading ? 'Booking…' : (booked ? 'Booked' : 'Book Consultation')}
        </button>
        {/* <Link
          to={`/doctor/${doctor._id}`}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          View
        </Link> */}

        <Link
          to={`/patient/booking?doctor=${doctor._id}`}
          className="px-3 py-1 border rounded"
        >
          Book
        </Link>
      </div>
      
    </div>
  );
}
