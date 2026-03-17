import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import { getMyAppointments } from "../services/appointments.js";

export default function DoctorDashboard() {
  const [doctorName, setDoctorName] = useState("Dr. Smith");
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
    <div className="min-h-screen bg-gradient-to-b from-white to-yellow-100 flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-200 p-6 flex flex-col justify-between min-h-screen">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-10">DermaEase</h2>

          <nav className="flex flex-col gap-4">
            <Link
              to="/doctor/dashboard"
              className="flex items-center gap-3 p-3 rounded-xl bg-yellow-100 text-gray-900 font-semibold shadow-sm hover:shadow-md transition"
            >
              Dashboard
            </Link>

            <Link
              to="/doctor/profile"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              My Profile
            </Link>

            <Link
              to="/doctor/manage-appointments"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              Appointments
            </Link>

            <Link
              to="/doctor/chats"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              Chats
            </Link>

            <Link
              to="/doctor/feedback"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              Feedback
            </Link>

            <Link
              to="/doctor/prescription-generator"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              Prescription Generator
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-4 mt-10">
          <Link
            to="/doctor/settings"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
          >
            Settings
          </Link>

          <Link
            to="/logout"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 font-medium transition"
          >
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              Good Morning, {doctorName}
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome back. Here is a quick overview of your schedule.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="text-right">
              <p className="font-semibold text-gray-900">Dr. Smith</p>
              <p className="text-sm text-gray-500">Dermatologist</p>
            </div>

            <img
              src="/Images/doctors/doctor1.jpg"
              alt="profile"
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow-sm"
            />
          </div>
        </div>

        {/* Feature Boxes */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          
          {/* Chats */}
          <Link
            to="/doctor/chats"
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition cursor-pointer flex flex-col items-center"
          >
            <img
              src="/Images/DoctorDashboard/Chat.png"
              className="w-full h-44 object-contain mb-4"
              alt="Chats"
            />
            <h3 className="font-semibold text-gray-900 text-lg mb-1">Chats</h3>
            <p className="text-gray-500 text-sm text-center">
              Chat with patients
            </p>
          </Link>

          {/* Appointments */}
          <Link
            to="/doctor/manage-appointments"
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition cursor-pointer flex flex-col items-center"
          >
            <img
              src="/Images/DoctorDashboard/appointment.png"
              className="w-full h-44 object-contain mb-4"
              alt="Appointments"
            />
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              Appointments
            </h3>
            <p className="text-gray-500 text-sm text-center">
              Manage patient appointments
            </p>
          </Link>

          {/* Ratings */}
          <Link
            to="/doctor/feedback"
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition cursor-pointer flex flex-col items-center"
          >
            <img
              src="/Images/DoctorDashboard/Rating.png"
              className="w-full h-44 object-contain mb-4"
              alt="Ratings"
            />
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              Ratings & Feedback
            </h3>
            <p className="text-gray-500 text-sm text-center">
              View your ratings and feedback
            </p>
          </Link>
        </div>

        {/* Latest & Upcoming Appointments */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Latest &amp; Upcoming Appointments
        </h2>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loadingAppointments ? (
            <div className="p-6 text-gray-600">Loading your appointments…</div>
          ) : appointmentsToShow.length === 0 ? (
            <div className="p-6 text-gray-600">
              You have no appointments yet. Once patients book consultations, they
              will appear here.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wide">
                <tr>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>

              <tbody>
                {appointmentsToShow.map((appointment) => {
                  const patientName =
                    appointment.patientId?.name ||
                    appointment.patientUsername ||
                    "Unknown Patient";
                  const initial = patientName.trim().charAt(0).toUpperCase() || "?";

                  return (
                    <tr
                      key={appointment._id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-semibold">
                          {initial}
                        </div>
                        {patientName}
                      </td>
                      <td className="p-4">{formatDate(appointment)}</td>
                      <td className="p-4">{formatTime(appointment)}</td>
                      <td className="p-4">
                        <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium capitalize">
                          {appointment.status || "pending"}
                        </span>
                      </td>
                      <td className="p-4 text-green-700 font-semibold cursor-pointer hover:underline">
                        View Details
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
