import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaUser, FaMapMarkerAlt, FaClock, FaCalendar,
  FaPhone, FaCheck, FaTimes, FaLocationArrow, FaSpinner,
  FaStar, FaRegStar, FaRoad, FaCar, FaArrowRight,
} from 'react-icons/fa';

import Navbar            from '../components/layout/Navbar';
import Footer            from '../components/layout/Footer';
import LoadingScreen     from '../components/ui/LoadingScreen';
import CarImage          from '../components/ui/CarImage';
import UserAvatar        from '../components/ui/UserAvatar';
import ToastNotification from '../components/ui/ToastNotification';
import { useToast }      from '../hooks/useToast';
import { crearReservaApi, listarCarrosApi, listarReservasApi, getConductorPerfilApi } from '../services/api';
import { getCarImageUrl, getEstadoInfo, formatFecha } from '../utils';
import './Home.css';

const MAX_SEATS = 4;

// ── Fila de estrellas ────────────────────────────────────────────────────────
const StarRow = ({ value }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(n =>
      n <= Math.round(value ?? 0)
        ? <FaStar key={n} style={{ color: '#FFBE00', fontSize: '0.72rem' }} />
        : <FaRegStar key={n} style={{ color: 'rgba(107,114,143,0.4)', fontSize: '0.72rem' }} />
    )}
  </span>
);

// ── Panel reutilizable ───────────────────────────────────────────────────────
const Panel = ({ title, icon, accent = '#FFBE00', children, noPadding = false }) => (
  <div style={{
    background: '#0E1422',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    overflow: 'hidden',
  }}>
    {title && (
      <div style={{
        padding: '13px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'linear-gradient(90deg, rgba(255,190,0,0.04) 0%, transparent 60%)',
      }}>
        {icon && <span style={{ color: accent, display: 'flex', alignItems: 'center', fontSize: '0.72rem' }}>{icon}</span>}
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#EEF0FA',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}>{title}</span>
      </div>
    )}
    <div style={noPadding ? {} : { padding: '18px' }}>{children}</div>
  </div>
);

// ── Fila de info ─────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, highlight }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <span style={{ color: '#FFBE00', fontSize: '0.7rem', flexShrink: 0, width: '14px', display: 'flex', justifyContent: 'center' }}>{icon}</span>
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#6B728F', flexShrink: 0, minWidth: '80px' }}>{label}</span>
    <span style={{
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '0.85rem',
      fontWeight: highlight ? 600 : 500,
      color: highlight ? '#EEF0FA' : 'rgba(238,240,250,0.8)',
      marginLeft: 'auto',
      textAlign: 'right',
    }}>{value}</span>
  </div>
);

