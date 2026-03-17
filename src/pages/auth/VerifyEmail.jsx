import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resendGoogleOTP, verifyGoogleOTP } from '../../services/auth.js';

export default function VerifyEmail() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const emailParam = searchParams.get('email');
      const tokenParam = searchParams.get('token');

      if (!emailParam || !tokenParam) {
        setError('Invalid verification link. Missing email or token.');
        setLoading(false);
        return;
      }

      setEmail(emailParam);
      setToken(tokenParam);

      try {
        // Verify via POST so we can show a friendly error screen if the link is expired/used.
        const res = await verifyGoogleOTP({ email: emailParam, token: tokenParam });

        if (res?.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.role || 'patient');
          if (res.name) localStorage.setItem('name', res.name);
        }

        const finalRole = res?.role || 'patient';
        return navigate(finalRole === 'doctor' ? '/doctor/dashboard' : '/patient', { replace: true });
      } catch (err) {
        console.error('Verification error:', err);
        setError(err?.message || 'Email verification failed. The link may have expired.');
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  async function handleResend() {
    if (!email) return;
    setResendLoading(true);
    setError('');
    setMessage('');
    try {
      await resendGoogleOTP({ email });
      setMessage('Verification email resent. Please check your inbox/spam.');
    } catch (err) {
      setError(err?.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50/60 via-white/40 to-blue-100/60">
        <div className="w-full max-w-md bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50/60 via-white/40 to-blue-100/60">
        <div className="w-full max-w-md bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <div className="space-y-3">
              {email && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="w-full py-2 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {resendLoading ? 'Resending…' : 'Resend verification email'}
                </button>
              )}

              {message && <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">{message}</div>}

              <Link to="/register" className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline">
                ← Back to Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

