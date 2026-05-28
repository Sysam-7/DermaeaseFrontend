import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import { getMyAppointments } from "../services/appointments.js";
import { fetchCurrentUser } from "../services/users.js";
import { avatarImageUrl } from "../utils/profileImageUrl.js";
import DoctorSidebar from "../components/doctor/DoctorSidebar";

function CalendarWidget() {
  const today = new Date();
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const label = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) =>
    d &&
    today.getDate() === d &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  const shift = (delta) => {
    setView(new Date(year, month + delta, 1));
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:shadow-none dark:ring-slate-600">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#2D2640] dark:text-gray-100">Calendar</h3>
        <span className="rounded-full bg-[#F3EEF9] px-3 py-1 text-xs font-medium text-[#5B3FA8] dark:bg-violet-950/60 dark:text-indigo-300">
          {label}
        </span>
      </div>
      <div className="mb-3 flex justify-between gap-2">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="rounded-xl bg-[#F5F2FA] px-3 py-1.5 text-sm font-medium text-[#5B3FA8] transition hover:bg-[#EDE8F5] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-indigo-300"
          aria-label="Previous month"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => shift(1)}
          className="rounded-xl bg-[#F5F2FA] px-3 py-1.5 text-sm font-medium text-[#5B3FA8] transition hover:bg-[#EDE8F5] dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-indigo-300"
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#9B8CB8] dark:text-slate-500">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <div
            key={i}
            className={`flex h-8 items-center justify-center rounded-lg text-sm ${
              d
                ? isToday(d)
                  ? "bg-[#5B3FA8] font-semibold text-white shadow-md"
                  : "text-[#2D2640] hover:bg-[#F3EEF9] dark:text-gray-200 dark:hover:bg-slate-800"
                : ""
            }`}
          >
            {d || ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const [doctorName, setDoctorName] = useState("Dr. Smith");
  const [doctorProfilePic, setDoctorProfilePic] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem("name");
      if (storedName) {
        const displayName = storedName.trim().toLowerCase().startsWith("dr.")
          ? storedName.trim()
          : `Dr. ${storedName.trim()}`;
        setDoctorName(displayName);
      }
    } catch (e) {
      console.error("Failed to read doctor name from localStorage", e);
    }
  }, []);

  useEffect(() => {
    function loadDoctorAvatar() {
      const t = localStorage.getItem("token");
      if (!t) return;
      fetchCurrentUser(t)
        .then((body) => {
          const pic = body?.data?.profilePic;
          setDoctorProfilePic(pic || "");
          if (body?.data?.name) {
            const n = body.data.name.trim();
            const displayName = n.toLowerCase().startsWith("dr.") ? n : `Dr. ${n}`;
            setDoctorName(displayName);
          }
        })
        .catch(() => {});
    }
    loadDoctorAvatar();
    function onProfileUpdated() {
      loadDoctorAvatar();
    }
    window.addEventListener("dermaease-profile-updated", onProfileUpdated);
    return () => window.removeEventListener("dermaease-profile-updated", onProfileUpdated);
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      setLoadingAppointments(true);
      try {
        const token = localStorage.getItem("token") || "";
        const result = await getMyAppointments(token);
        const list = result.data || result || [];
        setAppointments(list);
      } catch (err) {
        console.error("Failed to load dashboard appointments:", err);
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, []);

  const getAppointmentDate = (appointment) => {
    if (!appointment.date) return null;
    const date = new Date(appointment.date);
    if (appointment.time) {
      const [hours, minutes] = appointment.time.split(":");
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    }
    return date;
  };

  const now = new Date();
  const upcomingAppointments = appointments
    .map((a) => ({ ...a, _dateObj: getAppointmentDate(a) }))
    .filter((a) => a._dateObj && a._dateObj >= now)
    .sort((a, b) => a._dateObj - b._dateObj);

  const latestThreeAppointments =
    upcomingAppointments.length === 0
      ? appointments
          .map((a) => ({ ...a, _dateObj: getAppointmentDate(a) }))
          .filter((a) => a._dateObj)
          .sort((a, b) => b._dateObj - a._dateObj)
          .slice(0, 3)
      : [];

  const appointmentsToShow =
    upcomingAppointments.length > 0 ? upcomingAppointments : latestThreeAppointments;

  const upcomingCount = upcomingAppointments.length;
  const badgeText =
    upcomingCount > 99 ? "99+" : upcomingCount > 0 ? String(upcomingCount).padStart(2, "0") : null;

  const nextAppointment = upcomingAppointments[0];

  const formatDate = (appointment) => {
    const dateObj = getAppointmentDate(appointment);
    if (!dateObj) return "Date not set";
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (appointment) => {
    const dateObj = getAppointmentDate(appointment);
    if (!dateObj) return "Time not set";
    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F1FA] text-[#2D2640] dark:bg-slate-950 dark:text-gray-100">
      <div className="flex min-h-screen items-start">
        <DoctorSidebar appointmentBadge={badgeText} />

        {/* Main + right column */}
        <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
          <main className="min-w-0 flex-1 px-6 py-8 sm:px-10 lg:pr-6">
            {/* Top bar */}
            <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-[#2D2640] dark:text-gray-100 sm:text-3xl">
                  Good Morning, {doctorName}
                </h1>
                <p className="mt-1 text-[15px] text-[#6B6280] dark:text-slate-400">
                  Welcome back. Here is a quick overview of your schedule.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <NotificationBell />
                <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-[0_2px_12px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:ring-slate-600">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#2D2640] dark:text-gray-100">{doctorName}</p>
                    <p className="text-xs text-[#8B7EAE] dark:text-slate-400">Dermatologist</p>
                  </div>
                  <img
                    src={avatarImageUrl(doctorProfilePic, "doctors") || "/Images/doctors/doctor1.jpg"}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-[#E8E0F5] dark:ring-slate-600"
                  />
                </div>
              </div>
            </header>

            {/* Hero */}
            <section className="mb-8 flex flex-col items-stretch justify-between gap-6 rounded-3xl bg-gradient-to-br from-[#EDE4FF] via-[#E8DDF8] to-[#DDD0F0] p-8 shadow-[0_8px_32px_rgba(91,63,168,0.12)] dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:shadow-none sm:flex-row sm:items-center">
              <div className="max-w-lg">
                <h2 className="text-xl font-bold text-[#2D2640] dark:text-gray-100 sm:text-2xl">
                  Stay on top of your consultations
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5C5470] dark:text-slate-300">
                  Review upcoming visits, chat with patients, and manage your schedule in one place.
                </p>
                <Link
                  to="/doctor/manage-appointments"
                  className="mt-5 inline-flex items-center justify-center rounded-2xl bg-[#5B3FA8] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#5B3FA8]/30 transition hover:bg-[#4A3289]"
                >
                  View schedule
                </Link>
              </div>
              <div className="flex shrink-0 justify-center sm:justify-end">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-white/40 blur-xl" />
                  <img
                    src={avatarImageUrl(doctorProfilePic, "doctors") || "/Images/doctors/doctor1.jpg"}
                    alt=""
                    className="relative h-28 w-28 rounded-full border-4 border-white object-cover shadow-xl dark:border-slate-600 sm:h-32 sm:w-32"
                  />
                </div>
              </div>
            </section>

            {/* Quick actions */}
            <div className="mb-10 grid gap-5 sm:grid-cols-3">
              <Link
                to="/doctor/chats"
                className="flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#5B3FA8] to-[#4330A8] p-5 text-white shadow-[0_8px_28px_rgba(91,63,168,0.35)] transition hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <img
                  src="/Images/DoctorDashboard/Chat.png"
                  className="mx-auto mb-3 h-28 w-full object-contain opacity-95"
                  alt=""
                />
                <h3 className="font-semibold">Chats</h3>
                <p className="mt-1 text-sm text-white/80">Chat with patients</p>
              </Link>

              <Link
                to="/doctor/manage-appointments"
                className="flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8A598] to-[#D67B6E] p-5 text-white shadow-[0_8px_28px_rgba(214,123,110,0.35)] transition hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/25">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <img
                  src="/Images/DoctorDashboard/appointment.png"
                  className="mx-auto mb-3 h-28 w-full object-contain opacity-95"
                  alt=""
                />
                <h3 className="font-semibold">Appointments</h3>
                <p className="mt-1 text-sm text-white/90">Manage patient appointments</p>
              </Link>

              <Link
                to="/doctor/feedback"
                className="flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8D48A] to-[#D4B85C] p-5 text-[#3D3618] shadow-[0_8px_28px_rgba(212,184,92,0.35)] transition hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/40">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <img
                  src="/Images/DoctorDashboard/Rating.png"
                  className="mx-auto mb-3 h-28 w-full object-contain opacity-95"
                  alt=""
                />
                <h3 className="font-semibold">Ratings &amp; Feedback</h3>
                <p className="mt-1 text-sm text-[#5C5428]">View your ratings and feedback</p>
              </Link>
            </div>

            {/* Appointments table */}
            <h2 className="mb-6 text-xl font-bold text-[#2D2640] dark:text-gray-100">
              Latest &amp; Upcoming Appointments
            </h2>

            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:shadow-none dark:ring-slate-700">
              {loadingAppointments ? (
                <div className="p-8 text-center text-[#6B6280] dark:text-slate-400">Loading your appointments…</div>
              ) : appointmentsToShow.length === 0 ? (
                <div className="p-8 text-center text-[#6B6280] dark:text-slate-400">
                  You have no appointments yet. Once patients book consultations, they will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#EDE8F5] bg-[#FAF8FC] text-[11px] font-semibold uppercase tracking-wider text-[#8B7EAE] dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400">
                        <th className="px-5 py-4">Patient</th>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4">Time</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4" />
                      </tr>
                    </thead>
                    <tbody>
                      {appointmentsToShow.map((appointment, idx) => {
                        const patientName =
                          appointment.patientId?.name ||
                          appointment.patientUsername ||
                          "Unknown Patient";
                        const initial = patientName.trim().charAt(0).toUpperCase() || "?";
                        const rowHighlight = idx === 2;

                        return (
                          <tr
                            key={appointment._id}
                            className={`border-b border-[#F0EBF7] transition last:border-0 hover:bg-[#FAF8FC] dark:border-slate-700 dark:hover:bg-slate-800/50 ${
                              rowHighlight ? "bg-[#F3EEF9]/80 dark:bg-violet-950/35" : ""
                            }`}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#DDD0F0] to-[#C4B5E0] text-sm font-bold text-[#5B3FA8]">
                                  {initial}
                                </div>
                                <span className="font-medium text-[#2D2640] dark:text-gray-100">{patientName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-[#5C5470] dark:text-slate-300">{formatDate(appointment)}</td>
                            <td className="px-5 py-4 text-[#5C5470] dark:text-slate-300">{formatTime(appointment)}</td>
                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-full bg-[#E8F5EC] px-3 py-1 text-xs font-semibold capitalize text-[#2D7A4A] dark:bg-emerald-950/50 dark:text-emerald-300">
                                {appointment.status || "pending"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className="cursor-pointer text-sm font-semibold text-[#5B3FA8] hover:underline dark:text-indigo-400">
                                View Details
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>

          {/* Right sidebar */}
          <aside className="w-full shrink-0 border-t border-[#E8E0F5] bg-[#F9F7FC] px-6 py-8 dark:border-slate-700 dark:bg-slate-900/80 lg:w-[300px] lg:border-l lg:border-t-0 lg:pl-5 lg:pr-6">
            <div className="space-y-6">
              <CalendarWidget />

              <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:shadow-none dark:ring-slate-700">
                <div className="flex items-center justify-between border-b border-[#EDE8F5] px-4 py-3 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-[#2D2640] dark:text-gray-100">Next up</h3>
                  <Link
                    to="/doctor/manage-appointments"
                    className="text-xs font-semibold text-[#5B3FA8] hover:underline dark:text-indigo-400"
                  >
                    See all
                  </Link>
                </div>
                {nextAppointment ? (
                  <>
                    <div className="p-4">
                      <div className="flex gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F3EEF9] text-lg font-bold text-[#5B3FA8] dark:bg-violet-950/60 dark:text-indigo-300">
                          {(nextAppointment.patientId?.name || nextAppointment.patientUsername || "P")
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#2D2640] dark:text-gray-100">
                            {nextAppointment.patientId?.name ||
                              nextAppointment.patientUsername ||
                              "Patient"}
                          </p>
                          <p className="text-xs text-[#8B7EAE] dark:text-slate-400">Upcoming consultation</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#5B3FA8] px-4 py-3 text-sm text-white">
                      <svg className="h-4 w-4 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">
                        {formatDate(nextAppointment)}, {formatTime(nextAppointment)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-5 text-center text-sm text-[#6B6280] dark:text-slate-400">
                    No upcoming appointments.{" "}
                    <Link to="/doctor/manage-appointments" className="font-semibold text-[#5B3FA8] hover:underline dark:text-indigo-400">
                      View all
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
