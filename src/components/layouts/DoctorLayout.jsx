import { Link, Outlet } from 'react-router-dom';

export default function DoctorLayout() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-3 border p-4 space-y-2">
        <h3 className="font-semibold">Doctor Menu</h3>
        <nav className="flex flex-col space-y-1">
          <Link className="underline" to="/doctor">Dashboard</Link>
          <Link className="underline" to="/doctor/profile">My Profile</Link>
          <Link className="underline" to="/doctor/patient/preview">Patient Profile</Link>
          <Link className="underline" to="/doctor/appointments">Manage Appointments</Link>
          <Link className="underline" to="/doctor/chat">Chat</Link>
          <Link className="underline" to="/doctor/prescriptions">Prescriptions</Link>
          <Link className="underline" to="/doctor/reviews">Reviews</Link>
          <Link className="underline" to="/settings">Settings</Link>
          <Link className="underline" to="/help">Help / FAQ</Link>
        </nav>
      </aside>
      <main className="col-span-9">
        <Outlet />
      </main>
    </div>
  );
}


