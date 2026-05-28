import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ onLogout, isAuthenticated }) {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const isLandingPage = location.pathname === "/";
  const brandTarget = isAuthenticated
    ? role === "doctor"
      ? "/doctor/dashboard"
      : role === "patient"
        ? "/patient"
        : role === "admin"
          ? "/admin/dashboard"
          : "/"
    : "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] h-16 border-b border-violet-100 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-5">
        {/* Brand */}
        <Link to={brandTarget} className="flex items-center gap-2">
          <span className="text-lg md:text-xl font-extrabold tracking-tight text-violet-700 dark:text-violet-300">
            Derma Ease
          </span>
        </Link>

        {/* Center spacer */}
        <div className="hidden md:block" />

        {/* Right auth actions */}
        <div className="flex items-center gap-3">
          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center rounded-full border border-violet-200 px-4 py-1.5 text-xs md:text-sm font-medium text-violet-700 transition-colors hover:border-violet-400 hover:bg-violet-50 dark:border-slate-600 dark:text-violet-300 dark:hover:bg-slate-800"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-violet-700 px-4 py-1.5 text-xs md:text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-500"
              >
                Register
              </Link>
            </>
          )}
          {isAuthenticated && !isLandingPage && (
            <button
              onClick={onLogout}
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-violet-600 px-4 py-1.5 text-xs md:text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