// ── Input oscuro ─────────────────────────────────────────────────────────────
const DarkInput = ({ label, icon, value, onChange, placeholder, type = 'text', rightSlot, hint }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && (
        <label style={{
          display: 'block',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.7rem',
          fontWeight: 600,
          color: '#6B728F',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '6px',
        }}>{label}</label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '12px',
            color: focused ? '#FFBE00' : '#6B728F',
            fontSize: '0.7rem', pointerEvents: 'none',
            transition: 'color 0.15s',
          }}>{icon}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: icon ? '10px 12px 10px 32px' : '10px 12px',
            paddingRight: rightSlot ? '130px' : '12px',
            background: '#080B12',
            border: `1.5px solid ${focused ? 'rgba(255,190,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '10px',
            color: '#EEF0FA',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.85rem',
            outline: 'none',
            transition: 'border-color 0.15s',
            boxShadow: focused ? '0 0 0 3px rgba(255,190,0,0.06)' : 'none',
          }}
        />
        {rightSlot && (
          <div style={{ position: 'absolute', right: '6px' }}>{rightSlot}</div>
        )}
      </div>
      {hint && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: '#6B728F', marginTop: '4px', paddingLeft: '4px' }}>
          {hint}
        </p>
      )}
    </div>
  );
};

// ── Icono de asiento individual ──────────────────────────────────────────────
const SeatIcon = ({ number, state, onClick }) => {
  const [hov, setHov] = useState(false);
  const clickable = state === 'available' || state === 'selected';

  const styles = {
    available: {
      headBg: hov ? 'rgba(255,190,0,0.22)' : 'rgba(255,255,255,0.07)',
      headBorder: hov ? '#FFBE00' : 'rgba(255,255,255,0.1)',
      bodyBg: hov ? 'rgba(255,190,0,0.07)' : '#141D30',
      bodyBorder: hov ? '#FFBE00' : 'rgba(255,255,255,0.1)',
      color: hov ? '#FFBE00' : 'rgba(107,114,143,0.8)',
      labelColor: hov ? '#FFBE00' : 'rgba(107,114,143,0.5)',
      shadow: 'none',
      scale: hov ? 'scale(1.06)' : 'scale(1)',
    },
    selected: {
      headBg: 'rgba(255,190,0,0.3)',
      headBorder: '#FFBE00',
      bodyBg: 'rgba(255,190,0,0.1)',
      bodyBorder: '#FFBE00',
      color: '#FFBE00',
      labelColor: '#FFBE00',
      shadow: '0 0 14px rgba(255,190,0,0.22)',
      scale: 'scale(1.08)',
    },
    occupied: {
      headBg: 'rgba(239,68,68,0.18)',
      headBorder: 'rgba(239,68,68,0.4)',
      bodyBg: 'rgba(239,68,68,0.06)',
      bodyBorder: 'rgba(239,68,68,0.35)',
      color: 'rgba(239,68,68,0.65)',
      labelColor: 'rgba(239,68,68,0.5)',
      shadow: 'none',
      scale: 'scale(1)',
    },
    blocked: {
      headBg: 'rgba(255,255,255,0.03)',
      headBorder: 'rgba(255,255,255,0.05)',
      bodyBg: 'rgba(255,255,255,0.02)',
      bodyBorder: 'rgba(255,255,255,0.06)',
      color: 'rgba(255,255,255,0.12)',
      labelColor: 'rgba(255,255,255,0.1)',
      shadow: 'none',
      scale: 'scale(1)',
    },
    driver: {
      headBg: 'rgba(99,102,241,0.2)',
      headBorder: 'rgba(99,102,241,0.35)',
      bodyBg: 'rgba(99,102,241,0.07)',
      bodyBorder: 'rgba(99,102,241,0.3)',
      color: 'rgba(139,148,255,0.8)',
      labelColor: 'rgba(139,148,255,0.6)',
      shadow: 'none',
      scale: 'scale(1)',
    },
  }[state];

  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => clickable && setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={!clickable}
      title={
        state === 'driver'   ? 'Conductor' :
        state === 'occupied' ? `Asiento ${number} — ocupado` :
        state === 'blocked'  ? `Asiento ${number} — no disponible` :
        state === 'selected' ? `Asiento ${number} — seleccionado` :
        `Seleccionar asiento ${number}`
      }
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
        background: 'none', border: 'none', padding: '4px',
        cursor: clickable ? 'pointer' : 'not-allowed',
        transform: styles.scale,
        transition: 'transform 0.15s',
        outline: 'none',
        opacity: state === 'blocked' ? 0.35 : 1,
      }}
    >
      <div style={{
        width: '26px', height: '8px', borderRadius: '5px 5px 0 0',
        border: `1.5px solid ${styles.headBorder}`, borderBottom: 'none',
        background: styles.headBg, transition: 'all 0.15s',
      }} />
      <div style={{
        width: '48px', height: '48px', borderRadius: '10px',
        border: `2px solid ${styles.bodyBorder}`,
        background: styles.bodyBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: styles.color, transition: 'all 0.15s',
        boxShadow: styles.shadow,
      }}>
        {state === 'driver' ? (
          <svg viewBox="0 0 24 24" style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="8" strokeWidth="2"/>
            <circle cx="12" cy="12" r="2.5" strokeWidth="2"/>
            <line x1="12" y1="4" x2="12" y2="9.5" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="4.5" y1="16" x2="9" y2="13.2" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="19.5" y1="16" x2="15" y2="13.2" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        ) : state === 'occupied' ? (
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        ) : state === 'blocked' ? (
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9"/>
            <line x1="4.9" y1="4.9" x2="19.1" y2="19.1"/>
          </svg>
        ) : state === 'selected' ? (
          <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        ) : (
          <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{number}</span>
        )}
      </div>
      <span style={{
        fontSize: '9px', color: styles.labelColor,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: state === 'selected' ? 600 : 400,
        transition: 'color 0.15s', marginTop: '1px',
      }}>
        {state === 'driver' ? 'Conductor' : `Asiento ${number}`}
      </span>
    </button>
  );
};

// ── Mapa visual del taxi ─────────────────────────────────────────────────────
const TaxiSeatMap = ({ totalAsientos, asientosOcupados, selectedSeats, onToggle, onSelectAll, onOccupied }) => {
  const [btnHov, setBtnHov] = useState(false);
  const availableSeats = Array.from({ length: totalAsientos }, (_, i) => i + 1)
    .filter(n => !asientosOcupados.includes(n));
  const allSelected = availableSeats.length > 0 && availableSeats.every(n => selectedSeats.includes(n));
  const noneAvailable = availableSeats.length === 0;

  const getSeatState = (n) => {
    if (asientosOcupados.includes(n)) return 'occupied';
    if (n > totalAsientos)            return 'blocked';
    if (selectedSeats.includes(n))    return 'selected';
    return 'available';
  };

  const handleClick = (n) => {
    const s = getSeatState(n);
    if (s === 'occupied') { onOccupied(n); return; }
    if (s === 'blocked') return;
    onToggle(n);
  };

  const Divider = ({ faint }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0' }}>
      <div style={{ flex: 1, borderTop: `1px dashed rgba(255,255,255,${faint ? '0.04' : '0.07'})` }} />
      {[0,1,2].map(i => (
        <div key={i} style={{ width: '3px', height: '3px', borderRadius: '50%', background: `rgba(255,255,255,${faint ? '0.07' : '0.1'})` }} />
      ))}
      <div style={{ flex: 1, borderTop: `1px dashed rgba(255,255,255,${faint ? '0.04' : '0.07'})` }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* Seleccionar todos */}
      <button
        type="button"
        onClick={() => { if (allSelected) onSelectAll([]); else onSelectAll(availableSeats); }}
        onMouseEnter={() => !noneAvailable && setBtnHov(true)}
        onMouseLeave={() => setBtnHov(false)}
        disabled={noneAvailable}
        style={{
          width: '100%', padding: '9px 14px', borderRadius: '10px',
          border: allSelected
            ? '1.5px solid #FFBE00'
            : btnHov ? '1.5px solid rgba(255,190,0,0.55)' : '1.5px solid rgba(255,190,0,0.2)',
          background: allSelected
            ? 'rgba(255,190,0,0.1)'
            : noneAvailable ? 'rgba(255,255,255,0.02)'
            : btnHov ? 'rgba(255,190,0,0.06)' : 'rgba(255,190,0,0.03)',
          color: noneAvailable ? 'rgba(107,114,143,0.35)' : '#FFBE00',
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600,
          cursor: noneAvailable ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          transition: 'all 0.15s',
        }}
      >
        {allSelected ? (
          <>
            <svg style={{ width: '13px', height: '13px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Deseleccionar todos
          </>
        ) : (
          <>
            <svg style={{ width: '13px', height: '13px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Reservar todos disponibles
            {availableSeats.length > 0 && (
              <span style={{
                background: 'rgba(255,190,0,0.18)', color: '#FFBE00',
                fontSize: '0.68rem', fontWeight: 700,
                padding: '1px 7px', borderRadius: '20px',
              }}>{availableSeats.length}</span>
            )}
          </>
        )}
      </button>

      {/* Contenedor del vehículo */}
      <div style={{
        background: 'rgba(8,11,18,0.7)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '14px', padding: '18px 24px', userSelect: 'none',
      }}>
        {/* Frente */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', justifyContent: 'center' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(107,114,143,0.45)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>Frente</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Fila delantera */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '28px' }}>
          <SeatIcon number={0} state="driver" onClick={() => {}} />
          <SeatIcon number={1} state={getSeatState(1)} onClick={() => handleClick(1)} />
        </div>

        <Divider />

        {/* Fila trasera */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '10px' }}>
          <SeatIcon number={2} state={getSeatState(2)} onClick={() => handleClick(2)} />
          <SeatIcon number={3} state={getSeatState(3)} onClick={() => handleClick(3)} />
          <SeatIcon number={4} state={getSeatState(4)} onClick={() => handleClick(4)} />
        </div>

        {/* Asiento 5 */}
        {MAX_SEATS >= 5 && (
          <>
            <Divider faint />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <SeatIcon number={5} state={getSeatState(5)} onClick={() => handleClick(5)} />
            </div>
          </>
        )}

        {/* Parte trasera */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px', justifyContent: 'center' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(107,114,143,0.45)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>Parte trasera</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', justifyContent: 'center', padding: '2px 0' }}>
        {[
          { bg: '#141D30', border: 'rgba(255,255,255,0.1)', label: 'Disponible' },
          { bg: 'rgba(255,190,0,0.1)', border: '#FFBE00', label: 'Tus asientos' },
          { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.35)', label: 'Ocupado' },
        ].map(({ bg, border, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: 'rgba(107,114,143,0.65)', fontFamily: "'DM Sans', sans-serif" }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', border: `1.5px solid ${border}`, background: bg, display: 'inline-block', flexShrink: 0 }} />
            {label}
          </span>
        ))}
      </div>

    </div>
  );
};

// ── Componente principal ─────────────────────────────────────────────────────
const VerDetalles = () => {
  const [userData,         setUserData]         = useState(null);
  const [isLoading,        setIsLoading]        = useState(true);
  const [carDetails,       setCarDetails]       = useState(null);
  const [selectedSeats,    setSelectedSeats]    = useState([]);
  const [pickupLocation,   setPickupLocation]   = useState('');
  const [nombre,           setNombre]           = useState('');
  const [telefono,         setTelefono]         = useState('');
  const [asientosOcupados, setAsientosOcupados] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isReserving,      setIsReserving]      = useState(false);
  const [showSuccess,      setShowSuccess]      = useState(false);
  const [locLoading,       setLocLoading]       = useState(false);
  const [conductorPerfil,  setConductorPerfil]  = useState(null);
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();
  const { carId } = useParams();

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { navigate('/login'); return; }
    try {
      const user = JSON.parse(stored);
      if (user.rol === 'conductor') { navigate('/conductor', { replace: true }); return; }
      setUserData(user);
      setNombre(user.Nombre || user.nombre || user.name || '');
      setTelefono(user.Telefono || user.telefono || user.tel || '');
    } catch { navigate('/login'); return; }

    const loadAll = async () => {
      try {
        const [carrosData, reservasData] = await Promise.all([listarCarrosApi(), listarReservasApi()]);
        const carrosArray = Array.isArray(carrosData) ? carrosData : (carrosData?.data ?? []);
        const car = carrosArray.find(c => (c.id_carros || c.id || c.ID) == carId);
        if (!car) { setIsLoading(false); return; }

        const ra = Array.isArray(reservasData) ? reservasData : (reservasData?.data ?? []);
        const ACTIVOS = ['pendiente', 'confirmada'];
        const ocupados = ra
          .filter(r => r.id_carros == carId && ACTIVOS.includes((r.estado || '').toLowerCase()))
          .map(r => parseInt(r.Asiento || r.asiento || 0))
          .filter(n => n > 0);
        setAsientosOcupados(ocupados);

        const conductorUserId = car.id_users || car.Userid || car.userid || null;
        setCarDetails({
          id_carros:   car.id_carros  || car.id,
          conductor:   car.conductor  || car.Conductor,
          placa:       car.placa      || car.Placa,
          asientos:    parseInt(car.asientos || car.Asientos) || 4,
          origen:      car.precioviaje?.origen  || '',
          destino:     car.precioviaje?.destino || '',
          precio:      car.precioviaje?.precio  ?? null,
          horasalida:  car.horasalida || car.Horasalida,
          fecha:       car.fecha      || car.Fecha,
          imagencarro: car.imagencarro || car.Imagencarro,
          telefono:    car.telefono   || car.Telefono || 'No disponible',
          id_estados:  car.id_estados || car.estado   || car.Estado,
          id_users:    conductorUserId,
        });

        if (conductorUserId) {
          getConductorPerfilApi(conductorUserId)
            .then(res => { if (res?.data) setConductorPerfil(res.data); })
            .catch(() => {});
        }
      } catch {
        // silencioso
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, [carId, navigate]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) { showToast('Tu navegador no soporta geolocalización.', 'error'); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`,
            { headers: { 'Accept-Language': 'es' } }
          );
          const data = await res.json();
          setPickupLocation(data.display_name || `${coords.latitude}, ${coords.longitude}`);
        } catch {
          setPickupLocation(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        setLocLoading(false);
        const msgs = { 1: 'Permiso de ubicación denegado.', 2: 'No se pudo obtener tu ubicación.', 3: 'Tiempo de espera agotado.' };
        showToast(msgs[err.code] || 'Error al obtener ubicación.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirm = () => {
    if (!userData)                                    { navigate('/login'); return; }
    if (selectedSeats.length === 0)                   { showToast('Selecciona al menos un asiento.', 'error'); return; }
    if (!pickupLocation.trim())                       { showToast('Ingresa tu ubicación de recogida.', 'error'); return; }
    if (pickupLocation.trim().length < 10)            { showToast('La ubicación debe tener al menos 10 caracteres.', 'error'); return; }
    if (!nombre.trim())                               { showToast('Ingresa tu nombre.', 'error'); return; }
    if (!telefono.trim())                             { showToast('Ingresa tu teléfono.', 'error'); return; }
    if (carDetails.asientos - asientosOcupados.length <= 0) { showToast('No hay asientos disponibles.', 'error'); return; }
    const userId = userData.id || userData.id_users || userData.ID || userData.user_id || userData.userId;
    if (!userId) { showToast('Error de sesión. Inicia sesión nuevamente.', 'error'); navigate('/login'); return; }
    setShowConfirmation(true);
  };

  const handleReserve = async () => {
    setIsReserving(true);
    const carroId = carDetails.id_carros || carId;
    try {
      await Promise.all(
        selectedSeats.map(seat =>
          crearReservaApi({ Nombre: nombre.trim(), Ubicacion: pickupLocation.trim(), Asiento: seat, id_carros: carroId, Telefono: telefono.trim() })
        )
      );
      setShowConfirmation(false);
      setShowSuccess(true);
      setTimeout(() => navigate('/indexLogin'), 3000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al reservar. Inténtalo de nuevo.', 'error');
    } finally {
      setIsReserving(false);
    }
  };

  if (isLoading) return <LoadingScreen message="Cargando detalles del viaje…" />;

  if (!userData || !carDetails) return (
    <div className="home-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,190,0,0.08)', border: '1px solid rgba(255,190,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', color: '#FFBE00' }}>
          <FaCar />
        </div>
        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#EEF0FA', marginBottom: '12px' }}>
          {!userData ? 'Error de autenticación' : 'No se encontró el viaje'}
        </p>
        <button onClick={() => navigate(-1)} style={{
          padding: '8px 24px', background: 'rgba(255,190,0,0.08)',
          border: '1px solid rgba(255,190,0,0.25)', borderRadius: '10px',
          color: '#FFBE00', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem',
        }}>Volver</button>
      </div>
    </div>
  );

  const totalAsientos  = carDetails.asientos;
  const disponibles    = totalAsientos - asientosOcupados.length;
  const estadoInfo     = getEstadoInfo(carDetails.id_estados);
  const enViaje        = parseInt(carDetails.id_estados) === 2;
  const viajeTerminado = parseInt(carDetails.id_estados) === 5;
  const estadoBadge    = { 1: 'badge-green', 2: 'badge-amber', 3: 'badge-orange', 4: 'badge-red', 5: 'badge-gray' }[parseInt(carDetails.id_estados)] || 'badge-gray';
  const isFormComplete = !enViaje && !viajeTerminado && selectedSeats.length > 0
    && pickupLocation.trim() && nombre.trim() && telefono.trim() && disponibles > 0;

  const confirmRows = [
    ['Conductor',   carDetails.conductor],
    ['Destino',     carDetails.destino],
    ['Fecha',       formatFecha(carDetails.fecha)],
    ['Hora',        carDetails.horasalida],
    ['Asiento(s)',  [...selectedSeats].sort((a,b)=>a-b).map(n=>`#${n}`).join(', ')],
    ['Pasajero',    nombre],
    ['Teléfono',    telefono],
    ['Recogida',    pickupLocation],
    ...(carDetails.precio !== null ? [['Total', `$${Number(carDetails.precio * selectedSeats.length).toLocaleString('es-CO')}`]] : []),
  ];

  return (
    <div className="home-page" style={{ minHeight: '100vh' }}>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />
      <Navbar title="Detalles del viaje" />

      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '24px 16px 60px', width: '100%' }}>

        {/* ── Header de la página ── */}
        <div className="animate-fade-in-up" style={{
          background: '#0E1422',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
          padding: '24px 28px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Ruta */}
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 800, color: '#EEF0FA', letterSpacing: '-0.02em' }}>
                {carDetails.origen || '—'}
              </span>
              <FaArrowRight style={{ color: '#FFBE00', fontSize: '0.8rem', flexShrink: 0 }} />
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 800, color: '#EEF0FA', letterSpacing: '-0.02em' }}>
                {carDetails.destino}
              </span>
            </div>
          </div>

          {/* Badges y stats */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span className={estadoBadge} style={{ fontSize: '0.72rem', padding: '5px 12px', borderRadius: '20px', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
              {estadoInfo.label}
            </span>
            <span style={{
              fontSize: '0.72rem', padding: '5px 12px', borderRadius: '20px',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              background: 'rgba(6,9,16,0.82)',
              color: disponibles > 0 ? '#22c55e' : '#ef4444',
              border: `1px solid ${disponibles > 0 ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
              backdropFilter: 'blur(6px)',
            }}>
              {disponibles > 0 ? `${disponibles} libre${disponibles !== 1 ? 's' : ''}` : 'Sin asientos'}
            </span>
            {carDetails.precio !== null && (
              <span style={{
                fontSize: '0.9rem', padding: '4px 14px', borderRadius: '20px',
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                background: 'rgba(255,190,0,0.1)',
                color: '#FFBE00',
                border: '1px solid rgba(255,190,0,0.3)',
              }}>
                ${Number(carDetails.precio).toLocaleString('es-CO')}
              </span>
            )}
          </div>
        </div>

        {/* ── Cuadrícula principal ── */}
        <div className="vd-grid">

          {/* ── Columna izquierda (info) ── */}
          <div className="vd-col-left" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Imagen del carro */}
            <div className="animate-fade-in-up" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', animationDelay: '60ms' }}>
              <CarImage
                imageUrl={getCarImageUrl(carDetails.imagencarro)}
                conductorName={carDetails.conductor}
                className="vd-car-img"
                fallbackClassName="vd-car-fallback"
                fallbackIconSize="text-6xl"
              />
            </div>

            {/* Conductor */}
            <div className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
              <Panel title="Conductor" icon={<FaUser />}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0 }}>
                    <UserAvatar
                      userData={{ fotoperfil: conductorPerfil?.fotoperfil ?? null, name: carDetails.conductor }}
                      size="xl"
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#EEF0FA', marginBottom: '2px' }}>
                      {carDetails.conductor}
                    </p>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#EEF0FA', marginBottom: '10px' }}>
                      {carDetails.placa}
                    </p>

                    {/* Estrellas */}
                    {conductorPerfil ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <StarRow value={conductorPerfil.promedio_estrellas ?? 0} />
                          {conductorPerfil.promedio_estrellas != null ? (
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: '#FFBE00' }}>
                              {Number(conductorPerfil.promedio_estrellas).toFixed(1)}
                            </span>
                          ) : (
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: '#6B728F' }}>Sin calificaciones</span>
                          )}
                          {conductorPerfil.total_calificaciones > 0 && (
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: '#6B728F' }}>
                              ({conductorPerfil.total_calificaciones})
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FaRoad style={{ color: '#FFBE00', fontSize: '0.62rem' }} />
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: 'rgba(238,240,250,0.7)' }}>
                            {conductorPerfil.total_viajes} {conductorPerfil.total_viajes === 1 ? 'viaje' : 'viajes'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                        {[1,2,3,4,5].map(n => <FaRegStar key={n} style={{ color: 'rgba(107,114,143,0.25)', fontSize: '0.72rem' }} />)}
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: 'rgba(107,114,143,0.4)', marginLeft: '4px' }}>Cargando…</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'rgba(238,240,250,0.7)' }}>
                        <FaPhone style={{ color: '#FFBE00', fontSize: '0.65rem' }} />
                        {carDetails.telefono}
                      </span>
                      {carDetails.id_users && (
                        <button
                          type="button"
                          onClick={() => navigate(`/usuario/${carDetails.id_users}`)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', fontWeight: 600,
                            color: '#FFBE00', textDecoration: 'underline', textUnderlineOffset: '3px',
                            padding: 0,
                          }}
                        >
                          Ver perfil completo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Panel>
            </div>

            {/* Detalles del viaje */}
            <div className="animate-fade-in-up" style={{ animationDelay: '180ms' }}>
              <Panel title="Detalles del viaje" icon={<FaMapMarkerAlt />}>
                <InfoRow icon={<FaMapMarkerAlt />} label="Origen"    value={carDetails.origen || 'No especificado'} highlight />
                <InfoRow icon={<FaMapMarkerAlt />} label="Destino"   value={carDetails.destino} highlight />
                <InfoRow icon={<FaCalendar />}     label="Fecha"     value={formatFecha(carDetails.fecha)} highlight />
                <InfoRow icon={<FaClock />}        label="Hora salida" value={carDetails.horasalida} highlight />
                <InfoRow
                  icon={<FaUser />}
                  label="Asientos"
                  value={`${disponibles} disponible${disponibles !== 1 ? 's' : ''} de ${totalAsientos}`}
                  highlight={disponibles > 0}
                />
              </Panel>
            </div>

            {/* Precio */}
            {carDetails.precio !== null && (
              <div className="animate-fade-in-up" style={{ animationDelay: '240ms' }}>
                <Panel title="Precio por pasajero" icon={<FaRoad />} accent="#22c55e">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: '#6B728F' }}>
                      {carDetails.origen} → {carDetails.destino}
                    </span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#22c55e', letterSpacing: '-0.03em' }}>
                      ${Number(carDetails.precio).toLocaleString('es-CO')}
                    </span>
                  </div>
                  {selectedSeats.length > 1 && (
                    <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#6B728F' }}>
                        Total ({selectedSeats.length} asientos)
                      </span>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 800, color: '#22c55e' }}>
                        ${Number(carDetails.precio * selectedSeats.length).toLocaleString('es-CO')}
                      </span>
                    </div>
                  )}
                </Panel>
              </div>
            )}
          </div>

          {/* ── Columna derecha (reserva) ── */}
          <div className="vd-col-right" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Banner viaje en curso */}
            {enViaje && (
              <div className="animate-fade-in-up" style={{
                background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: '14px', padding: '14px 16px',
                display: 'flex', gap: '12px', alignItems: 'flex-start',
              }}>
                <FaRoad style={{ color: '#60a5fa', fontSize: '1rem', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.82rem', fontWeight: 700, color: '#93c5fd', marginBottom: '4px' }}>Viaje en curso</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'rgba(147,197,253,0.7)' }}>
                    Este vehículo ya inició su recorrido. No es posible hacer nuevas reservas.
                  </p>
                </div>
              </div>
            )}

            {/* Banner viaje terminado */}
            {viajeTerminado && (
              <div className="animate-fade-in-up" style={{
                background: 'rgba(107,114,143,0.07)', border: '1px solid rgba(107,114,143,0.2)',
                borderRadius: '14px', padding: '14px 16px',
                display: 'flex', gap: '12px', alignItems: 'flex-start',
              }}>
                <FaRoad style={{ color: '#6B728F', fontSize: '1rem', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.82rem', fontWeight: 700, color: '#6B728F', marginBottom: '4px' }}>Viaje terminado</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'rgba(107,114,143,0.6)' }}>
                    Este viaje ya finalizó y no acepta reservas.
                  </p>
                </div>
              </div>
            )}

            {/* Selector de asientos */}
            <div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
              <Panel title="Selecciona tu asiento" icon={<FaCar />}>
                <TaxiSeatMap
                  totalAsientos={totalAsientos}
                  asientosOcupados={asientosOcupados}
                  selectedSeats={selectedSeats}
                  onToggle={seat =>
                    setSelectedSeats(prev =>
                      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
                    )
                  }
                  onSelectAll={seats => setSelectedSeats(seats)}
                  onOccupied={seat => showToast(`El asiento ${seat} ya está ocupado.`, 'error')}
                />
              </Panel>
            </div>

            {/* Datos del pasajero */}
            <div className="animate-fade-in-up" style={{ animationDelay: '160ms' }}>
              <Panel title="Tus datos" icon={<FaUser />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <DarkInput
                    label="Nombre completo"
                    icon={<FaUser />}
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                  />
                  <DarkInput
                    label="Teléfono"
                    icon={<FaPhone />}
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    placeholder="+57 300 000 0000"
                  />

                  {/* Ubicación de recogida */}
                  <DarkInput
                    label="Ubicación de recogida"
                    icon={<FaMapMarkerAlt />}
                    value={pickupLocation}
                    onChange={e => setPickupLocation(e.target.value)}
                    placeholder="Ej: Calle 50 #23-45, Barrio Centro"
                    hint={pickupLocation && pickupLocation.length > 60 ? pickupLocation.slice(0, 60) + '…' : ''}
                    rightSlot={
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={locLoading}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          padding: '6px 10px',
                          background: locLoading ? 'rgba(255,190,0,0.07)' : 'rgba(255,190,0,0.12)',
                          border: '1px solid rgba(255,190,0,0.3)',
                          borderRadius: '7px',
                          color: '#FFBE00',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          cursor: locLoading ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s',
                        }}
                      >
                        {locLoading
                          ? <><FaSpinner style={{ fontSize: '0.6rem', animation: 'spin 1s linear infinite' }} /> Buscando…</>
                          : <><FaLocationArrow style={{ fontSize: '0.6rem' }} /> Mi ubicación</>
                        }
                      </button>
                    }
                  />

                  {/* Botón confirmar */}
                  <button
                    onClick={handleConfirm}
                    disabled={!isFormComplete}
                    style={{
                      width: '100%', padding: '13px',
                      background: isFormComplete
                        ? 'linear-gradient(135deg, #FFBE00 0%, #f59e0b 100%)'
                        : 'rgba(255,255,255,0.04)',
                      border: isFormComplete
                        ? '1.5px solid rgba(255,190,0,0.5)'
                        : '1.5px solid rgba(255,255,255,0.07)',
                      borderRadius: '12px',
                      color: isFormComplete ? '#080B12' : 'rgba(107,114,143,0.5)',
                      fontFamily: "'Syne', sans-serif",
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: isFormComplete ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'all 0.2s',
                      boxShadow: isFormComplete ? '0 4px 20px rgba(255,190,0,0.25)' : 'none',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    <FaCheck style={{ fontSize: '0.75rem' }} />
                    {disponibles <= 0
                      ? 'Sin asientos disponibles'
                      : selectedSeats.length > 1
                        ? `Confirmar ${selectedSeats.length} asientos`
                        : 'Confirmar reserva'}
                  </button>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal de confirmación ── */}
      {showConfirmation && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
            background: 'rgba(8,11,18,0.88)', backdropFilter: 'blur(8px)',
          }}
          onClick={e => e.target === e.currentTarget && setShowConfirmation(false)}
        >
          <div style={{
            background: '#0E1422',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '20px', width: '100%', maxWidth: '440px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}>
            {/* Header modal */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(255,190,0,0.1) 0%, rgba(255,190,0,0.04) 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,190,0,0.12)', border: '1px solid rgba(255,190,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFBE00', fontSize: '0.8rem' }}>
                  <FaCheck />
                </div>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#EEF0FA' }}>
                  Confirmar reserva
                </span>
              </div>
              <button
                onClick={() => setShowConfirmation(false)}
                style={{ background: 'none', border: 'none', color: '#6B728F', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '4px' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Filas de detalle */}
            <div style={{ padding: '8px 20px' }}>
              {confirmRows.map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#6B728F', flexShrink: 0 }}>{label}</span>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 600,
                    color: label === 'Total' ? '#22c55e' : '#EEF0FA',
                    textAlign: 'right', maxWidth: '220px', wordBreak: 'break-word',
                  }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Botones */}
            <div style={{ padding: '16px 20px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isReserving}
                style={{
                  flex: 1, padding: '11px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', color: '#6B728F',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.83rem', fontWeight: 600,
                  cursor: isReserving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.15s',
                }}
              >
                <FaTimes style={{ fontSize: '0.7rem' }} /> Cancelar
              </button>
              <button
                onClick={handleReserve}
                disabled={isReserving}
                style={{
                  flex: 1, padding: '11px',
                  background: 'linear-gradient(135deg, #FFBE00 0%, #f59e0b 100%)',
                  border: 'none', borderRadius: '10px',
                  color: '#080B12',
                  fontFamily: "'Syne', sans-serif", fontSize: '0.83rem', fontWeight: 800,
                  cursor: isReserving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.15s',
                  opacity: isReserving ? 0.75 : 1,
                }}
              >
                {isReserving ? (
                  <>
                    <svg style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Reservando…
                  </>
                ) : (
                  <><FaCheck style={{ fontSize: '0.7rem' }} /> Confirmar</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de éxito ── */}
      {showSuccess && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          background: 'rgba(8,11,18,0.92)', backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            background: '#0E1422',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '20px', width: '100%', maxWidth: '380px',
            padding: '36px 28px', textAlign: 'center',
            boxShadow: '0 0 60px rgba(34,197,94,0.08)',
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#22c55e', fontSize: '1.6rem',
            }}>
              <FaCheck />
            </div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#EEF0FA', marginBottom: '10px', letterSpacing: '-0.02em' }}>
              ¡Reserva creada!
            </h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#6B728F', marginBottom: '20px', lineHeight: 1.6 }}>
              Tu reserva está pendiente de confirmación por el conductor. Te notificaremos cuando sea aprobada.
            </p>
            <div style={{
              padding: '8px 16px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px',
              display: 'inline-block',
            }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: 'rgba(107,114,143,0.6)' }}>
                Redirigiendo en unos segundos…
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default VerDetalles;
