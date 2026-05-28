import { useLocation, useNavigate } from "react-router-dom";

function NavIcon({ children }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-[#5B3FA8] shadow-sm dark:bg-slate-800/90 dark:text-indigo-300">
      {children}
    </span>
  );
}

export default function AdminSidebar({ stats = {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { users = 0, patients = 0, doctors = 0 } = stats;

  const isActive = (path) => location.pathname === path;

  const navClass = (active) =>
    `group relative flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium leading-tight transition ${
      active
        ? "bg-[#F3EEF9] text-[#2D2640] shadow-sm dark:bg-violet-950/50 dark:text-gray-100"
        : "text-[#4B4558] hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800/80"
    }`;

  const activePill = (
    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#5B3FA8]" />
  );

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className="sticky top-16 z-30 flex h-[calc(100vh-4rem)] w-[240px] shrink-0 flex-col justify-between self-start overflow-hidden border-r border-[#E8E0F5] bg-white px-3 py-4 shadow-[4px_0_32px_rgba(91,63,168,0.06)] dark:border-slate-700 dark:bg-slate-900">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mb-4 flex items-center gap-2 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5DD6] to-[#5B3FA8] text-sm font-bold text-white shadow-md">
            A
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight text-[#2D2640] dark:text-gray-100">DermaEase</h2>
            <p className="text-[10px] leading-tight text-[#8B7EAE] dark:text-slate-400">Admin portal</p>
          </div>
        </div>

        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#9B8CB8] dark:text-slate-500">
          Menu
        </p>
        <nav className="mb-4 flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className={`${navClass(isActive("/admin/dashboard"))} relative w-full text-left`}
          >
            {isActive("/admin/dashboard") && activePill}
            <NavIcon>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </NavIcon>
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/doctor-applications")}
            className={`${navClass(isActive("/admin/doctor-applications"))} relative w-full text-left`}
          >
            {isActive("/admin/doctor-applications") && activePill}
            <NavIcon>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </NavIcon>
            Doctor applications
          </button>
        </nav>

        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#9B8CB8] dark:text-slate-500">
          Overview
        </p>
        <div className="space-y-1 px-1 text-[12px] leading-snug">
          <div className="rounded-lg bg-[#F3EEF9] px-2 py-1.5 dark:bg-violet-950/40">
            <span className="font-semibold">Users</span> · {users}
          </div>
          <div className="rounded-lg bg-[#F8F5FD] px-2 py-1.5 dark:bg-slate-800">
            <span className="font-semibold">Patients</span> · {patients}
          </div>
          <div className="rounded-lg bg-[#F8F5FD] px-2 py-1.5 dark:bg-slate-800">
            <span className="font-semibold">Doctors</span> · {doctors}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="shrink-0 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98]"
      >
        Logout
      </button>
    </aside>
  );
}
