import PatientPageShell from '../../components/patient/PatientPageShell';
import PatientPageHeader from '../../components/patient/PatientPageHeader';
import { patientCardStatic, patientBtnPrimary, patientBtnSecondary, patientInput } from '../../components/patient/patientTheme';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/** Same key as doctor settings so light/dark applies across the whole app. */
const THEME_KEY = 'doctor_theme';

export default function PatientSettings() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return (
    <PatientPageShell mainClassName="max-w-2xl mx-auto w-full">
      <PatientPageHeader title="Settings" subtitle="Appearance and preferences for your patient account." />

        <section className="mt-10 rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:ring-slate-700">
          <h2 className="text-lg font-semibold text-[#2D2640] dark:text-gray-100">Appearance</h2>
          <p className="mt-2 text-sm text-[#6B6280] dark:text-gray-300">
            Switch between light and dark theme. This is saved on this device and matches the same setting
            doctors use, so the whole site stays consistent.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`rounded-2xl border px-5 py-2.5 text-sm font-semibold transition ${
                theme === 'light'
                  ? 'border-[#5B3FA8] bg-[#F3EEF9] text-[#5B3FA8]'
                  : 'border-[#E8E0F5] bg-white text-[#4B4558] hover:bg-[#FAF8FC] dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              Light mode
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`rounded-2xl border px-5 py-2.5 text-sm font-semibold transition ${
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800 text-white'
                  : 'border-[#E8E0F5] bg-white text-[#4B4558] hover:bg-[#FAF8FC] dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              Dark mode
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:ring-slate-700">
          <h2 className="text-lg font-semibold text-[#2D2640] dark:text-gray-100">Account</h2>
          <p className="mt-2 text-sm text-[#6B6280] dark:text-gray-300">
            Update your profile or sign out from the links below.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/patient/profile"
              className="inline-flex items-center rounded-2xl border border-[#E8E0F5] px-5 py-2.5 text-sm font-semibold text-[#2D2640] transition hover:bg-[#F3EEF9] dark:border-slate-600 dark:text-gray-100 dark:hover:bg-slate-800"
            >
              Edit profile
            </Link>
            <a
              href="/logout"
              className="inline-flex items-center rounded-2xl bg-[#C45C6A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b54e5c]"
            >
              Logout
            </a>
          </div>
        </section>
    </PatientPageShell>
  );
}
