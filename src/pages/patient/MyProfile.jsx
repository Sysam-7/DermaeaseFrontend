import './MyProfile.page.css';
import { useEffect, useState } from 'react';
import { verifyToken } from '../../services/auth.js';
import { updateUsername } from '../../services/users.js';

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const body = await verifyToken(localStorage.getItem('token') || '');
        const u = body?.data?.user;
        if (u) {
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
      const body = await updateUsername(username, localStorage.getItem('token') || '');
      setUser(body.data || body.user || user);
      setMsg(body.message || 'Username saved');
      localStorage.setItem('username', username);
    } catch (err) {
      setMsg(err.message || 'Server error');
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


