import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { FaCar } from 'react-icons/fa';

import { loginApi }        from '../../services/api';
import { buildUserData }   from '../../utils';
import { useToast }        from '../../hooks/useToast';
import ToastNotification   from '../../components/ui/ToastNotification';
import GoogleAuthButton, { REDIRECT_BY_ROLE as GOOGLE_REDIRECT } from '../../components/ui/GoogleAuthButton';

import './Login.css';

const REDIRECT_BY_ROLE = {
  usuario:       '/indexLogin',
  conductor:     '/conductor',
  administrador: '/indexAdmin',
  admin:         '/indexAdmin',
};

/* ── Animated SVG route A→B ───────────────────────────── */
const RouteVisualization = () => (
  <div className="mcz-route">
    <svg className="mcz-route-svg" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">

      {/* Background dashed ghost path */}
      <path
        className="route-path-bg"
        d="M 60 30 L 60 70 Q 60 95 85 95 L 195 95 Q 220 95 220 118 L 220 155 Q 220 170 205 170 L 145 170"
      />

      {/* Animated amber route */}
      <path
        className="route-path"
        d="M 60 30 L 60 70 Q 60 95 85 95 L 195 95 Q 220 95 220 118 L 220 155 Q 220 170 205 170 L 145 170"
      />

      {/* ── Pin A — Origin ── */}
      <g className="pin-a">
        <circle className="pin-pulse"   cx="60" cy="30" r="10" fill="none" stroke="#FFBE00" strokeWidth="1.5"/>
        <circle className="pin-pulse-2" cx="60" cy="30" r="14" fill="none" stroke="#FFBE00" strokeWidth="0.8"/>
        <circle cx="60" cy="30" r="7" fill="#0E1422" stroke="#FFBE00" strokeWidth="2"/>
        <circle cx="60" cy="30" r="3" fill="#FFBE00"/>
        <rect x="70" y="22" width="54" height="16" rx="4" fill="#141D30"/>
        <text x="97" y="34" textAnchor="middle" className="route-label route-label-highlight">ORIGEN</text>
      </g>

      {/* ── Pin B — Destination ── */}
      <g className="pin-b">
        <circle className="pin-pulse"   cx="145" cy="170" r="10" fill="none" stroke="#FFBE00" strokeWidth="1.5"/>
        <circle className="pin-pulse-2" cx="145" cy="170" r="14" fill="none" stroke="#FFBE00" strokeWidth="0.8"/>
        <circle cx="145" cy="170" r="7" fill="#0E1422" stroke="#FFBE00" strokeWidth="2"/>
        <circle cx="145" cy="170" r="3" fill="#FFBE00"/>
        <rect x="155" y="162" width="60" height="16" rx="4" fill="#141D30"/>
        <text x="185" y="174" textAnchor="middle" className="route-label route-label-highlight">DESTINO</text>
      </g>

      {/* Waypoint nodes */}
      <circle cx="85"  cy="95"  r="3" fill="#FFBE00" opacity="0" style={{animation:'pinAppear 0.3s ease 1.2s forwards'}}/>
      <circle cx="220" cy="118" r="3" fill="#FFBE00" opacity="0" style={{animation:'pinAppear 0.3s ease 1.8s forwards'}}/>

      {/* Distance badge */}
      <g className="route-car">
        <rect x="220" y="26" width="80" height="28" rx="6" fill="#141D30" stroke="rgba(255,190,0,0.18)" strokeWidth="1"/>
        <text x="260" y="37" textAnchor="middle" className="route-label" style={{fontSize:'7.5px'}}>DISTANCIA EST.</text>
        <text x="260" y="49" textAnchor="middle" style={{fontFamily:'Syne,sans-serif', fontSize:'11px', fontWeight:'700', fill:'#FFBE00'}}>~4.2 km</text>
      </g>
    </svg>
  </div>
);

/* ── Main component ───────────────────────────────────── */
const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const correo     = e.target.correo.value;
    const contrasena = e.target.contrasenaS.value;

    try {
      const { data } = await loginApi(correo, contrasena);

      const userRol  = data.user?.rol || data.rol || data.user?.Rol || data.Rol || 'usuario';
      const userData = buildUserData(data, correo);

      localStorage.setItem('id_users', userData.id_users || '');
      localStorage.setItem('userData', JSON.stringify(userData));

      showToast('¡Inicio de sesión exitoso!', 'success');
      setTimeout(() => navigate(REDIRECT_BY_ROLE[userRol] ?? '/indexLogin', { replace: true }), 1500);

    } catch (error) {
      const errData = error.response?.data;
      if (errData?.errors)       showToast(Object.values(errData.errors).flat().join(', '), 'error');
      else if (errData?.message) showToast(errData.message, 'error');
      else if (error.request)    showToast('Error de conexión con el servidor.', 'error');
      else                       showToast('Error inesperado al iniciar sesión.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mcz-login">
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
          <span className="mcz-eyebrow">Movilidad compartida</span>
          <h1 className="mcz-tagline">
            Tu viaje,<br />
            <em>tu ritmo.</em>
          </h1>
          <p className="mcz-desc">
            Conectamos pasajeros y conductores para viajes compartidos más humanos, seguros y accesibles.
          </p>
        </div>

        <RouteVisualization />

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
            <h2 className="mcz-card-title">Bienvenido de vuelta</h2>
            <p className="mcz-card-sub">Inicia sesión para continuar tu viaje</p>
          </div>

          <form onSubmit={handleLogin} noValidate>

            {/* Email */}
            <div className="mcz-field">
              <label className="mcz-label" htmlFor="mcz-email">Correo electrónico</label>
              <div className="mcz-input-wrap">
                <input
                  id="mcz-email"
                  name="correo"
                  type="email"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  required
                  className="mcz-input"
                />
                <EnvelopeIcon className="mcz-input-icon" />
              </div>
            </div>

            {/* Password */}
            <div className="mcz-field">
              <label className="mcz-label" htmlFor="mcz-pass">Contraseña</label>
              <div className="mcz-input-wrap">
                <input
                  id="mcz-pass"
                  name="contrasenaS"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  required
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

            <button type="submit" className="mcz-btn-primary" disabled={isLoading}>
              {isLoading ? (
                <span className="mcz-btn-spinner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    style={{animation:'spin 0.8s linear infinite'}}>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Iniciando sesión…
                </span>
              ) : 'Iniciar sesión →'}
            </button>
          </form>

          <div className="mcz-divider"><span>o continúa con</span></div>

          <GoogleAuthButton
            label="Continuar con Google"
            onSuccess={(userData) => {
              showToast('¡Bienvenido!', 'success');
              const rol = userData?.rol || 'usuario';
              setTimeout(() => navigate(GOOGLE_REDIRECT[rol] ?? '/indexLogin', { replace: true }), 1200);
            }}
            onError={(msg) => showToast(msg, 'error')}
          />

          <div className="mcz-divider"><span>¿No tienes cuenta?</span></div>

          <button
            type="button"
            className="mcz-btn-secondary"
            onClick={() => navigate('/registrar')}
          >
            Crear cuenta gratis
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

export default Login;
