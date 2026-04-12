import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyKhaltiPayment } from '../../services/payments.js';

export default function KhaltiReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying payment with Khalti…');
  const [error, setError] = useState('');

  const pidx = searchParams.get('pidx');
  const urlStatus = searchParams.get('status');

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    if (!token) {
      setError('You must be logged in to complete verification.');
      return;
    }
    if (!pidx) {
      setError('Missing payment reference (pidx). Open this page only after returning from Khalti.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await verifyKhaltiPayment(pidx, token);
        if (cancelled) return;
        if (res.paid) {
          setMessage('Payment successful! Redirecting to your appointments…');
          setTimeout(() => navigate('/patient/appointments'), 1200);
        } else {
          setMessage(
            res.message ||
              (urlStatus ? `Khalti status: ${urlStatus}` : 'Payment not completed yet.')
          );
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Verification failed');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pidx, navigate, urlStatus]);

  return (
    <div className="max-w-lg mx-auto p-8 mt-10">
      <h1 className="text-xl font-semibold mb-2">Khalti payment</h1>
      {error ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">{error}</div>
      ) : (
        <p className="text-gray-700">{message}</p>
      )}
      <button
        type="button"
        onClick={() => navigate('/patient/appointments')}
        className="mt-6 text-sm text-purple-700 underline"
      >
        Back to appointments
      </button>
    </div>
  );
}
