import React, { useState } from "react";
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { FaCar } from 'react-icons/fa';
import axios from 'axios';

function Registrar() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      // Configurar axios para Laravel API
      const response = await axios.post('http://127.0.0.1:8000/api/Registro', {
        name: e.target.Nombre.value,
        email: e.target.Correo.value,
        password: e.target.Contraseña.value,
        password_confirmation: e.target.Contraseña.value, // Laravel requiere confirmación
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log('Usuario registrado:', response.data);
      setMessage('¡Usuario registrado exitosamente!');
      setMessageType('success');
      
      // Limpiar formulario
      e.target.reset();
      
      // Opcional: Redirigir después de un breve delay
      setTimeout(() => {
        // Aquí puedes agregar navegación a otra página
        // window.location.href = '/login';
      }, 2000);
      
    } catch (error) {
      console.error('Error al registrar:', error);
      
      if (error.response) {
        // Error del servidor Laravel
        const errorData = error.response.data;
        
        if (errorData.errors) {
          // Errores de validación de Laravel
          const errorMessages = Object.values(errorData.errors).flat();
          setMessage(errorMessages.join(', '));
        } else if (errorData.message) {
          // Mensaje de error general
          setMessage(errorData.message);
        } else {
          setMessage('Error al registrar usuario');
        }
      } else if (error.request) {
        // Error de conexión
        setMessage('Error de conexión. Verifica que el servidor Laravel esté ejecutándose.');
      } else {
        // Otro error
        setMessage('Error inesperado');
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolver = () => {
    // Navegar de vuelta a la página anterior o home
    window.history.back();
  };

  return (
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 px-4">
  <div className="w-full max-w-md bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-10 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
    <div className="flex justify-center mb-6">
      <FaCar className="text-blue-900 text-7xl drop-shadow-lg" />
    </div>

    <h1 className="text-3xl font-extrabold text-center text-blue-900 mb-2">Crear cuenta</h1>
    <p className="text-sm text-center text-gray-600 mb-8">
      ¡Empieza a viajar con <span className="font-semibold text-blue-800">Mecaza</span>!
    </p>

    {/* Mensaje de estado */}
    {message && (
      <div className={`mb-4 p-3 rounded-md text-sm ${
        messageType === 'success' 
          ? 'bg-green-100 text-green-700 border border-green-300' 
          : 'bg-red-100 text-red-700 border border-red-300'
      }`}>
        {message}
      </div>
    )}

    <form onSubmit={handleRegister} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">Nombre completo</label>
        <input
          name="Nombre"
          type="text"
          placeholder="Tu nombre"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">Correo electrónico</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-blue-900">
            <EnvelopeIcon className="h-5 w-5" />
          </span>
          <input
            name="Correo"
            type="email"
            placeholder="correo electrónico"
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-900 mb-1">Contraseña</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-blue-900">
            <LockClosedIcon className="h-5 w-5" />
          </span>
          <input
            name="Contraseña"
            type="password"
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 bg-teal-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Registrando...' : 'Registrarse'}
      </button>
      
      <button
        type="button"
        onClick={handleVolver}
        className="w-full py-2 bg-gray-600 text-white font-semibold rounded-md shadow-md hover:bg-gray-700 transition-colors"
      >
        Volver
      </button>
    </form>
  </div>
</div>

  );
}

export default Registrar;