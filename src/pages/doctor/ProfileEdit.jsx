import { useEffect, useState } from 'react';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';

export default function ProfileEdit() {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [form, setForm] = useState({
    name: '',
    email: '',
    specialty: '',
    location: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API.replace(/\/$/,'')}/auth/verify-token`, {
          credentials: 'include',
        });
        if (res.ok) {
          const body = await res.json();
          const user = body?.data?.user ?? body?.user;
          if (user) {
            setForm(f => ({ ...f,
              name: user.name || '',
              email: user.email || '',
              specialty: user.specialty || '',
              location: user.location || '',
              bio: user.bio || '',
            }));
          }
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch(`${API.replace(/\/$/,'')}/users/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated.' });
      } else {
        const body = await res.json().catch(()=>({}));
        setMessage({ type: 'error', text: body.message || 'Failed to update.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error.' });
    }
  }

  return (
    <DoctorLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        {loading ? <div>Loading…</div> : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Specialty</label>
              <input value={form.specialty} onChange={e=>setForm({...form, specialty: e.target.value})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Location</label>
              <input value={form.location} onChange={e=>setForm({...form, location: e.target.value})} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Bio</label>
              <textarea value={form.bio} onChange={e=>setForm({...form, bio: e.target.value})} className="w-full border rounded p-2" />
            </div>

            {message && (
              <div className={`p-2 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              <button type="button" onClick={() => window.location.href = '/doctor'} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </DoctorLayout>
  );
}


