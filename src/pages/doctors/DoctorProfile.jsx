import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API.replace(/\/$/,'')}/doctors/${id}`, { credentials: 'include' });
        if (!res.ok) {
          throw new Error(`Not found: ${res.status}`);
        }
        const body = await res.json();
        setDoctor(body.data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading doctor profile…</div>;
  if (error) return <div className="p-6 text-red-600">Error loading profile: {error}</div>;
  if (!doctor) return <div className="p-6">Doctor not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
      <div className="flex gap-6 items-center">
        <img src={doctor.profilePic || '/Images/doctor-placeholder.png'} alt={doctor.name} className="w-32 h-32 rounded-lg object-cover border" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{doctor.name}</h1>
          <p className="text-gray-600">{doctor.specialty || 'Dermatology'}</p>
          <p> Experience: {doctor.experience}</p>
          <p className="bg-yellow-200 w-20 h-6">{doctor.price}</p>
          <p className="text-sm text-gray-500 mt-2">{doctor.location}</p>
          <div className="mt-3">
            <button onClick={() => window.location.href = `/patient/booking?doctor=${doctor._id}`} className="inline-block bg-blue-600 text-white px-4 py-2 rounded">
              Book Consultation
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">About</h2>
        <p className="text-gray-700 mt-2">{doctor.bio || 'No bio provided yet.'}</p>
      </div>

      {doctor.rating && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">Rating</h3>
          <p>{doctor.rating} / 5</p>
        </div>
      )}

      {/* Optional: show sample reviews if present */}
      {doctor.reviews?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium">Reviews</h3>
          <div className="space-y-2 mt-2">
            {doctor.reviews.map((r, i) => (
              <div key={i} className="p-3 border rounded bg-gray-50">
                <div className="font-medium">{r.author}</div>
                <div className="text-sm text-gray-600">{r.comment}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}