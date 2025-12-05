export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-yellow-400 px-4 py-2 text-black hover:bg-yellow-300 active:bg-yellow-500 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}


