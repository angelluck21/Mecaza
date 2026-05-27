import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaBell, FaTrash } from 'react-icons/fa';
import {
  misNotificacionesApi,
  contadorNoLeidasApi,
  marcarTodasLeidasApi,
  eliminarTodasNotificacionesApi,
} from '../../services/api';

const TIPO_COLOR = {
  info:    '#6366f1',
  success: '#22c55e',
  warning: '#FFBE00',
  error:   '#ef4444',
};

const formatFecha = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

const NotificationBell = () => {
  const [noLeidas, setNoLeidas] = useState(0);
  const [notifs,   setNotifs]   = useState([]);
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchContador = useCallback(async () => {
    try {
      const { data } = await contadorNoLeidasApi();
      setNoLeidas(data.no_leidas ?? 0);
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => {
    fetchContador();
    const id = setInterval(fetchContador, 30_000);
    return () => clearInterval(id);
  }, [fetchContador]);

  const handleToggle = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (!willOpen) return;

    setLoading(true);
    try {
      const { data } = await misNotificacionesApi(1);
      const lista = Array.isArray(data.data) ? data.data : [];
      setNotifs(lista);

      // Auto-marcar todas como leídas al abrir — fire & forget
      const hayNoLeidas = lista.some(n => !n.leida);
      if (hayNoLeidas) {
        marcarTodasLeidasApi().catch(() => {});
        setNotifs(lista.map(n => ({ ...n, leida: true })));
        setNoLeidas(0);
      }
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  };

  const handleEliminarTodas = async () => {
    setNotifs([]);
    setNoLeidas(0);
    try { await eliminarTodasNotificacionesApi(); } catch { /* silencioso */ }
  };

  const [bellHovered, setBellHovered] = useState(false);

  return (
    <div style={{ position: 'relative' }} ref={ref}>

      {/* Botón campana */}
      <button
        onClick={handleToggle}
        onMouseEnter={() => setBellHovered(true)}
        onMouseLeave={() => setBellHovered(false)}
        title="Notificaciones"
        style={{
          position:        'relative',
          width:           '38px',
          height:          '38px',
          borderRadius:    '10px',
          border:          `1px solid ${open || bellHovered ? 'rgba(255,190,0,0.35)' : 'rgba(255,255,255,0.07)'}`,
          background:      open || bellHovered ? 'rgba(255,190,0,0.06)' : '#141D30',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          cursor:          'pointer',
          color:           open || bellHovered ? '#FFBE00' : '#6B728F',
          transition:      'all 0.2s',
          flexShrink:      0,
        }}
      >
        <FaBell style={{ fontSize: '0.95rem' }} />

        {/* Badge no leídas */}
        {noLeidas > 0 && (
          <span style={{
            position:        'absolute',
            top:             '-5px',
            right:           '-5px',
            minWidth:        '17px',
            height:          '17px',
            background:      '#ef4444',
            color:           '#fff',
            fontSize:        '0.58rem',
            fontWeight:      700,
            borderRadius:    '999px',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            padding:         '0 4px',
            border:          '2px solid #0E1422',
            lineHeight:      1,
            fontFamily:      "'Syne', sans-serif",
          }}>
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:     'absolute',
          right:        0,
          top:          'calc(100% + 8px)',
          width:        '300px',
          background:   '#0E1422',
          border:       '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px',
          overflow:     'hidden',
          boxShadow:    '0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,190,0,0.05)',
          zIndex:       99999,
          animation:    'scaleIn 0.25s cubic-bezier(.22,1,.36,1) both',
        }}>

          {/* Header */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '0.875rem 1rem',
            background:     'linear-gradient(160deg, #0B0F1C 0%, #141D30 100%)',
            borderBottom:   '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <p style={{
                fontFamily: "'Syne', sans-serif",
                fontSize:   '0.875rem',
                fontWeight: 700,
                color:      '#EEF0FA',
              }}>
                Notificaciones
              </p>
              {noLeidas > 0 && (
                <span style={{
                  fontSize:     '0.6rem',
                  fontWeight:   700,
                  background:   'rgba(239,68,68,0.15)',
                  color:        '#ef4444',
                  border:       '1px solid rgba(239,68,68,0.25)',
                  padding:      '0.1rem 0.45rem',
                  borderRadius: '999px',
                  fontFamily:   "'Syne', sans-serif",
                }}>
                  {noLeidas}
                </span>
              )}
            </div>

            {notifs.length > 0 && (
              <button
                onClick={handleEliminarTodas}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 600, color: '#6B728F', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: '0.2rem 0.4rem', borderRadius: '5px', transition: 'color 0.2s', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#6B728F'}
              >
                <FaTrash style={{ fontSize: '0.55rem' }} /> Eliminar todo
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0' }}>
                <div style={{
                  width:         '22px',
                  height:        '22px',
                  border:        '3px solid rgba(255,190,0,0.1)',
                  borderTopColor:'#FFBE00',
                  borderRadius:  '50%',
                  animation:     'homeSpin 0.8s linear infinite',
                }} />
              </div>

            ) : notifs.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <FaBell style={{ fontSize: '2rem', color: '#3A4060' }} />
                <p style={{ fontSize: '0.82rem', color: '#6B728F', fontWeight: 300, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                  Sin notificaciones
                </p>
              </div>

            ) : (
              notifs.map((n, idx) => (
                <NotifItem
                  key={n.id}
                  n={n}
                  onMark={() => {}}
                  isLast={idx === notifs.length - 1}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Item individual ─────────────────────────────────────────── */
const NotifItem = ({ n, onMark, isLast }) => {
  const [hovered, setHovered] = useState(false);
  const dotColor = !n.leida ? (TIPO_COLOR[n.tipo] ?? '#6366f1') : '#3A4060';

  return (
    <button
      onClick={() => !n.leida && onMark(n.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:          '100%',
        textAlign:      'left',
        padding:        '0.75rem 1rem',
        background:     hovered
          ? 'rgba(255,255,255,0.02)'
          : !n.leida ? 'rgba(255,190,0,0.03)' : 'none',
        border:         'none',
        borderBottom:   isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
        cursor:         !n.leida ? 'pointer' : 'default',
        display:        'flex',
        alignItems:     'flex-start',
        gap:            '0.65rem',
        transition:     'background 0.15s',
      }}
    >
      {/* Dot */}
      <span style={{
        width:        '7px',
        height:       '7px',
        borderRadius: '50%',
        background:   dotColor,
        flexShrink:   0,
        marginTop:    '5px',
        boxShadow:    !n.leida ? `0 0 6px ${dotColor}60` : 'none',
        transition:   'background 0.2s',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize:     '0.8rem',
          fontWeight:   !n.leida ? 600 : 400,
          color:        !n.leida ? '#EEF0FA' : '#6B728F',
          lineHeight:   1.4,
          fontFamily:   "'DM Sans', sans-serif",
          marginBottom: '0.2rem',
        }}>
          {n.titulo}
        </p>
        <p style={{
          fontSize:    '0.75rem',
          color:       '#4A5270',
          lineHeight:  1.5,
          fontFamily:  "'DM Sans', sans-serif",
          display:     '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow:    'hidden',
          fontWeight:  300,
        }}>
          {n.mensaje}
        </p>
        <p style={{
          fontSize:   '0.62rem',
          color:      '#3A4060',
          marginTop:  '0.3rem',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {formatFecha(n.created_at)}
        </p>
      </div>
    </button>
  );
};

export default NotificationBell;
