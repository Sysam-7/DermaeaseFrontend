import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function DoctorCard({ doctor }) {
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleBook(e) {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    // Redirect patient to the modern booking page where they can pick date & time.
    navigate(`/patient/booking?doctorId=${doctor._id}`);
    // We immediately stop the loading state because navigation will unmount this component.
    setLoading(false);
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
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-lg ring-1 ring-transparent transition hover:-translate-y-1 hover:shadow-2xl hover:ring-indigo-100">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" />

      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5">
        <div className="relative shrink-0">
          <img
            src={
              doctor.profilePic
                ? `/Images/doctors/${doctor.profilePic}` // custom pic from database
                : fallbackImage                           // fallback doctor1–doctor4
            }
            alt={doctor.name}
            className="h-20 w-20 rounded-2xl object-cover shadow-md ring-4 ring-indigo-50 transition group-hover:scale-[1.02]"
          />
          <span
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold shadow ${
              doctor.available ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {doctor.available ? "Available" : "Busy"}
          </span>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold text-slate-900">{doctor.name}</h3>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{doctor.specialty || "General"}</span>
          </div>
          <p className="text-sm text-slate-600">
            Personalized skin and wellness care tailored to your needs. Book a slot to see availability.
          </p>
          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <span className="text-slate-400">📍</span>
              {doctor.location || "Location shared after booking"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              <span className="text-slate-400">🏥</span>
              {doctor.clinic || "Private consultation"}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[180px]">
          <button
            onClick={handleBook}
            disabled={booked || loading}
            className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition ${
              booked
                ? "cursor-not-allowed bg-slate-300"
                : "bg-indigo-600 shadow-indigo-200 hover:-translate-y-0.5 hover:bg-indigo-700"
            }`}
          >
            {loading ? 'Booking…' : (booked ? 'Booked' : 'Book consultation')}
          </button>

          <Link
            to={`/patient/booking?doctorId=${doctor._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:text-indigo-600"
          >
            Quick booking
          </Link>
        </div>
      </div>
    </div>
  );
}
