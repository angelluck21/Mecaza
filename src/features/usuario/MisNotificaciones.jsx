import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheck, FaTrash, FaInbox } from 'react-icons/fa';

import Navbar            from '../../components/layout/Navbar';
import Footer            from '../../components/layout/Footer';
import DarkPagination    from '../../components/ui/DarkPagination';
import ToastNotification from '../../components/ui/ToastNotification';
import { useToast }      from '../../hooks/useToast';
import {
  misNotificacionesApi,
  marcarLeidaApi,
  marcarTodasLeidasApi,
  eliminarTodasNotificacionesApi,
} from '../../services/api';

// ── Design tokens ──────────────────────────────────────────────────────────────
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
  red:         '#ef4444',
};

const TIPO = {
  info:    { color: '#6366f1', label: 'Info'   },
  success: { color: '#22c55e', label: 'Éxito'  },
  warning: { color: '#FFBE00', label: 'Aviso'  },
  error:   { color: '#ef4444', label: 'Alerta' },
};
const getTipo = (t) => TIPO[t] ?? TIPO.info;

const fmtFecha = (ts) => {
  if (!ts) return '';
  const d    = new Date(ts);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000)       return 'Ahora mismo';
  if (diff < 3_600_000)    return `Hace ${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000)   return `Hace ${Math.floor(diff / 3_600_000)} h`;
  if (diff < 604_800_000)  return `Hace ${Math.floor(diff / 86_400_000)} días`;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Atoms ──────────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
    <div style={{ width: 30, height: 30, border: `3px solid ${T.muted}`, borderTopColor: T.amber, borderRadius: '50%', animation: 'nSpin 0.8s linear infinite' }} />
  </div>
);

const FilterPill = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
      border:      `1px solid ${active ? T.amberBorder : T.border}`,
      background:  active ? T.amberGlow : 'transparent',
      color:       active ? T.amber : T.fog,
      fontFamily:  'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600,
      transition:  'all 0.18s',
    }}
  >
    {children}
  </button>
);

// ── NotifCard ──────────────────────────────────────────────────────────────────
const NotifCard = ({ n, onMarcar, marcando, idx }) => {
  const tipo     = getTipo(n.tipo);
  const isUnread = !n.leida;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background:   T.surface,
        border:       `1px solid ${isUnread ? 'rgba(255,255,255,0.1)' : T.border}`,
        borderLeft:   `4px solid ${isUnread ? tipo.color : T.muted}`,
        borderRadius: '0 16px 16px 0',
        padding:      '18px 22px',
        display:      'flex',
        alignItems:   'flex-start',
        gap:          14,
        animation:    'nFadeUp 0.3s ease both',
        animationDelay: `${idx * 45}ms`,
        opacity:      isUnread ? 1 : 0.65,
        transition:   'opacity 0.2s, border-color 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Dot indicador */}
      <div style={{
        width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 5,
        background: isUnread ? tipo.color : T.muted,
        boxShadow:  isUnread ? `0 0 8px ${tipo.color}70` : 'none',
        transition: 'all 0.3s',
      }} />

      {/* Cuerpo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Fila superior: título + badge tipo + fecha */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p style={{
              fontFamily: 'Syne, sans-serif', fontSize: '0.88rem',
              fontWeight: isUnread ? 700 : 500,
              color:      isUnread ? T.white : T.fog,
              margin: 0,
            }}>
              {n.titulo}
            </p>
            <span style={{
              fontFamily:    'Syne, sans-serif', fontSize: '0.55rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.07em',
              padding: '2px 8px', borderRadius: 999,
              color:      tipo.color,
              background: `${tipo.color}18`,
              border:     `1px solid ${tipo.color}30`,
            }}>
              {tipo.label}
            </span>
          </div>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.63rem', color: T.muted, flexShrink: 0, marginTop: 2 }}>
            {fmtFecha(n.created_at)}
          </span>
        </div>

        {/* Mensaje */}
        {n.mensaje && (
          <p style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', lineHeight: 1.6,
            color: isUnread ? 'rgba(238,240,250,0.75)' : T.fog,
            margin: 0,
          }}>
            {n.mensaje}
          </p>
        )}

        {/* Acción marcar leída */}
        {isUnread && (hovered || marcando === n.id) && (
          <button
            onClick={() => onMarcar(n.id)}
            disabled={marcando === n.id}
            style={{
              marginTop: 10, display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: `1px solid ${T.border}`, borderRadius: 7,
              padding: '4px 10px', cursor: marcando === n.id ? 'not-allowed' : 'pointer',
              color: T.fog, fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', fontWeight: 500,
              opacity: marcando === n.id ? 0.5 : 1, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.amberBorder; e.currentTarget.style.color = T.amber; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border;      e.currentTarget.style.color = T.fog; }}
          >
            {marcando === n.id
              ? <div style={{ width: 10, height: 10, border: `2px solid ${T.amber}40`, borderTopColor: T.amber, borderRadius: '50%', animation: 'nSpin 0.8s linear infinite' }} />
              : <FaCheck style={{ fontSize: '0.55rem' }} />
            }
            {marcando === n.id ? 'Marcando…' : 'Marcar como leída'}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main ───────────────────────────────────────────────────────────────────────
const MisNotificaciones = () => {
  const [notifs,          setNotifs]          = useState([]);
  const [page,            setPage]            = useState(1);
  const [lastPage,        setLastPage]        = useState(1);
  const [total,           setTotal]           = useState(0);
  const [loading,         setLoading]         = useState(true);
  const [filtro,          setFiltro]          = useState('todas'); // 'todas' | 'no_leidas'
  const [marcando,        setMarcando]        = useState(null);
  const [marcandoTodas,   setMarcandoTodas]   = useState(false);
  const [eliminando,      setEliminando]      = useState(false);
  const [confirmDelete,   setConfirmDelete]   = useState(false);

  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { navigate('/login'); return; }
    try { JSON.parse(stored); } catch { navigate('/login'); }
  }, [navigate]);

  const fetchPage = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await misNotificacionesApi(p);
      setNotifs(Array.isArray(data.data) ? data.data : []);
      setPage(data.current_page ?? 1);
      setLastPage(data.last_page ?? 1);
      setTotal(data.total ?? 0);
    } catch {
      showToast('Error al cargar notificaciones.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(1); }, [fetchPage]);

  // ── Handlers ──
  const handleMarcar = async (id) => {
    setMarcando(id);
    try {
      await marcarLeidaApi(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    } catch { showToast('Error al marcar.', 'error'); }
    finally { setMarcando(null); }
  };

  const handleMarcarTodas = async () => {
    setMarcandoTodas(true);
    try {
      await marcarTodasLeidasApi();
      setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
      showToast('Todas marcadas como leídas.', 'success');
    } catch { showToast('Error al marcar.', 'error'); }
    finally { setMarcandoTodas(false); }
  };

  const handleEliminarTodas = async () => {
    setEliminando(true);
    setConfirmDelete(false);
    try {
      await eliminarTodasNotificacionesApi();
      setNotifs([]); setTotal(0); setLastPage(1); setPage(1);
      showToast('Notificaciones eliminadas.', 'success');
    } catch { showToast('Error al eliminar.', 'error'); }
    finally { setEliminando(false); }
  };

  // ── Derived ──
  const notifsFiltradas = filtro === 'no_leidas' ? notifs.filter(n => !n.leida) : notifs;
  const noLeidasCount   = notifs.filter(n => !n.leida).length;

  return (
    <>
      <style>{`
        @keyframes nSpin   { to { transform: rotate(360deg); } }
        @keyframes nFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes nScale  { from { opacity:0; transform:scale(0.95); }     to { opacity:1; transform:scale(1); }  }
      `}</style>

      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />

      <div style={{ minHeight: '100vh', background: T.void, display: 'flex', flexDirection: 'column' }}>
        <Navbar title="Notificaciones" />

        {/* ── Hero band ── */}
        <div style={{
          borderBottom: `1px solid ${T.border}`,
          padding: '2rem 1.25rem 1.5rem',
          background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,190,0,0.06) 0%, transparent 70%)`,
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>

              {/* Título */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: T.amberGlow, border: `1px solid ${T.amberBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaBell style={{ fontSize: '1.25rem', color: T.amber }} />
                </div>
                <div>
                  <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: T.white, margin: 0, lineHeight: 1.1 }}>
                    Notificaciones
                  </h1>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: T.fog, marginTop: 4, margin: 0 }}>
                    {total > 0
                      ? <>{total} en total{noLeidasCount > 0 ? <> · <strong style={{ color: T.amber }}>{noLeidasCount} sin leer</strong></> : null}</>
                      : 'Sin notificaciones'
                    }
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: 8 }}>
                {noLeidasCount > 0 && (
                  <button
                    onClick={handleMarcarTodas}
                    disabled={marcandoTodas}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 9,
                      border: `1px solid ${T.amberBorder}`, background: T.amberGlow,
                      color: T.amber, fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.75rem', fontWeight: 600,
                      cursor: marcandoTodas ? 'not-allowed' : 'pointer',
                      opacity: marcandoTodas ? 0.6 : 1,
                    }}
                  >
                    <FaCheck style={{ fontSize: '0.6rem' }} />
                    {marcandoTodas ? 'Marcando…' : 'Leer todas'}
                  </button>
                )}
                {notifs.length > 0 && (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    disabled={eliminando}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 9,
                      border: '1px solid rgba(239,68,68,0.22)', background: 'rgba(239,68,68,0.07)',
                      color: T.red, fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.75rem', fontWeight: 600,
                      cursor: eliminando ? 'not-allowed' : 'pointer',
                      opacity: eliminando ? 0.6 : 1,
                    }}
                  >
                    <FaTrash style={{ fontSize: '0.58rem' }} />
                    {eliminando ? 'Eliminando…' : 'Eliminar todo'}
                  </button>
                )}
              </div>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <FilterPill active={filtro === 'todas'}     onClick={() => setFiltro('todas')}>
                Todas
              </FilterPill>
              <FilterPill active={filtro === 'no_leidas'} onClick={() => setFiltro('no_leidas')}>
                Sin leer{noLeidasCount > 0 ? ` (${noLeidasCount})` : ''}
              </FilterPill>
            </div>
          </div>
        </div>

        {/* ── Lista ── */}
        <main style={{ flex: 1, maxWidth: 720, margin: '0 auto', width: '100%', padding: '1.75rem 1.25rem' }}>
          {loading ? (
            <Spinner />
          ) : notifs.length === 0 ? (
            /* Estado vacío global */
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: '5rem 2rem', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <FaBell style={{ fontSize: '1.8rem', color: T.muted }} />
              </div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: T.white, marginBottom: 8 }}>Sin notificaciones</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: T.fog }}>Cuando haya novedades aparecerán aquí.</p>
            </div>
          ) : notifsFiltradas.length === 0 ? (
            /* Estado vacío de filtro */
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <FaInbox style={{ fontSize: '1.8rem', color: T.muted }} />
              </div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: T.white, marginBottom: 8 }}>Todo al día</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: T.fog }}>No hay notificaciones sin leer en esta página.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notifsFiltradas.map((n, idx) => (
                  <NotifCard
                    key={n.id}
                    n={n}
                    onMarcar={handleMarcar}
                    marcando={marcando}
                    idx={idx}
                  />
                ))}
              </div>

              <DarkPagination
                currentPage={page}
                lastPage={lastPage}
                total={total}
                label="notificaciones"
                onPageChange={p => {
                  setFiltro('todas'); // reset filtro al cambiar página del servidor
                  fetchPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                loading={loading}
              />
            </>
          )}
        </main>

        <Footer />
      </div>

      {/* ── Modal confirmar eliminar ── */}
      {confirmDelete && (
        <div
          onClick={e => e.target === e.currentTarget && setConfirmDelete(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(8,11,18,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, width: '100%', maxWidth: 380, padding: '28px 24px', animation: 'nScale 0.2s cubic-bezier(.22,1,.36,1) both', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FaTrash style={{ color: T.red, fontSize: '1.1rem' }} />
            </div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: T.white, marginBottom: 8 }}>
              ¿Eliminar todas las notificaciones?
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: T.fog, marginBottom: 24 }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, color: T.fog, fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarTodas}
                style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'linear-gradient(135deg,#dc2626,#ef4444)', border: 'none', color: '#fff', fontFamily: 'Syne, sans-serif', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MisNotificaciones;
