import { Link } from 'react-router-dom';

export default function Navbar({ onLogout, isAuthenticated }) {
  return (
    <nav className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="font-bold">Derma Ease</Link>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/help">Help</Link>
        </div>
        <div className="space-x-4 flex items-center gap-4">
          <Link to="/login" className="text-sm">Login</Link>
          <Link to="/register" className="text-sm">Register</Link>
          {isAuthenticated && (
            <button onClick={onLogout} className="bg-yellow-400 px-3 py-1 rounded">Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
}



