import About from "./About";
import Contact from "./Contact";
import Help from "./Help";
import SettingsPage from "./Settings";

export default function Home() {
  return (
    <>
      {/* Hero Section with Background */}
      <div
        className="relative w-full h-screen bg-cover bg-center flex flex-col items-center justify-start text-center pt-16" 
        // 👆 reduced padding-top to move it further up
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
