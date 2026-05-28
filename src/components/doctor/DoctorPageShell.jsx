import DoctorSidebar from "./DoctorSidebar";
import { doctorShellBg } from "./doctorTheme";

export default function DoctorPageShell({
  children,
  appointmentBadge = null,
  mainClassName = "",
}) {
  return (
    <div className={doctorShellBg}>
      <div className="flex min-h-screen items-start">
        <DoctorSidebar appointmentBadge={appointmentBadge} />
        <main
          className={`portal-content min-w-0 flex-1 px-6 py-8 sm:px-10 ${mainClassName}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
