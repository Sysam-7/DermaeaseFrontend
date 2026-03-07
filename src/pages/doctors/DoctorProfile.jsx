import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDoctorById } from '../../services/aboutDoctors.js';
import { fetchReviews } from '../../services/users.js';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const body = await getDoctorById(id);
        setDoctor(body.data || body.doctor || body);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (id) {
      loadReviews();
    }
  }, [id]);

  async function loadReviews() {
    try {
      setReviewsLoading(true);
      const token = localStorage.getItem('token');
      const result = await fetchReviews(id, token);
      
      if (result.success) {
        setReviews(result.data || []);
        setAverageRating(result.averageRating || 0);
        setTotalReviews(result.totalReviews || 0);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }

  function renderStars(rating) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            className={`text-xl ${rating >= num ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  // Fallback images
  const fallbackImages = [
    "/Images/doctors/doctor1.jpg",
    "/Images/doctors/doctor2.jpg",
    "/Images/doctors/doctor3.jpg",
    "/Images/doctors/doctor4.jpg"
  ];

  const generateIndex = () => {
    if (!id) return 0;
    let sum = 0;
    for (let i = 0; i < id.length; i++) {
      sum += id.charCodeAt(i);
    }
    return sum % fallbackImages.length;
  };

  const fallbackImage = fallbackImages[generateIndex()];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading doctor profile…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Error loading profile: {error}</p>
          <Link to="/patient/find-doctors" className="text-indigo-600 hover:underline">
            ← Back to Find Doctors
          </Link>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg mb-4">Doctor not found.</p>
          <Link to="/patient/find-doctors" className="text-indigo-600 hover:underline">
            ← Back to Find Doctors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header with back button */}
        <div className="mb-6">
          <Link
            to="/patient/find-doctors"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
          >
            ← Back to Find Doctors
          </Link>
        </div>

        {/* Doctor Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400" />
          
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Image */}
              <div className="relative shrink-0">
                <img
                  src={
                    doctor.profilePic
                      ? `/Images/doctors/${doctor.profilePic}`
                      : fallbackImage
                  }
                  alt={doctor.name}
                  className="w-32 h-32 rounded-2xl object-cover shadow-lg ring-4 ring-indigo-50"
                />
                <span
                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold shadow ${
                    doctor.available !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {doctor.available !== false ? "Available" : "Busy"}
                </span>
              </div>

              {/* Doctor Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-slate-900">{doctor.name}</h1>
                  <span className="rounded-full bg-indigo-50 px-4 py-1 text-sm font-semibold text-indigo-700">
                    {doctor.specialty || 'Dermatology'}
                  </span>
                </div>

                {/* Rating Summary */}
                {averageRating > 0 && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-slate-900">{averageRating.toFixed(1)}</span>
                      {renderStars(Math.round(averageRating))}
                    </div>
                    <span className="text-sm text-slate-600">
                      ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-6">
                  {doctor.location && (
                    <span className="inline-flex items-center gap-1">
                      <span>📍</span>
                      {doctor.location}
                    </span>
                  )}
                  {doctor.clinic && (
                    <span className="inline-flex items-center gap-1">
                      <span>🏥</span>
                      {doctor.clinic}
                    </span>
                  )}
                  {doctor.experience && (
                    <span className="inline-flex items-center gap-1">
                      <span>💼</span>
                      {doctor.experience} years experience
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/patient/booking?doctorId=${doctor._id}`)}
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                  >
                    Book Consultation
                  </button>
                  <Link
                    to={`/patient/booking?doctorId=${doctor._id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:text-indigo-600"
                  >
                    Quick Booking
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {doctor.bio && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">About</h2>
            <p className="text-slate-700 leading-relaxed">{doctor.bio}</p>
          </div>
        )}

        {/* Availability Section */}
        {(doctor.workingHoursStart || doctor.workingDays) && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Availability</h3>
            {doctor.workingHoursStart && doctor.workingHoursEnd && (
              <p className="text-slate-700 mb-4">
                <span className="font-semibold">Working Hours:</span> {doctor.workingHoursStart} - {doctor.workingHoursEnd}
              </p>
            )}
            {doctor.workingDays && doctor.workingDays.length > 0 && (
              <div>
                <span className="font-semibold text-slate-700">Working Days:</span>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                    doctor.workingDays.includes(index) && (
                      <span key={index} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                        {day}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews & Ratings Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Reviews & Ratings</h2>
            {averageRating > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">{averageRating.toFixed(1)}</span>
                {renderStars(Math.round(averageRating))}
                <span className="text-sm text-slate-600 ml-2">
                  ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl">
              <p className="text-slate-600 text-lg mb-2">No reviews yet.</p>
              <p className="text-slate-500 text-sm">
                This doctor hasn't received any reviews yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-slate-900">
                          {review.patientId?.name || 'Anonymous Patient'}
                        </h3>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-slate-600 font-medium">
                            {review.rating}.0
                          </span>
                        </div>
                      </div>
                      {review.patientId?.email && (
                        <p className="text-sm text-slate-500 mb-3">
                          {review.patientId.email}
                        </p>
                      )}
                      {review.text && (
                        <p className="text-slate-700 leading-relaxed mt-3">
                          {review.text}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-4">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
