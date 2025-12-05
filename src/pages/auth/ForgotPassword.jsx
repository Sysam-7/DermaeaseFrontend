import { useState } from 'react';
import { forgotPassword } from '../../api/auth.js';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    if (!email) return setStatus('Email required');
    setLoading(true);
    try {
      await forgotPassword({ email });
      setStatus('If that account exists, a reset link was sent. Check your email (or backend logs in dev).');
    } catch (err) {
      setStatus(err?.message || 'Request failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset your password</h2>
        <p className="text-sm text-gray-500 mb-4">Enter your account email and we'll send a reset link.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" className="w-full px-4 py-2 border rounded-lg" />
          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg">{loading ? 'Sending…' : 'Send reset link'}</button>
            <Link to="/auth/login" className="text-sm text-gray-600 hover:underline">Back to login</Link>
          </div>
        </form>

        {status && <div className="mt-4 text-sm text-gray-700">{status}</div>}
      </div>
    </div>
  );
}


