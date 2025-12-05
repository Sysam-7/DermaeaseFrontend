export default function Input({ label, hint, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>}
      <input className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 ${className}`} {...props} />
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}


