import React from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle, FaCar } from 'react-icons/fa';

const TOAST_STYLES = {
  success: { border: 'border-green-500', bg: 'bg-green-100',  icon: <FaCheck className="h-6 w-6 text-green-600" />,    title: 'Operación Exitosa'   },
  error:   { border: 'border-red-500',   bg: 'bg-red-100',    icon: <FaTimes className="h-6 w-6 text-red-600" />,      title: 'Error en la Operación' },
  warning: { border: 'border-yellow-500',bg: 'bg-yellow-100', icon: <FaExclamationTriangle className="h-6 w-6 text-yellow-600" />, title: 'Advertencia' },
  info:    { border: 'border-blue-500',  bg: 'bg-blue-100',   icon: <FaInfoCircle className="h-6 w-6 text-blue-600" />, title: 'Información'  },
};

const ToastNotification = ({ message, type = 'success', onClose, isVisible }) => {
  if (!isVisible) return null;

  const styles = TOAST_STYLES[type] ?? TOAST_STYLES.success;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`bg-white rounded-xl shadow-2xl border-l-4 ${styles.border} p-6 max-w-md transition-all duration-300 hover:scale-105`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${styles.bg} p-2 rounded-full`}>
            {styles.icon}
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{styles.title}</h4>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="sr-only">Cerrar</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <FaCar className="mr-1" />
              <span>Sistema Mecaza</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
