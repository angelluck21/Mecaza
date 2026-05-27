import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCar, FaPlus, FaUsers, FaSync, FaTicketAlt,
  FaTrash, FaCheck, FaTimes, FaMapMarkerAlt, FaClock,
  FaCalendarAlt, FaPhone, FaUser, FaEnvelope, FaFileInvoice, FaEdit,
  FaDownload, FaFileArchive, FaRoad, FaShieldAlt, FaBolt, FaSearch, FaEye,
} from 'react-icons/fa';

import Navbar            from '../../components/layout/Navbar';
import Footer            from '../../components/layout/Footer';
import LoadingScreen     from '../../components/ui/LoadingScreen';
import ToastNotification from '../../components/ui/ToastNotification';
import DarkPagination    from '../../components/ui/DarkPagination';
import { useToast }      from '../../hooks/useToast';
import { formatFecha }   from '../../utils';
import {
  listarCarrosAdminApi, listarReservasApi, listarReservasAuthApi,
  listarUsuariosApi, eliminarUsuarioApi, eliminarCarroApi, actualizarEstadoCarroApi,
  confirmarReservaApi, eliminarReservaApi,
  agregarPrecioApi, eliminarPrecioApi, actualizarPrecioApi,
  invitarConductorApi, listarFacturasApi, listarPreciosApi,
  descargarFacturaApi, descargarTodasFacturasApi,
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
  sky:         '#38bdf8',
  orange:      '#f97316',
  red:         '#ef4444',
};

const ESTADOS = {
  1: { color: T.sky,    label: 'Esperando'        },
  2: { color: T.green,  label: 'En viaje'          },
  3: { color: T.orange, label: 'Mantenimiento'     },
  4: { color: T.red,    label: 'Fuera de servicio' },
  5: { color: T.fog,    label: 'Terminado'         },
};
const getE  = (id) => ESTADOS[parseInt(id)] ?? { color: T.fog, label: '—' };
const fmtM  = (n)  => n != null ? `$${Number(n).toLocaleString('es-CO')}` : '$0';
const fmtD  = (ts) => ts ? new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Atoms ──────────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
    <div style={{ width: 28, height: 28, border: `3px solid ${T.muted}`, borderTopColor: T.amber, borderRadius: '50%', animation: 'aSpin 0.8s linear infinite' }} />
  </div>
);

const EmptySection = ({ icon, title, desc }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: '4rem 2rem', textAlign: 'center' }}>
    <div style={{ width: 56, height: 56, borderRadius: 16, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.6rem', color: T.muted }}>
      {icon}
    </div>
    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: T.white, marginBottom: 6 }}>{title}</p>
    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: T.fog }}>{desc}</p>
  </div>
);

const StatChip = ({ value, label, color, loading }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 20px', minWidth: 84, textAlign: 'center' }}>
    {loading
      ? <div style={{ width: 22, height: 22, border: `2px solid ${T.muted}`, borderTopColor: color, borderRadius: '50%', animation: 'aSpin 0.8s linear infinite', margin: '0 auto 4px' }} />
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
      <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 16, height: 16, borderRadius: 999, padding: '0 3px', background: T.red, color: '#fff', fontSize: '0.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${T.void}` }}>{badge}</span>
    )}
  </button>
);

const StatusBadge = ({ id }) => {
  const e = getE(id);
  return (
    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.58rem', fontWeight: 700, padding: '3px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em', color: e.color, background: `${e.color}18`, border: `1px solid ${e.color}35` }}>
      {e.label}
    </span>
  );
};

const ResBadge = ({ estado }) => {
  const e = estado?.toLowerCase();
  const c = e === 'confirmada' ? T.green : (e === 'rechazada' || e === 'cancelada') ? T.red : T.amber;
  return (
    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.58rem', fontWeight: 700, padding: '3px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em', color: c, background: `${c}18`, border: `1px solid ${c}35` }}>
      {estado || 'Pendiente'}
    </span>
  );
};

// ── Dark Modal ─────────────────────────────────────────────────────────────────
const DarkModal = ({ title, onClose, children, maxWidth = 480 }) => (
  <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(8,11,18,0.85)', backdropFilter: 'blur(8px)' }}>
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, width: '100%', maxWidth, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'aScale 0.2s cubic-bezier(.22,1,.36,1) both' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg,rgba(255,190,0,0.07) 0%,transparent 100%)', flexShrink: 0 }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: T.white }}>{title}</span>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.border}`, color: T.fog, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => { e.currentTarget.style.color = T.white; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.fog;   e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        ><FaTimes style={{ fontSize: '0.7rem' }} /></button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>{children}</div>
    </div>
  </div>
);

