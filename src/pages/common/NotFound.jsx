import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
      <Link className="underline" to="/">Go Home</Link>
    </div>
  );
}


