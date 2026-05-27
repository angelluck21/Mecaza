import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaPhone, FaShieldAlt,
  FaEdit, FaTrash, FaIdCard,
  FaStar, FaRegStar, FaRoad, FaCommentAlt,
} from 'react-icons/fa';

import Navbar             from '../../components/layout/Navbar';
import LoadingScreen     from '../../components/ui/LoadingScreen';
import ToastNotification from '../../components/ui/ToastNotification';
import Footer            from '../../components/layout/Footer';
import { useToast }      from '../../hooks/useToast';
import {
  verUsuarioApi, eliminarUsuarioApi,
  getConductorPerfilApi, getUsuarioPerfilApi,
} from '../../services/api';
import { getUserPhotoUrl } from '../../utils';

// ── Design tokens ──────────────────────────────────────────────────────────────
const T = {
  void:      '#080B12',
  surface:   '#0E1422',
  surface2:  '#141D30',
  border:    'rgba(255,255,255,0.07)',
  amber:     '#FFBE00',
  amberGlow: 'rgba(255,190,0,0.12)',
  white:     '#EEF0FA',
  fog:       '#6B728F',
  muted:     '#3A4060',
};

const ROL_LABEL = {
  admin: 'Administrador', administrador: 'Administrador',
  conductor: 'Conductor', usuario: 'Usuario',
};

const resolveField = (obj, keys) => {
  for (const k of keys) if (obj?.[k]) return obj[k];
  return null;
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const StarRow = ({ value, size = 13 }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
    {[1,2,3,4,5].map(n =>
      n <= Math.round(value ?? 0)
        ? <FaStar    key={n} style={{ fontSize: size, color: T.amber }} />
        : <FaRegStar key={n} style={{ fontSize: size, color: T.muted  }} />
    )}
  </span>
);

const StarBar = ({ label, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem' }}>
      <span style={{ width: 40, textAlign: 'right', color: T.fog, flexShrink: 0 }}>{label} ★</span>
      <div style={{ flex: 1, background: T.surface2, borderRadius: 99, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: T.amber, borderRadius: 99, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ width: 18, color: T.fog, flexShrink: 0, fontSize: '0.68rem' }}>{count}</span>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: `1px solid ${T.border}` }}>
      <span style={{ color: T.amber, fontSize: '0.85rem', flexShrink: 0, opacity: 0.9 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.62rem', fontWeight: 700, color: T.fog, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{label}</p>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', color: T.white, margin: 0, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
      </div>
    </div>
  );
};

const Panel = ({ title, icon, children }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
    <div style={{
      padding: '12px 16px',
      background: 'linear-gradient(135deg, rgba(255,190,0,0.08) 0%, transparent 100%)',
      borderBottom: `1px solid ${T.border}`,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ color: T.amber, fontSize: '0.75rem' }}>{icon}</span>
      <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: T.white, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{title}</span>
    </div>
    <div style={{ padding: '14px 16px' }}>{children}</div>
  </div>
);

const StatTile = ({ value, label, accentColor }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '1.2rem 1rem', textAlign: 'center', borderTop: `3px solid ${accentColor}` }}>
    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.4rem', fontWeight: 800, color: accentColor, margin: 0, lineHeight: 1 }}>{value ?? '—'}</p>
    <p style={{ fontSize: '0.7rem', color: T.fog, margin: '6px 0 0', fontWeight: 600, letterSpacing: '0.03em' }}>{label}</p>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

