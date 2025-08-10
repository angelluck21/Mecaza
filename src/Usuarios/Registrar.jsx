import React, { useState } from "react";
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { FaCar } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CONDUCTOR_AUTH_CONFIG } from '../config/conductorAuth';

function Registrar() {
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [selectedRol, setSelectedRol] = useState('');
  const navigate = useNavigate();

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = {
        Nombre: e.target.Nombre.value,
        Correo: e.target.Correo.value,
        Contrasena: e.target.Contrasena.value,
        Telefono: e.target.Telefono.value,
        Rol: selectedRol, // Cambiado a mayúscula para coincidir con el backend
      };
      
      if (!formData.Nombre || !formData.Correo || !formData.Contrasena || !formData.Telefono) {
        showNotification('Por favor, completa todos los campos requeridos', 'error');
        return;
      }
      
      // Ensure rol is selected
      if (!selectedRol || selectedRol === '') {
        showNotification('Error: Por favor, selecciona un rol', 'error');
        setIsLoading(false);
        return;
      }
      
      const datosParaEnviar = {
        ...formData,
        Rol: selectedRol, // Campo principal con mayúscula
        rol: selectedRol, // Fallback con minúscula
        role: selectedRol, // Fallback en inglés
      };
      
      console.log('selectedRol:', selectedRol); // Debug log
      console.log('Datos a enviar:', datosParaEnviar); // Debug log
      console.log('Token de autenticación:', localStorage.getItem('authToken')); // Debug log
      
      const response = await axios.post('http://127.0.0.1:8000/api/registro', datosParaEnviar, {
        headers: {
          'Authorization':  'Bearer ' + localStorage.getItem('authToken'),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log('Respuesta exitosa del servidor:', response.data); // Debug log
      
      const rolMessages = {
        'usuario': '¡Usuario registrado exitosamente! Serás redirigido al login.',
        'conductor': '¡Conductor registrado exitosamente! Serás redirigido al panel de conductor.',
        'administrador': '¡Administrador registrado exitosamente! Serás redirigido al panel de administrador.'
      };
      
      showNotification(rolMessages[selectedRol], 'success');
      
      // Guardar datos del usuario en localStorage
      const userData = {
        ...response.data,
        rol: selectedRol,
        Correo: formData.Correo,
        Nombre: formData.Nombre
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('Datos guardados en localStorage:', userData); // Debug log
      
      // Resetear formulario
      e.target.reset();
      setSelectedRol('');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        const redirectPaths = {
          'usuario': '/login',
          'conductor': '/conductor',
          'administrador': '/indexAdmin'
        };
        
        const targetPath = redirectPaths[selectedRol];
        console.log('Rol seleccionado:', selectedRol); // Debug log
        console.log('Ruta de redirección:', targetPath); // Debug log
        
        if (targetPath) {
          console.log('Iniciando redirección...'); // Debug log
          navigate(targetPath);
        } else {
          console.error('Ruta no encontrada para el rol:', selectedRol);
          navigate('/login'); // Fallback
        }
      }, 2000);
      
    } catch (error) {
      console.log('Error completo:', error); // Debug log
      console.log('Error response:', error.response); // Debug log
      
      if (error.response) {
        const errorData = error.response.data;
        const statusCode = error.response.status;
        
        console.log('Status code:', statusCode); // Debug log
        console.log('Error data:', errorData); // Debug log
        
        // Check for 500 server errors first
        if (statusCode === 500) {
          if (errorData.message && errorData.message.includes('Integrity constraint violation')) {
            if (errorData.message.includes("Column 'rol' cannot be null")) {
              showNotification('Error en el servidor: El rol no se está procesando correctamente. Contacta al administrador.', 'error');
            } else {
              showNotification('Error en el servidor. Por favor, contacta al administrador.', 'error');
            }
          } else {
            showNotification('Error interno del servidor. Por favor, intenta nuevamente o contacta al administrador.', 'error');
          }
        } else if (errorData.errors) {
          // Check specifically for email/Correo validation errors
          const emailErrors = errorData.errors.Correo || errorData.errors.email || [];
          const hasEmailError = emailErrors.length > 0;
          
          if (hasEmailError) {
            // Check if it's a duplicate email error
            const emailErrorText = emailErrors.join(' ').toLowerCase();
            if (emailErrorText.includes('ya ha sido tomado') || 
                emailErrorText.includes('already been taken') ||
                emailErrorText.includes('duplicate') ||
                emailErrorText.includes('unique')) {
              showNotification('Este correo electrónico ya está registrado', 'error');
            } else {
              showNotification('Error en el formato del correo electrónico', 'error');
            }
          } else {
            // For other validation errors, show a more concise message
            const errorMessages = Object.values(errorData.errors).flat();
            const firstError = errorMessages[0];
            showNotification(firstError, 'error');
          }
        } else if (errorData.message) {
          showNotification(errorData.message, 'error');
        } else {
          showNotification('Error al registrar usuario', 'error');
        }
      } else if (error.request) {
        showNotification('Error de conexión. Verifica que el servidor Laravel esté ejecutándose.', 'error');
      } else {
        showNotification('Error inesperado: ' + error.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolver = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 px-4">
      {showToast && (
        <div className={`fixed top-6 right-6 z-50 max-w-sm w-full transform transition-all duration-500 ease-out ${
          showToast ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
        }`}>
          <div className={`relative overflow-hidden rounded-2xl shadow-2xl border ${
            toastType === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400' 
              : 'bg-gradient-to-r from-red-500 to-pink-600 border-red-400'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            
            <div className="relative p-6 flex items-start space-x-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                toastType === 'success' 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : 'bg-white/20 backdrop-blur-sm'
              }`}>
                <FaCar className={`text-2xl ${
                  toastType === 'success' ? 'text-white' : 'text-white'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-lg font-semibold ${
                  toastType === 'success' ? 'text-white' : 'text-white'
                }`}>
                  {toastType === 'success' ? '¡Éxito!' : 'Error'}
                </p>
                <p className={`text-sm mt-1 ${
                  toastType === 'success' ? 'text-green-100' : 'text-red-100'
                }`}>
                  {toastMessage}
                </p>
              </div>
              
              <button
                onClick={() => setShowToast(false)}
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  toastType === 'success' 
                    ? 'hover:bg-white/20 text-white' 
                    : 'hover:bg-white/20 text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={`h-1 ${
              toastType === 'success' ? 'bg-green-400' : 'bg-red-400'
            }`}>
              <div className={`h-full ${
                toastType === 'success' ? 'bg-white' : 'bg-white'
              } animate-pulse`} style={{animationDuration: '4s'}}></div>
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-md bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-10 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
        <div className="flex justify-center mb-6">
          <FaCar className="text-blue-900 text-7xl drop-shadow-lg" />
        </div>

        <h1 className="text-3xl font-extrabold text-center text-blue-900 mb-2">Crear cuenta</h1>
        <p className="text-sm text-center text-gray-600 mb-4">
          ¡Empieza a viajar con <span className="font-semibold text-blue-800">Mecaza</span>!
        </p>

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
            <label className="block text-sm font-medium text-blue-900 mb-1">Número de teléfono</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-blue-900">
                <EnvelopeIcon className="h-5 w-5" />
              </span>
              <input
                name="Telefono"
                type="text"
                placeholder="número de teléfono"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Rol</label>
            <select
              value={selectedRol}
              onChange={(e) => setSelectedRol(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Selecciona un rol</option>
              <option value="usuario">Usuario</option>
              <option value="conductor">Conductor</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Contraseña</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-blue-900">
                <LockClosedIcon className="h-5 w-5" />
              </span>
              <input
                name="Contrasena"
                type="password"
                placeholder="••••••••"
                required
                minLength={3}
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