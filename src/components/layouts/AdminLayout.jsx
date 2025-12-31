import { Link, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-3 border p-4 space-y-2">
        <h3 className="font-semibold">Admin Menu</h3>
        <nav className="flex flex-col space-y-1">
          <Link className="underline" to="/admin">Dashboard</Link>
          <Link className="underline" to="/admin/doctors">Manage Doctors</Link>
          <Link className="underline" to="/admin/patients">Manage Patients</Link>
          <Link className="underline" to="/admin/reviews">Manage Reviews</Link>
          <Link className="underline" to="/admin/messages">Outgoing Messages</Link>
          <Link className="underline" to="/admin/analytics">System Analytics</Link>
          <Link className="underline" to="/admin/settings">Settings</Link>
          <Link className="underline" to="/help">Help / FAQ</Link>
        </nav>
      </aside>
      <main className="col-span-9">
        <Outlet />
      </main>
    </div>
  );
}


