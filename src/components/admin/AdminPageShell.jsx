import AdminSidebar from "./AdminSidebar";

export default function AdminPageShell({ children, stats, mainClassName = "" }) {
  return (
    <div className="min-h-screen bg-[#F4F1FA] text-[#2D2640] dark:bg-slate-950 dark:text-gray-100">
      <div className="flex min-h-screen items-start">
        <AdminSidebar stats={stats} />
        <main className={`portal-content flex-1 px-6 py-8 sm:px-10 ${mainClassName}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
