import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPrescriptions } from '../services/users.js';

export default function Prescriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== 'patient' && role !== 'admin') {
      navigate('/login');
      return;
    }
    loadPrescriptions();
  }, []);

  async function loadPrescriptions() {
    try {
      setLoading(true);
      setError('');
      const res = await fetchPrescriptions(token);
      if (res?.success === false) {
        setItems([]);
        setError(res.message || 'Failed to load prescriptions');
      } else {
        setItems(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
      setError(err.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-yellow-100 px-4 py-6 dark:from-slate-950 dark:to-slate-900 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-gray-100 md:text-4xl">My Prescriptions</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 md:text-base">
              View and download prescriptions your doctors have shared with you.
            </p>
          </div>
          <Link
            to="/patient"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            ← Back to Dashboard
          </Link>
        </header>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-slate-400">Loading your prescriptions...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/40">
            <h2 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-300">Unable to load prescriptions</h2>
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={loadPrescriptions}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-slate-900 dark:ring-1 dark:ring-slate-700">
            <div className="mb-3 text-5xl">💊</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">No prescriptions yet</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              When your doctor creates a prescription for you, it will appear here for easy access and download.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {items.map((p) => {
              const doctorName = p.doctorId?.name || 'Your doctor';
              const disease = p.content?.disease || 'Skin condition';
              return (
                <div
                  key={p._id}
                  className="flex flex-col justify-between rounded-2xl border border-yellow-100 bg-white p-5 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{doctorName}</h3>
                      <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {formatDate(p.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">Diagnosis:</span>{' '}
                      <span>{disease}</span>
                    </p>
                    {p.content?.medicines && p.content.medicines.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        {p.content.medicines.slice(0, 3).map((m, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-0.5 text-indigo-500">•</span>
                            <span className="font-medium">{m.name}</span>
                            {m.dosage && <span className="text-gray-500">— {m.dosage}</span>}
                          </li>
                        ))}
                        {p.content.medicines.length > 3 && (
                          <li className="text-xs text-gray-400">+ {p.content.medicines.length - 3} more</li>
                        )}
                      </ul>
                    )}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => navigate(`/patient/prescription/${p._id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm hover:shadow-md"
                    >
                      View Details
                    </button>
                    {p.pdfLink && (
                      <a
                        href={p.pdfLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
                      >
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
