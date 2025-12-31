import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Page from '../../components/ui/Page.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { fetchDoctorsForAdmin, deleteDoctorAsAdmin } from '../../services/admin.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    let active = true;

    async function loadDoctors() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchDoctorsForAdmin(token);
        if (!active) return;
        setDoctors(data.data || data.doctors || []);
      } catch (err) {
        if (!active) return;
        if (err.status === 401) {
          localStorage.removeItem('admin_token');
          navigate('/admin/login', { replace: true });
          return;
        }
        setError(err.message || 'Failed to fetch doctors');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDoctors();

    return () => {
      active = false;
    };
  }, [navigate, token]);

  async function handleDelete(id) {
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    const confirmDelete = window.confirm('Delete this doctor? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      await deleteDoctorAsAdmin(id, token);
      setDoctors((prev) => prev.filter((doc) => doc._id !== id));
      if (selectedDoctor?._id === id) setSelectedDoctor(null);
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login', { replace: true });
        return;
      }
      alert(err.message || 'Failed to delete doctor');
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  }

  return (
    <Page
      title="Admin dashboard"
      subtitle="Manage doctors securely"
      actions={
        <Button onClick={handleLogout} className="text-sm px-3 py-1">
          Logout
        </Button>
      }
    >
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <Card>Loading doctors…</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Doctors</h2>
              <span className="text-sm text-gray-500">{doctors.length} total</span>
            </div>
            <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
              {doctors.map((doc) => (
                <div key={doc._id} className="border rounded-lg p-3">
                  <p className="font-semibold">{doc.name || 'Unnamed doctor'}</p>
                  <p className="text-sm text-gray-500">{doc.email}</p>
                  <p className="text-sm">{doc.specialty || 'General'}</p>
                  <div className="mt-3 flex gap-2">
                    <Button type="button" className="text-sm px-3 py-1" onClick={() => setSelectedDoctor(doc)}>
                      View info
                    </Button>
                    <Button
                      type="button"
                      className="text-sm px-3 py-1 bg-red-500 hover:bg-red-400 text-white"
                      onClick={() => handleDelete(doc._id)}
                    >
                      Delete doctor
                    </Button>
                  </div>
                </div>
              ))}
              {doctors.length === 0 && <p className="text-sm text-gray-500">No doctors found.</p>}
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold mb-3">Details</h2>
            {selectedDoctor ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Name:</span> {selectedDoctor.name || 'Not provided'}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {selectedDoctor.email || 'Not provided'}
                </p>
                <p>
                  <span className="font-medium">Specialization:</span> {selectedDoctor.specialty || 'Not provided'}
                </p>
                <p>
                  <span className="font-medium">Status:</span> {selectedDoctor.status || 'active'}
                </p>
                <p>
                  <span className="font-medium">Location:</span> {selectedDoctor.location || '—'}
                </p>
                <p>
                  <span className="font-medium">Bio:</span> {selectedDoctor.bio || '—'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select a doctor to view their information.</p>
            )}
          </Card>
        </div>
      )}
    </Page>
  );
}


