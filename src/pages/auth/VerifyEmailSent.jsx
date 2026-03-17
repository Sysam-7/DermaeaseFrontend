import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resendGoogleOTP } from '../../services/auth.js';

export default function VerifyEmailSent() {
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      navigate('/register');
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email) {
      setError('Email is missing');
      return;
    }

    if (countdown > 0) return;

    setResendLoading(true);
    setError('');
    setMessage('');
    try {
      await resendGoogleOTP({ email });
      setMessage('Verification email resent successfully! Please check your email.');
      setCountdown(60); // 60 second cooldown
    } catch (err) {
      setError(err?.message || 'Failed to resend email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50/60 via-white/40 to-blue-100/60 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute right-10 top-10 w-72 h-72 bg-yellow-300 opacity-40 rounded-full blur-3xl"></div>
      <div className="absolute right-32 top-56 w-56 h-56 bg-yellow-300 opacity-30 rounded-full blur-2xl"></div>

      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-sm text-gray-600">
            We've sent a verification email to <strong>{email}</strong>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Is it really you trying to create a new account in DermaEase?</strong>
          </p>
          <p className="text-sm text-gray-600">
            Click the verification link in the email to confirm your account. The link will expire in 1 hour.
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the email?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || countdown > 0}
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading
                ? 'Sending...'
                : countdown > 0
                ? `Resend in ${countdown}s`
                : 'Resend Verification Email'}
            </button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <Link
              to="/register"
              className="text-sm text-gray-600 hover:text-indigo-600 hover:underline"
            >
              ← Back to Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

