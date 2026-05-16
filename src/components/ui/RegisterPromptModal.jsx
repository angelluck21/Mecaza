import React from 'react';
import { FaCar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const BENEFITS = [
  'Ver detalles completos del viaje',
  'Información del conductor y vehículo',
  'Precios y rutas disponibles',
  'Reservar asientos específicos',
  'Historial de tus viajes',
];

const RegisterPromptModal = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(15, 10, 40, 0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl shadow-violet-900/30 overflow-hidden animate-scale-in">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-violet-700 px-8 py-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative">
            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3 rotate-3 hover:rotate-0 transition-transform duration-300">
              <FaCar className="text-white text-3xl" />
            </div>
            <h3 className="text-xl font-extrabold">¡Regístrate para continuar!</h3>
            <p className="text-blue-200 text-sm mt-1">Accede a todos los detalles del viaje</p>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="px-8 py-6">
          <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100 rounded-xl p-4 mb-5">
            <p className="text-xs font-semibold text-violet-700 uppercase tracking-wider mb-2">¿Qué obtienes?</p>
            <ul className="space-y-1.5">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => { onClose(); navigate('/registrar'); }}
              className="w-full bg-gradient-to-r from-blue-700 to-violet-600 text-white py-3 px-4 rounded-xl font-bold hover:from-blue-800 hover:to-violet-700 transition-all duration-200 shadow-md hover:shadow-violet-300/50 hover:shadow-lg hover:scale-[1.02] active:scale-95"
            >
              🚀 Crear Cuenta Gratis
            </button>
            <button
              onClick={() => { onClose(); navigate('/login'); }}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 active:scale-95"
            >
              🔑 Ya tengo cuenta
            </button>
            <button
              onClick={onClose}
              className="w-full text-gray-400 py-2 text-sm hover:text-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPromptModal;
