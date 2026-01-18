import React, { useEffect, useState, useCallback, useRef } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/common/Home.jsx";
import About from "./pages/common/About.jsx";
import Contact from "./pages/common/Contact.jsx";
import Help from "./pages/common/Help.jsx";
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
import { checkAdminExists } from "./services/admin.js";
import Booking from "./pages/patient/Booking.jsx";
import PatientChat from "./pages/patient/PatientChat.jsx";
import DoctorChats from "./pages/doctor/DoctorChats.jsx";
import MyAppointments from "./pages/patient/MyAppointments.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

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
  
  // Allow access if token exists, even if role doesn't match exactly (for OAuth flow)
  if (!token) {
    // Check if we're in the middle of OAuth flow
    const currentPath = window.location.pathname;
    if (currentPath.includes('/auth/success')) {
      // Don't redirect if we're on OAuth success page
      return children;
    }
    return <Navigate to="/login" replace />;
  }
  
  if (roles && roles.length && !roles.includes(role)) {
    // If role doesn't match, redirect to appropriate dashboard based on actual role
    if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (role === 'patient') return <Navigate to="/patient" replace />;
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const shortcutInFlight = useRef(false);

  useEffect(() => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    if (name || role) setUser({ name, role });
  }, []);

  const handleAdminShortcut = useCallback(async () => {
    try {
      console.log("🔑 Admin shortcut triggered (A+8)");
      const res = await checkAdminExists();
      console.log("Admin check response:", res);
      if (res?.adminExists === false) {
        console.log("No admin exists, navigating to setup");
        navigate("/admin/setup");
      } else if (res?.adminExists === true) {
        console.log("Admin exists, navigating to login");
        navigate("/admin/login");
      } else {
        console.warn("Unexpected admin check response:", res);
      }
    } catch (err) {
      console.error("❌ Admin check failed:", err);
      // Still navigate to login on error
      navigate("/admin/login");
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
      // Ignore if typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Check for 'a' or 'A' key
      const key = event.key?.toLowerCase();
      if (key === "a") {
        pressed.add("a");
      }
      
      // Check for '8' key (both regular and numpad)
      if (event.key === "8" || event.code === "Digit8" || event.code === "Numpad8") {
        pressed.add("8");
      }
      
      // Trigger when both keys are pressed
      if (pressed.has("a") && pressed.has("8")) {
        event.preventDefault(); // Prevent default behavior
        event.stopPropagation(); // Stop event bubbling
        pressed.clear();
        console.log("🔑 A+8 shortcut detected");
        maybeTriggerShortcut();
      }
    }

    function handleKeyUp(event) {
      const key = event.key?.toLowerCase();
      if (key === "a") {
        pressed.delete("a");
      }
      if (event.key === "8" || event.code === "Digit8" || event.code === "Numpad8") {
        pressed.delete("8");
      }
    }

    // Add event listeners
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
    window.location.href = "/"; // redirect to home after logout
  }

  // Determine if header should be hidden on certain routes
  const hideHeader = location.pathname === "/login" || location.pathname === "/register";
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  return (
    <>
      {!hideHeader && (
        <Navbar onLogout={handleLogout} isAuthenticated={isAuthenticated} />
      )}
      <div className={hideHeader ? "p-4" : "pt-20 p-4"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<Help />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/forgot" element={<ResetPassword />} />
          <Route path="/auth/success" element={<OAuthSuccess />} />
          <Route path="/patient/booking-confirmation" element={<BookingConfirmation />} />
          <Route
            path="/patient/booking"
            element={
              <Protected roles={["patient", "admin"]}>
                <Booking />
              </Protected>
            }
          />
          <Route
            path="/patient/chat"
            element={
              <Protected roles={["patient", "admin"]}>
                <PatientChat />
              </Protected>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <Protected roles={["patient", "admin"]}>
                <MyAppointments />
              </Protected>
            }
          />

          <Route
            path="/doctor/dashboard"
            element={
              <Protected roles={['doctor']}>
                <DoctorDashboard />
              </Protected>
            }
          />

<Route
  path="/doctor/manage-appointments"
  element={
    <Protected roles={['doctor']}>
      <ManageAppointments />
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
          <Route
            path="/doctor/chats"
            element={
              <Protected roles={["doctor", "admin"]}>
                <DoctorChats />
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
