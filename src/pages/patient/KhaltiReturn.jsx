import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyKhaltiPayment } from '../../services/payments.js';
import PatientPageShell from '../../components/patient/PatientPageShell';
import PatientPageHeader from '../../components/patient/PatientPageHeader';
import { patientCardStatic, patientBtnSecondary } from '../../components/patient/patientTheme';

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
    <PatientPageShell mainClassName="max-w-lg">
      <PatientPageHeader title="Khalti payment" subtitle="Payment verification" showBell={false} />
      <div className={`${patientCardStatic} p-6`}>
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
        ) : (
          <p className="text-[#6B6280]">{message}</p>
        )}
        <button type="button" onClick={() => navigate('/patient/appointments')} className={`${patientBtnSecondary} mt-6`}>
          Back to appointments
        </button>
      </div>
    </PatientPageShell>
  );
}
