import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCar, FaPlus, FaTrash, FaListAlt,
  FaMapMarkerAlt, FaClock, FaCalendarAlt, FaPhone,
  FaUser, FaCheck, FaTimes, FaIdCard, FaPlay, FaFlagCheckered,
  FaSync, FaRoad, FaStar, FaRoute, FaBolt,
} from 'react-icons/fa';

import Navbar            from '../../components/layout/Navbar';
import Footer            from '../../components/layout/Footer';
import LoadingScreen     from '../../components/ui/LoadingScreen';
import ToastNotification from '../../components/ui/ToastNotification';
import DarkPagination    from '../../components/ui/DarkPagination';
import { useToast }      from '../../hooks/useToast';
import {
  misReservasApi, listarPreciosApi, crearCarroApi, eliminarCarroApi,
  confirmarReservaApi, iniciarViajeApi, terminarViajeApi,
  historialConductorApi, asignarViajeApi, misCarrosApi, calificarPasajeroApi,
} from '../../services/api';
import { compressImage, formatFecha } from '../../utils';

const RPER = 6; // reservas visibles por página (client-side)

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  void:        '#080B12',
  surface:     '#0E1422',
  surface2:    '#141D30',
  border:      'rgba(255,255,255,0.07)',
  amber:       '#FFBE00',
  amberGlow:   'rgba(255,190,0,0.12)',
  amberBorder: 'rgba(255,190,0,0.3)',
  white:       '#EEF0FA',
  fog:         '#6B728F',
  muted:       '#3A4060',
  green:       '#22c55e',
  sky:         '#38bdf8',
  red:         '#ef4444',
};

const STATUS = {
  1: { color: '#38bdf8', label: 'Esperando', live: true  },
  2: { color: '#22c55e', label: 'En ruta',   live: true  },
  3: { color: '#FFBE00', label: 'Activo',    live: true  },
  4: { color: '#6B728F', label: 'Inactivo',  live: false },
  5: { color: '#6B728F', label: 'Terminado', live: false },
};
const getS  = (id) => STATUS[parseInt(id)] ?? { color: T.fog, label: '—', live: false };
const fmtM  = (n)  => n != null ? `$${Number(n).toLocaleString('es-CO')}` : '$0';
const fmtD  = (ts) => ts ? new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '—';

// ── Atoms ─────────────────────────────────────────────────────────────────────

const LiveDot = ({ color }) => (
  <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10, flexShrink: 0 }}>
    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.6, animation: 'ping 1.5s ease-out infinite' }} />
    <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'block' }} />
  </span>
);

const PlateChip = ({ value }) => (
  <span style={{
    fontFamily: 'monospace', fontWeight: 800, fontSize: '0.88rem',
    letterSpacing: '0.12em', color: T.white, textTransform: 'uppercase',
    background: T.surface2, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: '4px 10px',
  }}>{value || '—'}</span>
);

const SeatGrid = ({ total, ocupados }) => {
  const n = parseInt(total) || 4;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{
          width: 22, height: 16, borderRadius: 4,
          background: i < ocupados ? 'rgba(255,190,0,0.22)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${i < ocupados ? 'rgba(255,190,0,0.45)' : T.border}`,
        }} />
      ))}
      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: T.fog, marginLeft: 6 }}>
        {ocupados}/{n}
      </span>
    </div>
  );
};

const StatChip = ({ value, label, color, loading }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 14, padding: '12px 20px', minWidth: 80, textAlign: 'center',
  }}>
    {loading
      ? <div style={{ width: 22, height: 22, border: `2px solid ${T.muted}`, borderTopColor: color, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 4px' }} />
      : <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, color, margin: 0, lineHeight: 1 }}>{value}</p>
    }
    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.62rem', color: T.fog, marginTop: 4 }}>{label}</p>
  </div>
);

const TabBtn = ({ id, label, icon, active, badge, onClick }) => (
  <button
    onClick={() => onClick(id)}
    style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '9px 16px', borderRadius: 10, whiteSpace: 'nowrap',
      background: active ? T.amberGlow : 'transparent',
      border: `1px solid ${active ? T.amberBorder : 'transparent'}`,
      color: active ? T.amber : T.fog,
      fontFamily: 'Syne, sans-serif', fontSize: '0.78rem', fontWeight: 700,
      cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = T.white; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = T.fog;   e.currentTarget.style.background = 'transparent'; } }}
  >
    <span style={{ fontSize: '0.72rem' }}>{icon}</span>
    {label}
    {badge > 0 && (
      <span style={{
        position: 'absolute', top: -5, right: -5,
        minWidth: 16, height: 16, borderRadius: 999, padding: '0 3px',
        background: T.red, color: '#fff', fontSize: '0.5rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `2px solid ${T.void}`,
      }}>{badge}</span>
    )}
  </button>
);

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
    <div style={{ width: 28, height: 28, border: `3px solid ${T.muted}`, borderTopColor: T.amber, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

const EmptyTab = ({ icon, title, desc, action }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: '4rem 2rem', textAlign: 'center' }}>
    <div style={{ width: 58, height: 58, borderRadius: 16, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
      {icon}
    </div>
    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: T.white, marginBottom: 8 }}>{title}</p>
    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: T.fog, marginBottom: action ? '1.5rem' : 0 }}>{desc}</p>
    {action && (
      <button onClick={action.onClick} style={{ padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#C8960C,#FFBE00)', color: '#080B12', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.82rem', border: 'none', cursor: 'pointer' }}>
        {action.label}
      </button>
    )}
  </div>
);

// ── DarkModal ─────────────────────────────────────────────────────────────────
const DarkModal = ({ title, onClose, children }) => (
  <div
    onClick={(e) => e.target === e.currentTarget && onClose()}
    style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(8,11,18,0.85)', backdropFilter: 'blur(8px)' }}
  >
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'scaleIn 0.2s cubic-bezier(.22,1,.36,1) both' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg,rgba(255,190,0,0.07) 0%,transparent 100%)', flexShrink: 0 }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: T.white }}>{title}</span>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.fog, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => { e.currentTarget.style.color = T.white; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.fog;   e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          <FaTimes style={{ fontSize: '0.7rem' }} />
        </button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>{children}</div>
    </div>
  </div>
);

