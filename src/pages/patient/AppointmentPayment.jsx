import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMyAppointments } from '../../services/appointments.js';
import { fetchPaymentFee, initiateKhaltiPayment } from '../../services/payments.js';
import { fetchCurrentUser } from '../../services/users.js';

export default function AppointmentPayment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feeNpr, setFeeNpr] = useState(500);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    (async () => {
      try {
        const feeRes = await fetchPaymentFee();
        if (feeRes.amount_npr != null) setFeeNpr(feeRes.amount_npr);
      } catch {
        /* keep default */
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token') || '';
        const [apptRes, userRes] = await Promise.all([
          getMyAppointments(token),
          fetchCurrentUser(token).catch(() => null),
        ]);
        const list = apptRes.data || apptRes || [];
        const appt = list.find((a) => String(a._id) === String(appointmentId));
        if (!appt) {
          setError('Appointment not found.');
          setAppointment(null);
        } else {
          setAppointment(appt);
        }
        const u = userRes?.data || userRes?.user || userRes;
        const name = u?.name || localStorage.getItem('name') || '';
        const email = u?.email || '';
        setCustomerInfo((prev) => ({
          ...prev,
          name: prev.name || name,
          email: prev.email || email,
        }));
      } catch (err) {
        setError(err.message || 'Failed to load appointment details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [appointmentId]);

  const doctorName = useMemo(() => appointment?.doctorId?.name || 'Doctor', [appointment]);
  const alreadyPaid = appointment?.paymentStatus === 'paid';

  const handlePayWithKhalti = async () => {
    if (!appointment) return;
    if (!customerInfo.name?.trim() || !customerInfo.email?.trim() || !customerInfo.phone?.trim()) {
      setError('Please enter your name, email, and phone for Khalti.');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || '';
      const res = await initiateKhaltiPayment(
        appointment._id,
        {
          name: customerInfo.name.trim(),
          email: customerInfo.email.trim(),
          phone: customerInfo.phone.trim(),
        },
        token
      );
      const paymentUrl = res.data?.payment_url;
      if (!paymentUrl) throw new Error('No payment URL from server');
      window.location.href = paymentUrl;
    } catch (err) {
      setError(err.message || 'Could not start Khalti payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Appointment payment (Khalti)</h1>
      <p className="text-gray-600 mb-6">
        Pay the consultation fee to continue. You will be redirected to Khalti (sandbox) to complete payment.
      </p>

      {loading ? (
        <div className="p-4 bg-white rounded border">Loading payment details...</div>
      ) : error && !appointment ? (
        <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>
      ) : !appointment ? null : appointment.status !== 'confirmed' ? (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded border border-yellow-200">
          Payment is available only after the doctor confirms this appointment.
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="space-y-2 text-sm mb-4">
            <p>
              <span className="font-semibold">Doctor:</span> {doctorName}
            </p>
            <p>
              <span className="font-semibold">Amount:</span> NPR {feeNpr}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{' '}
              {alreadyPaid ? 'Paid' : appointment.paymentStatus === 'pending' ? 'Payment started' : 'Unpaid'}
            </p>
          </div>

          {alreadyPaid ? (
            <div className="mt-4 p-3 rounded bg-green-50 text-green-700 border border-green-200">
              Payment completed. You can continue to your appointment.
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">Billing details (sent to Khalti)</p>
              <div className="grid gap-3 max-w-md">
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="Full name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo((s) => ({ ...s, name: e.target.value }))}
                />
                <input
                  className="border rounded-lg px-3 py-2"
                  type="email"
                  placeholder="Email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo((s) => ({ ...s, email: e.target.value }))}
                />
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="Phone (e.g. 9800000001 for sandbox)"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo((s) => ({ ...s, phone: e.target.value }))}
                />
              </div>
              {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
              <button
                onClick={handlePayWithKhalti}
                disabled={processing}
                className="mt-6 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
              >
                {processing ? 'Starting Khalti…' : 'Pay with Khalti'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
