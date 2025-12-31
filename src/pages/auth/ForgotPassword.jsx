import { useState, useEffect } from 'react';
import { forgotPassword } from '../../services/auth.js';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Forgot Password • DermaEase';
  }, []);

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
          <p>Reset your password to regain access to your account.</p>
        </div>

        <div className="right-pane">
          <h2>Forgot Password</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your email address and we'll send you a link to reset your password.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            {status && (
              <div className={`text-sm p-3 rounded-lg ${
                status.includes('sent') || status.includes('success')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {status}
              </div>
            )}

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600 hover:underline">
              ← Back to login
            </Link>
          </div>

          <p className="register-text mt-4">
            Don't have an account? <Link to="/register">Create Your Account →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}