// ── Form fields ───────────────────────────────────────────────────────────────
const DField = ({ label, icon, type = 'text', value, onChange, placeholder, disabled, required, min }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.6rem', fontWeight: 700, color: T.fog, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.surface2, borderRadius: 10, padding: '0 12px', border: `1px solid ${focused ? T.amber : T.border}`, boxShadow: focused ? '0 0 0 3px rgba(255,190,0,0.07)' : 'none', transition: 'all 0.2s', opacity: disabled ? 0.5 : 1 }}>
        {icon && <span style={{ color: focused ? T.amber : T.fog, fontSize: '0.8rem', flexShrink: 0, transition: 'color 0.2s' }}>{icon}</span>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} required={required} min={min}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: T.white, fontSize: '0.85rem', padding: '11px 0', fontFamily: 'DM Sans, sans-serif' }} />
      </div>
    </div>
  );
};

const DSelect = ({ label, icon, value, onChange, required, children }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.6rem', fontWeight: 700, color: T.fog, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.surface2, borderRadius: 10, padding: '0 12px', border: `1px solid ${focused ? T.amber : T.border}`, boxShadow: focused ? '0 0 0 3px rgba(255,190,0,0.07)' : 'none', transition: 'all 0.2s' }}>
        {icon && <span style={{ color: focused ? T.amber : T.fog, fontSize: '0.8rem', flexShrink: 0, transition: 'color 0.2s' }}>{icon}</span>}
        <select value={value} onChange={onChange} required onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: T.white, fontSize: '0.85rem', padding: '11px 0', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>
          {children}
        </select>
      </div>
    </div>
  );
};

