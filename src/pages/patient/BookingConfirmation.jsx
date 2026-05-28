import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { avatarImageUrl } from '../../utils/profileImageUrl.js';
import PatientPageShell from '../../components/patient/PatientPageShell';
import { patientCardStatic, patientBtnPrimary, patientBtnSecondary } from '../../components/patient/patientTheme';

export default function BookingConfirmation() {
  const { state } = useLocation();
  const doctor = state?.doctor || {};
  const message = state?.message || "Appointment booked. Please wait for doctor's approval.";

  useEffect(() => {
    document.title = 'Booking Confirmed • DermaEase';
  }, []);

  return (
    <PatientPageShell mainClassName="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className={`${patientCardStatic} w-full max-w-3xl p-8`}>
        <div className="flex items-center gap-4">
          <img
            src={avatarImageUrl(doctor.profilePic, 'doctors') || '/Images/doctors/doctor1.jpg'}
            alt={doctor.name}
            className="h-24 w-24 rounded-lg object-cover ring-2 ring-[#E8E0F5]"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-[#2D2640] md:text-3xl">Booking Confirmed</h1>
            <p className="mt-1 text-sm text-[#6B6280]">You have requested a consultation with</p>
            <div className="mt-2 text-lg font-semibold text-[#5B3FA8]">{doctor.name || 'Doctor'}</div>
            <div className="text-sm text-[#6B6280]">
              {doctor.specialty || ''} • {doctor.location || ''}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-[#E8E0F5] bg-[#F8F5FD] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-emerald-600 font-bold text-white">
              ✓
            </div>
            <div>
              <p className="text-lg font-medium text-[#2D2640]">{message}</p>
              <div className="mt-2 text-sm text-[#6B6280]">
                We saved your request and the doctor will be notified. You will be informed when they approve or
                decline.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/patient/find-doctors" className={`${patientBtnPrimary} w-full text-center sm:w-auto`}>
            Browse more doctors
          </Link>
          <Link to="/patient/appointments" className={`${patientBtnSecondary} w-full text-center sm:w-auto`}>
            View my appointments
          </Link>
        </div>

        <p className="mt-6 text-xs text-[#9B94A8]">
          If you don&apos;t receive updates, check the Appointments page or contact support.
        </p>
      </div>
    </PatientPageShell>
  );
}
