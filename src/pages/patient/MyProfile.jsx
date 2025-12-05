import './MyProfile.page.css';
import { useEffect, useState } from 'react';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API.replace(/\/$/,'')}/auth/verify-token`, {
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        });
        if (res.ok) {
          const body = await res.json();
          const u = body.data.user;
          setUser(u);
          setUsername(u?.username || '');
        }
      } catch (err) { /* ignore */ }
    })();
  }, []);

  async function saveUsername(e) {
    e?.preventDefault();
    if (!username) { setMsg('Username required'); return; }
    setSaving(true); setMsg('');
    try {
      const res = await fetch(`${API.replace(/\/$/,'')}/users/username`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ username }),
      });
      const body = await res.json();
      if (res.ok) {
        setUser(body.data);
        setMsg('Username saved');
        localStorage.setItem('username', username);
      } else {
        setMsg(body.message || 'Save failed');
      }
    } catch (err) {
      setMsg('Server error');
    } finally { setSaving(false); }
  }

  // If no user loaded render placeholder
  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium">Username (required)</label>
        <input value={username} onChange={e => setUsername(e.target.value)} className="w-full border p-2 rounded" />
      </div>
      <div className="mb-4">
        <button onClick={saveUsername} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
          {saving ? 'Saving...' : 'Save username'}
        </button>
      </div>
      {msg && <div className="text-sm text-gray-700">{msg}</div>}
    </div>
  );
}


