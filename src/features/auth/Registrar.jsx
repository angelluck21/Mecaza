import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LockClosedIcon, EnvelopeIcon, PhoneIcon,
  UserIcon, EyeIcon, EyeSlashIcon,
} from '@heroicons/react/24/solid';
import { FaCar } from 'react-icons/fa';

import { registrarApi }  from '../../services/api';
import { extractUserId } from '../../utils';
import { useToast }      from '../../hooks/useToast';
import ToastNotification from '../../components/ui/ToastNotification';
import GoogleAuthButton  from '../../components/ui/GoogleAuthButton';

import './Login.css';   // shared design-system

const ROL = 'usuario';

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

/* ── Steps visual for left panel ─────────────────────── */
const OnboardingSteps = () => (
  <div className="mcz-steps">
    <div className="mcz-step">
      <div className="mcz-step-left">
        <div className="mcz-step-num">01</div>
        <div className="mcz-step-connector" />
      </div>
      <div className="mcz-step-body">
        <p className="mcz-step-title">Crea tu cuenta</p>
        <p className="mcz-step-desc">Llena tus datos básicos en menos de 2 minutos, sin complicaciones.</p>
      </div>
    </div>

    <div className="mcz-step">
      <div className="mcz-step-left">
        <div className="mcz-step-num">02</div>
        <div className="mcz-step-connector" />
      </div>
      <div className="mcz-step-body">
        <p className="mcz-step-title">Elige tu destino</p>
        <p className="mcz-step-desc">Busca viajes disponibles cerca de ti en tiempo real.</p>
      </div>
    </div>

    <div className="mcz-step">
      <div className="mcz-step-left">
        <div className="mcz-step-num">03</div>
      </div>
      <div className="mcz-step-body">
        <p className="mcz-step-title">Viaja seguro</p>
        <p className="mcz-step-desc">Conéctate con conductores verificados y llega a tu destino.</p>
      </div>
    </div>
  </div>
);

/* ── Main component ───────────────────────────────────── */
const Registrar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      Nombre:     e.target.Nombre.value,
      Correo:     e.target.Correo.value,
      Contrasena: e.target.Contrasena.value,
      Telefono:   e.target.Telefono.value,
      Rol:        ROL,
      rol:        ROL,
      role:       ROL,
    };

    try {
      const { data } = await registrarApi(payload);
      const userId   = extractUserId(data);
      const userData = {
        id_users: userId, id: userId, ID: userId, user_id: userId, userId,
        rol: ROL, Correo: payload.Correo, Nombre: payload.Nombre, ...data,
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      showToast('¡Cuenta creada! Serás redirigido al login.', 'success');
      e.target.reset();
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      showToast(parseRegisterError(error), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mcz-login mcz-register">
      <ToastNotification
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* ── Left brand panel ── */}
      <div className="mcz-left">

        <div className="mcz-logo">
          <div className="mcz-logo-icon"><FaCar /></div>
          <span className="mcz-logo-name">Mecaza</span>
        </div>

        <div className="mcz-brand">
          <span className="mcz-eyebrow">Tu primer viaje</span>
          <h1 className="mcz-tagline">
            Únete y<br />
            <em>muévete.</em>
          </h1>
          <p className="mcz-desc">
            Crea tu cuenta en segundos y empieza a compartir viajes seguros, económicos y accesibles.
          </p>
        </div>

        {/* Onboarding steps instead of route */}
        <OnboardingSteps />

        {/* Stats */}
        <div className="mcz-stats">
          <div className="mcz-stat">
            <span className="mcz-stat-num">10K+</span>
            <span className="mcz-stat-lbl">Viajes</span>
          </div>
          <div className="mcz-stat">
            <span className="mcz-stat-num">500+</span>
            <span className="mcz-stat-lbl">Conductores</span>
          </div>
          <div className="mcz-stat">
            <span className="mcz-stat-num">4.9★</span>
            <span className="mcz-stat-lbl">Puntuación</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="mcz-right">
        <div className="mcz-card">

          <div className="mcz-card-header">
            <h2 className="mcz-card-title">Crear cuenta</h2>
            <p className="mcz-card-sub">Tu primer viaje empieza aquí</p>
          </div>

          <form onSubmit={handleRegister} noValidate>

            {/* Nombre */}
            <div className="mcz-field">
              <label className="mcz-label" htmlFor="reg-nombre">Nombre completo</label>
              <div className="mcz-input-wrap">
                <input
                  id="reg-nombre"
                  name="Nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                  required
                  className="mcz-input"
                />
                <UserIcon className="mcz-input-icon" />
              </div>
            </div>

            {/* Correo */}
            <div className="mcz-field">
              <label className="mcz-label" htmlFor="reg-correo">Correo electrónico</label>
              <div className="mcz-input-wrap">
                <input
                  id="reg-correo"
                  name="Correo"
                  type="email"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  required
                  className="mcz-input"
                />
                <EnvelopeIcon className="mcz-input-icon" />
              </div>
            </div>

            {/* Teléfono */}
            <div className="mcz-field">
              <label className="mcz-label" htmlFor="reg-tel">Número de teléfono</label>
              <div className="mcz-input-wrap">
                <input
                  id="reg-tel"
                  name="Telefono"
                  type="tel"
                  placeholder="+57 300 000 0000"
                  autoComplete="tel"
                  required
                  className="mcz-input"
                />
                <PhoneIcon className="mcz-input-icon" />
              </div>
            </div>

            {/* Contraseña */}
            <div className="mcz-field">
              <label className="mcz-label" htmlFor="reg-pass">Contraseña</label>
              <div className="mcz-input-wrap">
                <input
                  id="reg-pass"
                  name="Contrasena"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••"
                  autoComplete="new-password"
                  required
                  minLength={3}
                  className="mcz-input has-toggle"
                />
                <LockClosedIcon className="mcz-input-icon" />
                <button
                  type="button"
                  className="mcz-toggle"
                  onClick={() => setShowPass(p => !p)}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mcz-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="mcz-btn-spinner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    style={{animation:'spin 0.8s linear infinite'}}>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Creando cuenta…
                </span>
              ) : 'Crear cuenta →'}
            </button>
          </form>

          {/* Google */}
          <div className="mcz-divider"><span>o regístrate con</span></div>

          <GoogleAuthButton
            label="Registrarse con Google"
            onSuccess={() => {
              showToast('¡Cuenta creada con Google!', 'success');
              setTimeout(() => navigate('/indexLogin', { replace: true }), 1200);
            }}
            onError={(msg) => showToast(msg, 'error')}
          />

          {/* Login link */}
          <div className="mcz-divider"><span>¿Ya tienes cuenta?</span></div>

          <button
            type="button"
            className="mcz-btn-secondary"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </button>

          <div className="mcz-back-strip">
            <button className="mcz-back" onClick={() => navigate('/')}>
              <span className="mcz-back-arrow">←</span>
              Volver al inicio
            </button>
            <span className="mcz-back-brand">Mecaza</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registrar;
