export default function About() {
  return (
    <div
      className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('/Images/About.png')", // ✅ from public folder
      }}
    >
      {/* Centered content */}
      <div className="relative z-10 text-center text-white px-8 py-6 rounded-2xl backdrop-blur-md bg-white/0 shadow-2xl max-w-2xl">
        <h2 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
          About Us
        </h2>
        <p className="text-xl font-light leading-relaxed drop-shadow-md">
          DermaEase is a modern and user-friendly platform designed to simplify
          dermatology consultations. It’s built as a learning project to
          showcase efficient healthcare solutions through seamless design,
          accessibility, and ease of use.
        </p>
      </div>
    </div>
  );
}
