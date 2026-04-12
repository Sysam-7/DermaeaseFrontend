import { useEffect, useState } from 'react';
import { fetchMyDoctorReviews } from '../../services/users.js';
import NotificationBell from '../../components/NotificationBell.jsx';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';

export default function DoctorFeedback() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const result = await fetchMyDoctorReviews(token);
      
      if (result.success) {
        setReviews(result.data || []);
        setAverageRating(result.averageRating || 0);
        setTotalReviews(result.totalReviews || 0);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-yellow-100 dark:from-slate-900 dark:to-slate-950 flex">
      <DoctorSidebar />

      {/* Main Content */}
      <main className="flex-1 p-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
              Ratings & Feedback
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              View patient reviews and ratings
            </p>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {localStorage.getItem('name') || 'Dr. Smith'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dermatologist</p>
            </div>

            <img
              src="/Images/doctors/doctor1.jpg"
              alt="profile"
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow-sm"
            />
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Overall Rating
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                  {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                </div>
                <div>
                  {renderStars(Math.round(averageRating))}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg">No reviews yet.</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Reviews from patients will appear here once they leave feedback.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        {review.patientId?.name || 'Anonymous Patient'}
                      </h3>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-gray-600 font-medium">
                          {review.rating}.0
                        </span>
                      </div>
                    </div>
                    {review.patientId?.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {review.patientId.email}
                      </p>
                    )}
                    {review.text && (
                      <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                        {review.text}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-4">
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
      </main>
    </div>
  );
}

