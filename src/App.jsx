import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/common/Home.jsx";
import About from "./pages/common/About.jsx";
import Contact from "./pages/common/Contact.jsx";
import Help from "./pages/common/Help.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import DoctorApplication from "./pages/auth/DoctorApplication.jsx";
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
import DoctorApplications from "./pages/admin/DoctorApplications.jsx";
import Booking from "./pages/patient/Booking.jsx";
import PatientChat from "./pages/patient/PatientChat.jsx";
import DoctorChats from "./pages/doctor/DoctorChats.jsx";
import MyAppointments from "./pages/patient/MyAppointments.jsx";
import AppointmentPayment from "./pages/patient/AppointmentPayment.jsx";
import KhaltiReturn from "./pages/patient/KhaltiReturn.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import VerifyOTP from "./pages/auth/VerifyOTP.jsx";
import VerifyEmailSent from "./pages/auth/VerifyEmailSent.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import PrescriptionGenerator from "./pages/doctor/PrescriptionGenerator.jsx";
import Prescriptions from "./pages/Prescriptions.jsx";
import Reviews from "./pages/Reviews.jsx";
import ViewPrescription from "./pages/patient/ViewPrescription.jsx";
import DoctorFeedback from "./pages/doctor/DoctorFeedback.jsx";
import DoctorSettings from "./pages/doctor/DoctorSettings.jsx";
import PatientSettings from "./pages/patient/PatientSettings.jsx";

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
  const navigate = useNavigate();
  const location = useLocation();

  // Apply saved light/dark theme on load so every route respects `doctor_theme` without opening Settings first.
  useEffect(() => {
    const stored = localStorage.getItem("doctor_theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      // Ignore if typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const isEightKey = event.key === "8" || event.code === "Digit8" || event.code === "Numpad8";
      if (event.ctrlKey && isEightKey) {
        event.preventDefault();
        event.stopPropagation();
        navigate("/admin/login");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    window.location.href = "/"; // redirect to home after logout
  }

  // Determine if header should be hidden on certain routes
  const hideHeader =
    location.pathname === "/login"
    || location.pathname === "/register"
    || location.pathname === "/register/doctor";
  const isAuthenticated = Boolean(localStorage.getItem("token"));
  const path = location.pathname;
  const isLandingPageRoute = path === "/";
  /** Full portal layouts use their own nav/sidebars — global Back + extra shell padding caused a large gap under the navbar */
  const isDoctorPortal = path.startsWith("/doctor");
  const isPatientPortal = path.startsWith("/patient");
  const isAdminAppShell =
    path.startsWith("/admin/dashboard") || path.startsWith("/admin/doctor-applications");
  const showGlobalBackButton =
    !isLandingPageRoute &&
    !isDoctorPortal &&
    !isPatientPortal &&
    !isAdminAppShell;

  const handleGlobalBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <>
      {!hideHeader && (
        <Navbar onLogout={handleLogout} isAuthenticated={isAuthenticated} />
      )}
      <div
        className={
          hideHeader
            ? "p-4"
            : "pt-16 px-4 pb-5 sm:px-5 sm:pb-6"
        }
      >
        {showGlobalBackButton && (
          <div className="mb-2">
            <button
              type="button"
              onClick={handleGlobalBack}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-md transition hover:border-indigo-400 hover:text-indigo-600 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              ← Back
            </button>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<Help />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/doctor" element={<DoctorApplication />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
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
            path="/patient/appointment-payment/:appointmentId"
            element={
              <Protected roles={["patient", "admin"]}>
                <AppointmentPayment />
              </Protected>
            }
          />
          <Route
            path="/patient/payment/khalti/return"
            element={
              <Protected roles={["patient", "admin"]}>
                <KhaltiReturn />
              </Protected>
            }
          />
          <Route
            path="/prescriptions"
            element={
              <Protected roles={["patient", "admin"]}>
                <Prescriptions />
              </Protected>
            }
          />
          <Route
            path="/reviews"
            element={
              <Protected roles={["patient", "admin"]}>
                <Reviews />
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
            path="/patient/settings"
            element={
              <Protected roles={["patient", "admin"]}>
                <PatientSettings />
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
          <Route
            path="/patient/prescription/:prescriptionId"
            element={
              <Protected roles={["patient", "admin"]}>
                <ViewPrescription />
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
          <Route
            path="/doctor/prescription-generator"
            element={
              <Protected roles={["doctor", "admin"]}>
                <PrescriptionGenerator />
              </Protected>
            }
          />
          <Route
            path="/doctor/feedback"
            element={
              <Protected roles={["doctor", "admin"]}>
                <DoctorFeedback />
              </Protected>
            }
          />
          <Route
            path="/doctor/settings"
            element={
              <Protected roles={["doctor", "admin"]}>
                <DoctorSettings />
              </Protected>
            }
          />
          <Route path="/doctors/:id" element={<DoctorProfile />} />
          <Route path="/admin/setup" element={<Navigate to="/admin/register" replace />} />
          <Route path="/admin/register" element={<AdminSetup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <Protected roles={["admin"]}>
                <AdminDashboard />
              </Protected>
            }
          />
          <Route
            path="/admin/doctor-applications"
            element={
              <Protected roles={["admin"]}>
                <DoctorApplications />
              </Protected>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}
