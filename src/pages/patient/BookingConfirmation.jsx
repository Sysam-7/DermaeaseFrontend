import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function BookingConfirmation() {
  const { state } = useLocation();
  const doctor = state?.doctor || {};
  const message = state?.message || "Appointment booked. Please wait for doctor's approval.";

  useEffect(() => {
    document.title = 'Booking Confirmed • DermaEase';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-white to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-4">
          <img src={doctor.profilePic || '/Images/doctors/doctor1.jpg'} alt={doctor.name} className="w-24 h-24 rounded-lg object-cover ring-2 ring-indigo-200" />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Booking Confirmed</h1>
            <p className="mt-1 text-sm text-gray-600">You have requested a consultation with</p>
            <div className="mt-2 text-lg font-semibold text-indigo-700">{doctor.name || 'Doctor'}</div>
            <div className="text-sm text-gray-500">{doctor.specialty || ''} • {doctor.location || ''}</div>
          </div>
        </div>

        <div className="mt-6 rounded-lg p-5 border border-dashed border-indigo-100 bg-indigo-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-green-600 rounded-md flex items-center justify-center text-white font-bold">✓</div>
            </div>
            <div>
              <div className="text-lg font-medium text-gray-800">{message}</div>
              <div className="mt-2 text-sm text-gray-600">We saved your request and the doctor will be notified. You will be informed when they approve or decline.</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link to="/patient/find-doctors" className="inline-block w-full sm:w-auto text-center px-5 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">Browse more doctors</Link>
          <Link to="/patient/my-appointments" className="inline-block w-full sm:w-auto text-center px-5 py-3 border border-indigo-200 rounded-lg text-indigo-700 hover:bg-indigo-50">View my appointments</Link>
        </div>

        <div className="mt-6 text-xs text-gray-400">If you don't receive updates, check the Appointments page or contact support.</div>
      </div>
    </div>
  );
}