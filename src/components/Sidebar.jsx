import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="border rounded-lg p-4 space-y-3 w-full">
      <h3 className="font-semibold text-lg">Patient Menu</h3>
      <nav className="flex flex-col space-y-1 text-sm">
        <Link className="hover:underline" to="/patient">Dashboard</Link>
        <Link className="hover:underline" to="/patient/search">Search Doctors</Link>
        <Link className="hover:underline" to="/patient/doctor/preview">Doctor Profile</Link>
        <Link className="hover:underline" to="/patient/book">Appointment Booking</Link>
        <Link className="hover:underline" to="/patient/appointments">My Appointments</Link>
        <Link className="hover:underline" to="/patient/chat">Chat</Link>
        <Link className="hover:underline" to="/patient/profile">My Profile</Link>
        <Link className="hover:underline" to="/settings">Settings</Link>
        <Link className="hover:underline" to="/help">Help / FAQ</Link>
      </nav>
    </aside>
  );
}



