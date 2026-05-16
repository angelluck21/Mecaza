import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, EnvelopeIcon, PhoneIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { FaCar, FaUser, FaCarAlt, FaCog } from 'react-icons/fa';

import { registrarApi }  from '../../services/api';
import { extractUserId } from '../../utils';
import { useToast }      from '../../hooks/useToast';
import ToastNotification from '../../components/ui/ToastNotification';

const REDIRECT_BY_ROLE = {
  usuario:       '/login',
  conductor:     '/conductor',
  administrador: '/indexAdmin',
};

const ROL_MESSAGES = {
  usuario:       '¡Cuenta creada! Serás redirigido al login.',
  conductor:     '¡Conductor registrado! Serás redirigido al panel.',
  administrador: '¡Admin registrado! Serás redirigido al panel.',
};

const ROLES_OPTIONS = [
  { value: 'usuario',       icon: <FaUser />,    label: 'Usuario',       desc: 'Reserva y viaja' },
  { value: 'conductor',     icon: <FaCarAlt />,  label: 'Conductor',     desc: 'Ofrece viajes' },
  { value: 'administrador', icon: <FaCog />,     label: 'Administrador', desc: 'Gestiona la plataforma' },
];

const parseRegisterError = (error) => {
  const errData = error.response?.data;
  const status  = error.response?.status;
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
  const [showPass,    setShowPass]    = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedRol) { showToast('Por favor, selecciona un rol.', 'error'); return; }

    setIsLoading(true);
    const payload = {
      Nombre:     e.target.Nombre.value,
      Correo:     e.target.Correo.value,
      Contrasena: e.target.Contrasena.value,
      Telefono:   e.target.Telefono.value,
      Rol:        selectedRol,
      rol:        selectedRol,
      role:       selectedRol,
    };

    try {
      const { data } = await registrarApi(payload);
      const userId   = extractUserId(data);
      const userData = {
        id_users: userId, id: userId, ID: userId, user_id: userId, userId,
        rol: selectedRol, Correo: payload.Correo, Nombre: payload.Nombre, ...data,
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

  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900 px-4 py-8 relative overflow-hidden">

      {/* Decoración */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />

      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-white rounded-2xl shadow-2xl shadow-violet-900/40 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-violet-700 px-8 py-7 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FaCar className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl font-extrabold text-white">Crear cuenta</h1>
              <p className="text-blue-200 text-sm mt-1">
                Empieza a viajar con <span className="font-bold text-white">Mecaza</span>
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="px-8 py-7">
            <form onSubmit={handleRegister} className="space-y-4">

              {/* Nombre */}
              <div>
                <label className={labelClass}>Nombre completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-violet-400" />
                  <input name="Nombre" type="text" placeholder="Tu nombre completo" required className={inputClass} />
                </div>
              </div>

              {/* Correo */}
              <div>
                <label className={labelClass}>Correo electrónico</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-violet-400" />
                  <input name="Correo" type="email" placeholder="tu@correo.com" required className={inputClass} />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className={labelClass}>Número de teléfono</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-2.5 h-5 w-5 text-violet-400" />
                  <input name="Telefono" type="text" placeholder="+57 300 000 0000" required className={inputClass} />
                </div>
              </div>

              {/* Rol */}
              <div>
                <label className={labelClass}>Tipo de cuenta</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES_OPTIONS.map(({ value, icon, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelectedRol(value)}
                      className={`p-2.5 rounded-xl border-2 text-center transition-all duration-200 text-xs ${
                        selectedRol === value
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-gray-200 text-gray-500 hover:border-violet-300 hover:bg-violet-50/50'
                      }`}
                    >
                      <div className={`flex justify-center mb-1 text-base ${selectedRol === value ? 'text-violet-500' : 'text-gray-400'}`}>{icon}</div>
                      <div className="font-semibold">{label}</div>
                      <div className="text-gray-400 mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className={labelClass}>Contraseña</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-2.5 h-5 w-5 text-violet-400" />
                  <input
                    name="Contrasena"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    minLength={3}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-violet-500 transition-colors"
                  >
                    {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botón registrar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-700 to-violet-600 text-white font-bold rounded-xl shadow-md hover:shadow-violet-300/50 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-1"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Registrando...
                  </span>
                ) : 'Crear cuenta'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-gray-50 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all duration-200 text-sm active:scale-95"
              >
                Ya tengo cuenta
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-blue-300 text-sm mt-4">
          <button onClick={() => navigate('/')} className="hover:text-white transition-colors underline underline-offset-2">
            ← Volver al inicio
          </button>
        </p>
      </div>
    </div>
  );
};

export default Registrar;
