import React, { useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const TOAST_CONFIG = {
  success: {
    icon:       <FaCheck className="text-white text-sm" />,
    iconBg:     'bg-green-500',
    bar:        'bg-green-500',
    title:      '¡Operación exitosa!',
    textColor:  'text-green-700',
  },
  error: {
    icon:       <FaTimes className="text-white text-sm" />,
    iconBg:     'bg-red-500',
    bar:        'bg-red-500',
    title:      'Ocurrió un error',
    textColor:  'text-red-700',
  },
  warning: {
    icon:       <FaExclamationTriangle className="text-white text-sm" />,
    iconBg:     'bg-yellow-500',
    bar:        'bg-yellow-500',
    title:      'Advertencia',
    textColor:  'text-yellow-700',
  },
  info: {
    icon:       <FaInfoCircle className="text-white text-sm" />,
    iconBg:     'bg-violet-500',
    bar:        'bg-violet-500',
    title:      'Información',
    textColor:  'text-violet-700',
  },
};

const ToastNotification = ({ message, type = 'success', onClose, isVisible }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  if (!isVisible && !visible) return null;

  const cfg = TOAST_CONFIG[type] ?? TOAST_CONFIG.success;

  return (
    <div
      className={`fixed top-5 right-5 z-[99999] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden w-80 max-w-[calc(100vw-2.5rem)]">

        {/* Barra de color superior */}
        <div className={`h-1 w-full ${cfg.bar}`} />

        <div className="px-4 py-3.5 flex items-start gap-3">
          {/* Ícono */}
          <div className={`${cfg.iconBg} w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5`}>
            {cfg.icon}
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold uppercase tracking-wider ${cfg.textColor}`}>{cfg.title}</p>
            <p className="text-sm text-gray-700 mt-0.5 leading-snug">{message}</p>
          </div>

          {/* Cerrar */}
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 transition-colors shrink-0 mt-0.5"
            aria-label="Cerrar"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
