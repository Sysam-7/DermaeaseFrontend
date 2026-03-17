import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyGoogleOTP, resendGoogleOTP } from '../../services/auth.js';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Redirect to register if no email
      navigate('/register');
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);
    setError('');
    setMessage('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp.slice(0, 6));
    setError('');
    setMessage('');

    // Focus the last filled input or the first empty one
    const lastIndex = Math.min(pastedData.length - 1, 5);
    const nextInput = document.getElementById(`otp-${lastIndex}`);
    if (nextInput) nextInput.focus();
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    setError('');
    setMessage('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    if (!email) {
      setError('Email is missing');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyGoogleOTP({ email, otp: otpString });
      
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role || 'patient');
        if (res.name) localStorage.setItem('name', res.name);
      }

      setMessage('Email verified successfully! Redirecting...');
      setTimeout(() => {
        const role = res.role || 'patient';
        navigate(role === 'doctor' ? '/doctor/dashboard' : '/patient');
      }, 1000);
    } catch (err) {
      setError(err?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

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
      setMessage('OTP resent successfully! Please check your email.');
      setCountdown(60); // 60 second cooldown
    } catch (err) {
      setError(err?.message || 'Failed to resend OTP. Please try again.');
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-sm text-gray-600 mb-6">
          We've sent a 6-digit verification code to <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-300 text-white font-semibold shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
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
                : 'Resend OTP'}
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
        </form>
      </div>
    </div>
  );
}

