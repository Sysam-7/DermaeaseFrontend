import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DoctorSidebar from "../../components/doctor/DoctorSidebar";

const THEME_KEY = "doctor_theme";

export default function DoctorSettings() {
  const [theme, setTheme] = useState("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailSummaries, setEmailSummaries] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
      // default to light
      document.documentElement.classList.remove("dark");
    }

    const storedNotifications = localStorage.getItem("doctor_notifications");
    const storedSummaries = localStorage.getItem("doctor_email_summaries");
    if (storedNotifications !== null) {
      setNotificationsEnabled(storedNotifications === "true");
    }
    if (storedSummaries !== null) {
      setEmailSummaries(storedSummaries === "true");
    }
  }, []);

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const handleNotificationsChange = (value) => {
    setNotificationsEnabled(value);
    localStorage.setItem("doctor_notifications", String(value));
  };

  const handleEmailSummariesChange = (value) => {
    setEmailSummaries(value);
    localStorage.setItem("doctor_email_summaries", String(value));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-yellow-100 dark:from-slate-900 dark:to-slate-950 flex">
      <DoctorSidebar />

      <main className="flex-1 p-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-10">
          Personalize your DermaEase experience and basic account preferences.
        </p>

        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Appearance
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Switch between light and dark themes. This setting is saved on this
            device.
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleThemeChange("light")}
              className={`px-4 py-2 rounded-xl border text-sm font-medium ${
                theme === "light"
                  ? "bg-yellow-400 border-yellow-500 text-gray-900"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Light mode
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
              className={`px-4 py-2 rounded-xl border text-sm font-medium ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-900 text-white"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Dark mode
            </button>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Notifications
          </h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                In-app notifications
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Show alerts for new appointment requests and messages.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationsChange(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Daily email summary
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Receive a simple summary of tomorrow&apos;s schedule.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleEmailSummariesChange(!emailSummaries)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailSummaries ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  emailSummaries ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Account
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Basic account information is managed from your profile page. You can
            still quickly sign out from here.
          </p>
          <a
            href="/doctor/profile"
            className="inline-flex items-center px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3"
          >
            Edit profile
          </a>
          <a
            href="/logout"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700"
          >
            Logout
          </a>
        </section>
      </main>
    </div>
  );
}

