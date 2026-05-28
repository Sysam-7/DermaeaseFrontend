import { useEffect, useState } from "react";
import { getMyAppointments, updateAppointmentStatus } from "../../services/appointments.js";
import { isAppointmentPaid, subscribeToPaymentUpdates } from "../../services/appointmentPayments.js";
import DoctorPageShell from "../../components/doctor/DoctorPageShell";
import DoctorPageHeader from "../../components/doctor/DoctorPageHeader";
import { doctorBtnPrimary, doctorCardStatic, doctorTableHead, doctorTableRow } from "../../components/doctor/doctorTheme";

function isPaidForAppointment(a) {
  if (!a) return false;
  if (a.paymentStatus === "paid") return true;
  return isAppointmentPaid(a._id);
}

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [, bump] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const APPOINTMENTS_PER_PAGE = 10;

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

  useEffect(() => {
    return subscribeToPaymentUpdates(() => bump((x) => x + 1));
  }, []);

  // Update appointment status (confirm, complete, cancel)
  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token") || "";
      const result = await updateAppointmentStatus(id, status, token);
      if (result.success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a._id === id ? { ...a, ...result.data, status: result.data.status ?? a.status } : a
          )
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

  const getAppointmentTimestamp = (appointment) => {
    if (!appointment?.date) return 0;
    const date = new Date(appointment.date);
    if (appointment.time) {
      const [hours, minutes] = appointment.time.split(":");
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date.getTime();
  };

  const getRequestTimestamp = (appointment) => {
    if (appointment?.createdAt) {
      const created = new Date(appointment.createdAt).getTime();
      if (!Number.isNaN(created)) return created;
    }
    // Fallback for older or malformed records
    return getAppointmentTimestamp(appointment);
  };

  const sortedAppointments = [...appointments].sort(
    (a, b) => getRequestTimestamp(b) - getRequestTimestamp(a)
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedAppointments.length / APPOINTMENTS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * APPOINTMENTS_PER_PAGE;
  const paginatedAppointments = sortedAppointments.slice(
    startIndex,
    startIndex + APPOINTMENTS_PER_PAGE
  );

  return (
    <DoctorPageShell>
        <DoctorPageHeader
          title="Manage Appointments"
          subtitle="View and manage all consultations booked by your patients."
          actions={
            <button type="button" onClick={loadAppointments} className={doctorBtnPrimary}>
              Refresh
            </button>
          }
        />

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 dark:bg-red-900/40 dark:text-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-6 text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 rounded-2xl shadow">
            Loading upcoming appointments…
          </div>
        ) : sortedAppointments.length === 0 ? (
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow text-gray-600 dark:text-gray-300">
            No upcoming appointments found. Once patients book from the{" "}
            <span className="font-semibold">Find Doctors</span> page, they will
            appear here.
          </div>
        ) : (
          <>
            <div className={`overflow-hidden ${doctorCardStatic}`}>
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className={doctorTableHead}>
                <tr>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Date &amp; Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAppointments.map((app) => {
                  const patientName =
                    app.patientId?.name || app.patientUsername || "Unknown Patient";
                  const patientEmail = app.patientId?.email || "";

                  return (
                    <tr key={app._id} className={doctorTableRow}>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {patientName}
                          </span>
                          {patientEmail && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {patientEmail}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-800 dark:text-gray-200">
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
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isPaidForAppointment(app)
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {isPaidForAppointment(app) ? "Paid" : "Pending"}
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
                          {app.status === "confirmed" && isPaidForAppointment(app) && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(app._id, "completed")
                              }
                              className="px-3 py-1 text-xs rounded-full bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Complete
                            </button>
                          )}
                          {app.status === "confirmed" && !isPaidForAppointment(app) && (
                            <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              Waiting for payment
                            </span>
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
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#E8E0F5] bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-[#6B6280] dark:text-slate-400">
              {`Showing ${sortedAppointments.length === 0 ? 0 : startIndex + 1}-${Math.min(
                startIndex + APPOINTMENTS_PER_PAGE,
                sortedAppointments.length
              )} of ${sortedAppointments.length} appointments`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
          </>
        )}
    </DoctorPageShell>
  );
}
