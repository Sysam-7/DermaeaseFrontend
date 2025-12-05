import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type = 'info', ttl = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ttl);
  }, []);
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg shadow-md text-sm max-w-xs ${t.type === 'error' ? 'bg-red-50 text-red-800' : t.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-white text-gray-800'}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}