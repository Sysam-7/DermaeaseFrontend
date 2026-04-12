import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function DoctorCard({ doctor }) {
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleBook(e) {
    e?.preventDefault();
    e?.stopPropagation();
    if (loading) return;
    setLoading(true);
    // Redirect patient to the modern booking page where they can pick date & time.
    navigate(`/patient/booking?doctorId=${doctor._id}`);
    // We immediately stop the loading state because navigation will unmount this component.
    setLoading(false);
  }

  function handleCardClick(e) {
    // Don't navigate if clicking on buttons
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/doctors/${doctor._id}`);
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
    <div 
      onClick={handleCardClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-lg ring-1 ring-transparent transition hover:-translate-y-1 hover:shadow-2xl hover:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900/90 dark:hover:ring-indigo-900"
    >
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
            className="h-20 w-20 rounded-2xl object-cover shadow-md ring-4 ring-indigo-50 transition group-hover:scale-[1.02] dark:ring-indigo-950/50"
          />
          <span
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold shadow ${
              doctor.available ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {doctor.available ? "Available" : "Busy"}
          </span>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-gray-100">{doctor.name}</h3>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">{doctor.specialty || "General"}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Personalized skin and wellness care tailored to your needs. Book a slot to see availability.
          </p>
          <div className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
              <span className="text-slate-400">📍</span>
              {doctor.location || "Location shared after booking"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
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
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
          >
            Quick booking
          </Link>
        </div>
      </div>
    </div>
  );
}
