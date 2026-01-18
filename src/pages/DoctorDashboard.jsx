import React from "react";
import { Link } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

export default function DoctorDashboard() {
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
              Good Morning, Dr. Smith
            </h1>
            <p className="text-gray-600 text-lg">
              You have 2 new appointment requests and 3 unread messages.
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
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition cursor-pointer flex flex-col items-center">
            <img
              src="/Images/DoctorDashboard/Chat.png"
              className="w-full h-44 object-contain mb-4"
              alt="Chats"
            />
            <h3 className="font-semibold text-gray-900 text-lg mb-1">Chats</h3>
            <p className="text-gray-500 text-sm text-center">
              Chat with patients
            </p>
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition cursor-pointer flex flex-col items-center">
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
          </div>

          {/* Ratings */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition cursor-pointer flex flex-col items-center">
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
          </div>
        </div>

        {/* Upcoming Appointments */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Upcoming Appointments
        </h2>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
              <tr className="border-t hover:bg-gray-50 transition">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src="/Images/Patients/Patient1.jpg"
                    className="w-10 h-10 rounded-full object-cover"
                    alt="Patient"
                  />
                  John Doe
                </td>
                <td className="p-4">Oct 28, 2024</td>
                <td className="p-4">10:30 AM</td>
                <td className="p-4">
                  <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                    Confirmed
                  </span>
                </td>
                <td className="p-4 text-green-700 font-semibold cursor-pointer hover:underline">
                  View Details
                </td>
              </tr>

              <tr className="border-t hover:bg-gray-50 transition">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src="/Images/Patients/Patient2.jpg"
                    className="w-10 h-10 rounded-full object-cover"
                    alt="Patient"
                  />
                  Jane Smith
                </td>
                <td className="p-4">Oct 28, 2024</td>
                <td className="p-4">02:00 PM</td>
                <td className="p-4">
                  <span className="text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium">
                    Pending
                  </span>
                </td>
                <td className="p-4 text-green-700 font-semibold cursor-pointer hover:underline">
                  View Details
                </td>
              </tr>

              <tr className="border-t hover:bg-gray-50 transition">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src="/Images/Patients/Patient3.jpg"
                    className="w-10 h-10 rounded-full object-cover"
                    alt="Patient"
                  />
                  Mike Johnson
                </td>
                <td className="p-4">Oct 29, 2024</td>
                <td className="p-4">11:00 AM</td>
                <td className="p-4">
                  <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                    Confirmed
                  </span>
                </td>
                <td className="p-4 text-green-700 font-semibold cursor-pointer hover:underline">
                  View Details
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
