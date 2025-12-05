export default function Page({ title, subtitle, actions, children }) {
  return (
    <div className="mx-auto max-w-5xl">
      {(title || subtitle || actions) && (
        <div className="mb-6 flex items-end justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}