// ── Form fields ────────────────────────────────────────────────────────────────
const AField = ({ label, icon, type = 'text', value, onChange, placeholder, disabled, required, min, prefix }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.6rem', fontWeight: 700, color: T.fog, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.surface2, borderRadius: 10, padding: prefix ? '0 12px 0 0' : '0 12px', border: `1px solid ${focused ? T.amber : T.border}`, boxShadow: focused ? '0 0 0 3px rgba(255,190,0,0.07)' : 'none', transition: 'all 0.2s', opacity: disabled ? 0.5 : 1 }}>
        {prefix && <span style={{ padding: '0 0 0 12px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: T.fog }}>{prefix}</span>}
        {icon  && !prefix && <span style={{ color: focused ? T.amber : T.fog, fontSize: '0.8rem', flexShrink: 0, transition: 'color 0.2s' }}>{icon}</span>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} required={required} min={min}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: T.white, fontSize: '0.85rem', padding: '11px 0', fontFamily: 'DM Sans, sans-serif' }} />
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const IndexAdmin = () => {
  const [userData,       setUserData]       = useState(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [activeTab,      setActiveTab]      = useState('panel');
  const [stats,          setStats]          = useState({ totalVehiculos: 0, totalReservas: 0, reservasHoy: 0, totalUsuarios: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Rutas/Precios
  const [preciosList,       setPreciosList]       = useState([]);
  const [loadingPrecios,    setLoadingPrecios]    = useState(false);
  const [pagePrecios,       setPagePrecios]       = useState(1);
  const [lastPagePrecios,   setLastPagePrecios]   = useState(1);
  const [totalPrecios,      setTotalPrecios]      = useState(0);
  const [nuevoPrecio,       setNuevoPrecio]       = useState({ Origen: '', Destino: '', Precio: '' });
  const [isSaving,          setIsSaving]          = useState(false);
  const [deletingPrecioId,  setDeletingPrecioId]  = useState(null);
  const [editingPrecioId,   setEditingPrecioId]   = useState(null);
  const [editingPrecioForm, setEditingPrecioForm] = useState({ Origen: '', Destino: '', Precio: '' });
  const [savingPrecioId,    setSavingPrecioId]    = useState(null);

  // Vehículos
  const [carrosList,    setCarrosList]    = useState([]);
  const [loadingCarros, setLoadingCarros] = useState(false);
  const [carroEstados,  setCarroEstados]  = useState({});
  const [savingCarroId, setSavingCarroId] = useState(null);
  const [pageCarros,    setPageCarros]    = useState(1);
  const [lastPageCarros,setLastPageCarros]= useState(1);

  // Reservas
  const [reservasList,    setReservasList]    = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [procesandoResId, setProcesandoResId] = useState(null);
  const [pageReservas,    setPageReservas]    = useState(1);
  const [lastPageReservas,setLastPageReservas]= useState(1);

  // Facturas
  const [facturasList,    setFacturasList]    = useState([]);
  const [loadingFacturas, setLoadingFacturas] = useState(false);
  const [downloadingId,   setDownloadingId]   = useState(null);
  const [downloadingAll,  setDownloadingAll]  = useState(false);
  const [pageFacturas,    setPageFacturas]    = useState(1);
  const [lastPageFacturas,setLastPageFacturas]= useState(1);

  // Usuarios
  const [users,          setUsers]          = useState([]);
  const [filteredUsers,  setFilteredUsers]  = useState([]);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Modales
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail,     setInviteEmail]     = useState('');
  const [isInviting,      setIsInviting]      = useState(false);
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [isDeleting,      setIsDeleting]      = useState(false);

  const accionReservaRef = useRef(null);
  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { navigate('/login'); return; }
    try {
      const user = JSON.parse(stored);
      if (user.rol !== 'admin' && user.rol !== 'administrador') { navigate('/'); return; }
      setUserData(user);
      fetchStats();
    } catch { navigate('/login'); }
    setIsLoading(false);
  }, [navigate]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const [vRes, rRes, uRes] = await Promise.all([
        listarCarrosAdminApi(), listarReservasApi(), listarUsuariosApi(),
      ]);
      const totalVehiculos = vRes.data?.total ?? (Array.isArray(vRes.data?.data) ? vRes.data.data.length : 0);
      const totalUsuarios  = uRes.data?.total ?? (Array.isArray(uRes.data?.data) ? uRes.data.data.length : 0);
      const reservasArr    = Array.isArray(rRes.data) ? rRes.data : (Array.isArray(rRes) ? rRes : []);
      const totalReservas  = rRes.data?.total ?? reservasArr.length;
      const fechaHoy       = new Date().toISOString().split('T')[0];
      const reservasHoy    = reservasArr.filter(r => r.created_at?.startsWith(fechaHoy)).length;
      setStats({ totalVehiculos, totalReservas, reservasHoy, totalUsuarios });
    } catch { /* silencioso */ }
    finally { setIsLoadingStats(false); }
  };

  // ── Usuarios ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredUsers(users.filter(u =>
      u.name?.toLowerCase().includes(lower)  ||
      u.email?.toLowerCase().includes(lower) ||
      u.tel?.toLowerCase().includes(lower)   ||
      u.rol?.toLowerCase().includes(lower)   ||
      String(u.id_users || u.id || '').includes(lower)
    ));
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data } = await listarUsuariosApi();
      const list = Array.isArray(data.data) ? data.data : [];
      setUsers(list);
      setFilteredUsers(list);
    } catch (err) {
      const s = err.response?.status;
      if (s === 401) { showToast('Sesión expirada.', 'error'); navigate('/login'); }
      else showToast('Error al cargar usuarios.', 'error');
    } finally { setIsLoadingUsers(false); }
  };

  // ── Tab routing ───────────────────────────────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'rutas'     && preciosList.length === 0)  fetchPrecios(1);
    if (tab === 'vehiculos' && carrosList.length === 0)   fetchCarros(1);
    if (tab === 'reservas'  && reservasList.length === 0) fetchReservas(1);
    if (tab === 'facturas'  && facturasList.length === 0) fetchFacturas(1);
    if (tab === 'usuarios'  && users.length === 0)        fetchUsers();
  };

  // ── Rutas/Precios ─────────────────────────────────────────────────────────
  const fetchPrecios = async (page = 1) => {
    setLoadingPrecios(true);
    try {
      const { data } = await listarPreciosApi(page);
      setPreciosList(Array.isArray(data.data) ? data.data : []);
      setPagePrecios(data.current_page ?? 1);
      setLastPagePrecios(data.last_page ?? 1);
      setTotalPrecios(data.total ?? 0);
    } catch { showToast('Error al cargar rutas.', 'error'); }
    finally { setLoadingPrecios(false); }
  };

  const handleSaveNuevoPrecio = async (e) => {
    e.preventDefault();
    const { Origen, Destino, Precio } = nuevoPrecio;
    if (!Origen || !Destino || !Precio) { showToast('Completa todos los campos.', 'error'); return; }
    setIsSaving(true);
    try {
      await agregarPrecioApi({ Origen: Origen.trim(), Destino: Destino.trim(), Precio: parseFloat(Precio) });
      showToast('Ruta agregada.', 'success');
      setNuevoPrecio({ Origen: '', Destino: '', Precio: '' });
      await fetchPrecios(1);
    } catch (err) { showToast(err.response?.data?.message || 'Error al guardar.', 'error'); }
    finally { setIsSaving(false); }
  };

  const handleEliminarPrecio = async (id) => {
    setDeletingPrecioId(id);
    try {
      await eliminarPrecioApi(id);
      showToast('Ruta eliminada.', 'success');
      await fetchPrecios(pagePrecios);
    } catch { showToast('Error al eliminar.', 'error'); }
    finally { setDeletingPrecioId(null); }
  };

  const handleUpdatePrecio = async (id) => {
    setSavingPrecioId(id);
    try {
      await actualizarPrecioApi(id, { Origen: editingPrecioForm.Origen.trim(), Destino: editingPrecioForm.Destino.trim(), Precio: parseFloat(editingPrecioForm.Precio) });
      showToast('Ruta actualizada.', 'success');
      setEditingPrecioId(null);
      await fetchPrecios(pagePrecios);
    } catch { showToast('Error al actualizar.', 'error'); }
    finally { setSavingPrecioId(null); }
  };

  // ── Vehículos ─────────────────────────────────────────────────────────────
  const fetchCarros = async (page = 1) => {
    setLoadingCarros(true);
    try {
      const { data } = await listarCarrosAdminApi(page);
      const cars = Array.isArray(data?.data) ? data.data : [];
      setCarrosList(cars);
      setPageCarros(data?.current_page ?? 1);
      setLastPageCarros(data?.last_page ?? 1);
      const init = {};
      cars.forEach(c => { init[c.id_carros || c.id] = c.id_estados || ''; });
      setCarroEstados(init);
    } catch { showToast('Error al cargar vehículos.', 'error'); }
    finally { setLoadingCarros(false); }
  };

  const handleUpdateCarroEstado = async (carId) => {
    const estadoId = carroEstados[carId];
    if (!estadoId) { showToast('Selecciona un estado.', 'error'); return; }
    setSavingCarroId(carId);
    try {
      await actualizarEstadoCarroApi(carId, parseInt(estadoId));
      showToast('Estado actualizado.', 'success');
      await fetchCarros(pageCarros);
    } catch { showToast('Error al actualizar.', 'error'); }
    finally { setSavingCarroId(null); }
  };

  // ── Reservas ──────────────────────────────────────────────────────────────
  const fetchReservas = async (page = 1) => {
    setLoadingReservas(true);
    try {
      const { data } = await listarReservasAuthApi(page);
      const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setReservasList(list);
      setPageReservas(data.current_page ?? 1);
      setLastPageReservas(data.last_page ?? 1);
    } catch { showToast('Error al cargar reservas.', 'error'); }
    finally { setLoadingReservas(false); }
  };

  const handleReservaEstado = async (reserva, estado) => {
    const id = reserva.id_reservarviajes || reserva.id_reservarviaje || reserva.id;
    if (accionReservaRef.current !== null) return;
    accionReservaRef.current = id;
    setProcesandoResId(id);
    try {
      await confirmarReservaApi(id, estado);
      showToast(estado === 'confirmada' ? 'Reserva confirmada.' : 'Reserva rechazada.', estado === 'confirmada' ? 'success' : 'error');
      await fetchReservas(pageReservas);
    } catch { showToast('Error al actualizar.', 'error'); }
    finally { accionReservaRef.current = null; setProcesandoResId(null); }
  };

  // ── Eliminar (compartido) ─────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.tipo === 'carro') {
        await eliminarCarroApi(deleteTarget.id);
        showToast('Vehículo eliminado.', 'success');
        setDeleteTarget(null);
        await fetchCarros(pageCarros);
      } else if (deleteTarget.tipo === 'reserva') {
        await eliminarReservaApi(deleteTarget.id);
        showToast('Reserva eliminada.', 'success');
        setDeleteTarget(null);
        await fetchReservas(pageReservas);
      } else if (deleteTarget.tipo === 'usuario') {
        await eliminarUsuarioApi(deleteTarget.id);
        showToast('Usuario eliminado.', 'success');
        setDeleteTarget(null);
        await fetchUsers();
      }
    } catch { showToast('Error al eliminar.', 'error'); }
    finally { setIsDeleting(false); }
  };

  // ── Facturas ──────────────────────────────────────────────────────────────
  const fetchFacturas = async (page = 1) => {
    setLoadingFacturas(true);
    try {
      const { data } = await listarFacturasApi(page);
      const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setFacturasList(list);
      setPageFacturas(data.current_page ?? 1);
      setLastPageFacturas(data.last_page ?? 1);
    } catch { showToast('Error al cargar facturas.', 'error'); }
    finally { setLoadingFacturas(false); }
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleDescargarFactura = async (factura) => {
    setDownloadingId(factura.id_factura);
    try {
      const { data } = await descargarFacturaApi(factura.id_factura);
      triggerDownload(new Blob([data], { type: 'application/pdf' }), `${factura.numero_factura}.pdf`);
    } catch { showToast('Error al descargar.', 'error'); }
    finally { setDownloadingId(null); }
  };

  const handleDescargarTodas = async () => {
    setDownloadingAll(true);
    try {
      const { data } = await descargarTodasFacturasApi();
      triggerDownload(new Blob([data], { type: 'application/zip' }), `facturas_mecaza_${new Date().toISOString().slice(0,10)}.zip`);
    } catch { showToast('Error al descargar ZIP.', 'error'); }
    finally { setDownloadingAll(false); }
  };

  // ── Invitar conductor ─────────────────────────────────────────────────────
  const handleInvitar = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await invitarConductorApi(inviteEmail);
      showToast(`Invitación enviada a ${inviteEmail}`, 'success');
      setInviteEmail(''); setShowInviteModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Error al enviar.', 'error');
    } finally { setIsInviting(false); }
  };

  if (isLoading) return <LoadingScreen message="Cargando panel…" />;
  if (!userData) return null;

  const nombre  = userData.Nombre || userData.nombre || userData.name || 'Admin';
  const inicial = nombre[0]?.toUpperCase() || 'A';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes aSpin   { to { transform:rotate(360deg); } }
        @keyframes aFadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes aScale  { from { opacity:0; transform:scale(0.96); }     to { opacity:1; transform:scale(1); }     }
        select option { background:#141D30; color:#EEF0FA; }
      `}</style>

      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />

      <div style={{ minHeight: '100vh', background: T.void, display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        {/* ── Hero band ── */}
        <div style={{
          borderBottom: `1px solid ${T.border}`, padding: '2rem 1.25rem 1.5rem',
          backgroundImage: `
            radial-gradient(ellipse 100% 60% at 50% -10%, rgba(255,190,0,0.08) 0%, transparent 65%),
            repeating-linear-gradient(90deg, rgba(255,190,0,0.018) 0px, rgba(255,190,0,0.018) 1px, transparent 1px, transparent 48px),
            repeating-linear-gradient(0deg,  rgba(255,190,0,0.018) 0px, rgba(255,190,0,0.018) 1px, transparent 1px, transparent 48px)
          `,
        }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>

            {/* Identity row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Shield avatar */}
                <div style={{ position: 'relative', width: 58, height: 58, flexShrink: 0 }}>
                  <div style={{ width: 58, height: 58, borderRadius: 16, background: T.amberGlow, border: `2px solid ${T.amberBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaShieldAlt style={{ fontSize: '1.4rem', color: T.amber }} />
                  </div>
                  <span style={{ position: 'absolute', bottom: -4, right: -4, width: 16, height: 16, borderRadius: 999, background: T.green, border: `2px solid ${T.void}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaBolt style={{ fontSize: '0.45rem', color: T.void }} />
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: T.white, margin: 0 }}>{nombre}</h1>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.55rem', fontWeight: 700, color: T.amber, background: T.amberGlow, border: `1px solid ${T.amberBorder}`, borderRadius: 999, padding: '2px 9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administrador</span>
                  </div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: T.fog, margin: 0 }}>Centro de control · Sistema Mecaza</p>
                </div>
              </div>

              {/* Hero actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowInviteModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#C8960C,#FFBE00)', color: '#080B12', border: 'none', fontFamily: 'Syne, sans-serif', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <FaEnvelope style={{ fontSize: '0.7rem' }} /> Invitar conductor
                </button>
                <button
                  onClick={fetchStats} disabled={isLoadingStats}
                  style={{ width: 38, height: 38, borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, color: isLoadingStats ? T.amber : T.fog, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLoadingStats ? 'default' : 'pointer' }}
                >
                  <FaSync style={{ fontSize: '0.8rem', animation: isLoadingStats ? 'aSpin 1s linear infinite' : 'none' }} />
                </button>
              </div>
            </div>

            {/* KPI strip */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <StatChip value={stats.totalVehiculos} label="Vehículos"     color={T.sky}    loading={isLoadingStats} />
              <StatChip value={stats.totalReservas}  label="Reservas"      color={T.amber}  loading={isLoadingStats} />
              <StatChip value={stats.reservasHoy}    label="Reservas hoy"  color={stats.reservasHoy > 0 ? T.green : T.fog} loading={isLoadingStats} />
              <StatChip value={stats.totalUsuarios}  label="Usuarios"      color={T.orange} loading={isLoadingStats} />
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '0.5rem 1.25rem', overflowX: 'auto' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', gap: 4 }}>
            {[
              { id: 'panel',     label: 'Panel',     icon: <FaShieldAlt />  },
              { id: 'rutas',     label: 'Rutas',     icon: <FaRoad />       },
              { id: 'vehiculos', label: 'Vehículos', icon: <FaCar />        },
              { id: 'reservas',  label: 'Reservas',  icon: <FaTicketAlt />  },
              { id: 'facturas',  label: 'Facturas',  icon: <FaFileInvoice />},
              { id: 'usuarios',  label: 'Usuarios',  icon: <FaUsers />      },
            ].map(t => <TabBtn key={t.id} {...t} active={activeTab === t.id} onClick={handleTabChange} />)}
          </div>
        </div>

        {/* ── Content ── */}
        <main style={{ flex: 1, maxWidth: 1080, margin: '0 auto', width: '100%', padding: '1.75rem 1.25rem' }}>

          {/* ══════════ PANEL ══════════ */}
          {activeTab === 'panel' && (
            <div style={{ animation: 'aFadeUp 0.3s ease both' }}>

              {/* Estados del sistema */}
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.62rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Estados del sistema</p>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '4px 0', marginBottom: 8 }}>
                {Object.entries(ESTADOS).map(([id, e], idx, arr) => (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: idx < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: e.color, boxShadow: `0 0 6px ${e.color}70`, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.6rem', fontWeight: 700, color: T.muted, width: 20 }}>{id}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: T.fog }}>{e.label}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: 'Syne, sans-serif', fontSize: '0.55rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, color: e.color, background: `${e.color}15`, border: `1px solid ${e.color}30` }}>ID {id}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: T.muted }}>Los estados son fijos y no se pueden agregar ni eliminar.</p>
            </div>
          )}

          {/* ══════════ RUTAS ══════════ */}
          {activeTab === 'rutas' && (
            <div style={{ animation: 'aFadeUp 0.3s ease both' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' }}>

                {/* Formulario */}
                <div style={{ flex: '0 0 300px', minWidth: 260 }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.62rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Nueva ruta</p>
                  <form onSubmit={handleSaveNuevoPrecio} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <AField label="Origen"     icon={<FaMapMarkerAlt />} value={nuevoPrecio.Origen}  onChange={e => setNuevoPrecio(p => ({ ...p, Origen: e.target.value }))}  placeholder="Ej. Zaragoza"  required />
                    <AField label="Destino"    icon={<FaMapMarkerAlt />} value={nuevoPrecio.Destino} onChange={e => setNuevoPrecio(p => ({ ...p, Destino: e.target.value }))} placeholder="Ej. Medellín"  required />
                    <AField label="Precio COP" prefix="$"                value={nuevoPrecio.Precio}  onChange={e => setNuevoPrecio(p => ({ ...p, Precio: e.target.value }))}  placeholder="0" type="number" min="0" required />
                    <button type="submit" disabled={isSaving} style={{ padding: '11px 0', borderRadius: 10, background: 'linear-gradient(135deg,#C8960C,#FFBE00)', border: 'none', color: '#080B12', fontFamily: 'Syne, sans-serif', fontSize: '0.82rem', fontWeight: 800, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                      {isSaving ? <div style={{ width: 14, height: 14, border: '2px solid rgba(8,11,18,0.25)', borderTopColor: '#080B12', borderRadius: '50%', animation: 'aSpin 0.8s linear infinite' }} /> : <FaPlus style={{ fontSize: '0.7rem' }} />}
                      {isSaving ? 'Guardando…' : 'Agregar ruta'}
                    </button>
                  </form>
                </div>

                {/* Lista */}
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.62rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rutas registradas</p>
                    {totalPrecios > 0 && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: T.fog }}>{totalPrecios} rutas</span>}
                  </div>

                  {loadingPrecios ? <Spinner /> : preciosList.length === 0 ? (
                    <EmptySection icon={<FaRoad />} title="Sin rutas" desc="Agrega la primera ruta desde el formulario." />
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {preciosList.map((ruta, idx) => {
                          const id      = ruta.id_precioviajes || ruta.id;
                          const deleting = deletingPrecioId === id;
                          const editing  = editingPrecioId  === id;
                          const saving   = savingPrecioId   === id;
                          return (
                            <div key={id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.amber}`, borderRadius: '0 14px 14px 0', padding: '14px 16px', animation: 'aFadeUp 0.28s ease both', animationDelay: `${idx * 40}ms` }}>
                              {editing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <AField value={editingPrecioForm.Origen}  onChange={e => setEditingPrecioForm(p => ({ ...p, Origen: e.target.value }))}  placeholder="Origen"  />
                                    <AField value={editingPrecioForm.Destino} onChange={e => setEditingPrecioForm(p => ({ ...p, Destino: e.target.value }))} placeholder="Destino" />
                                  </div>
                                  <AField value={editingPrecioForm.Precio} onChange={e => setEditingPrecioForm(p => ({ ...p, Precio: e.target.value }))} placeholder="Precio" type="number" min="0" prefix="$" />
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => handleUpdatePrecio(id)} disabled={saving} style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#C8960C,#FFBE00)', color: '#080B12', fontFamily: 'Syne, sans-serif', fontSize: '0.75rem', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                      {saving ? <div style={{ width: 12, height: 12, border: '2px solid rgba(8,11,18,0.3)', borderTopColor: '#080B12', borderRadius: '50%', animation: 'aSpin 0.8s linear infinite' }} /> : <FaCheck style={{ fontSize: '0.6rem' }} />} Guardar
                                    </button>
                                    <button onClick={() => setEditingPrecioId(null)} style={{ padding: '8px 14px', borderRadius: 9, background: T.surface2, border: `1px solid ${T.border}`, color: T.fog, fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: T.white, marginBottom: 3 }}>
                                      {ruta.origen} <span style={{ color: T.muted }}>→</span> {ruta.destino}
                                    </p>
                                    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.8rem', fontWeight: 800, color: T.amber }}>{fmtM(ruta.precio)}</p>
                                  </div>
                                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                    <button onClick={() => { setEditingPrecioId(id); setEditingPrecioForm({ Origen: ruta.origen, Destino: ruta.destino, Precio: ruta.precio }); }} style={{ width: 30, height: 30, borderRadius: 8, background: T.amberGlow, border: `1px solid ${T.amberBorder}`, color: T.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.65rem' }}><FaEdit /></button>
                                    <button onClick={() => handleEliminarPrecio(id)} disabled={deleting} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: deleting ? 'not-allowed' : 'pointer', fontSize: '0.65rem', opacity: deleting ? 0.5 : 1 }}>
                                      {deleting ? <div style={{ width: 10, height: 10, border: `2px solid ${T.red}40`, borderTopColor: T.red, borderRadius: '50%', animation: 'aSpin 0.8s linear infinite' }} /> : <FaTrash />}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <DarkPagination currentPage={pagePrecios} lastPage={lastPagePrecios} total={totalPrecios} label="rutas" onPageChange={p => fetchPrecios(p)} loading={loadingPrecios} />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ VEHÍCULOS ══════════ */}
          {activeTab === 'vehiculos' && (
            <div style={{ animation: 'aFadeUp 0.3s ease both' }}>
              {loadingCarros ? <Spinner /> : carrosList.length === 0 ? (
                <EmptySection icon={<FaCar />} title="Sin vehículos" desc="No hay vehículos registrados en el sistema." />
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {carrosList.map((car, idx) => {
                      const carId   = car.id_carros || car.id;
                      const e       = getE(car.id_estados);
                      const saving  = savingCarroId === carId;
                      const precio  = car.precioviaje;
                      const imgSrc  = car.imagencarro ? (car.imagencarro.startsWith('http') ? car.imagencarro : `http://localhost:8000${car.imagencarro}`) : null;
                      return (
                        <div key={carId ?? idx} style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${e.color}`, borderRadius: '0 16px 16px 0', overflow: 'hidden', animation: 'aFadeUp 0.3s ease both', animationDelay: `${idx * 55}ms` }}>
                          {/* Header strip */}
                          <div style={{ padding: '12px 20px', background: `linear-gradient(90deg,${e.color}09 0%,transparent 55%)`, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.1em', color: T.white, background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, padding: '4px 10px', textTransform: 'uppercase' }}>{car.placa || '—'}</span>
                              <StatusBadge id={car.id_estados} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              {precio && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: T.fog, display: 'flex', alignItems: 'center', gap: 4 }}><FaMapMarkerAlt style={{ fontSize: '0.6rem', color: e.color }} />{precio.origen} → {precio.destino}</span>}
                              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: T.fog, display: 'flex', alignItems: 'center', gap: 4 }}><FaClock style={{ fontSize: '0.6rem' }} />{car.horasalida || '—'}</span>
                              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: T.fog, display: 'flex', alignItems: 'center', gap: 4 }}><FaCalendarAlt style={{ fontSize: '0.6rem' }} />{fmtD(car.fecha)}</span>
                            </div>
                          </div>
                          {/* Body */}
                          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                              {imgSrc
                                ? <img src={imgSrc} alt={car.placa} style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 8, opacity: 0.8, border: `1px solid ${T.border}` }} />
                                : <div style={{ width: 52, height: 40, borderRadius: 8, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCar style={{ color: T.muted, fontSize: '1rem' }} /></div>
                              }
                              <div>
                                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: T.white }}>{car.conductor || '—'}</p>
                                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: T.fog, display: 'flex', alignItems: 'center', gap: 4 }}><FaPhone style={{ fontSize: '0.6rem' }} />{car.telefono || '—'}</p>
                              </div>
                            </div>
                            {/* Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                                <select
                                  value={carroEstados[carId] ?? ''}
                                  onChange={e => setCarroEstados(p => ({ ...p, [carId]: e.target.value }))}
                                  style={{ background: 'none', border: 'none', outline: 'none', color: T.fog, fontSize: '0.75rem', padding: '8px 12px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', minWidth: 160 }}
                                >
                                  <option value="">Cambiar estado…</option>
                                  {Object.entries(ESTADOS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
                                </select>
                              </div>
                              <button
                                onClick={() => handleUpdateCarroEstado(carId)}
                                disabled={saving || !carroEstados[carId]}
                                style={{ height: 36, padding: '0 14px', borderRadius: 9, border: 'none', background: T.amberGlow, border: `1px solid ${T.amberBorder}`, color: T.amber, fontFamily: 'Syne, sans-serif', fontSize: '0.72rem', fontWeight: 700, cursor: (saving || !carroEstados[carId]) ? 'not-allowed' : 'pointer', opacity: !carroEstados[carId] ? 0.4 : saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 5 }}
                              >
                                {saving ? <div style={{ width: 11, height: 11, border: `2px solid ${T.amber}40`, borderTopColor: T.amber, borderRadius: '50%', animation: 'aSpin 0.8s linear infinite' }} /> : <FaCheck style={{ fontSize: '0.6rem' }} />}
                                Guardar
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ tipo: 'carro', id: carId, label: car.placa || `Vehículo #${carId}` })}
                                style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.65rem' }}
                              ><FaTrash /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <DarkPagination currentPage={pageCarros} lastPage={lastPageCarros} onPageChange={p => fetchCarros(p)} loading={loadingCarros} />
                </>
              )}
            </div>
          )}

          {/* ══════════ RESERVAS ══════════ */}
          {activeTab === 'reservas' && (
            <div style={{ animation: 'aFadeUp 0.3s ease both' }}>
              {loadingReservas ? <Spinner /> : reservasList.length === 0 ? (
                <EmptySection icon={<FaTicketAlt />} title="Sin reservas" desc="No hay reservas registradas en el sistema." />
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {reservasList.map((r, idx) => {
                      const id        = r.id_reservarviajes || r.id_reservarviaje || r.id;
                      const estado    = r.estado?.toLowerCase();
                      const pendiente = !estado || estado === 'pendiente';
                      const procesando = procesandoResId === id;
                      const borderColor = estado === 'confirmada' ? T.green : (estado === 'rechazada' || estado === 'cancelada') ? T.red : T.amber;
                      return (
                        <div key={id ?? idx} style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${borderColor}`, borderRadius: '0 14px 14px 0', padding: '16px 20px', animation: 'aFadeUp 0.28s ease both', animationDelay: `${idx * 45}ms` }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                            <div>
                              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: T.white }}>Reserva <span style={{ color: T.amber }}>#{id}</span> · Vehículo #{r.id_carros}</p>
                              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.67rem', color: T.fog }}>{r.created_at ? new Date(r.created_at).toLocaleDateString('es-ES') : '—'}</p>
                            </div>
                            <ResBadge estado={r.estado} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 10, marginBottom: pendiente ? 14 : 0 }}>
                            {[
                              { icon: <FaUser />,       val: r.nombre         || '—' },
                              { icon: <FaPhone />,      val: r.tel || r.telefono || '—' },
                              { icon: <FaMapMarkerAlt />,val: r.ubicacion     || '—' },
                              { icon: <FaCar />,        val: `Asiento ${r.asiento || r.Asiento || '—'}` },
                            ].map((c, i) => (
                              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', color: T.fog }}>
                                <span style={{ color: T.amber, fontSize: '0.62rem', flexShrink: 0 }}>{c.icon}</span>{c.val}
                              </span>
                            ))}
                          </div>
                          {pendiente && (
                            <div style={{ display: 'flex', gap: 8, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                              {[
                                { label: 'Confirmar', fn: () => handleReservaEstado(r, 'confirmada'), bg: 'rgba(34,197,94,0.12)', color: T.green, icon: <FaCheck style={{ fontSize: '0.6rem' }} /> },
                                { label: 'Rechazar',  fn: () => handleReservaEstado(r, 'rechazada'),  bg: 'rgba(239,68,68,0.1)',  color: T.red,   icon: <FaTimes style={{ fontSize: '0.6rem' }} /> },
                              ].map(b => (
                                <button key={b.label} onClick={b.fn} disabled={procesando} style={{ flex: 1, maxWidth: 140, padding: '8px 0', borderRadius: 9, border: 'none', background: b.bg, color: b.color, fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: procesando ? 'not-allowed' : 'pointer', opacity: procesando ? 0.5 : 1 }}>
                                  {procesando ? <div style={{ width: 11, height: 11, border: `2px solid ${b.color}40`, borderTopColor: b.color, borderRadius: '50%', animation: 'aSpin 0.8s linear infinite' }} /> : b.icon}{b.label}
                                </button>
                              ))}
                              <button onClick={() => setDeleteTarget({ tipo: 'reserva', id, label: `Reserva #${id}` })} style={{ marginLeft: 'auto', width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.65rem' }}><FaTrash /></button>
                            </div>
                          )}
                          {!pendiente && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
                              <button onClick={() => setDeleteTarget({ tipo: 'reserva', id, label: `Reserva #${id}` })} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.62rem' }}><FaTrash /></button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <DarkPagination currentPage={pageReservas} lastPage={lastPageReservas} onPageChange={p => fetchReservas(p)} loading={loadingReservas} />
                </>
              )}
            </div>
          )}

          {/* ══════════ FACTURAS ══════════ */}
          {activeTab === 'facturas' && (
            <div style={{ animation: 'aFadeUp 0.3s ease both' }}>
              {loadingFacturas ? <Spinner /> : facturasList.length === 0 ? (
                <EmptySection icon={<FaFileInvoice />} title="Sin facturas" desc="No hay facturas registradas en el sistema." />
              ) : (
                <>
                  {/* Descargar todas */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
                    <button
                      onClick={handleDescargarTodas}
                      disabled={downloadingAll}
                      style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: T.amberGlow, border: `1px solid ${T.amberBorder}`, color: T.amber, fontFamily: 'Syne, sans-serif', fontSize: '0.78rem', fontWeight: 700, cursor: downloadingAll ? 'not-allowed' : 'pointer', opacity: downloadingAll ? 0.6 : 1 }}
                    >
                      {downloadingAll ? <div style={{ width: 13, height: 13, border: `2px solid ${T.amber}40`, borderTopColor: T.amber, borderRadius: '50%', animation: 'aSpin 0.8s linear infinite' }} /> : <FaFileArchive style={{ fontSize: '0.72rem' }} />}
                      {downloadingAll ? 'Generando ZIP…' : 'Descargar todas (.zip)'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {facturasList.map((f, idx) => (
                      <div key={f.id_factura ?? idx} style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.green}`, borderRadius: '0 14px 14px 0', padding: '16px 20px', animation: 'aFadeUp 0.28s ease both', animationDelay: `${idx * 45}ms` }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.08em', color: T.amber, background: T.amberGlow, border: `1px solid ${T.amberBorder}`, borderRadius: 8, padding: '4px 10px' }}>
                              {f.numero_factura || `#${f.id_factura}`}
                            </span>
                            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.58rem', fontWeight: 700, padding: '3px 8px', borderRadius: 999, color: T.green, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', textTransform: 'uppercase' }}>
                              <FaCheck style={{ fontSize: '0.5rem', marginRight: 4 }} />Confirmada
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: T.fog }}>{fmtD(f.created_at)}</span>
                            <button
                              onClick={() => handleDescargarFactura(f)}
                              disabled={downloadingId === f.id_factura}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: T.surface2, border: `1px solid ${T.border}`, color: T.fog, fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 600, cursor: downloadingId === f.id_factura ? 'not-allowed' : 'pointer', opacity: downloadingId === f.id_factura ? 0.5 : 1 }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = T.amberBorder; e.currentTarget.style.color = T.amber; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border;      e.currentTarget.style.color = T.fog; }}
                            >
                              {downloadingId === f.id_factura ? <div style={{ width: 10, height: 10, border: `2px solid ${T.fog}40`, borderTopColor: T.fog, borderRadius: '50%', animation: 'aSpin 0.8s linear infinite' }} /> : <FaDownload style={{ fontSize: '0.58rem' }} />}
                              PDF
                            </button>
                          </div>
                        </div>
                        {/* Data grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 12 }}>
                          {[
                            { label: 'Pasajero',  val: f.usuario?.name || f.usuario?.Nombre || '—' },
                            { label: 'Conductor', val: f.carro?.conductor || '—' },
                            { label: 'Placa',     val: f.carro?.placa     || '—', mono: true },
                            { label: 'Origen',    val: f.origen || f.carro?.precioviaje?.origen  || '—' },
                            { label: 'Destino',   val: f.destino || f.carro?.precioviaje?.destino || '—' },
                            { label: 'Total',     val: fmtM(f.total ?? f.subtotal), accent: T.amber },
                          ].map((c, i) => (
                            <div key={i}>
                              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.56rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{c.label}</p>
                              <p style={{ fontFamily: c.mono ? 'monospace' : 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: c.accent ? 700 : 400, color: c.accent || T.fog }}>{c.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <DarkPagination currentPage={pageFacturas} lastPage={lastPageFacturas} onPageChange={p => fetchFacturas(p)} loading={loadingFacturas} />
                </>
              )}
            </div>
          )}

          {/* ══════════ USUARIOS ══════════ */}
          {activeTab === 'usuarios' && (
            <div style={{ animation: 'aFadeUp 0.3s ease both' }}>

              {/* Barra superior */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                {/* Buscador */}
                <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
                  <FaSearch style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: T.fog, fontSize: '0.75rem', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email, teléfono, rol o ID…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, color: T.white, fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = T.amber}
                    onBlur={e  => e.target.style.borderColor = T.border}
                  />
                </div>
                {/* Info + refresh */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {!isLoadingUsers && users.length > 0 && (
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: T.fog }}>
                      <strong style={{ color: filteredUsers.length < users.length ? T.amber : T.white }}>{filteredUsers.length}</strong>
                      <span style={{ color: T.muted }}> / {users.length} usuarios</span>
                      {searchTerm && <span style={{ color: T.muted }}> · "{searchTerm}"</span>}
                    </span>
                  )}
                  <button
                    onClick={fetchUsers} disabled={isLoadingUsers}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, background: T.surface2, border: `1px solid ${T.border}`, color: isLoadingUsers ? T.amber : T.fog, fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem', fontWeight: 600, cursor: isLoadingUsers ? 'default' : 'pointer' }}
                  >
                    <FaSync style={{ fontSize: '0.65rem', animation: isLoadingUsers ? 'aSpin 1s linear infinite' : 'none' }} />
                    {isLoadingUsers ? 'Cargando…' : 'Actualizar'}
                  </button>
                </div>
              </div>

              {/* Lista */}
              {isLoadingUsers ? <Spinner /> : filteredUsers.length === 0 ? (
                <EmptySection
                  icon={<FaUsers />}
                  title={searchTerm ? 'Sin resultados' : 'Sin usuarios'}
                  desc={searchTerm ? `No hay coincidencias para "${searchTerm}".` : 'No hay usuarios registrados en el sistema.'}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredUsers.map((u, idx) => {
                    const userId  = u.id_users || u.id;
                    const nombre  = u.name || u.Nombre || '—';
                    const inicial = nombre[0]?.toUpperCase() || '?';
                    const rol     = u.rol?.toLowerCase();
                    const rolColor =
                      rol === 'conductor'                    ? T.sky    :
                      rol === 'admin' || rol === 'administrador' ? T.amber  :
                      T.green;

                    return (
                      <div
                        key={userId ?? idx}
                        style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${rolColor}`, borderRadius: '0 14px 14px 0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, animation: 'aFadeUp 0.28s ease both', animationDelay: `${idx * 35}ms` }}
                      >
                        {/* Avatar + datos */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${rolColor}18`, border: `1px solid ${rolColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontSize: '0.85rem', fontWeight: 800, color: rolColor, flexShrink: 0 }}>
                            {inicial}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: T.white }}>{nombre}</p>
                              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.55rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em', color: rolColor, background: `${rolColor}18`, border: `1px solid ${rolColor}30` }}>
                                {u.rol || '—'}
                              </span>
                            </div>
                            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: T.fog }}>{u.email}</p>
                          </div>
                        </div>

                        {/* Meta */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
                          {u.tel && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: T.fog }}>
                              <FaPhone style={{ fontSize: '0.6rem', color: T.muted }} />{u.tel}
                            </span>
                          )}
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.68rem', color: T.muted }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '—'}
                          </span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: T.muted }}>#{userId}</span>
                        </div>

                        {/* Acciones */}
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => navigate(`/ver-perfil/${userId}`)}
                            title="Ver perfil"
                            style={{ width: 32, height: 32, borderRadius: 8, background: T.amberGlow, border: `1px solid ${T.amberBorder}`, color: T.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.68rem' }}
                          ><FaEye /></button>
                          <button
                            onClick={() => setDeleteTarget({ tipo: 'usuario', id: userId, label: nombre })}
                            title="Eliminar usuario"
                            style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.65rem' }}
                          ><FaTrash /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </main>
        <Footer />
      </div>

      {/* ── Modal: Invitar conductor ── */}
      {showInviteModal && (
        <DarkModal title="Invitar conductor" onClose={() => { setShowInviteModal(false); setInviteEmail(''); }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', color: T.fog, marginBottom: 20, lineHeight: 1.6 }}>
            El conductor recibirá un enlace de un solo uso válido por <strong style={{ color: T.white }}>48 horas</strong> para crear su cuenta.
          </p>
          <form onSubmit={handleInvitar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AField label="Correo electrónico" icon={<FaEnvelope />} type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="conductor@correo.com" required />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => { setShowInviteModal(false); setInviteEmail(''); }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, color: T.fog, fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={isInviting || !inviteEmail} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'linear-gradient(135deg,#C8960C,#FFBE00)', border: 'none', color: '#080B12', fontFamily: 'Syne, sans-serif', fontSize: '0.82rem', fontWeight: 800, cursor: (isInviting || !inviteEmail) ? 'not-allowed' : 'pointer', opacity: (isInviting || !inviteEmail) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                {isInviting ? <div style={{ width: 14, height: 14, border: '2px solid rgba(8,11,18,0.25)', borderTopColor: '#080B12', borderRadius: '50%', animation: 'aSpin 0.8s linear infinite' }} /> : <FaEnvelope style={{ fontSize: '0.7rem' }} />}
                {isInviting ? 'Enviando…' : 'Enviar invitación'}
              </button>
            </div>
          </form>
        </DarkModal>
      )}

      {/* ── Modal: Confirmar eliminación ── */}
      {deleteTarget && (
        <div onClick={e => e.target === e.currentTarget && !isDeleting && setDeleteTarget(null)} style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(8,11,18,0.85)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, width: '100%', maxWidth: 380, padding: '28px 24px', animation: 'aScale 0.2s cubic-bezier(.22,1,.36,1) both', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FaTrash style={{ color: T.red, fontSize: '1.1rem' }} />
            </div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: T.white, marginBottom: 6 }}>Eliminar</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: T.fog, marginBottom: 6 }}><strong style={{ color: T.white }}>{deleteTarget.label}</strong></p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: T.fog, marginBottom: 24 }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} disabled={isDeleting} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, color: T.fog, fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', opacity: isDeleting ? 0.5 : 1 }}>Cancelar</button>
              <button onClick={handleDeleteConfirm} disabled={isDeleting} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'linear-gradient(135deg,#dc2626,#ef4444)', border: 'none', color: '#fff', fontFamily: 'Syne, sans-serif', fontSize: '0.82rem', fontWeight: 800, cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                {isDeleting ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'aSpin 0.8s linear infinite' }} /> : null}
                {isDeleting ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IndexAdmin;
