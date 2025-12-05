export default function Help() {
  return (
    <div
      className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('/Images/Help.png')", // ✅ image from public folder
      }}
    >
      {/* Centered content */}
      <div className="relative z-10 text-center text-white px-10 py-8 rounded-2xl backdrop-blur-md bg-white/0 shadow-2xl max-w-2xl">
        <h2 className="text-5xl font-extrabold mb-6 drop-shadow-lg">
          Help / FAQ
        </h2>

        <ul className="space-y-4 text-lg font-light leading-relaxed drop-shadow-md list-none">
          <li>
            <span className="font-semibold text-green-300">How to book?</span>{" "}
            Go to the <span className="underline">Booking</span> section in your
            portal.
          </li>
          <li>
            <span className="font-semibold text-green-300">How to chat?</span>{" "}
            Open the <span className="underline">Chat</span> page and enter the
            other user's ID.
          </li>
        </ul>
      </div>
    </div>
  );
}
