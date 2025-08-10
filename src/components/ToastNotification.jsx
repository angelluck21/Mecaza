import React from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle, FaCar } from 'react-icons/fa';

const ToastNotification = ({ message, type = 'success', onClose, isVisible }) => {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheck className="h-6 w-6 text-green-600" />;
      case 'error':
        return <FaTimes className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <FaExclamationTriangle className="h-6 w-6 text-yellow-600" />;
      case 'info':
        return <FaInfoCircle className="h-6 w-6 text-blue-600" />;
      default:
        return <FaCheck className="h-6 w-6 text-green-600" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      case 'info':
        return 'border-blue-500';
      default:
        return 'border-green-500';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-green-100';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Operación Exitosa';
      case 'error':
        return 'Error en la Operación';
      case 'warning':
        return 'Advertencia';
      case 'info':
        return 'Información';
      default:
        return 'Notificación';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`bg-white rounded-xl shadow-2xl border-l-4 ${getBorderColor()} p-6 max-w-md transform transition-all duration-300 hover:scale-105`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className={`${getBgColor()} p-2 rounded-full`}>
              {getIcon()}
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {getTitle()}
              </h4>
              <button
                onClick={onClose}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {message}
            </p>
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