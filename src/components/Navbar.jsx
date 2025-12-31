import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ onLogout, isAuthenticated }) {
  const location = useLocation();

  const navLinkBase =
    "text-sm font-medium text-slate-700 hover:text-violet-700 transition-colors px-2 py-1 rounded-full hover:bg-violet-50";

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur border-b border-violet-100 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg md:text-xl font-extrabold tracking-tight text-violet-700">
            Derma Ease
          </span>
        </Link>

        {/* Center links */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/about" className={navLinkBase}>
            About
          </Link>
          <Link to="/contact" className={navLinkBase}>
            Contact
          </Link>
          <Link to="/help" className={navLinkBase}>
            Help
          </Link>
        </nav>

        {/* Right auth actions */}
        <div className="flex items-center gap-3">
          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center rounded-full border border-violet-200 px-4 py-1.5 text-xs md:text-sm font-medium text-violet-700 hover:border-violet-400 hover:bg-violet-50 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-violet-700 px-4 py-1.5 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-violet-800 transition-colors"
              >
                Register
              </Link>
            </>
          )}
          {isAuthenticated && (
            <button
              onClick={onLogout}
              className="inline-flex items-center justify-center rounded-full bg-violet-600 px-4 py-1.5 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
