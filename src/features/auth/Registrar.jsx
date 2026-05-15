import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { FaCar } from 'react-icons/fa';

import { registrarApi } from '../../services/api';
import { extractUserId } from '../../utils';
import { useToast } from '../../hooks/useToast';
import ToastNotification from '../../components/ui/ToastNotification';

const REDIRECT_BY_ROLE = {
  usuario:       '/login',
  conductor:     '/conductor',
  administrador: '/indexAdmin',
};

const ROL_MESSAGES = {
  usuario:       '¡Usuario registrado exitosamente! Serás redirigido al login.',
  conductor:     '¡Conductor registrado exitosamente! Serás redirigido al panel de conductor.',
  administrador: '¡Administrador registrado exitosamente! Serás redirigido al panel de administrador.',
};

const parseRegisterError = (error) => {
  const errData   = error.response?.data;
  const status    = error.response?.status;

  if (!error.response) return 'Error de conexión con el servidor.';
  if (status === 500) {
    return errData?.message?.includes('Integrity constraint violation')
      ? 'Error en el servidor al procesar el rol. Contacta al administrador.'
      : 'Error interno del servidor. Intenta nuevamente.';
  }
  if (errData?.errors) {
    const emailErrors = errData.errors.Correo || errData.errors.email || [];
    if (emailErrors.length) {
      const txt = emailErrors.join(' ').toLowerCase();
      return txt.includes('ya ha sido tomado') || txt.includes('already been taken') || txt.includes('unique')
        ? 'Este correo electrónico ya está registrado.'
        : 'Error en el formato del correo electrónico.';
    }
    return Object.values(errData.errors).flat()[0] || 'Error de validación.';
  }
  return errData?.message || 'Error al registrar usuario.';
};

// ── Component ─────────────────────────────────────────────────────────────────

const Registrar = () => {
  const [isLoading,   setIsLoading]   = useState(false);
  const [selectedRol, setSelectedRol] = useState('');
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedRol) { showToast('Por favor, selecciona un rol.', 'error'); return; }

    setIsLoading(true);
    const payload = {
      Nombre:    e.target.Nombre.value,
      Correo:    e.target.Correo.value,
      Contrasena: e.target.Contrasena.value,
      Telefono:  e.target.Telefono.value,
      Rol:       selectedRol,
      rol:       selectedRol,
      role:      selectedRol,
    };

    try {
      const { data } = await registrarApi(payload);
      const userId   = extractUserId(data);

      const userData = {
        id_users: userId, id: userId, ID: userId, user_id: userId, userId,
        rol:      selectedRol,
        Correo:   payload.Correo,
        Nombre:   payload.Nombre,
        ...data,
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      showToast(ROL_MESSAGES[selectedRol], 'success');

      e.target.reset();
      setSelectedRol('');

      setTimeout(() => navigate(REDIRECT_BY_ROLE[selectedRol] ?? '/login'), 2000);

    } catch (error) {
      showToast(parseRegisterError(error), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 px-4">
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />

      <div className="w-full max-w-md bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-10 transition-all duration-300 hover:scale-[1.01]">
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
            <input name="Nombre" type="text" placeholder="Tu nombre" required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Correo electrónico</label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-900" />
              <input name="Correo" type="email" placeholder="correo electrónico" required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Número de teléfono</label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-900" />
              <input name="Telefono" type="text" placeholder="número de teléfono" required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Rol</label>
            <select value={selectedRol} onChange={(e) => setSelectedRol(e.target.value)} required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
              <option value="">Selecciona un rol</option>
              <option value="usuario">Usuario</option>
              <option value="conductor">Conductor</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Contraseña</label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-2.5 h-5 w-5 text-blue-900" />
              <input name="Contrasena" type="password" placeholder="••••••••" required minLength={3}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm text-blue-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full py-2 bg-teal-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>

          <button type="button" onClick={() => window.history.back()}
            className="w-full py-2 bg-gray-600 text-white font-semibold rounded-md shadow-md hover:bg-gray-700 transition-colors">
            Volver
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registrar;
