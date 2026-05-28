import PatientSidebar from "./PatientSidebar";
import { patientShellBg } from "./patientTheme";

export default function PatientPageShell({
  children,
  upcomingBadge = null,
  mainClassName = "",
}) {
  return (
    <div className={patientShellBg}>
      <div className="flex min-h-screen items-start">
        <PatientSidebar upcomingBadge={upcomingBadge} />
        <main className={`portal-content min-w-0 flex-1 px-6 py-8 sm:px-10 ${mainClassName}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
