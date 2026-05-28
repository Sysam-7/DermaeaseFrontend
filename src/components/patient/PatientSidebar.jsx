import { Link, useLocation, useNavigate } from "react-router-dom";

function NavIcon({ children }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-[#5B3FA8] shadow-sm dark:bg-slate-800/90 dark:text-indigo-300">
      {children}
    </span>
  );
}

export default function PatientSidebar({ upcomingBadge = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const isPatientHome = path === "/patient" || path === "/patient/";

  const navClass = (active) =>
    `relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium leading-tight transition overflow-hidden ${
      active
        ? "bg-[#F3EEF9] text-[#2D2640] shadow-sm dark:bg-violet-950/50 dark:text-gray-100"
        : "text-[#4B4558] hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800/80"
    }`;

  const rail = (active) =>
    active ? (
      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#5B3FA8]" />
    ) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/", { replace: true });
  };

  return (
    <aside className="sticky top-16 z-30 flex h-[calc(100vh-4rem)] w-[240px] shrink-0 flex-col justify-between self-start overflow-hidden border-r border-[#E8E0F5] bg-white px-3 py-4 shadow-[4px_0_32px_rgba(91,63,168,0.06)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mb-4 flex items-center gap-2 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5DD6] to-[#5B3FA8] text-sm font-bold text-white shadow-md">
            D
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight text-[#2D2640] dark:text-gray-100">DermaEase</h2>
            <p className="text-[10px] leading-tight text-[#8B7EAE] dark:text-slate-400">Patient portal</p>
          </div>
        </div>

        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#9B8CB8] dark:text-slate-500">
          Menu
        </p>
        <nav className="flex flex-col gap-0.5">
          <Link to="/patient" className={navClass(isPatientHome)}>
            {rail(isPatientHome)}
            <NavIcon>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </NavIcon>
            Dashboard
          </Link>

          <Link to="/patient/find-doctors" className={navClass(path.startsWith("/patient/find-doctors"))}>
            {rail(path.startsWith("/patient/find-doctors"))}
            <NavIcon>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </NavIcon>
            Find doctors
          </Link>

          <Link to="/patient/appointments" className={navClass(path.startsWith("/patient/appointments"))}>
            {rail(path.startsWith("/patient/appointments"))}
            <NavIcon>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </NavIcon>
            <span className="flex-1 text-left">Appointments</span>
            {upcomingBadge && (
              <span className="rounded-full bg-[#5B3FA8] px-2 py-0.5 text-[11px] font-bold text-white">
                {upcomingBadge}
              </span>
            )}
          </Link>

          <Link to="/patient/chat" className={navClass(path.startsWith("/patient/chat"))}>
            {rail(path.startsWith("/patient/chat"))}
            <NavIcon>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </NavIcon>
            Chat
          </Link>

          <Link to="/prescriptions" className={navClass(path.startsWith("/prescriptions") || path.startsWith("/patient/prescription"))}>
            {rail(path.startsWith("/prescriptions") || path.startsWith("/patient/prescription"))}
            <NavIcon>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </NavIcon>
            Prescriptions
          </Link>

          <Link to="/reviews" className={navClass(path.startsWith("/reviews"))}>
            {rail(path.startsWith("/reviews"))}
            <NavIcon>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </NavIcon>
            Reviews
          </Link>

          <Link to="/patient/profile" className={navClass(path.startsWith("/patient/profile"))}>
            {rail(path.startsWith("/patient/profile"))}
            <NavIcon>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </NavIcon>
            Profile
          </Link>
        </nav>
      </div>

      <div className="shrink-0 border-t border-[#E8E0F5] pt-3 dark:border-slate-700">
        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#9B8CB8] dark:text-slate-500">
          Account
        </p>
        <nav className="flex flex-col gap-0.5">
          <Link to="/patient/settings" className={navClass(path.startsWith("/patient/settings"))}>
            {rail(path.startsWith("/patient/settings"))}
            <NavIcon>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </NavIcon>
            Settings
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[#C45C6A] transition hover:bg-[#FDE8EB] dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <NavIcon>
              <svg className="h-3.5 w-3.5 text-[#C45C6A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </NavIcon>
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );
}
