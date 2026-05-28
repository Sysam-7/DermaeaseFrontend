import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPageShell from '../../components/admin/AdminPageShell.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import { fetchPendingDoctorApplications, reviewDoctorApplication } from '../../Services/admin.js';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

function buildDocumentUrl(path) {
  if (!path) return '#';
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path).replace(/\\/g, '/');
  if (normalized.startsWith('/')) return `${BASE_URL}${normalized}`;
  return `${BASE_URL}/${normalized}`;
}

export default function DoctorApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewNotes, setReviewNotes] = useState({});
  const [popup, setPopup] = useState({ open: false, title: '', message: '', tone: 'success' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetchPendingDoctorApplications(token);
        if (!active) return;
        setApplications(res.data || []);
      } catch (err) {
        if (!active) return;
        if (err.status === 401) {
          localStorage.removeItem('admin_token');
          navigate('/admin/login', { replace: true });
          return;
        }
        setError(err.message || 'Failed to load applications');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [navigate, token]);

  async function handleReview(applicationId, action) {
    try {
      await reviewDoctorApplication(applicationId, action, reviewNotes[applicationId] || '', token);
      setApplications((prev) => prev.filter((app) => app._id !== applicationId));
      setPopup({
        open: true,
        title: action === 'approve' ? 'Doctor approved' : 'Application rejected',
        message:
          action === 'approve'
            ? 'Doctor verified. They can now use the doctor portal and protected features, consistent with your existing approval checks.'
            : 'Application rejected. The doctor account will not pass approval checks until a new successful review, per your current rules.',
        tone: 'success',
      });
    } catch (err) {
      setPopup({
        open: true,
        title: 'Review failed',
        message: err.message || 'Unable to process this application',
        tone: 'error',
      });
    }
  }

  return (
    <AdminPageShell mainClassName="max-w-6xl mx-auto w-full">
      <AdminPageHeader
        title="Doctor registration reviews"
        subtitle="NMC-aligned verification: confirm documents and declared specialty before enabling the doctor portal."
      />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="mb-6 rounded-2xl border border-[#E8E0F5] bg-white p-5 text-sm text-[#2D2640] shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100">
          <h2 className="font-semibold text-[#5B3FA8] dark:text-indigo-300">Review checklist (compliance-style)</h2>
          <p className="mt-2 text-[#6B6280] dark:text-slate-400">
            Applicants should have submitted: NMC registration certificate, MBBS/medical degree (optional specialist pages in the same degree file), and citizenship or national ID. During review, confirm:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[#4B4558] dark:text-slate-300">
            <li>NMC registration appears valid and consistent with the declared registration number</li>
            <li>Identity on documents matches the applicant name and supporting ID</li>
            <li>Medical degree and declared specialization are plausible and consistent across documents</li>
            <li>All submitted information is internally consistent before approve/reject</li>
          </ul>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#E8E0F5] bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border border-[#E8E0F5] bg-white p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            No pending doctor applications.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {applications.map((app) => (
              <div key={app._id} className="rounded-2xl border border-[#E8E0F5] bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h2 className="text-lg font-semibold">{app.name}</h2>
                <p className="text-sm text-slate-500">{app.email}</p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">NMC registration no.:</span> {app.licenseNumber}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Declared specialization:</span> {app.specialization}
                </p>

                <div className="mt-3 space-y-1 text-sm">
                  <a className="block text-indigo-600 hover:underline dark:text-indigo-400" href={buildDocumentUrl(app.medicalLicensePath)} target="_blank" rel="noreferrer">
                    Open NMC registration certificate
                  </a>
                  <a className="block text-indigo-600 hover:underline dark:text-indigo-400" href={buildDocumentUrl(app.degreeCertificatePath)} target="_blank" rel="noreferrer">
                    Open MBBS / medical degree (incl. optional specialist pages)
                  </a>
                  <a className="block text-indigo-600 hover:underline dark:text-indigo-400" href={buildDocumentUrl(app.idDocumentPath)} target="_blank" rel="noreferrer">
                    Open citizenship or national ID
                  </a>
                </div>

                <input
                  type="text"
                  placeholder="Optional review note (reason for reject / approval context)"
                  value={reviewNotes[app._id] || ''}
                  onChange={(e) => setReviewNotes((prev) => ({ ...prev, [app._id]: e.target.value }))}
                  className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleReview(app._id, 'approve')}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(app._id, 'reject')}
                    className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {popup.open && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900">
            <h3 className={`text-lg font-bold ${popup.tone === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
              {popup.title}
            </h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{popup.message}</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setPopup({ open: false, title: '', message: '', tone: 'success' })}
                className="rounded-lg bg-[#5B3FA8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a3289]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}

