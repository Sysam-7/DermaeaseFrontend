import { useEffect, useState } from "react";
import { getMyAppointments, updateAppointmentStatus } from "../../services/appointments.js";

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load appointments from backend
  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || "";
      const result = await getMyAppointments(token);
      const appointmentsList = result.data || result || [];
      // Show all appointments (including past) so doctors can see every booking
      setAppointments(appointmentsList);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError(err.message || "Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Update appointment status (confirm, complete, cancel)
  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token") || "";
      const result = await updateAppointmentStatus(id, status, token);
      if (result.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: result.data.status } : a))
        );
      } else {
        alert(result.message || "Failed to update status");
      }
    } catch (err) {
      alert(err.message || "Failed to update status");
      console.error("Update status error:", err);
    }
  };

  // Format date and time for display
  const formatDateTime = (appointment) => {
    if (!appointment.date) return "Date not set";
    const date = new Date(appointment.date);
    if (appointment.time) {
      const [hours, minutes] = appointment.time.split(":");
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    }
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-yellow-100 flex">
      {/* Sidebar (match DoctorDashboard styling) */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-200 p-6 flex flex-col justify-between min-h-screen">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-10">DermaEase</h2>

          <nav className="flex flex-col gap-4">
            <a
              href="/doctor/dashboard"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              Dashboard
            </a>

            <a
              href="/doctor/manage-appointments"
              className="flex items-center gap-3 p-3 rounded-xl bg-yellow-100 text-gray-900 font-semibold shadow-sm hover:shadow-md transition"
            >
              Appointments
            </a>

            <a
              href="/doctor/chats"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              Chats
            </a>

            <a
              href="/doctor/feedback"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
            >
              Feedback
            </a>
          </nav>
        </div>

        <div className="flex flex-col gap-4 mt-10">
          <a
            href="/doctor/settings"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition"
          >
            Settings
          </a>

          <a
            href="/logout"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 font-medium transition"
          >
            Logout
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              Manage Appointments
            </h1>
            <p className="text-gray-600 text-lg">
              View and manage all consultations booked by your patients.
            </p>
          </div>
          <button
            onClick={loadAppointments}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-6 text-gray-600 bg-white rounded-2xl shadow">
            Loading upcoming appointments…
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl shadow text-gray-600">
            No upcoming appointments found. Once patients book from the{" "}
            <span className="font-semibold">Find Doctors</span> page, they will
            appear here.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wide">
                <tr>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Date &amp; Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => {
                  const patientName =
                    app.patientId?.name || app.patientUsername || "Unknown Patient";
                  const patientEmail = app.patientId?.email || "";

                  return (
                    <tr
                      key={app._id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">
                            {patientName}
                          </span>
                          {patientEmail && (
                            <span className="text-sm text-gray-500">
                              {patientEmail}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-800">
                        {formatDateTime(app)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status.charAt(0).toUpperCase() +
                            app.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {app.status === "pending" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(app._id, "confirmed")
                              }
                              className="px-3 py-1 text-xs rounded-full bg-green-600 text-white hover:bg-green-700"
                            >
                              Confirm
                            </button>
                          )}
                          {app.status === "confirmed" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(app._id, "completed")
                              }
                              className="px-3 py-1 text-xs rounded-full bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Complete
                            </button>
                          )}
                          {app.status !== "cancelled" &&
                            app.status !== "completed" && (
                              <button
                                onClick={() =>
                                  handleUpdateStatus(app._id, "cancelled")
                                }
                                className="px-3 py-1 text-xs rounded-full bg-red-600 text-white hover:bg-red-700"
                              >
                                Cancel
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
