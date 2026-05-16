import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LockClosedIcon, PhoneIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { FaCar } from 'react-icons/fa';

import { validarInvitacionApi, registrarConductorApi } from '../services/api';
import { useToast } from '../hooks/useToast';
import ToastNotification from '../components/ui/ToastNotification';

const RegConductor = () => {
  const [searchParams]  = useSearchParams();
  const navigate         = useNavigate();
  const token            = searchParams.get('token') ?? '';

  const [status,    setStatus]    = useState('validating'); // validating | valid | invalid | done
  const [email,     setEmail]     = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    validarInvitacionApi(token)
      .then(({ data }) => {
        if (data.valid) { setEmail(data.email); setStatus('valid'); }
        else setStatus('invalid');
      })
      .catch(() => setStatus('invalid'));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      Nombre:     e.target.Nombre.value,
      Contrasena: e.target.Contrasena.value,
      Telefono:   e.target.Telefono.value,
    };
    try {
      const { data } = await registrarConductorApi(token, payload);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify({
        ...data.user,
        id_users: data.user?.id_users ?? data.user?.id,
        rol: 'conductor',
      }));
      setStatus('done');
      showToast('¡Cuenta creada! Redirigiendo...', 'success');
      setTimeout(() => navigate('/conductor'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear la cuenta.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all';
  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900 px-4 py-8 relative overflow-hidden">
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
              <h1 className="text-2xl font-extrabold text-white">Registro de conductor</h1>
              <p className="text-blue-200 text-sm mt-1">
                Únete al equipo de <span className="font-bold text-white">Mecaza</span>
              </p>
            </div>
          </div>

          <div className="px-8 py-7">

            {/* Validando token */}
            {status === 'validating' && (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="w-10 h-10 border-4 border-violet-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Validando enlace de invitación...</p>
              </div>
            )}

            {/* Token inválido */}
            {status === 'invalid' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-red-500 text-2xl font-bold">!</span>
                </div>
                <h2 className="font-bold text-gray-800">Enlace no válido</h2>
                <p className="text-sm text-gray-500">
                  Este enlace de invitación no es válido, ya fue utilizado o expiró. Solicita al administrador que te envíe una nueva invitación.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-2 text-sm text-violet-600 hover:text-violet-800 underline underline-offset-2"
                >
                  ← Volver al inicio
                </button>
              </div>
            )}

            {/* Registro exitoso */}
            {status === 'done' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-green-500 text-2xl">✓</span>
                </div>
                <h2 className="font-bold text-gray-800">¡Cuenta creada!</h2>
                <p className="text-sm text-gray-500">Redirigiendo al panel de conductor...</p>
              </div>
            )}

            {/* Formulario */}
            {status === 'valid' && (
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Correo (solo lectura) */}
                <div>
                  <label className={labelClass}>Correo electrónico</label>
                  <div className="px-4 py-2.5 border border-gray-100 bg-gray-50 rounded-xl text-gray-500 text-sm">
                    {email}
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <label className={labelClass}>Nombre completo</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-violet-400" />
                    <input name="Nombre" type="text" placeholder="Tu nombre completo" required className={inputClass} />
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
                      minLength={6}
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
                      Creando cuenta...
                    </span>
                  ) : 'Crear mi cuenta'}
                </button>
              </form>
            )}
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

export default RegConductor;
