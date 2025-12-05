import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../api/auth.js';

export default function ResetPassword() {
  const [search] = useSearchParams();
  const token = search.get('token') || '';
  const email = search.get('email') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(()=> { document.title = 'Reset password'; }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    if (!password || password !== confirm) return setStatus('Passwords must match');
    if (password.length < 8) return setStatus('Use at least 8 characters');
    setLoading(true);
    try {
      await resetPassword({ email, token, password });
      setStatus('Password reset successfully. Redirecting to login...');
      setTimeout(()=> navigate('/auth/login'), 1200);
    } catch (err) {
      setStatus(err?.message || 'Reset failed');
    } finally { setLoading(false); }
  }

  if (!token || !email) return (
    <div className="p-6">
      <div className="max-w-md bg-white rounded p-6 shadow">Invalid reset link. <Link to="/auth/forgot-password" className="text-green-600">Request new link</Link></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-semibold">Create a new password</h2>
        <p className="text-sm text-gray-500 mb-4">Account: <strong>{email}</strong></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="New password" className="w-full px-4 py-2 border rounded-lg" />
          <input value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" placeholder="Confirm password" className="w-full px-4 py-2 border rounded-lg" />
          <div className="flex justify-between items-center">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg">{loading ? 'Saving…' : 'Save password'}</button>
            <Link to="/auth/login" className="text-sm text-gray-600 hover:underline">Back to login</Link>
          </div>
        </form>

        {status && <div className="mt-4 text-sm text-gray-700">{status}</div>}
      </div>
    </div>
  );
}