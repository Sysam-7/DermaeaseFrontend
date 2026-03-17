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
    <div className="min-h-screen bg-gradient-to-b from-white to-yellow-100 px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">My Prescriptions</h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">
              View and download prescriptions your doctors have shared with you.
            </p>
          </div>
          <Link
            to="/patient"
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </header>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your prescriptions...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Unable to load prescriptions</h2>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={loadPrescriptions}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-3">💊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No prescriptions yet</h2>
            <p className="text-gray-600 text-sm">
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
                  className="bg-white rounded-2xl shadow-md border border-yellow-100 p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{doctorName}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
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
