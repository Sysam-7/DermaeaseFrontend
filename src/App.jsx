import React, { useEffect, useState, useCallback, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/common/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import BookingConfirmation from "./pages/patient/BookingConfirmation.jsx";
import OAuthSuccess from "./pages/auth/OAuthSuccess.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import ManageAppointments from "./pages/doctor/ManageAppointments.jsx";
import ProfileEdit from "./pages/doctor/ProfileEdit.jsx";
import NotFound from "./pages/common/NotFound.jsx";
import FindingDoctors from "./pages/FindingDoctors.jsx";
import DoctorProfile from "./pages/doctors/DoctorProfile.jsx";
import AdminSetup from "./pages/admin/AdminSetup.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import { checkAdminExists } from "./api/admin.js";

function Protected({ children, roles }) {
  const adminToken = localStorage.getItem("admin_token");
  const adminOnly = Array.isArray(roles) && roles.length === 1 && roles[0] === "admin";

  if (adminOnly) {
    if (!adminToken) return <Navigate to="/admin/login" replace />;
    return children;
  }

  if (Array.isArray(roles) && roles.includes("admin") && adminToken) {
    return children;
  }

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (roles && roles.length && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const shortcutInFlight = useRef(false);

  useEffect(() => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    if (name || role) setUser({ name, role });
  }, []);

  const handleAdminShortcut = useCallback(async () => {
    try {
      const res = await checkAdminExists();
      if (res?.adminExists === false) {
        navigate("/admin/setup");
      } else if (res?.adminExists === true) {
        navigate("/admin/login");
      }
    } catch (err) {
      console.error("admin check failed", err);
    }
  }, [navigate]);

  useEffect(() => {
    const pressed = new Set();

    function maybeTriggerShortcut() {
      if (shortcutInFlight.current) return;
      shortcutInFlight.current = true;
      handleAdminShortcut().finally(() => {
        shortcutInFlight.current = false;
      });
    }

    function handleKeyDown(event) {
      const lower = event.key?.toLowerCase();
      if (lower === "a") pressed.add("a");
      if (event.key === "8" || event.code === "Digit8" || event.code === "Numpad8") {
        pressed.add("8");
      }
      if (pressed.has("a") && pressed.has("8")) {
        pressed.clear();
        maybeTriggerShortcut();
      }
    }

    function handleKeyUp(event) {
      const lower = event.key?.toLowerCase();
      if (lower === "a") pressed.delete("a");
      if (event.key === "8" || event.code === "Digit8" || event.code === "Numpad8") {
        pressed.delete("8");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleAdminShortcut]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    window.location.href = "/login";
  }

  return (
    <>
      <Navbar onLogout={handleLogout} isAuthenticated={!!user} />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/success" element={<OAuthSuccess />} />
          <Route path="/patient/booking-confirmation" element={<BookingConfirmation />} />

          <Route
  path="/doctor/dashboard"
  element={
    <Protected roles={['doctor']}>
      <DoctorDashboard />
    </Protected>
  }
/>

          <Route
            path="/patient/*"
            element={
              <Protected roles={["patient", "admin"]}>
                <PatientDashboard />
              </Protected>
            }
          />
          <Route
            path="/patient/find-doctors"
            element={
              <Protected roles={["patient", "admin"]}>
                <FindingDoctors />
              </Protected>
            }
          />
          <Route path="/find-doctors" element={<FindingDoctors />} />

          <Route
            path="/doctor"
            element={
              <Protected roles={["doctor", "admin"]}>
                <DoctorDashboard />
              </Protected>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <Protected roles={["doctor", "admin"]}>
                <ManageAppointments />
              </Protected>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <Protected roles={["doctor", "admin"]}>
                <ProfileEdit />
              </Protected>
            }
          />
          <Route path="/doctors/:id" element={<DoctorProfile />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <Protected roles={["admin"]}>
                <AdminDashboard />
              </Protected>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