// ── Card: vehículo activo (dispatch console style) ────────────────────────────
const ActiveVehicleCard = ({ carro, dashReservas, accionCarroId, procesando, onIniciar, onTerminar, onConfirmar, onRechazar, idx }) => {
  const id        = carro.id_carros || carro.id;
  const estadoNum = parseInt(carro.id_estados);
  const s         = getS(carro.id_estados);
  const precio    = carro.precioviaje;

  const pasajeros = dashReservas
    .filter(r => String(r.id_carros || r.id_carro || r.carro_id) === String(id))
    .filter(r => { const e = r.estado?.toLowerCase(); return e === 'pendiente' || e === 'confirmada'; });

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${s.color}`, borderRadius: '0 16px 16px 0', overflow: 'hidden', animation: 'fadeUp 0.35s ease both', animationDelay: `${idx * 70}ms` }}>

      {/* Header strip */}
      <div style={{ padding: '14px 20px', background: `linear-gradient(90deg,${s.color}09 0%,transparent 50%)`, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PlateChip value={carro.placa} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {s.live && <LiveDot color={s.color} />}
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.68rem', fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {precio?.precio && (
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.95rem', fontWeight: 800, color: T.amber }}>
              {fmtM(precio.precio)}<span style={{ fontSize: '0.6rem', fontWeight: 400, color: T.fog }}> /pasajero</span>
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: T.fog }}>
            <FaClock style={{ fontSize: '0.6rem' }} />{carro.horasalida || '—'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: T.fog }}>
            <FaCalendarAlt style={{ fontSize: '0.6rem' }} />{fmtD(carro.fecha)}
          </span>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
        {/* Left panel */}
        <div>
          {/* Route */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <FaMapMarkerAlt style={{ color: s.color, fontSize: '0.8rem', flexShrink: 0 }} />
            {precio ? (
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: T.white }}>
                {precio.origen} <span style={{ color: T.muted }}>→</span> {precio.destino}
              </span>
            ) : (
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: T.fog, fontStyle: 'italic' }}>Sin ruta asignada</span>
            )}
          </div>

          {/* Seat grid */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.58rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Ocupación</p>
            <SeatGrid total={carro.asientos} ocupados={pasajeros.length} />
          </div>

          {/* Passenger list */}
          {pasajeros.length > 0 && (
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.58rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Pasajeros</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pasajeros.map((r, ri) => {
                  const resId     = r.id_reservarviajes || r.id;
                  const enProceso = procesando === resId;
                  const estado    = r.estado?.toLowerCase();
                  return (
                    <div key={resId ?? ri} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.surface2, borderRadius: 10, padding: '8px 12px', border: `1px solid ${T.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: T.amberGlow, border: `1px solid ${T.amberBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontSize: '0.7rem', fontWeight: 800, color: T.amber, flexShrink: 0 }}>
                          {(r.nombre || r.name || '?')[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: T.white }}>{r.nombre || r.name || '—'}</p>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.65rem', color: T.fog }}>Asiento {r.asiento || r.Asiento || '—'}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.58rem', fontWeight: 700, padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase', background: estado === 'confirmada' ? 'rgba(34,197,94,0.1)' : 'rgba(255,190,0,0.1)', color: estado === 'confirmada' ? T.green : T.amber, border: `1px solid ${estado === 'confirmada' ? 'rgba(34,197,94,0.3)' : T.amberBorder}` }}>
                          {r.estado || 'Pendiente'}
                        </span>
                        {(!estado || estado === 'pendiente') && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => !enProceso && onConfirmar(r)} disabled={enProceso} style={{ width: 26, height: 26, borderRadius: 7, border: 'none', cursor: 'pointer', background: 'rgba(34,197,94,0.15)', color: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}><FaCheck /></button>
                            <button onClick={() => !enProceso && onRechazar(r)} disabled={enProceso} style={{ width: 26, height: 26, borderRadius: 7, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.12)', color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}><FaTimes /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: action button */}
        {(estadoNum === 1 || estadoNum === 2) && (
          <div>
            {estadoNum === 1 && (
              <button onClick={() => onIniciar(id)} disabled={accionCarroId === id} style={{ padding: '12px 18px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#166534,#22c55e)', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 7, cursor: accionCarroId === id ? 'not-allowed' : 'pointer', opacity: accionCarroId === id ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                {accionCarroId === id ? <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <FaPlay style={{ fontSize: '0.65rem' }} />}
                Iniciar viaje
              </button>
            )}
            {estadoNum === 2 && (
              <button onClick={() => onTerminar(id)} disabled={accionCarroId === id} style={{ padding: '12px 18px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#C8960C,#FFBE00)', color: '#080B12', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 7, cursor: accionCarroId === id ? 'not-allowed' : 'pointer', opacity: accionCarroId === id ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                {accionCarroId === id ? <div style={{ width: 13, height: 13, border: '2px solid rgba(8,11,18,0.25)', borderTopColor: '#080B12', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <FaFlagCheckered style={{ fontSize: '0.65rem' }} />}
                Terminar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Card: reserva ─────────────────────────────────────────────────────────────
const ICell = ({ label, value, accent }) => (
  <div>
    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.57rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{label}</p>
    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: accent || T.fog }}>{value || '—'}</p>
  </div>
);

const ReservaCard = ({ r, id, enProceso, estado, onConfirmar, onRechazar, idx }) => {
  const sc = estado === 'confirmada' ? { c: T.green, bg: 'rgba(34,197,94,0.08)', b: 'rgba(34,197,94,0.25)' }
           : (estado === 'rechazada' || estado === 'cancelada') ? { c: T.red, bg: 'rgba(239,68,68,0.08)', b: 'rgba(239,68,68,0.25)' }
           : { c: T.amber, bg: T.amberGlow, b: T.amberBorder };
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${sc.c}`, borderRadius: '0 14px 14px 0', padding: '16px 20px', animation: 'fadeUp 0.3s ease both', animationDelay: `${idx * 50}ms` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: T.white }}>Reserva #{id}</p>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: T.fog }}>{r.created_at ? new Date(r.created_at).toLocaleDateString('es-ES') : '—'}</p>
        </div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.6rem', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: sc.bg, color: sc.c, border: `1px solid ${sc.b}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {r.estado || 'Pendiente'}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 12, marginBottom: 14 }}>
        <ICell label="Pasajero"   value={r.nombre}    accent={T.white} />
        <ICell label="Ubicación"  value={r.ubicacion} />
        <ICell label="Asiento"    value={r.asiento}   accent={T.amber} />
        {r.tel && <ICell label="Teléfono" value={r.tel} />}
      </div>
      {(!estado || estado === 'pendiente') && (
        <div style={{ display: 'flex', gap: 8, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
          {[
            { label: 'Confirmar', fn: onConfirmar, bg: 'rgba(34,197,94,0.13)', color: T.green, icon: <FaCheck style={{ fontSize: '0.65rem' }} /> },
            { label: 'Rechazar',  fn: onRechazar,  bg: 'rgba(239,68,68,0.1)',  color: T.red,   icon: <FaTimes style={{ fontSize: '0.65rem' }} /> },
          ].map(b => (
            <button key={b.label} onClick={b.fn} disabled={enProceso} style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', background: b.bg, color: b.color, fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: enProceso ? 'not-allowed' : 'pointer', opacity: enProceso ? 0.5 : 1 }}>
              {enProceso ? <div style={{ width: 12, height: 12, border: `2px solid ${b.color}40`, borderTopColor: b.color, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : b.icon}
              {b.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Card: flota ───────────────────────────────────────────────────────────────
const FleetCard = ({ carro, onDelete, onAsignar, idx }) => {
  const s        = getS(carro.id_estados);
  const inactive = [4, 5].includes(parseInt(carro.id_estados));
  const imgSrc   = carro.imagencarro
    ? (carro.imagencarro.startsWith('http') ? carro.imagencarro : `http://localhost:8000${carro.imagencarro}`)
    : null;
  const precio = carro.precioviaje;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.3s ease both', animationDelay: `${idx * 50}ms` }}>
      {/* Photo */}
      <div style={{ position: 'relative', height: 120, background: T.surface2 }}>
        {imgSrc
          ? <img src={imgSrc} alt={carro.placa} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.72 }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCar style={{ fontSize: '2.5rem', color: T.muted }} /></div>
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(14,20,34,0.9) 0%,transparent 55%)' }} />
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, background: 'rgba(8,11,18,0.72)', backdropFilter: 'blur(4px)', border: `1px solid ${s.color}40`, fontFamily: 'Syne, sans-serif', fontSize: '0.6rem', fontWeight: 700, color: s.color, textTransform: 'uppercase' }}>
            {s.live && <LiveDot color={s.color} />}{s.label}
          </span>
        </div>
        <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em', color: '#fff', background: 'rgba(8,11,18,0.7)', backdropFilter: 'blur(4px)', borderRadius: 6, padding: '3px 8px', textTransform: 'uppercase' }}>
            {carro.placa || '—'}
          </span>
        </div>
      </div>

      <div style={{ padding: '12px 14px' }}>
        {precio
          ? <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.fog, marginBottom: 4 }}><FaMapMarkerAlt style={{ fontSize: '0.62rem', marginRight: 4 }} />{precio.origen} → {precio.destino}</p>
          : <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: T.muted, fontStyle: 'italic', marginBottom: 4 }}>Sin ruta asignada</p>
        }
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: T.muted, marginBottom: 12 }}>{carro.asientos} asientos{carro.horasalida ? ` · ${carro.horasalida}` : ''}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onDelete} style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid rgba(239,68,68,0.2)`, background: 'rgba(239,68,68,0.07)', color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <FaTrash style={{ fontSize: '0.65rem' }} />
          </button>
          {inactive && (
            <button onClick={onAsignar} style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#C8960C,#FFBE00)', color: '#080B12', fontFamily: 'Syne, sans-serif', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
              <FaRoute style={{ fontSize: '0.62rem' }} /> Asignar viaje
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Card: historial ───────────────────────────────────────────────────────────
const HistorialCard = ({ r, resId, ruta, nombre, isExpanded, ratingDraft, calificandoPasajeroId, onExpandRating, onCollapseRating, onSetStars, onSetComment, onCalificar, idx }) => {
  const precio  = r.carro?.precioviaje;
  const ingreso = parseFloat(precio?.precio ?? 0);
  const LABELS  = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'];
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.muted}`, borderRadius: '0 14px 14px 0', padding: '16px 20px', animation: 'fadeUp 0.3s ease both', animationDelay: `${idx * 50}ms` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: T.white, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaRoad style={{ color: T.fog, fontSize: '0.72rem' }} />{ruta}
          </p>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: T.fog }}>{r.carro?.placa} · {fmtD(r.updated_at?.split('T')[0])} · {r.carro?.horasalida || '—'}</p>
          {ingreso > 0 && <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: T.green, marginTop: 3 }}>+{fmtM(ingreso)}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontSize: '0.7rem', fontWeight: 800, color: T.fog }}>
              {nombre[0]?.toUpperCase()}
            </div>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.fog }}>{nombre}</span>
          </div>
          {r.calificacion != null && (
            <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(n => <FaStar key={n} style={{ fontSize: '0.72rem', color: n <= r.calificacion ? T.amber : T.muted }} />)}</div>
          )}
          {r.calificacion_conductor != null
            ? <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(n => <FaStar key={n} style={{ fontSize: '0.72rem', color: n <= r.calificacion_conductor ? '#f97316' : T.muted }} />)}</div>
            : !isExpanded && (
              <button onClick={onExpandRating} style={{ padding: '5px 12px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${T.amberBorder}`, background: T.amberGlow, color: T.amber, fontFamily: 'Syne, sans-serif', fontSize: '0.62rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                <FaStar style={{ fontSize: '0.58rem' }} /> Calificar
              </button>
            )
          }
        </div>
      </div>

      {isExpanded && r.calificacion_conductor == null && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 6 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => onSetStars(n)} style={{ fontSize: '1.4rem', background: 'none', border: 'none', cursor: 'pointer', color: n <= ratingDraft.stars ? T.amber : T.muted, transition: 'color 0.15s, transform 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              ><FaStar /></button>
            ))}
          </div>
          {ratingDraft.stars > 0 && <p style={{ textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: T.amber, marginBottom: 10 }}>{LABELS[ratingDraft.stars]}</p>}
          <textarea rows={2} maxLength={500} value={ratingDraft.comment} onChange={e => onSetComment(e.target.value)} placeholder="Comentario opcional…"
            style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px', color: T.white, resize: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onCollapseRating} style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: T.surface2, border: `1px solid ${T.border}`, color: T.fog, fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={onCalificar} disabled={ratingDraft.stars === 0 || calificandoPasajeroId === resId} style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#C8960C,#FFBE00)', color: '#080B12', fontFamily: 'Syne, sans-serif', fontSize: '0.78rem', fontWeight: 800, cursor: (ratingDraft.stars === 0 || calificandoPasajeroId === resId) ? 'not-allowed' : 'pointer', opacity: (ratingDraft.stars === 0 || calificandoPasajeroId === resId) ? 0.5 : 1 }}>
              {calificandoPasajeroId === resId ? 'Guardando…' : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const Conductor = () => {
  const [userData,       setUserData]       = useState(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [activeTab,      setActiveTab]      = useState('activos');

  const [showAddCar,      setShowAddCar]      = useState(false);
  const [showAsignar,     setShowAsignar]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [reservas,      setReservas]      = useState([]);
  const [carros,        setCarros]        = useState([]);
  const [rutas,         setRutas]         = useState([]);
  const [historial,     setHistorial]     = useState([]);
  const [carroToDelete, setCarroToDelete] = useState(null);
  const [carroAAsignar, setCarroAAsignar] = useState(null);

  const [dashCarros,   setDashCarros]   = useState([]);
  const [dashReservas, setDashReservas] = useState([]);
  const [loadingDash,  setLoadingDash]  = useState(true);

  const [loadingReservas,  setLoadingReservas]  = useState(false);
  const [loadingCarros,    setLoadingCarros]    = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [isSaving,         setIsSaving]         = useState(false);
  const [isDeleting,       setIsDeleting]       = useState(false);
  const [isAsignando,      setIsAsignando]      = useState(false);
  const [procesando,       setProcesando]       = useState(null);
  const [accionCarroId,    setAccionCarroId]    = useState(null);

  const [expandedRatingId,      setExpandedRatingId]      = useState(null);
  const [ratingDraft,           setRatingDraft]           = useState({ stars: 0, comment: '' });
  const [calificandoPasajeroId, setCalificandoPasajeroId] = useState(null);

  const [pageReservas,      setPageReservas]      = useState(1);
  const [lastPageReservas,  setLastPageReservas]  = useState(1);
  const [pageRUI,           setPageRUI]           = useState(1); // client-side page for reservas
  const [pageHistorial,     setPageHistorial]     = useState(1);
  const [lastPageHistorial, setLastPageHistorial] = useState(1);

  const [carData,   setCarData]   = useState({ Conductor: '', Placa: '', Telefono: '', Imagencarro: null });
  const [viajeData, setViajeData] = useState({ id_precioviaje: '', horasalida: '', fecha: '' });

  const { toast, showToast, hideToast } = useToast();
  const navigate      = useNavigate();
  const procesandoRef = useRef(null);
  const accionRef     = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { navigate('/login'); return; }
    try {
      const user = JSON.parse(stored);
      if (user.rol !== 'conductor' && user.rol !== 'admin') { navigate('/'); return; }
      setUserData(user);
    } catch { navigate('/login'); }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => { if (userData) loadDashboard(); }, [userData]);

  const loadDashboard = async () => {
    setLoadingDash(true);
    try {
      const [carsR, resR] = await Promise.all([misCarrosApi(), misReservasApi(1)]);
      setDashCarros(Array.isArray(carsR.data?.data) ? carsR.data.data : []);
      setDashReservas(Array.isArray(resR.data?.data) ? resR.data.data : []);
    } catch {}
    finally { setLoadingDash(false); }
  };

  const fetchRutas = async () => {
    if (rutas.length > 0) return;
    try { const { data } = await listarPreciosApi(); setRutas(Array.isArray(data.data) ? data.data : []); } catch {}
  };

  const fetchReservas = async (page = 1) => {
    setLoadingReservas(true);
    try {
      const { data } = await misReservasApi(page);
      setReservas(Array.isArray(data.data) ? data.data : []);
      setPageRUI(1);                              // reset client-side page on fresh fetch
      setPageReservas(data.current_page ?? 1);
      setLastPageReservas(data.last_page ?? 1);
    } catch { showToast('Error al cargar reservas.', 'error'); }
    finally { setLoadingReservas(false); }
  };

  const fetchCarros = async () => {
    setLoadingCarros(true);
    try { const { data } = await misCarrosApi(); setCarros(Array.isArray(data.data) ? data.data : []); }
    catch { showToast('Error al cargar vehículos.', 'error'); }
    finally { setLoadingCarros(false); }
  };

  const fetchHistorial = async (page = 1) => {
    setLoadingHistorial(true);
    try {
      const { data } = await historialConductorApi(page);
      setHistorial(Array.isArray(data.data) ? data.data : []);
      setPageHistorial(data.current_page ?? 1);
      setLastPageHistorial(data.last_page ?? 1);
    } catch { showToast('Error al cargar historial.', 'error'); }
    finally { setLoadingHistorial(false); }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'reservas'  && reservas.length === 0)  fetchReservas(1);
    if (tab === 'flota'     && carros.length === 0)    fetchCarros();
    if (tab === 'historial' && historial.length === 0) fetchHistorial(1);
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    const { Conductor, Placa, Telefono, Imagencarro } = carData;
    if (!Conductor || !Placa || !Telefono || !Imagencarro) { showToast('Completa todos los campos.', 'error'); return; }
    const nombreLogueado = userData?.Nombre || userData?.nombre || userData?.name || '';
    if (Conductor.trim().toLowerCase() !== nombreLogueado.toLowerCase()) { showToast('El nombre debe coincidir con tu cuenta.', 'error'); return; }
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('Conductor', Conductor.trim());
      fd.append('Telefono',  Telefono.trim());
      fd.append('Placa',     Placa.trim());
      fd.append('Imagencarro', await compressImage(Imagencarro));
      await crearCarroApi(fd);
      showToast('Vehículo registrado. Asígnale un viaje desde Mi Flota.', 'success');
      setCarData({ Conductor: '', Placa: '', Telefono: '', Imagencarro: null });
      setShowAddCar(false);
      await loadDashboard();
      if (activeTab === 'flota') await fetchCarros();
    } catch (err) {
      const errors = err.response?.data?.errors;
      showToast(String(errors ? Object.values(errors).flat()[0] : (err.response?.data?.message || 'Error al guardar.')), 'error');
    } finally { setIsSaving(false); }
  };

  const handleAsignarViaje = async (e) => {
    e.preventDefault();
    if (!carroAAsignar || !viajeData.id_precioviaje || !viajeData.horasalida || !viajeData.fecha) { showToast('Completa todos los campos.', 'error'); return; }
    setIsAsignando(true);
    try {
      await asignarViajeApi(carroAAsignar.id_carros || carroAAsignar.id, { id_precioviaje: parseInt(viajeData.id_precioviaje), horasalida: viajeData.horasalida, fecha: viajeData.fecha });
      showToast('¡Viaje asignado!', 'success');
      setShowAsignar(false); setCarroAAsignar(null);
      setViajeData({ id_precioviaje: '', horasalida: '', fecha: '' });
      await loadDashboard();
      if (activeTab === 'flota') await fetchCarros();
    } catch (err) { showToast(err.response?.data?.message || 'Error al asignar.', 'error'); }
    finally { setIsAsignando(false); }
  };

  const handleDeleteCarro = async () => {
    if (!carroToDelete) return;
    setIsDeleting(true);
    try {
      await eliminarCarroApi(carroToDelete.id_carros || carroToDelete.id);
      showToast('Vehículo eliminado.', 'success');
      setShowDeleteModal(false); setCarroToDelete(null);
      await fetchCarros(); await loadDashboard();
    } catch { showToast('Error al eliminar.', 'error'); }
    finally { setIsDeleting(false); }
  };

  const handleIniciarViaje = async (carroId) => {
    if (accionRef.current !== null) return;
    accionRef.current = carroId; setAccionCarroId(carroId);
    try { await iniciarViajeApi(carroId); showToast('¡Viaje iniciado!', 'success'); await loadDashboard(); }
    catch (err) { showToast(err.response?.data?.message || 'Error al iniciar.', 'error'); }
    finally { accionRef.current = null; setAccionCarroId(null); }
  };

  const handleTerminarViaje = async (carroId) => {
    if (accionRef.current !== null) return;
    accionRef.current = carroId; setAccionCarroId(carroId);
    try { await terminarViajeApi(carroId); showToast('Viaje finalizado.', 'success'); await loadDashboard(); }
    catch (err) { showToast(err.response?.data?.message || 'Error al finalizar.', 'error'); }
    finally { accionRef.current = null; setAccionCarroId(null); }
  };

  const cambiarEstadoReserva = async (reserva, estado) => {
    const id = reserva.id_reservarviajes || reserva.id_reservarviaje || reserva.id || reserva.ID;
    if (procesandoRef.current !== null) return;
    procesandoRef.current = id; setProcesando(id);
    try {
      await confirmarReservaApi(id, estado);
      showToast(estado === 'confirmada' ? 'Reserva confirmada.' : 'Operación exitosa.', 'success');
      await loadDashboard(); await fetchReservas(pageReservas);
    } catch { showToast('Error al actualizar.', 'error'); }
    finally { procesandoRef.current = null; setProcesando(null); }
  };

  const handleCalificarPasajero = async (reservaId) => {
    if (ratingDraft.stars === 0) return;
    setCalificandoPasajeroId(reservaId);
    try {
      await calificarPasajeroApi(reservaId, ratingDraft.stars, ratingDraft.comment);
      showToast('¡Pasajero calificado!', 'success');
      setExpandedRatingId(null); setRatingDraft({ stars: 0, comment: '' });
      await fetchHistorial(pageHistorial);
    } catch (err) { showToast(err.response?.data?.message || 'Error al calificar.', 'error'); }
    finally { setCalificandoPasajeroId(null); }
  };

  if (isLoading) return <LoadingScreen message="Cargando panel…" />;
  if (!userData)  return null;

  const nombre          = userData.Nombre || userData.nombre || userData.name || 'Conductor';
  const inicial         = nombre[0]?.toUpperCase() || 'C';
  const carrosActivos   = dashCarros.filter(c => ![4, 5].includes(parseInt(c.id_estados)));
  const carrosInactivos = dashCarros.filter(c => [4, 5].includes(parseInt(c.id_estados)));
  const pendientesCount = dashReservas.filter(r => r.estado?.toLowerCase() === 'pendiente').length;

  return (
    <>
      <style>{`
        @keyframes ping    { 0% { transform:scale(1);    opacity:.8; } 100% { transform:scale(2.5); opacity:0; } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.96); }      to { opacity:1; transform:scale(1); } }
        select option { background:#141D30; color:#EEF0FA; }
      `}</style>

      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />

      <div style={{ minHeight: '100vh', background: T.void, display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        {/* ── Hero band ── */}
        <div style={{
          borderBottom: `1px solid ${T.border}`, padding: '2rem 1.25rem 1.5rem',
          backgroundImage: `radial-gradient(ellipse 90% 55% at 50% -5%, rgba(255,190,0,0.07) 0%, transparent 65%), radial-gradient(rgba(255,190,0,0.035) 1px, transparent 1px)`,
          backgroundSize: 'auto, 28px 28px',
        }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Driver row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, background: T.amberGlow, border: `2px solid ${T.amberBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: T.amber, flexShrink: 0 }}>
                  {inicial}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: T.white, margin: 0 }}>{nombre}</h1>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.58rem', fontWeight: 700, color: T.amber, background: T.amberGlow, border: `1px solid ${T.amberBorder}`, borderRadius: 999, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Conductor</span>
                  </div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.fog, margin: 0 }}>Panel de despacho</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { setCarData(p => ({ ...p, Conductor: userData?.Nombre || userData?.nombre || userData?.name || '', Telefono: userData?.Telefono || userData?.telefono || '' })); setShowAddCar(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#C8960C,#FFBE00)', color: '#080B12', border: 'none', fontFamily: 'Syne, sans-serif', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  <FaPlus style={{ fontSize: '0.7rem' }} /> Nuevo vehículo
                </button>
                <button onClick={loadDashboard} disabled={loadingDash} style={{ width: 38, height: 38, borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, color: loadingDash ? T.amber : T.fog, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loadingDash ? 'default' : 'pointer' }}>
                  <FaSync style={{ fontSize: '0.8rem', animation: loadingDash ? 'spin 1s linear infinite' : 'none' }} />
                </button>
              </div>
            </div>
            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <StatChip value={carrosActivos.length}   label="En servicio"  color={T.green} loading={loadingDash} />
              <StatChip value={dashCarros.length}      label="Flota total"  color={T.amber} loading={loadingDash} />
              <StatChip value={pendientesCount}        label="Pendientes"   color={pendientesCount > 0 ? T.red : T.fog} loading={loadingDash} />
              <StatChip value={carrosInactivos.length} label="Inactivos"    color={T.fog}   loading={loadingDash} />
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '0.5rem 1.25rem', overflowX: 'auto' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 4 }}>
            {[
              { id: 'activos',   label: 'En servicio', icon: <FaBolt />,    badge: 0 },
              { id: 'reservas',  label: 'Reservas',    icon: <FaListAlt />, badge: pendientesCount },
              { id: 'flota',     label: 'Mi flota',    icon: <FaCar />,     badge: 0 },
              { id: 'historial', label: 'Historial',   icon: <FaRoad />,    badge: 0 },
            ].map(t => <TabBtn key={t.id} {...t} active={activeTab === t.id} onClick={handleTabChange} />)}
          </div>
        </div>

        {/* ── Content ── */}
        <main style={{ flex: 1, maxWidth: 1000, margin: '0 auto', width: '100%', padding: '1.75rem 1.25rem' }}>

          {activeTab === 'activos' && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              {loadingDash ? <Spinner /> : carrosActivos.length === 0 ? (
                <EmptyTab icon={<FaBolt style={{ fontSize: '2rem', color: T.muted }} />} title="Sin vehículos en servicio" desc="Registra un vehículo y asígnale una ruta para verlo aquí activo." action={{ label: 'Agregar vehículo', onClick: () => setShowAddCar(true) }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {carrosActivos.map((c, idx) => (
                    <ActiveVehicleCard key={c.id_carros || c.id} carro={c} dashReservas={dashReservas} accionCarroId={accionCarroId} procesando={procesando} onIniciar={handleIniciarViaje} onTerminar={handleTerminarViaje} onConfirmar={(r) => cambiarEstadoReserva(r, 'confirmada')} onRechazar={(r) => cambiarEstadoReserva(r, 'rechazada')} idx={idx} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reservas' && (() => {
            const lastPageR    = Math.ceil(reservas.length / RPER);
            const reservasPage = reservas.slice((pageRUI - 1) * RPER, pageRUI * RPER);
            return (
              <div style={{ animation: 'fadeUp 0.3s ease both' }}>
                {loadingReservas ? <Spinner /> : reservas.length === 0 ? (
                  <EmptyTab icon={<FaListAlt style={{ fontSize: '2rem', color: T.muted }} />} title="Sin reservas activas" desc="Las reservas de tus vehículos aparecerán aquí." />
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {reservasPage.map((r, idx) => {
                        const id = r.id_reservarviajes || r.id_reservarviaje || r.id || r.ID;
                        return <ReservaCard key={id ?? idx} r={r} id={id} enProceso={procesando === id} estado={r.estado?.toLowerCase()} onConfirmar={() => cambiarEstadoReserva(r, 'confirmada')} onRechazar={() => cambiarEstadoReserva(r, 'rechazada')} idx={idx} />;
                      })}
                    </div>
                    <DarkPagination
                      currentPage={pageRUI}
                      lastPage={lastPageR}
                      onPageChange={p => { setPageRUI(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      loading={loadingReservas}
                      total={reservas.length}
                      label="reservas"
                    />
                  </>
                )}
              </div>
            );
          })()}

          {activeTab === 'flota' && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              {loadingCarros ? <Spinner /> : carros.length === 0 ? (
                <EmptyTab icon={<FaCar style={{ fontSize: '2rem', color: T.muted }} />} title="Sin vehículos registrados" desc="Agrega tu primer vehículo para empezar." action={{ label: 'Agregar vehículo', onClick: () => setShowAddCar(true) }} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px,1fr))', gap: 16 }}>
                  {carros.map((c, idx) => (
                    <FleetCard key={c.id_carros || c.id} carro={c} idx={idx}
                      onDelete={() => { setCarroToDelete(c); setShowDeleteModal(true); }}
                      onAsignar={() => { setCarroAAsignar(c); setViajeData({ id_precioviaje: String(c.id_precioviaje || ''), horasalida: '', fecha: '' }); fetchRutas(); setShowAsignar(true); }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'historial' && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              {loadingHistorial ? <Spinner /> : historial.length === 0 ? (
                <EmptyTab icon={<FaRoad style={{ fontSize: '2rem', color: T.muted }} />} title="Sin viajes completados" desc="Aquí verás el historial de todos tus viajes terminados." />
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {historial.map((r, idx) => {
                      const resId  = r.id_reservarviajes ?? idx;
                      const precio = r.carro?.precioviaje;
                      const ruta   = precio ? `${precio.origen} → ${precio.destino}` : '—';
                      return (
                        <HistorialCard key={resId} r={r} resId={resId} ruta={ruta} nombre={r.usuario?.name || r.nombre || '—'} isExpanded={expandedRatingId === resId} ratingDraft={ratingDraft} calificandoPasajeroId={calificandoPasajeroId}
                          onExpandRating={() => { setExpandedRatingId(resId); setRatingDraft({ stars: 0, comment: '' }); }}
                          onCollapseRating={() => { setExpandedRatingId(null); setRatingDraft({ stars: 0, comment: '' }); }}
                          onSetStars={n => setRatingDraft(d => ({ ...d, stars: n }))}
                          onSetComment={c => setRatingDraft(d => ({ ...d, comment: c }))}
                          onCalificar={() => handleCalificarPasajero(resId)}
                          idx={idx}
                        />
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 24 }}>
                    <DarkPagination currentPage={pageHistorial} lastPage={lastPageHistorial} onPageChange={p => fetchHistorial(p)} loading={loadingHistorial} />
                  </div>
                </>
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* ── Modal: Agregar vehículo ── */}
      {showAddCar && (
        <DarkModal title="Registrar vehículo" onClose={() => setShowAddCar(false)}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.fog, marginBottom: 20 }}>Una vez creado, asígnale un viaje desde la pestaña Mi Flota.</p>
          <form onSubmit={handleAddCar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <DField label="Conductor" icon={<FaUser />}  value={carData.Conductor} onChange={e => setCarData(p => ({ ...p, Conductor: e.target.value }))} placeholder="Tu nombre" required />
              <DField label="Teléfono"  icon={<FaPhone />} value={carData.Telefono}  onChange={e => setCarData(p => ({ ...p, Telefono: e.target.value }))}  placeholder="300 000 0000" required />
            </div>
            <DField label="Placa" icon={<FaIdCard />} value={carData.Placa} onChange={e => setCarData(p => ({ ...p, Placa: e.target.value }))} placeholder="ABC-123" required />
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.6rem', fontWeight: 700, color: T.fog, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Imagen del vehículo</p>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.surface2, border: `1px dashed ${T.border}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer' }}>
                <FaCar style={{ color: T.fog, fontSize: '1rem' }} />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: carData.Imagencarro ? T.amber : T.fog }}>
                  {carData.Imagencarro ? carData.Imagencarro.name : 'Seleccionar imagen…'}
                </span>
                <input type="file" accept="image/*" required hidden onChange={e => setCarData(p => ({ ...p, Imagencarro: e.target.files[0] || null }))} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" onClick={() => setShowAddCar(false)} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, color: T.fog, fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={isSaving} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'linear-gradient(135deg,#C8960C,#FFBE00)', border: 'none', color: '#080B12', fontFamily: 'Syne, sans-serif', fontSize: '0.82rem', fontWeight: 800, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }}>
                {isSaving ? 'Guardando…' : 'Registrar vehículo'}
              </button>
            </div>
          </form>
        </DarkModal>
      )}

      {/* ── Modal: Asignar viaje ── */}
      {showAsignar && carroAAsignar && (
        <DarkModal title={`Asignar viaje · ${carroAAsignar.placa}`} onClose={() => { setShowAsignar(false); setCarroAAsignar(null); }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.fog, marginBottom: 20 }}>El vehículo pasará a "Esperando pasajeros" al guardar.</p>
          <form onSubmit={handleAsignarViaje} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <DSelect label="Ruta del viaje" icon={<FaMapMarkerAlt />} value={viajeData.id_precioviaje} onChange={e => setViajeData(p => ({ ...p, id_precioviaje: e.target.value }))} required>
              <option value="">Seleccionar ruta…</option>
              {rutas.map(r => { const rid = r.id_precioviajes || r.id; return <option key={rid} value={rid}>{r.origen} → {r.destino} (${Number(r.precio).toLocaleString('es-CO')})</option>; })}
            </DSelect>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <DField label="Hora de salida" icon={<FaClock />}      type="time" value={viajeData.horasalida} onChange={e => setViajeData(p => ({ ...p, horasalida: e.target.value }))} required />
              <DField label="Fecha"          icon={<FaCalendarAlt />} type="date" value={viajeData.fecha}     onChange={e => setViajeData(p => ({ ...p, fecha: e.target.value }))} min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" onClick={() => { setShowAsignar(false); setCarroAAsignar(null); }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, color: T.fog, fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={isAsignando} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'linear-gradient(135deg,#C8960C,#FFBE00)', border: 'none', color: '#080B12', fontFamily: 'Syne, sans-serif', fontSize: '0.82rem', fontWeight: 800, cursor: isAsignando ? 'not-allowed' : 'pointer', opacity: isAsignando ? 0.6 : 1 }}>
                {isAsignando ? 'Asignando…' : 'Asignar viaje'}
              </button>
            </div>
          </form>
        </DarkModal>
      )}

      {/* ── Modal: Eliminar vehículo ── */}
      {showDeleteModal && carroToDelete && (
        <DarkModal title="Eliminar vehículo" onClose={() => { setShowDeleteModal(false); setCarroToDelete(null); }}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FaTrash style={{ color: T.red, fontSize: '1.1rem' }} />
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: T.fog, marginBottom: 24 }}>
              ¿Eliminar el vehículo <strong style={{ color: T.white }}>{carroToDelete.placa}</strong>?<br />Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowDeleteModal(false); setCarroToDelete(null); }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, color: T.fog, fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleDeleteCarro} disabled={isDeleting} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'linear-gradient(135deg,#dc2626,#ef4444)', border: 'none', color: '#fff', fontFamily: 'Syne, sans-serif', fontSize: '0.82rem', fontWeight: 800, cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.6 : 1 }}>
                {isDeleting ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </DarkModal>
      )}
    </>
  );
};

export default Conductor;
