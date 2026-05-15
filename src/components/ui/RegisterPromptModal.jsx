import React from 'react';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const RegisterPromptModal = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaUser className="text-blue-600 text-2xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">¡Regístrate para ver los detalles del viaje!</h3>
        <p className="text-gray-600 mb-6">
          Para ver toda la información del viaje, detalles del conductor, precios y reservar tu asiento, necesitas crear una cuenta en Mecaza. Es rápido y gratuito.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-800">
            <strong>¿Qué obtienes al registrarte?</strong><br />
            • Ver detalles completos del viaje<br />
            • Información del conductor y vehículo<br />
            • Precios y rutas disponibles<br />
            • Reservar asientos específicos<br />
            • Historial de tus viajes
          </p>
        </div>
        <div className="space-y-3">
          <button onClick={() => { onClose(); navigate('/registrar'); }} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            🚀 Crear Cuenta y Ver Detalles
          </button>
          <button onClick={() => { onClose(); navigate('/login'); }} className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors">
            🔑 Ya tengo cuenta
          </button>
          <button onClick={onClose} className="w-full text-gray-500 py-2 px-4 hover:text-gray-700 transition-colors">
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPromptModal;
