import NotificationBell from "../NotificationBell";

export default function PatientPageHeader({
  title,
  subtitle,
  actions,
  showBell = true,
}) {
  return (
    <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#2D2640] dark:text-gray-100 sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[15px] text-[#6B6280] dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {(showBell || actions) && (
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {showBell && <NotificationBell />}
          {actions}
        </div>
      )}
    </header>
  );
}