const VerPerfil = () => {
  const { userId: paramUserId } = useParams();

  const [loggedInUser,   setLoggedInUser]   = useState(null);
  const [userData,       setUserData]       = useState(null);
  const [isViewingOther, setIsViewingOther] = useState(false);
  const [isLoading,      setIsLoading]      = useState(true);
  const [showDelete,     setShowDelete]     = useState(false);
  const [isDeleting,     setIsDeleting]     = useState(false);
  const [conductorStats,    setConductorStats]    = useState(null);
  const [usuarioStats,      setUsuarioStats]      = useState(null);
  const [resenasConductorN, setResenasConductorN] = useState(5);
  const [resenasUsuarioN,   setResenasUsuarioN]   = useState(5);

  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const stored = localStorage.getItem('userData');
      if (!stored) { navigate('/login'); return; }

      let loggedIn;
      try { loggedIn = JSON.parse(stored); } catch { navigate('/login'); return; }

      const viewingOther = !!paramUserId;
      setLoggedInUser(loggedIn);
      setIsViewingOther(viewingOther);

      const loggedInId = resolveField(loggedIn, ['id_users', 'id', 'ID', 'id_user', 'user_id', 'userId']);
      const targetId   = viewingOther ? paramUserId : loggedInId;
      if (!targetId) { navigate('/login'); return; }

      try {
        const { data } = await verUsuarioApi(targetId);
        const perfil   = data?.data ?? data?.user ?? data ?? {};

        let finalData;
        if (viewingOther) {
          finalData = perfil;
          setUserData(perfil);
        } else {
          finalData = { ...loggedIn, ...perfil };
          localStorage.setItem('userData', JSON.stringify(finalData));
          setUserData(finalData);
        }

        const perfilRol = finalData.rol ?? perfil.rol;
        if (perfilRol === 'conductor') {
          getConductorPerfilApi(targetId)
            .then(res => { if (res?.data) setConductorStats(res.data); })
            .catch(() => {});
        } else if (perfilRol === 'usuario') {
          getUsuarioPerfilApi(targetId)
            .then(res => { if (res?.data) setUsuarioStats(res.data); })
            .catch(() => {});
        }
      } catch {
        if (viewingOther) { showToast('No se pudo cargar el perfil.', 'error'); navigate(-1); }
        else setUserData(loggedIn);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [navigate, paramUserId]);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const targetId = resolveField(userData, ['id_users', 'id', 'ID', 'id_user', 'user_id', 'userId']);
      await eliminarUsuarioApi(targetId);
      showToast(isViewingOther ? 'Usuario eliminado correctamente.' : 'Cuenta eliminada exitosamente.', 'success');
      setTimeout(() => {
        if (isViewingOther) navigate('/indexAdmin');
        else {
          localStorage.removeItem('userData');
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      }, 1500);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401)      showToast('Sesión expirada.', 'error');
      else if (status === 404) showToast('Usuario no encontrado.', 'error');
      else                     showToast('Error al eliminar. Intenta nuevamente.', 'error');
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  if (isLoading) return <LoadingScreen message="Cargando perfil..." />;
  if (!userData || !loggedInUser) return null;

  const nombre   = resolveField(userData, ['Nombre', 'nombre', 'name']);
  const correo   = resolveField(userData, ['Correo', 'correo', 'email', 'Email']);
  const telefono = resolveField(userData, ['Telefono', 'telefono', 'tel', 'phone']);
  const userId   = resolveField(userData, ['id_users', 'id', 'ID', 'user_id', 'userId']);
  const rol      = userData.rol ?? 'usuario';

  const loggedInRol     = loggedInUser.rol;
  const loggedInIsAdmin = loggedInRol === 'admin' || loggedInRol === 'administrador';
  const loggedInId      = resolveField(loggedInUser, ['id_users', 'id', 'ID', 'id_user', 'user_id', 'userId']);
  const isOwnProfile    = !isViewingOther || String(loggedInId) === String(userId);
  const esConductor     = rol === 'conductor';

  // Conductor stats
  const resenas  = conductorStats?.resenas ?? [];
  const totalCal = conductorStats?.total_calificaciones ?? 0;
  const promedio = conductorStats?.promedio_estrellas    ?? null;
  const distrib  = [5,4,3,2,1].map(star => ({
    star, count: resenas.filter(r => Math.round(r.calificacion) === star).length,
  }));

  // Usuario stats
  const uResenas  = usuarioStats?.resenas ?? [];
  const uTotalCal = usuarioStats?.total_calificaciones ?? 0;
  const uPromedio = usuarioStats?.promedio_estrellas    ?? null;
  const uDistrib  = [5,4,3,2,1].map(star => ({
    star, count: uResenas.filter(r => Math.round(r.calificacion) === star).length,
  }));

  const fotoRaw = userData.fotoperfil || userData.fotoPerfil || null;
  const fotoUrl = fotoRaw ? (getUserPhotoUrl(fotoRaw) || fotoRaw) : null;

  const roleBadge =
    esConductor
      ? { bg: 'rgba(59,130,246,0.14)', color: '#A0A8C0', border: 'rgba(59,130,246,0.3)' }
      : rol === 'admin' || rol === 'administrador'
        ? { bg: 'rgba(139,92,246,0.14)', color: '#A78BFA', border: 'rgba(139,92,246,0.3)' }
        : { bg: T.amberGlow, color: T.amber, border: 'rgba(255,190,0,0.3)' };

  // ── JSX ──────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: T.void, display: 'flex', flexDirection: 'column', fontFamily: 'DM Sans, sans-serif' }}>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />

      <Navbar />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: 680, width: '100%', margin: '0 auto', padding: '2rem 1rem 3rem', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* ── Hero card ── */}
        <div style={{ background: T.surface, borderRadius: 20, overflow: 'hidden', border: `1px solid ${T.border}` }} className="animate-fade-in-up">

          {/* Banner amber */}
          <div style={{ height: 100, background: 'linear-gradient(135deg, #92600A 0%, #C8960C 35%, #FFBE00 65%, #FFD84D 100%)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
          </div>

          {/* Avatar centrado, overlapping */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: -44, position: 'relative', zIndex: 2 }}>
            <div style={{
              width: 88, height: 88, borderRadius: 20,
              overflow: 'hidden',
              border: `3px solid ${T.amber}`,
              boxShadow: `0 0 0 5px ${T.surface}, 0 8px 28px rgba(255,190,0,0.3)`,
              background: T.surface2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {fotoUrl
                ? <img src={fotoUrl} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                : <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, color: T.amber }}>
                    {(nombre || '?').charAt(0).toUpperCase()}
                  </span>
              }
            </div>
          </div>

          {/* Nombre, badge y stats — todo centrado */}
          <div style={{ textAlign: 'center', padding: '14px 1.5rem 1.5rem' }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.55rem', fontWeight: 800, color: T.white, margin: '0 0 10px', lineHeight: 1.15 }}>
              {nombre || 'Sin nombre'}
            </h1>

            {/* Badges row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <span style={{
                fontFamily: 'Syne, sans-serif', fontSize: '0.68rem', fontWeight: 700,
                padding: '4px 12px', borderRadius: 99, letterSpacing: '0.05em',
                background: roleBadge.bg, color: roleBadge.color,
                border: `1px solid ${roleBadge.border}`,
              }}>
                {ROL_LABEL[rol] ?? 'Usuario'}
              </span>

              {esConductor && conductorStats && promedio != null && (
                <>
                  <span style={{ color: T.muted, fontSize: '0.7rem' }}>·</span>
                  <StarRow value={promedio} size={12} />
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.8rem', fontWeight: 700, color: T.amber }}>
                    {Number(promedio).toFixed(1)}
                  </span>
                  <span style={{ color: T.muted, fontSize: '0.7rem' }}>·</span>
                  <span style={{ fontSize: '0.72rem', color: T.fog, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FaRoad style={{ color: '#A0A8C0', fontSize: '0.65rem' }} /> {conductorStats.total_viajes} viajes
                  </span>
                </>
              )}

              {!esConductor && rol === 'usuario' && usuarioStats && (
                <>
                  <span style={{ color: T.muted, fontSize: '0.7rem' }}>·</span>
                  <span style={{ fontSize: '0.72rem', color: T.fog, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FaRoad style={{ color: '#A0A8C0', fontSize: '0.65rem' }} />
                    {usuarioStats.total_viajes ?? 0} {(usuarioStats.total_viajes ?? 0) === 1 ? 'viaje realizado' : 'viajes realizados'}
                  </span>
                </>
              )}
            </div>

            {/* Separador */}
            <div style={{ height: 1, background: T.border, margin: '0 0 16px' }} />

            {/* CTA de edición — solo perfil propio */}
            {!isViewingOther && (
              <button
                onClick={() => navigate('/ajustes-perfil')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '9px 24px',
                  background: `linear-gradient(135deg, #C8960C, ${T.amber})`,
                  border: 'none', borderRadius: 12,
                  color: '#080B12', fontSize: '0.82rem', fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                  boxShadow: '0 4px 18px rgba(255,190,0,0.3)',
                  letterSpacing: '0.02em',
                }}
              >
                <FaEdit style={{ fontSize: '0.7rem' }} />
                Editar perfil
              </button>
            )}

            {/* Admin viendo otro usuario */}
            {isViewingOther && loggedInIsAdmin && (
              <button
                onClick={() => setShowDelete(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '9px 24px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 12, color: '#F87171',
                  fontSize: '0.82rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                }}
              >
                <FaTrash style={{ fontSize: '0.7rem' }} />
                Eliminar usuario
              </button>
            )}
          </div>
        </div>

        {/* ── Info panels ────────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }} className="animate-fade-in-up">
          <Panel title="Información personal" icon={<FaUser />}>
            {loggedInIsAdmin && <InfoRow icon={<FaIdCard />} label="ID de usuario" value={`#${userId}`} />}
            <InfoRow icon={<FaUser />}      label="Nombre completo"   value={nombre} />
            <InfoRow icon={<FaShieldAlt />} label="Rol en el sistema" value={ROL_LABEL[rol] ?? 'Usuario'} />
          </Panel>

          <Panel title="Información de contacto" icon={<FaEnvelope />}>
            {(isOwnProfile || loggedInIsAdmin || esConductor) && (
              <InfoRow icon={<FaEnvelope />} label="Correo electrónico" value={correo} />
            )}
            <InfoRow icon={<FaPhone />} label="Teléfono" value={telefono} />
            {!(isOwnProfile || loggedInIsAdmin || esConductor) && !telefono && (
              <p style={{ fontSize: '0.8rem', color: T.fog, margin: 0, padding: '8px 0' }}>
                Sin datos de contacto disponibles.
              </p>
            )}
          </Panel>
        </div>

        {/* ── Conductor: stats + ratings + reviews ────────────────────────────── */}
        {esConductor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-fade-in-up">

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <StatTile
                value={conductorStats ? conductorStats.total_viajes : '—'}
                label={conductorStats?.total_viajes === 1 ? 'Viaje completado' : 'Viajes completados'}
                accentColor={T.amber}
              />
              <StatTile
                value={conductorStats && promedio != null ? Number(promedio).toFixed(1) : '—'}
                label="Promedio de estrellas"
                accentColor={T.amber}
              />
            </div>

            <Panel title="Calificaciones" icon={<FaStar />}>
              {!conductorStats ? (
                <p style={{ fontSize: '0.8rem', color: T.fog, textAlign: 'center', margin: 0, padding: '8px 0' }}>Cargando…</p>
              ) : totalCal === 0 ? (
                <p style={{ fontSize: '0.8rem', color: T.fog, textAlign: 'center', margin: 0, padding: '8px 0' }}>
                  {isOwnProfile
                    ? 'Aún no tienes calificaciones. ¡Completa viajes para recibirlas!'
                    : 'Este conductor aún no tiene calificaciones.'}
                </p>
              ) : (
                <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '3.2rem', fontWeight: 800, color: T.amber, margin: 0, lineHeight: 1 }}>
                      {Number(promedio).toFixed(1)}
                    </p>
                    <StarRow value={promedio} size={15} />
                    <p style={{ fontSize: '0.68rem', color: T.fog, margin: '5px 0 0' }}>
                      {totalCal} {totalCal === 1 ? 'reseña' : 'reseñas'}
                    </p>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 6 }}>
                    {distrib.map(({ star, count }) => (
                      <StarBar key={star} label={star} count={count} total={totalCal} />
                    ))}
                  </div>
                </div>
              )}
            </Panel>

            <Panel title="Reseñas recientes" icon={<FaCommentAlt />}>
              {!conductorStats ? (
                <p style={{ fontSize: '0.8rem', color: T.fog, textAlign: 'center', margin: 0 }}>Cargando…</p>
              ) : resenas.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: T.fog, textAlign: 'center', margin: 0 }}>
                  {isOwnProfile ? 'Aún no tienes comentarios escritos.' : 'Sin comentarios por el momento.'}
                </p>
              ) : (
                <div>
                  {resenas.slice(0, resenasConductorN).map((r, i) => (
                    <div key={i} style={{ padding: '12px 0', borderBottom: i < Math.min(resenasConductorN, resenas.length) - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                        <StarRow value={r.calificacion} size={12} />
                        <span style={{ fontSize: '0.68rem', color: T.fog }}>{r.fecha}</span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: T.white, margin: 0, lineHeight: 1.55, opacity: 0.85 }}>{r.comentario}</p>
                    </div>
                  ))}
                  {resenas.length > resenasConductorN ? (
                    <button
                      onClick={() => setResenasConductorN(n => n + 10)}
                      style={{ marginTop: 12, width: '100%', padding: '8px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.amber, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif', letterSpacing: '0.02em' }}
                    >
                      Ver más reseñas ({resenas.length - resenasConductorN} restantes)
                    </button>
                  ) : resenas.length > 5 && (
                    <button
                      onClick={() => setResenasConductorN(5)}
                      style={{ marginTop: 12, width: '100%', padding: '8px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 10, color: T.fog, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
                    >
                      Mostrar menos
                    </button>
                  )}
                </div>
              )}
            </Panel>
          </div>
        )}

        {/* ── Usuario: calificaciones como pasajero ────────────────────────────── */}
        {!esConductor && rol === 'usuario' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-fade-in-up">

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <StatTile
                value={usuarioStats ? (usuarioStats.total_viajes ?? 0) : '—'}
                label={usuarioStats?.total_viajes === 1 ? 'Viaje realizado' : 'Viajes realizados'}
                accentColor={T.amber}
              />
              <StatTile
                value={usuarioStats && uPromedio != null ? Number(uPromedio).toFixed(1) : '—'}
                label="Calificación como pasajero"
                accentColor={T.amber}
              />
            </div>

            <Panel title="Calificaciones recibidas" icon={<FaStar />}>
              {!usuarioStats ? (
                <p style={{ fontSize: '0.8rem', color: T.fog, textAlign: 'center', margin: 0, padding: '8px 0' }}>Cargando…</p>
              ) : uTotalCal === 0 ? (
                <p style={{ fontSize: '0.8rem', color: T.fog, textAlign: 'center', margin: 0, padding: '8px 0' }}>
                  {isOwnProfile ? 'Aún no tienes calificaciones como pasajero.' : 'Este usuario aún no tiene calificaciones.'}
                </p>
              ) : (
                <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '3.2rem', fontWeight: 800, color: T.amber, margin: 0, lineHeight: 1 }}>
                      {Number(uPromedio).toFixed(1)}
                    </p>
                    <StarRow value={uPromedio} size={15} />
                    <p style={{ fontSize: '0.68rem', color: T.fog, margin: '5px 0 0' }}>
                      {uTotalCal} {uTotalCal === 1 ? 'reseña' : 'reseñas'}
                    </p>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 6 }}>
                    {uDistrib.map(({ star, count }) => (
                      <StarBar key={star} label={star} count={count} total={uTotalCal} />
                    ))}
                  </div>
                </div>
              )}
            </Panel>

            <Panel title="Comentarios de conductores" icon={<FaCommentAlt />}>
              {!usuarioStats ? (
                <p style={{ fontSize: '0.8rem', color: T.fog, textAlign: 'center', margin: 0 }}>Cargando…</p>
              ) : uResenas.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: T.fog, textAlign: 'center', margin: 0 }}>
                  {isOwnProfile ? 'Aún no tienes comentarios escritos sobre ti.' : 'Sin comentarios por el momento.'}
                </p>
              ) : (
                <div>
                  {uResenas.slice(0, resenasUsuarioN).map((r, i) => (
                    <div key={i} style={{ padding: '12px 0', borderBottom: i < Math.min(resenasUsuarioN, uResenas.length) - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                        <StarRow value={r.calificacion} size={12} />
                        <span style={{ fontSize: '0.68rem', color: T.fog }}>{r.fecha}</span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: T.white, margin: 0, lineHeight: 1.55, opacity: 0.85 }}>{r.comentario}</p>
                    </div>
                  ))}
                  {uResenas.length > resenasUsuarioN ? (
                    <button
                      onClick={() => setResenasUsuarioN(n => n + 10)}
                      style={{ marginTop: 12, width: '100%', padding: '8px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.amber, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif', letterSpacing: '0.02em' }}
                    >
                      Ver más comentarios ({uResenas.length - resenasUsuarioN} restantes)
                    </button>
                  ) : uResenas.length > 5 && (
                    <button
                      onClick={() => setResenasUsuarioN(5)}
                      style={{ marginTop: 12, width: '100%', padding: '8px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 10, color: T.fog, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
                    >
                      Mostrar menos
                    </button>
                  )}
                </div>
              )}
            </Panel>
          </div>
        )}

        {/* ── Zona de peligro (solo perfil propio) ─────────────────────────────── */}
        {!isViewingOther && (
          <div style={{ background: T.surface, border: '1px solid rgba(239,68,68,0.18)', borderRadius: 16, overflow: 'hidden' }} className="animate-fade-in-up">
            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.06)', borderBottom: '1px solid rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaTrash style={{ color: '#F87171', fontSize: '0.72rem' }} />
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Zona de peligro</span>
            </div>
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: T.white, margin: 0 }}>Eliminar cuenta</p>
                <p style={{ fontSize: '0.75rem', color: T.fog, margin: '3px 0 0' }}>Esta acción es permanente e irreversible.</p>
              </div>
              <button
                onClick={() => setShowDelete(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)', borderRadius: 10, color: '#F87171', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}
              >
                <FaTrash style={{ fontSize: '0.65rem' }} /> Eliminar mi cuenta
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Modal: confirmar eliminación ──────────────────────────────────────── */}
      {showDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          background: 'rgba(8,11,18,0.88)', backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 20, width: '100%', maxWidth: 380,
            padding: '2rem 1.75rem', boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
            textAlign: 'center',
          }} className="animate-scale-in">
            <div style={{
              width: 58, height: 58, borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <FaTrash style={{ color: '#F87171', fontSize: '1.2rem' }} />
            </div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: T.white, margin: '0 0 0.5rem' }}>
              {isViewingOther ? '¿Eliminar este usuario?' : '¿Eliminar tu cuenta?'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: T.fog, margin: '0 0 1.5rem', lineHeight: 1.65 }}>
              Esta acción es{' '}
              <span style={{ color: '#F87171', fontWeight: 700 }}>irreversible</span>.{' '}
              {isViewingOther
                ? `Se eliminará toda la información de ${nombre || 'este usuario'}.`
                : 'Se eliminará toda tu información, reservas y datos del sistema.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowDelete(false)}
                disabled={isDeleting}
                style={{ flex: 1, padding: '0.75rem', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 12, color: T.fog, fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Syne, sans-serif', opacity: isDeleting ? 0.5 : 1 }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #b91c1c, #ef4444)', border: 'none', borderRadius: 12, color: '#fff', fontSize: '0.84rem', fontWeight: 700, cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.6 : 1, fontFamily: 'Syne, sans-serif' }}
              >
                {isDeleting ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default VerPerfil;
