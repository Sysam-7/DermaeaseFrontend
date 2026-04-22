import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/auth.js';
import PasswordInput from '../../components/PasswordInput.jsx';

function strongPassword(p) {
  return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p);
}

export default function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    if (!name || !email || !password) { setMessage('Please complete all required fields'); return; }
    if (!strongPassword(password)) { setMessage('Password: 8+ chars, upper/lower and a number'); return; }
    setLoading(true);
    try {
      const res = await register({ name, email, password, role: 'patient' });
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role || 'patient');
      }
      const finalRole = res.role || 'patient';
      navigate(finalRole === 'doctor' ? '/doctor/dashboard' : '/patient');
    } catch (err) {
      setMessage(err?.message || 'Registration failed');
    } finally { setLoading(false); }
  }

  function handleGoogleRegister() {
    const qs = new URLSearchParams({ role: 'patient' }).toString();
    let googleAuthURL;
    if (typeof window !== 'undefined' && !import.meta.env.VITE_API_URL) {
      googleAuthURL = `${window.location.origin}/api/auth/google?${qs}`;
    } else {
      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
      const apiURL = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
      googleAuthURL = `${apiURL}/auth/google?${qs}`;
    }
    console.log('Opening Google OAuth for registration:', googleAuthURL);
    window.location.href = googleAuthURL;
  }

  return (
    <>
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50/60 via-white/40 to-blue-100/60 overflow-hidden">

      {/* --- Yellow blobs on right side --- */}
      <div className="absolute right-10 top-10 w-72 h-72 bg-yellow-300 opacity-40 rounded-full blur-3xl"></div>
      <div className="absolute right-32 top-56 w-56 h-56 bg-yellow-300 opacity-30 rounded-full blur-2xl"></div>
      <div className="absolute right-48 top-96 w-40 h-40 bg-yellow-300 opacity-20 rounded-full blur-xl"></div>

      {/* --- C-shaped wave on right --- */}
      <div className="absolute right-0 top-0 h-full w-40 bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-200 opacity-40 rounded-l-[100px]"></div>

      <div className="w-full max-w-4xl bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left decorative pane */}
        <div className="relative flex items-center justify-center">
          <img 
            src="/Images/registerimage.jpg" 
            alt="Register" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right form pane */}
        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
          <p className="mt-1 text-sm text-gray-500">Register to request/offer consultations</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required />
            <input className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Username (optional)" value={username} onChange={e=>setUsername(e.target.value)} />
            <input className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <PasswordInput
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-3 pr-20 rounded-xl border border-gray-200"
              containerClassName="w-full"
            />
            <div className="text-xs text-gray-400">8+ chars, include upper & lower case & number</div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Creating this form registers a patient account.
            </div>

            {message && <div className="text-sm text-red-600">{message}</div>}

            <div className="flex items-center justify-between gap-4">
              <button type="submit" disabled={loading} className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-300 text-white font-semibold shadow">
                {loading ? 'Creating…' : 'Create account'}
              </button>
              <Link to="/login" className="text-sm text-gray-500 hover:underline">Already have an account?</Link>
            </div>
            <button
              type="button"
              onClick={() => navigate('/register/doctor')}
              className="w-full rounded-xl border border-indigo-200 bg-indigo-50 py-3 px-5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              Register as Doctor
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <span>Or sign up with Google</span>
            <div className="mt-3">
              <button 
                type="button" 
                onClick={handleGoogleRegister}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 flex items-center justify-center gap-3 bg-white hover:shadow-md transition-shadow"
              >
                <img src="/Images/google-icon.png" alt="Google" className="w-5 h-5" />
                <span className="text-sm text-gray-700">Register with Google</span>
              </button>
            </div>
            <div className="mt-4">
              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-indigo-600 hover:underline">
                Forgot your password?
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
    </>
  );
}
