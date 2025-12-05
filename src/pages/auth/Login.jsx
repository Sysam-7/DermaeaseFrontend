import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/authService.js';
import '../Login.page.css';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Login • DermaEase';

    let script;
    function renderGsiButton() {
      try {
        const root = document.getElementById('gsi-container');
        if (!root || !window.google || !window.google.accounts || !window.google.accounts.id) return;
        root.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(root, { theme: 'outline', size: 'large', width: '100%' });
      } catch (e) {
        console.warn('GSI render error', e);
      }
    }

    if (GOOGLE_CLIENT_ID) {
      if (window.google?.accounts?.id) {
        renderGsiButton();
      } else {
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => { renderGsiButton(); };
        document.head.appendChild(script);
      }
    } else {
      console.warn('VITE_GOOGLE_CLIENT_ID not set');
    }

    window.onGoogleSignIn = (resp) => handleCredentialResponse(resp);

    return () => {
      if (script && script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  async function handleCredentialResponse(credentialResponse) {
    setError('');
    try {
      if (!credentialResponse) throw new Error('No credential received from Google');
      const payload = credentialResponse.credential ? { credential: credentialResponse.credential } : credentialResponse;

      const r = await fetch(`${API}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.message || 'Google sign-in failed');

      if (body.token) {
        localStorage.setItem('token', body.token);
        if (body.role) localStorage.setItem('role', body.role);
        if (body.name) localStorage.setItem('name', body.name);
      }

      const role = body.role || localStorage.getItem('role') || 'patient';
      navigate(role === 'doctor' ? '/doctor' : '/patient');

    } catch (err) {
      console.error('Google sign-in error', err);
      setError(err.message || 'Google sign-in error');
    }
  }

  async function submit(e) {
    e?.preventDefault();
    setError('');

    if (!email || !password) return setError('Email and password are required');

    setLoading(true);
    try {
      const res = await login({ email, password });

      if (res.token) {
        localStorage.setItem('token', res.token);
        if (res.role) localStorage.setItem('role', res.role);
        if (res.name) localStorage.setItem('name', res.name);
      }

      const role = res.role || localStorage.getItem('role') || 'patient';
      navigate(role === 'doctor' ? '/doctor' : '/patient');

    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function openServerGoogle() {
    window.open(
      `${API}/auth/google`,
      '_blank',
      'noopener,noreferrer,width=600,height=700'
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
          <p>Modern dermatology consultations — safe, simple, personal.</p>
        </div>

        <div className="right-pane">
          <h2>User Login</h2>

          <form onSubmit={submit} className="login-form">
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {error && <div className="form-error">{error}</div>}

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Signing in…' : 'LOGIN'}
            </button>
          </form>

          <div className="divider">or sign in with</div>

          <div id="gsi-container" className="google-btn-container" />

          <button className="google-fallback" type="button" onClick={openServerGoogle}>
            <img src="/Images/google-icon.png" alt="Google" className="google-icon" />
            Sign in with Google
          </button>

          <p className="register-text">
            Don't have an account? <Link to="/register">Create Your Account →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
