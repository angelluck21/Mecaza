import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { FaCar } from 'react-icons/fa';

import { loginApi } from '../services/api';
import { buildUserData } from '../utils';
import { useToast } from '../hooks/useToast';
import ToastNotification from '../components/ui/ToastNotification';

const REDIRECT_BY_ROLE = {
  usuario:       '/indexLogin',
  conductor:     '/conductor',
  administrador: '/indexAdmin',
  admin:         '/indexAdmin',
};

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const correo    = e.target.correo.value;
    const contrasena = e.target.contrasenaS.value;

    try {
      const { data } = await loginApi(correo, contrasena);

      if (data.token) localStorage.setItem('authToken', data.token);

      const userRol  = data.user?.rol || data.rol || data.user?.Rol || data.Rol || 'usuario';
      const userData = buildUserData(data, correo);

      localStorage.setItem('id_users', userData.id_users || '');
      localStorage.setItem('token',    data.token || '');
      localStorage.setItem('userData', JSON.stringify(userData));

      showToast('¡Inicio de sesión exitoso!', 'success');

      setTimeout(() => {
        const path = REDIRECT_BY_ROLE[userRol] ?? '/indexLogin';
        navigate(path, { replace: true });
      }, 1500);

    } catch (error) {
      const errData = error.response?.data;
      if (errData?.errors) {
        showToast(Object.values(errData.errors).flat().join(', '), 'error');
      } else if (errData?.message) {
        showToast(errData.message, 'error');
      } else if (error.request) {
        showToast('Error de conexión con el servidor.', 'error');
      } else {
        showToast('Error inesperado al iniciar sesión.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 px-4">
      <ToastNotification
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      <div className="w-full max-w-md bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-10 transition-all duration-300 hover:scale-[1.01]">
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
              <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-900" />
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
              <LockClosedIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-900" />
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
            onClick={() => navigate('/registrar')}
            className="w-full py-2 bg-gray-600 text-white font-semibold rounded-md shadow-md hover:bg-gray-700 transition-colors"
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
