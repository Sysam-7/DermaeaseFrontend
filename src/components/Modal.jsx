import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, type = 'info', title, message, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const typeStyles = {
    success: {
      icon: '✓',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      borderColor: 'border-green-200',
      buttonBg: 'bg-green-600 hover:bg-green-700',
    },
    error: {
      icon: '✕',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      borderColor: 'border-red-200',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: '⚠',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      borderColor: 'border-yellow-200',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: 'ℹ',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      borderColor: 'border-blue-200',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full ${styles.iconBg} mb-4`}>
            <span className={`text-3xl font-bold ${styles.iconColor}`}>{styles.icon}</span>
          </div>

          {/* Title */}
          {title && (
            <h3 className={`text-xl font-bold text-center ${styles.titleColor} mb-2`}>
              {title}
            </h3>
          )}

          {/* Message */}
          {message && (
            <p className="text-gray-700 text-center mb-6 leading-relaxed">
              {message}
            </p>
          )}

          {/* Children (custom content) */}
          {children}

          {/* Button */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-lg text-white font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${styles.buttonBg}`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

