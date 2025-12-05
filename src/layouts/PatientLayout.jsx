import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

export default function PatientLayout() {
  return (
    <div className="grid grid-cols-12 gap-6 max-w-6xl mx-auto">
      <div className="col-span-12 md:col-span-3">
        <Sidebar />
      </div>
      <main className="col-span-12 md:col-span-9">
        <Outlet />
      </main>
    </div>
  );
}


