import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const [debug, setDebug] = useState({ step: "init", info: {} });

  useEffect(() => {
    const run = async () => {
      try {
        setDebug({ step: "reading params" });

        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");
        const urlRole = params.get("role");

        // 1) If token present in URL -> use it, set role, redirect
        if (urlToken) {
          const role = urlRole || "patient";
          localStorage.setItem("token", urlToken);
          localStorage.setItem("role", role);
          setDebug({ step: "redirect (url token)", info: { role } });
          return navigate(role === "doctor" ? "/doctor" : "/patient", { replace: true });
        }

        // 2) No token in URL -> try verifying cookie session with backend
        setDebug({ step: "verifying cookie token" });
        const res = await fetch(`${API.replace(/\/$/, "")}/auth/verify-token`, {
          credentials: "include",
        });

        if (res.ok) {
          // backend confirmed cookie -> get user data if available
          const body = await res.json().catch(() => null);
          const user = body?.data?.user;
          const role = urlRole || user?.role || "patient";

          if (user?.name) localStorage.setItem("name", user.name);
          localStorage.setItem("role", role);

          setDebug({ step: "redirect (valid cookie)", info: { role } });
          return navigate(role === "doctor" ? "/doctor" : "/patient", { replace: true });
        }

        // 3) Verification returned non-OK (e.g. no valid cookie). STILL redirect to patient/doctor.
        // Use urlRole if provided, otherwise default to patient.
        const fallbackRole = urlRole || "patient";
        localStorage.setItem("role", fallbackRole);
        setDebug({
          step: "redirect (verification failed, fallback)",
          info: { verificationOk: false, role: fallbackRole },
        });
        return navigate(fallbackRole === "doctor" ? "/doctor" : "/patient", { replace: true });

      } catch (err) {
        // Only on unexpected exceptions do we send to /login
        console.error("OAuth callback error:", err);
        setDebug({ step: "error", info: { error: String(err) } });
        return navigate("/login", { replace: true });
      }
    };

    run();
  }, [navigate]);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h2>OAuth Callback • Debug</h2>
      <pre>{JSON.stringify(debug, null, 2)}</pre>
      <p>This page will auto-redirect. If you see "error" in debug, check the console.</p>
    </div>
  );
}
