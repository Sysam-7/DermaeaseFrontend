import { Link } from "react-router-dom";
import About from "./About";
import Contact from "./Contact";
import Help from "./Help";
import SettingsPage from "./Settings";

export default function Home() {
  return (
    <>
      {/* New modern hero section (top of page) */}
      <section className="w-full bg-[#f5f3ff] border-b border-violet-100">
        {/* Announcement bar */}
        <div className="w-full bg-[#4c3cff] text-center text-xs md:text-sm text-white py-2">
          <span className="opacity-90">
            Welcome to the new Derma Ease experience.
          </span>
          <Link
            to="/about"
            className="ml-1 underline underline-offset-2 opacity-90 hover:opacity-100"
          >
            Learn more about our updates →
          </Link>
        </div>

        {/* Main hero content */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left space-y-4">
            <span className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              Dermatology simplified
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              Your skin health,
              <br />
              <span className="text-violet-700">reimagined today.</span>
            </h1>

            <p className="text-sm md:text-base text-slate-600 max-w-xl mx-auto md:mx-0">
              Connect with top dermatologists, manage your skincare routine, and access
              personalized treatments — all from the comfort of your home.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-800 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full border border-violet-200 bg-white px-6 py-2.5 text-sm font-semibold text-violet-700 hover:border-violet-400 hover:bg-violet-50 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Simple illustration block */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-xl border border-violet-100 p-6 space-y-4">
              <div className="h-10 w-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xl font-bold">
                DE
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Start your first consultation</h2>
                <p className="text-sm text-slate-600">
                  Answer a few questions and get matched with a dermatologist in minutes.
                </p>
              </div>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>Video and chat consultations</li>
                <li>Digital prescriptions &amp; treatment plans</li>
                <li>Secure medical record storage</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Existing hero Section with Background (moved below new section) */}
      <div
        className="relative w-full h-screen bg-cover bg-center flex flex-col items-center justify-start text-center pt-16"
        style={{
          backgroundImage: "url('/Images/Home.png')",
        }}
      >
        {/* Text + Logo Container */}
        <div className="relative z-10 text-white px-6 py-6 rounded-2xl backdrop-blur-md bg-white/0 shadow-2xl -translate-y-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-5xl font-extrabold drop-shadow-lg">
              DermaEase
            </h1>
            <img
              src="/Images/logo.png"
              alt="DermaEase Logo"
              className="w-12 h-12 drop-shadow-lg"
            />
          </div>
          <p className="text-xl font-light drop-shadow-md">
            Simple dermatology care platform.
          </p>
        </div>
      </div>

      {/* Other Sections Below */}
      <div className="space-y-12">
        <About />
        <Contact />
        <Help />
      </div>
    </>
  );
}
