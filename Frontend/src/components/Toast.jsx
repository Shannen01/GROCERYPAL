import React, { useEffect } from 'react';

const getToastStyles = (type) => {
  switch (type) {
    case 'error':
      return {
        container: 'bg-white shadow-lg rounded-lg',
        icon: (
          <div className="w-8 h-8 bg-[#FC8181] rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-medium">×</span>
          </div>
        ),
        buttonColor: 'text-[#FC8181]'
      };
    case 'success':
      return {
        container: 'bg-white shadow-lg rounded-lg',
        icon: (
          <div className="w-8 h-8 bg-[#68D391] rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-medium">✓</span>
          </div>
        ),
        buttonColor: 'text-[#68D391]'
      };
    default:
      return {
        container: 'bg-white shadow-lg rounded-lg',
        icon: (
          <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
            <span className="text-white">i</span>
          </div>
        ),
        buttonColor: 'text-gray-400'
      };
  }
};

const Toast = ({ message, type = 'info', onClose, subMessage, actionLabel, onAction }) => {
  const styles = getToastStyles(type);

  useEffect(() => {
    if (type !== 'success') {  
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [onClose, type]);

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (onAction) {
      onAction();
    }
    onClose();
  };

  return (
    <div className="fixed top-4 right-4 z-50 px-4">
      <div className="bg-black/5 fixed inset-0" onClick={onClose} />
      <div className={`${styles.container} p-4 max-w-md mx-auto flex items-start space-x-4 shadow-xl border border-gray-100 relative`}>
        <div className="flex gap-3 w-full">
          {styles.icon}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{message}</p>
            {subMessage && (
              <p className="mt-1 text-sm text-gray-500">{subMessage}</p>
            )}
            {actionLabel && (
              <button
                onClick={handleActionClick}
                className={`mt-2 text-sm font-medium ${styles.buttonColor} hover:opacity-80`}
              >
                {actionLabel}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
