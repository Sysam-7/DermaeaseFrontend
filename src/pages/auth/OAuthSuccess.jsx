import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../../services/auth.js";

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
          // Verify token and get user info before redirecting
          try {
            const verifyResult = await verifyToken(urlToken);
            if (verifyResult?.data?.user) {
              const user = verifyResult.data.user;
              if (user.name) localStorage.setItem("name", user.name);
              const finalRole = user.role || role;
              localStorage.setItem("role", finalRole);
              return navigate(finalRole === "doctor" ? "/doctor/dashboard" : "/patient", { replace: true });
            }
          } catch (err) {
            console.error("Token verification failed:", err);
          }
          return navigate(role === "doctor" ? "/doctor/dashboard" : "/patient", { replace: true });
        }

        // 2) No token in URL -> try verifying cookie session with backend
        setDebug({ step: "verifying cookie token" });
        const body = await verifyToken(localStorage.getItem('token') || '');

        if (body?.data?.user) {
          const user = body?.data?.user;
          const role = urlRole || user?.role || "patient";

          if (user?.name) localStorage.setItem("name", user.name);
          localStorage.setItem("role", role);

          setDebug({ step: "redirect (valid cookie)", info: { role } });
          return navigate(role === "doctor" ? "/doctor/dashboard" : "/patient", { replace: true });
        }

        // 3) Verification returned non-OK (e.g. no valid cookie). STILL redirect to patient/doctor.
        // Use urlRole if provided, otherwise default to patient.
        const fallbackRole = urlRole || "patient";
        localStorage.setItem("role", fallbackRole);
        setDebug({
          step: "redirect (verification failed, fallback)",
          info: { verificationOk: false, role: fallbackRole },
        });
        return navigate(fallbackRole === "doctor" ? "/doctor/dashboard" : "/patient", { replace: true });

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
