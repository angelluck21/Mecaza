import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { FaCar } from 'react-icons/fa';
import axios from 'axios';
import Registrar from './Registrar';
import IndexLoggeado from '../pages/indexLogin';
import IndexAdmin from '../pages/indexAdmin';

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const navigate = useNavigate();

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const correo = e.target.correo.value;
    const contrasena = e.target.contrasenaS.value;
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        Correo: correo,
        Contrasena: contrasena,
       

      },
      {
        headers: {
          'Authorization':  'Bearer ' + localStorage.getItem('authToken'),
          'Content-Type': 'application/json',
          
          'Accept': 'application/json',
        }
      });
      
      showNotification('¡Inicio de sesión exitoso!', 'success');
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      // Obtener el rol del usuario desde la respuesta del servidor
      const userRol = response.data.user?.rol || response.data.rol || response.data.user?.Rol || response.data.Rol || 'usuario';
      
      console.log('Login Debug:', {
        correo,
        userRol,
        responseData: response.data
      });
      
      const userData = {
        Nombre: response.data.user?.Nombre || response.data.Nombre || response.data.user?.nombre || response.data.nombre || correo.split('@')[0],
        Correo: correo,
        token: response.data.token,
        rol: userRol
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('Datos guardados en localStorage:', userData); // Debug log
      
      // Definir rutas de redirección según el rol
      const redirectPaths = {
        'usuario': '/indexLogin',
        'conductor': '/conductor',
        'administrador': '/indexAdmin',
        'admin': '/indexAdmin' // Fallback para 'admin'
      };
      
      setTimeout(() => {
        const targetPath = redirectPaths[userRol];
        console.log('Rol del usuario:', userRol); // Debug log
        console.log('Ruta de redirección:', targetPath); // Debug log
        
        if (targetPath) {
          console.log('Iniciando redirección...'); // Debug log
          console.log('URL actual antes de redirección:', window.location.pathname); // Debug log
          
          // Forzar la redirección
          navigate(targetPath, { replace: true });
          
          // Verificar si la redirección funcionó
          setTimeout(() => {
            console.log('URL después de redirección:', window.location.pathname); // Debug log
            if (window.location.pathname !== targetPath) {
              console.error('La redirección no funcionó, intentando con window.location');
              window.location.href = targetPath;
            }
          }, 100);
        } else {
          console.error('Ruta no encontrada para el rol:', userRol);
          navigate('/indexLogin'); // Fallback
        }
      }, 1500);
      
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          showNotification(errorMessages.join(', '), 'error');
        } else if (errorData.message) {
          showNotification(errorData.message, 'error');
        } else {
          showNotification('Credenciales inválidas', 'error');
        }
      } else if (error.request) {
        showNotification('Error de conexión. Verifica que el servidor Laravel esté ejecutándose.', 'error');
      } else {
        showNotification('Error inesperado al iniciar sesión', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrar = () => {
    navigate('/registrar');
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

        <h1 className="text-3xl font-extrabold text-center text-blue-900 mb-2">Iniciar Sesión</h1>
        <p className="text-sm text-center text-gray-600 mb-8">
          ¡Bienvenido de vuelta a <span className="font-semibold text-blue-800">Mecaza</span>!
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Correo electrónico</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-blue-900">
                <EnvelopeIcon className="h-5 w-5" />
              </span>
              <input
                name="correo"
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
                name="contrasenaS"
                type="password"
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-teal-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
          
          <button
            type="button"
            onClick={handleRegistrar}
            className="w-full py-2 bg-gray-600 text-white font-semibold rounded-md shadow-md hover:bg-gray-700 transition-colors"
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

