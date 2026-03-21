import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMyAppointments } from '../../services/appointments.js';
import { markAppointmentPaid, isAppointmentPaid } from '../../services/appointmentPayments.js';

const DEFAULT_AMOUNT = 500;

export default function AppointmentPayment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token') || '';
        const res = await getMyAppointments(token);
        const list = res.data || res || [];
        const appt = list.find((a) => String(a._id) === String(appointmentId));
        if (!appt) {
          setError('Appointment not found.');
          setAppointment(null);
        } else {
          setAppointment(appt);
        }
      } catch (err) {
        setError(err.message || 'Failed to load appointment details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [appointmentId]);

  const doctorName = useMemo(() => appointment?.doctorId?.name || 'Doctor', [appointment]);
  const patientName = useMemo(() => localStorage.getItem('name') || 'Patient', []);
  const alreadyPaid = isAppointmentPaid(appointmentId);

  const handleMockKhaltiPayment = async () => {
    if (!appointment) return;
    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      markAppointmentPaid({
        appointmentId: appointment._id,
        doctorId: appointment.doctorId?._id || appointment.doctorId || '',
        doctorName,
        patientName,
        amount: DEFAULT_AMOUNT,
      });
      navigate('/patient/appointments');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Appointment Payment</h1>
      <p className="text-gray-600 mb-6">
        Khalti payment gateway UI placeholder. API integration can be connected later.
      </p>

      {loading ? (
        <div className="p-4 bg-white rounded border">Loading payment details...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>
      ) : !appointment ? null : appointment.status !== 'confirmed' ? (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded border border-yellow-200">
          Payment is available only after doctor confirmation.
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Doctor:</span> {doctorName}</p>
            <p><span className="font-semibold">Amount:</span> NPR {DEFAULT_AMOUNT}</p>
            <p>
              <span className="font-semibold">Status:</span>{' '}
              {alreadyPaid ? 'Payment completed' : 'Pending payment'}
            </p>
          </div>

          {!alreadyPaid ? (
            <button
              onClick={handleMockKhaltiPayment}
              disabled={processing}
              className="mt-6 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
            >
              {processing ? 'Processing Khalti Payment...' : 'Pay with Khalti'}
            </button>
          ) : (
            <div className="mt-6 p-3 rounded bg-green-50 text-green-700 border border-green-200">
              Payment successful. You can continue to your appointment.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
