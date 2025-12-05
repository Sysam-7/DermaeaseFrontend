import { Link } from 'react-router-dom';

export default function DashboardCard({ title, description, to }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 flex items-start justify-between">
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-gray-600 text-sm max-w-md">{description}</p>
      </div>
      <Link to={to} className="self-start bg-yellow-400 text-black text-xs px-3 py-1 rounded">Open</Link>
    </div>
  );
}



