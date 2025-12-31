import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/auth.js';

function strongPassword(p) {
  return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p);
}

export default function ResetPassword() {
  const [search] = useSearchParams();
  const token = search.get('token') || '';
  const email = search.get('email') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Reset Password • DermaEase';
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    if (!password || !confirm) return setStatus('Please fill in all fields');
    if (password !== confirm) return setStatus('Passwords must match');
    if (!strongPassword(password)) return setStatus('Password: 8+ chars, upper/lower and a number');
    setLoading(true);
    try {
      await resetPassword({ email, token, password });
      setStatus('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setStatus(err?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="
        relative min-h-screen w-full
        bg-gradient-to-br from-blue-50/60 via-white/40 to-blue-100/60
        backdrop-blur-md flex items-center justify-center p-4 overflow-hidden
      ">
        <div className="login-card">
          <div className="right-pane">
            <h2>Invalid Reset Link</h2>
            <p className="text-sm text-gray-500 mb-4">This reset link is invalid or has expired.</p>
            <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
              Request a new reset link →
            </Link>
            <div className="mt-4">
              <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600 hover:underline">
                ← Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="
      relative min-h-screen w-full
      bg-gradient-to-br from-blue-50/60 via-white/40 to-blue-100/60
      backdrop-blur-md flex items-center justify-center p-4 overflow-hidden
    ">
      {/* --- YELLOW MODERN SPLASH BLOBS (3 sizes, right side) --- */}
      <div className="absolute right-10 top-10 w-72 h-72 bg-yellow-300 opacity-40 rounded-full blur-3xl" />
      <div className="absolute right-32 top-56 w-56 h-56 bg-yellow-300 opacity-30 rounded-full blur-2xl" />
      <div className="absolute right-48 top-96 w-40 h-40 bg-yellow-300 opacity-20 rounded-full blur-xl" />

      {/* --- C-SHAPED WAVE --- */}
      <div className="
        absolute right-0 top-0 h-full w-40 
        bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-200
        opacity-40 rounded-l-[100px]
      " />

      <div className="login-card">
        <div className="left-pane">
          <h1>DermaEase</h1>
          <p>Create a new secure password for your account.</p>
        </div>

        <div className="right-pane">
          <h2>Reset Password</h2>
          <p className="text-sm text-gray-500 mb-2">Account: <strong className="text-gray-900">{email}</strong></p>
          <p className="text-xs text-gray-400 mb-6">Password must be 8+ characters with upper, lower case and a number</p>

          <form onSubmit={handleSubmit} className="login-form">
            <input
              className="input-field"
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <input
              className="input-field"
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />

            {status && (
              <div className={`text-sm p-3 rounded-lg ${
                status.includes('success') || status.includes('Redirecting')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {status}
              </div>
            )}

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600 hover:underline">
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}