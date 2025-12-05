export default function Contact() {
  return (
    <div
      className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('/Images/Contact.png')", // ✅ image from public folder
      }}
    >
      {/* Main centered content */}
      <div className="relative z-10 text-center text-white px-8 py-6 rounded-2xl backdrop-blur-md bg-white/0 shadow-2xl max-w-xl">
        <h2 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
          Contact Us
        </h2>
        <p className="text-xl font-light mb-3 drop-shadow-md">
          We’d love to hear from you!
        </p>
        <p className="text-lg drop-shadow-sm">
          Email us at{" "}
          <span className="font-semibold text-green-300">
            support@dermaease.local
          </span>
        </p>
      </div>
    </div>
  );
}
