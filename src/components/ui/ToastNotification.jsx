import React, { useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

/* ── Config por tipo ─────────────────────────────────────────── */
const TYPES = {
  success: {
    icon:    <FaCheck />,
    color:   '#22c55e',
    glow:    'rgba(34,197,94,0.18)',
    border:  'rgba(34,197,94,0.28)',
    title:   '¡Operación exitosa!',
  },
  error: {
    icon:    <FaTimes />,
    color:   '#ef4444',
    glow:    'rgba(239,68,68,0.18)',
    border:  'rgba(239,68,68,0.28)',
    title:   'Ocurrió un error',
  },
  warning: {
    icon:    <FaExclamationTriangle />,
    color:   '#FFBE00',
    glow:    'rgba(255,190,0,0.18)',
    border:  'rgba(255,190,0,0.28)',
    title:   'Advertencia',
  },
  info: {
    icon:    <FaInfoCircle />,
    color:   '#6366f1',
    glow:    'rgba(99,102,241,0.18)',
    border:  'rgba(99,102,241,0.28)',
    title:   'Información',
  },
};

/* ── Keyframes inyectados una sola vez ───────────────────────── */
const STYLE_ID = 'mcz-toast-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(24px) scale(0.96); }
      to   { opacity: 1; transform: translateX(0)    scale(1);    }
    }
    @keyframes toastOut {
      from { opacity: 1; transform: translateX(0)    scale(1);    }
      to   { opacity: 0; transform: translateX(16px) scale(0.96); }
    }
    @keyframes drainBar {
      from { width: 100%; }
      to   { width: 0%;   }
    }
  `;
  document.head.appendChild(s);
}

/* ── Componente ──────────────────────────────────────────────── */
const ToastNotification = ({ message, type = 'success', onClose, isVisible, duration = 4000 }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  if (!isVisible && !mounted) return null;

  const cfg = TYPES[type] ?? TYPES.success;
  const leaving = !isVisible && mounted;

  return (
    <div
      style={{
        position:  'fixed',
        top:       '1.25rem',
        right:     '1.25rem',
        zIndex:    99999,
        width:     '320px',
        maxWidth:  'calc(100vw - 2rem)',
        animation: leaving
          ? 'toastOut 0.32s cubic-bezier(.4,0,.6,1) forwards'
          : 'toastIn  0.36s cubic-bezier(.22,1,.36,1) forwards',
      }}
    >
      <div
        style={{
          background:   '#0E1422',
          border:       `1px solid ${cfg.border}`,
          borderRadius: '14px',
          overflow:     'hidden',
          boxShadow:    `0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04), 0 0 24px ${cfg.glow}`,
          fontFamily:   "'DM Sans', system-ui, sans-serif",
        }}
      >
        {/* Barra superior de color */}
        <div style={{
          height:     '2px',
          background: `linear-gradient(90deg, ${cfg.color}, rgba(255,255,255,0.08))`,
        }} />

        {/* Contenido */}
        <div style={{
          display:    'flex',
          alignItems: 'flex-start',
          gap:        '0.75rem',
          padding:    '0.9rem 1rem',
        }}>

          {/* Ícono */}
          <div style={{
            width:           '34px',
            height:          '34px',
            borderRadius:    '9px',
            background:      cfg.glow,
            border:          `1px solid ${cfg.border}`,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            color:           cfg.color,
            fontSize:        '0.85rem',
            flexShrink:      0,
            marginTop:       '1px',
            boxShadow:       `0 0 16px ${cfg.glow}`,
          }}>
            {cfg.icon}
          </div>

          {/* Texto */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize:      '0.58rem',
              fontWeight:    700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         cfg.color,
              marginBottom:  '0.2rem',
              fontFamily:    "'Syne', sans-serif",
            }}>
              {cfg.title}
            </p>
            <p style={{
              fontSize:   '0.84rem',
              color:      '#8B92A9',
              lineHeight: 1.5,
              fontWeight: 300,
            }}>
              {message}
            </p>
          </div>

          {/* Cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background:  'none',
              border:      'none',
              cursor:      'pointer',
              color:       '#3A4060',
              padding:     '0.2rem',
              borderRadius:'4px',
              flexShrink:  0,
              marginTop:   '2px',
              fontSize:    '0.75rem',
              transition:  'color 0.2s',
              lineHeight:  1,
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFBE00'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#3A4060'}
          >
            <FaTimes />
          </button>
        </div>

        {/* Barra de progreso inferior */}
        <div style={{ height: '2px', background: 'rgba(255,255,255,0.04)' }}>
          {isVisible && (
            <div style={{
              height:          '100%',
              background:      cfg.color,
              opacity:         0.5,
              animation:       `drainBar ${duration}ms linear forwards`,
              borderRadius:    '0 0 14px 14px',
            }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
