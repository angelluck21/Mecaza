import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { FaCar } from 'react-icons/fa';

import { loginApi }      from '../../services/api';
import { buildUserData } from '../../utils';
import { useToast }      from '../../hooks/useToast';
import ToastNotification from '../../components/ui/ToastNotification';

const REDIRECT_BY_ROLE = {
  usuario:       '/indexLogin',
  conductor:     '/conductor',
  administrador: '/indexAdmin',
  admin:         '/indexAdmin',
};

const Login = () => {
  const [isLoading,   setIsLoading]   = useState(false);
  const [showPass,    setShowPass]    = useState(false);
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
      setTimeout(() => navigate(REDIRECT_BY_ROLE[userRol] ?? '/indexLogin', { replace: true }), 1500);

    } catch (error) {
      const errData = error.response?.data;
      if (errData?.errors)        showToast(Object.values(errData.errors).flat().join(', '), 'error');
      else if (errData?.message)  showToast(errData.message, 'error');
      else if (error.request)     showToast('Error de conexión con el servidor.', 'error');
      else                        showToast('Error inesperado al iniciar sesión.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900 px-4 relative overflow-hidden">

      {/* Decoración de fondo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />

      <div className="w-full max-w-md animate-scale-in">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-violet-900/40 overflow-hidden">

          {/* Header de color */}
          <div className="bg-gradient-to-r from-blue-800 to-violet-700 px-8 py-8 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full" />
            <div className="relative">
              <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FaCar className="text-white text-3xl" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">Iniciar Sesión</h1>
              <p className="text-blue-200 text-sm mt-1">
                Bienvenido de vuelta a <span className="font-bold text-white">Mecaza</span>
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="px-8 py-8">
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Correo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-violet-400" />
                  <input
                    name="correo"
                    type="email"
                    placeholder="tu@correo.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-2.5 h-5 w-5 text-violet-400" />
                  <input
                    name="contrasenaS"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-violet-500 transition-colors text-xs"
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Botón login */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-700 to-violet-600 text-white font-bold rounded-xl shadow-md hover:shadow-violet-300/50 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : 'Iniciar sesión'}
              </button>

              {/* Separador */}
              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-gray-400">¿No tienes cuenta?</span>
                </div>
              </div>

              {/* Botón registro */}
              <button
                type="button"
                onClick={() => navigate('/registrar')}
                className="w-full py-2.5 bg-gray-50 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all duration-200 text-sm active:scale-95"
              >
                Crear cuenta gratis
              </button>
            </form>
          </div>
        </div>

        {/* Link volver */}
        <p className="text-center text-blue-300 text-sm mt-4">
          <button onClick={() => navigate('/')} className="hover:text-white transition-colors underline underline-offset-2">
            ← Volver al inicio
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
