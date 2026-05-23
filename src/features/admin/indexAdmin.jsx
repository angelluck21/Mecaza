import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCar, FaPlus, FaUsers, FaCog, FaSync, FaTicketAlt,
  FaTrash, FaCheck, FaTimes, FaMapMarkerAlt, FaClock,
  FaCalendarAlt, FaPhone, FaUser, FaEnvelope, FaFileInvoice, FaEdit,
  FaDownload, FaFileArchive,
} from 'react-icons/fa';

import PageBg            from '../../components/ui/PageBg';
import InnerNavbar       from '../../components/layout/InnerNavbar';
import LoadingScreen     from '../../components/ui/LoadingScreen';
import StatCard          from '../../components/ui/StatCard';
import SectionCard       from '../../components/ui/SectionCard';
import ToastNotification from '../../components/ui/ToastNotification';
import Pagination        from '../../components/ui/Pagination';
import { useToast }      from '../../hooks/useToast';
import { getEstadoInfo, formatFecha } from '../../utils';

import {
  listarCarrosAdminApi, listarReservasApi, listarEstadosApi,
  listarUsuariosApi, eliminarCarroApi, actualizarEstadoCarroApi,
  confirmarReservaApi, eliminarReservaApi,
  agregarPrecioApi, eliminarPrecioApi, actualizarPrecioApi,
  agregarEstadoApi, eliminarEstadoApi,
  invitarConductorApi, listarFacturasApi, listarPreciosApi,
  descargarFacturaApi, descargarTodasFacturasApi,
} from '../../services/api';

// ── Constantes ────────────────────────────────────────────────────────────────

const ESTADOS_LABELS = [
  { id: 1, label: 'Esperando pasajeros', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 2, label: 'En viaje',            color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 3, label: 'En mantenimiento',    color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 4, label: 'Fuera de servicio',   color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 5, label: 'Viaje terminado',     color: 'bg-gray-100 text-gray-600 border-gray-200' },
];

// ── Sub-componentes ────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, maxWidth = 'max-w-md', children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(15,10,40,0.80)', backdropFilter: 'blur(6px)' }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div className={`bg-white rounded-2xl w-full ${maxWidth} shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
      <div className="bg-gradient-to-r from-blue-800 to-violet-700 px-6 py-4 flex items-center justify-between shrink-0">
        <h2 className="text-base font-bold text-white">{title}</h2>
        <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">&times;</button>
      </div>
      <div className="overflow-y-auto flex-1 p-6">{children}</div>
    </div>
  </div>
);

const ActionCard = ({ icon, title, desc, btnLabel, btnColor = 'violet', onClick }) => {
  const colors = {
    violet: 'from-violet-600 to-blue-600',
    green:  'from-green-600 to-emerald-500',
    blue:   'from-blue-600 to-cyan-500',
    orange: 'from-orange-500 to-amber-400',
    teal:   'from-teal-600 to-cyan-500',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3 hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${colors[btnColor] ?? colors.violet} flex items-center justify-center text-white shadow-sm`}>
          {icon}
        </div>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed flex-1">{desc}</p>
      <button
        onClick={onClick}
        className={`w-full py-2.5 bg-gradient-to-r ${colors[btnColor] ?? colors.violet} text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95`}
      >
        <FaPlus className="text-xs" /> {btnLabel}
      </button>
    </div>
  );
};

// ── Component principal ───────────────────────────────────────────────────────

const IndexAdmin = () => {
  const [userData,       setUserData]       = useState(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [stats,          setStats]          = useState({ totalVehiculos: 0, totalReservas: 0, reservasHoy: 0, totalUsuarios: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Modales configuración
  const [showPreciosModal, setShowPreciosModal] = useState(false);
  const [showEstadoModal,  setShowEstadoModal]  = useState(false);
  const [isSaving,         setIsSaving]         = useState(false);
  const [nuevoPrecio,      setNuevoPrecio]      = useState({ Origen: '', Destino: '', Precio: '' });
  const [preciosList,      setPreciosList]      = useState([]);
  const [loadingPrecios,   setLoadingPrecios]   = useState(false);
  const [deletingPrecioId,  setDeletingPrecioId]  = useState(null);
  const [editingPrecioId,   setEditingPrecioId]   = useState(null);
  const [editingPrecioForm, setEditingPrecioForm] = useState({ Origen: '', Destino: '', Precio: '' });
  const [savingPrecioId,    setSavingPrecioId]    = useState(null);
  const [estadoSel,         setEstadoSel]         = useState('');
  const [estadosConfigList,  setEstadosConfigList]  = useState([]);
  const [loadingEstadosConf, setLoadingEstadosConf] = useState(false);
  const [deletingEstadoId,   setDeletingEstadoId]   = useState(null);

  // Modal carros
  const [showCarrosModal, setShowCarrosModal] = useState(false);
  const [carrosList,      setCarrosList]      = useState([]);
  const [loadingCarros,   setLoadingCarros]   = useState(false);
  const [estadosList,     setEstadosList]     = useState([]);
  const [carroEstados,    setCarroEstados]    = useState({});
  const [savingCarroId,   setSavingCarroId]   = useState(null);
  const [pageCarros,      setPageCarros]      = useState(1);
  const [lastPageCarros,  setLastPageCarros]  = useState(1);

  // Modal reservas
  const [showReservasModal, setShowReservasModal] = useState(false);
  const [reservasList,      setReservasList]      = useState([]);
  const [loadingReservas,   setLoadingReservas]   = useState(false);
  const [procesandoResId,   setProcesandoResId]   = useState(null);
  const [pageReservas,      setPageReservas]      = useState(1);
  const [lastPageReservas,  setLastPageReservas]  = useState(1);

  // Confirmación eliminación compartida
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [isDeleting,      setIsDeleting]      = useState(false);

  // Modal facturas
  const [showFacturasModal,  setShowFacturasModal]  = useState(false);
  const [facturasList,       setFacturasList]       = useState([]);
  const [loadingFacturas,    setLoadingFacturas]    = useState(false);
  const [downloadingId,      setDownloadingId]      = useState(null);
  const [downloadingAll,     setDownloadingAll]     = useState(false);
  const [pageFacturas,       setPageFacturas]       = useState(1);
  const [lastPageFacturas,   setLastPageFacturas]   = useState(1);

  // Modal invitar conductor
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail,     setInviteEmail]     = useState('');
  const [isInviting,      setIsInviting]      = useState(false);

  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  // ── Auth + stats ──────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { navigate('/login'); return; }
    try {
      const user = JSON.parse(stored);
      if (user.rol !== 'admin' && user.rol !== 'administrador') { navigate('/indexLogin'); return; }
      setUserData(user);
      fetchStats();
    } catch { navigate('/login'); }
    setIsLoading(false);
  }, [navigate]);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const [vRes, rRes, uRes] = await Promise.all([
        listarCarrosAdminApi(),
        listarReservasApi(),
        listarUsuariosApi(),
      ]);
      const totalVehiculos = vRes.data?.total ?? (Array.isArray(vRes.data?.data) ? vRes.data.data.length : 0);
      const totalUsuarios  = uRes.data?.total ?? (Array.isArray(uRes.data?.data) ? uRes.data.data.length : 0);
      const reservasArr    = Array.isArray(rRes.data) ? rRes.data : (Array.isArray(rRes) ? rRes : []);
      const totalReservas  = rRes.total ?? reservasArr.length;
      const fechaHoy       = new Date().toISOString().split('T')[0];
      const hoy            = reservasArr.filter(r => r.created_at?.startsWith(fechaHoy)).length;
      setStats({ totalVehiculos, totalReservas, reservasHoy: hoy, totalUsuarios });
    } catch {
      /* silencioso */
    } finally { setIsLoadingStats(false); }
  };

  // ── Precios ───────────────────────────────────────────────────────────────
  const fetchPrecios = async () => {
    setLoadingPrecios(true);
    try {
      const { data } = await listarPreciosApi();
      setPreciosList(Array.isArray(data.data) ? data.data : []);
    } catch { showToast('Error al cargar rutas.', 'error'); }
    finally { setLoadingPrecios(false); }
  };

  const handleSaveNuevoPrecio = async (e) => {
    e.preventDefault();
    if (!nuevoPrecio.Origen || !nuevoPrecio.Destino || !nuevoPrecio.Precio) {
      showToast('Completa todos los campos.', 'error'); return;
    }
    setIsSaving(true);
    try {
      await agregarPrecioApi({
        Origen:  nuevoPrecio.Origen.trim(),
        Destino: nuevoPrecio.Destino.trim(),
        Precio:  parseFloat(nuevoPrecio.Precio),
      });
      showToast('Ruta agregada correctamente.', 'success');
      setNuevoPrecio({ Origen: '', Destino: '', Precio: '' });
      await fetchPrecios();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al guardar la ruta.', 'error');
    } finally { setIsSaving(false); }
  };

  const handleEliminarPrecio = async (id) => {
    setDeletingPrecioId(id);
    try {
      await eliminarPrecioApi(id);
      showToast('Ruta eliminada.', 'success');
      await fetchPrecios();
    } catch { showToast('Error al eliminar la ruta.', 'error'); }
    finally { setDeletingPrecioId(null); }
  };

  const handleUpdatePrecio = async (id) => {
    setSavingPrecioId(id);
    try {
      await actualizarPrecioApi(id, {
        Origen:  editingPrecioForm.Origen.trim(),
        Destino: editingPrecioForm.Destino.trim(),
        Precio:  parseFloat(editingPrecioForm.Precio),
      });
      showToast('Ruta actualizada.', 'success');
      setEditingPrecioId(null);
      await fetchPrecios();
    } catch { showToast('Error al actualizar la ruta.', 'error'); }
    finally { setSavingPrecioId(null); }
  };

  const fetchEstadosConfig = async () => {
    setLoadingEstadosConf(true);
    try {
      const { data } = await listarEstadosApi();
      setEstadosConfigList(Array.isArray(data.data) ? data.data : []);
    } catch { showToast('Error al cargar estados.', 'error'); }
    finally { setLoadingEstadosConf(false); }
  };

  const handleEliminarEstado = async (id) => {
    setDeletingEstadoId(id);
    try {
      await eliminarEstadoApi(id);
      showToast('Estado eliminado.', 'success');
      await fetchEstadosConfig();
    } catch { showToast('Error al eliminar el estado.', 'error'); }
    finally { setDeletingEstadoId(null); }
  };

  // ── Estados ───────────────────────────────────────────────────────────────
  const handleSaveEstado = async (e) => {
    e.preventDefault();
    if (!estadoSel) { showToast('Selecciona un estado.', 'error'); return; }
    setIsSaving(true);
    try {
      const estado = ESTADOS_LABELS.find(s => s.id === parseInt(estadoSel));
      await agregarEstadoApi({ Estados: estado.label });
      showToast('Estado guardado correctamente.', 'success');
      setEstadoSel('');
      setShowEstadoModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al guardar estado.', 'error');
    } finally { setIsSaving(false); }
  };

  // ── Carros ────────────────────────────────────────────────────────────────
  const fetchCarros = async (page = 1) => {
    setLoadingCarros(true);
    setShowCarrosModal(true);
    try {
      const [cRes, eRes] = await Promise.all([listarCarrosAdminApi(page), listarEstadosApi()]);
      const cars    = Array.isArray(cRes.data?.data) ? cRes.data.data : [];
      const estados = Array.isArray(eRes.data?.data) ? eRes.data.data : [];
      setCarrosList(cars);
      setEstadosList(estados);
      setPageCarros(cRes.data?.current_page ?? 1);
      setLastPageCarros(cRes.data?.last_page ?? 1);
      const initial = {};
      cars.forEach(c => { initial[c.id_carros || c.id] = c.id_estados || ''; });
      setCarroEstados(initial);
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
    } catch { showToast('Error al actualizar el estado.', 'error'); }
    finally { setSavingCarroId(null); }
  };

  // ── Reservas ──────────────────────────────────────────────────────────────
  const fetchReservas = async (page = 1) => {
    setLoadingReservas(true);
    setShowReservasModal(true);
    try {
      const data = await listarReservasApi(page);
      const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setReservasList(list);
      setPageReservas(data.current_page ?? 1);
      setLastPageReservas(data.last_page ?? 1);
    } catch { showToast('Error al cargar reservas.', 'error'); }
    finally { setLoadingReservas(false); }
  };

  const handleReservaEstado = async (reserva, estado) => {
    const id = reserva.id_reservarviajes || reserva.id_reservarviaje || reserva.id;
    setProcesandoResId(id);
    try {
      await confirmarReservaApi(id, estado);
      showToast(estado === 'Confirmada' ? 'Reserva confirmada.' : 'Reserva rechazada.', estado === 'Confirmada' ? 'success' : 'error');
      await fetchReservas(pageReservas);
    } catch { showToast('Error al actualizar la reserva.', 'error'); }
    finally { setProcesandoResId(null); }
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
      }
    } catch { showToast('Error al eliminar.', 'error'); }
    finally { setIsDeleting(false); }
  };

  // ── Facturas ──────────────────────────────────────────────────────────────
  const fetchFacturas = async (page = 1) => {
    setLoadingFacturas(true);
    setShowFacturasModal(true);
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
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleDescargarFactura = async (factura) => {
    setDownloadingId(factura.id_factura);
    try {
      const { data } = await descargarFacturaApi(factura.id_factura);
      triggerDownload(new Blob([data], { type: 'application/pdf' }), `${factura.numero_factura}.pdf`);
    } catch { showToast('Error al descargar la factura.', 'error'); }
    finally { setDownloadingId(null); }
  };

  const handleDescargarTodas = async () => {
    setDownloadingAll(true);
    try {
      const { data } = await descargarTodasFacturasApi();
      triggerDownload(new Blob([data], { type: 'application/zip' }), `facturas_mecaza_${new Date().toISOString().slice(0,10)}.zip`);
    } catch { showToast('Error al descargar el ZIP de facturas.', 'error'); }
    finally { setDownloadingAll(false); }
  };

  // ── Invitar conductor ─────────────────────────────────────────────────────
  const handleInvitar = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await invitarConductorApi(inviteEmail);
      showToast(`Invitación enviada a ${inviteEmail}`, 'success');
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Error al enviar la invitación.';
      showToast(msg, 'error');
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) return <LoadingScreen message="Cargando panel..." />;
  if (!userData)  return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PageBg>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />
      <InnerNavbar userData={userData} title="Panel Administrativo" backTo="/indexLogin" />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Panel Administrativo</h1>
          <p className="text-blue-200 text-sm mt-1">Gestiona el sistema Mecaza desde aquí.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up">
          <StatCard icon={<FaCar />}       label="Vehículos"     value={stats.totalVehiculos} color="blue"   loading={isLoadingStats} />
          <StatCard icon={<FaTicketAlt />} label="Reservas"      value={stats.totalReservas}  color="violet" loading={isLoadingStats} />
          <StatCard icon={<FaUsers />}     label="Reservas hoy"  value={stats.reservasHoy}    color="green"  loading={isLoadingStats} />
          <StatCard icon={<FaUser />}      label="Usuarios"      value={stats.totalUsuarios}  color="blue"   loading={isLoadingStats} />
        </div>

        {/* Actualizar stats */}
        <div className="flex justify-end">
          <button
            onClick={fetchStats}
            disabled={isLoadingStats}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <FaSync className={isLoadingStats ? 'animate-spin' : ''} />
            {isLoadingStats ? 'Actualizando...' : 'Actualizar stats'}
          </button>
        </div>

        {/* Configuración */}
        <SectionCard title="Configuración del sistema" icon={<FaCog className="text-sm" />} className="animate-fade-in-up">
          <div className="grid sm:grid-cols-2 gap-4 mt-1">
            <ActionCard
              icon={<FaCar />}
              title="Estado del viaje"
              desc="Configura los estados disponibles para los viajes del sistema."
              btnLabel="Gestionar estados"
              btnColor="green"
              onClick={() => { setShowEstadoModal(true); fetchEstadosConfig(); }}
            />
            <ActionCard
              icon={<FaTicketAlt />}
              title="Precios de rutas"
              desc="Gestiona las rutas y precios disponibles para los conductores."
              btnLabel="Gestionar rutas"
              btnColor="blue"
              onClick={() => { setShowPreciosModal(true); fetchPrecios(); }}
            />
          </div>
        </SectionCard>

        {/* Gestión */}
        <SectionCard title="Gestión" icon={<FaUsers className="text-sm" />} accent="blue" className="animate-fade-in-up">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-1">
            <ActionCard
              icon={<FaUsers />}
              title="Ver usuarios"
              desc="Consulta y administra la lista completa de usuarios registrados."
              btnLabel="Ver usuarios"
              btnColor="violet"
              onClick={() => navigate('/lista-usuarios')}
            />
            <ActionCard
              icon={<FaCar />}
              title="Ver vehículos"
              desc="Administra todos los vehículos registrados: estado y eliminación."
              btnLabel="Ver vehículos"
              btnColor="teal"
              onClick={() => fetchCarros(1)}
            />
            <ActionCard
              icon={<FaTicketAlt />}
              title="Ver reservas"
              desc="Gestiona todas las reservas: confirma, rechaza o elimina."
              btnLabel="Ver reservas"
              btnColor="orange"
              onClick={() => fetchReservas(1)}
            />
            <ActionCard
              icon={<FaFileInvoice />}
              title="Ver facturas"
              desc="Consulta todas las facturas generadas del sistema."
              btnLabel="Ver facturas"
              btnColor="blue"
              onClick={() => fetchFacturas(1)}
            />
            <ActionCard
              icon={<FaEnvelope />}
              title="Invitar conductor"
              desc="Envía un link de invitación por correo para que un conductor cree su cuenta."
              btnLabel="Invitar conductor"
              btnColor="green"
              onClick={() => setShowInviteModal(true)}
            />
          </div>
        </SectionCard>
      </div>

      {/* ── Modal: Gestionar Estados ── */}
      {showEstadoModal && (
        <Modal title="Gestionar Estados de Viaje" maxWidth="max-w-2xl" onClose={() => { setShowEstadoModal(false); setEstadoSel(''); }}>
          <div className="grid grid-cols-2 gap-6">

            {/* Izquierda: agregar */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Agregar estado</p>
              <form onSubmit={handleSaveEstado} className="space-y-2">
                {ESTADOS_LABELS.map(e => (
                  <label
                    key={e.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      estadoSel == e.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <input type="radio" name="estado" value={e.id} checked={estadoSel == e.id} onChange={ev => setEstadoSel(ev.target.value)} className="sr-only" />
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${e.color}`}>{e.label}</span>
                  </label>
                ))}
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={isSaving || !estadoSel}
                    className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    {isSaving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Guardando...</> : <><FaPlus className="text-xs" /> Agregar</>}
                  </button>
                  <button type="button" onClick={() => setShowEstadoModal(false)}
                    className="px-4 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all">
                    Cerrar
                  </button>
                </div>
              </form>
            </div>

            {/* Derecha: lista */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Estados registrados</p>
              {loadingEstadosConf ? (
                <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                  <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                  Cargando...
                </div>
              ) : estadosConfigList.length === 0 ? (
                <p className="text-sm text-gray-400 py-3 text-center">Sin estados registrados.</p>
              ) : (
                <div className="space-y-2">
                  {estadosConfigList.map(est => {
                    const id  = est.id_estados || est.id;
                    const lbl = est.estados || est.nombre || `Estado ${id}`;
                    const info = ESTADOS_LABELS.find(e => e.label.toLowerCase() === lbl.toLowerCase());
                    const deleting = deletingEstadoId === id;
                    return (
                      <div key={id} className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${info?.color ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {lbl}
                        </span>
                        <button
                          onClick={() => handleEliminarEstado(id)}
                          disabled={deleting}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Eliminar estado"
                        >
                          {deleting
                            ? <div className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                            : <FaTrash className="text-xs" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Gestionar Rutas y Precios ── */}
      {showPreciosModal && (
        <Modal title="Gestionar Rutas y Precios" maxWidth="max-w-3xl" onClose={() => { setShowPreciosModal(false); setNuevoPrecio({ Origen: '', Destino: '', Precio: '' }); setEditingPrecioId(null); }}>
          <div className="grid grid-cols-2 gap-6">

            {/* Izquierda: agregar */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Agregar nueva ruta</p>
              <form onSubmit={handleSaveNuevoPrecio} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Origen</label>
                  <input
                    type="text" required
                    value={nuevoPrecio.Origen}
                    onChange={e => setNuevoPrecio(p => ({ ...p, Origen: e.target.value }))}
                    placeholder="Ej. Zaragoza"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Destino</label>
                  <input
                    type="text" required
                    value={nuevoPrecio.Destino}
                    onChange={e => setNuevoPrecio(p => ({ ...p, Destino: e.target.value }))}
                    placeholder="Ej. Medellín"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Precio (COP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-medium">$</span>
                    <input
                      type="number" min="0" step="0.01" required
                      value={nuevoPrecio.Precio}
                      onChange={e => setNuevoPrecio(p => ({ ...p, Precio: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={isSaving}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-700 to-violet-600 text-white font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    {isSaving
                      ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Guardando...</>
                      : <><FaPlus className="text-xs" /> Agregar ruta</>}
                  </button>
                  <button type="button" onClick={() => setShowPreciosModal(false)}
                    className="px-3 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all">
                    Cerrar
                  </button>
                </div>
              </form>
            </div>

            {/* Derecha: lista con edición */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Rutas registradas</p>
              {loadingPrecios ? (
                <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                  <div className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                  Cargando...
                </div>
              ) : preciosList.length === 0 ? (
                <p className="text-sm text-gray-400 py-3 text-center">Sin rutas registradas aún.</p>
              ) : (
                <div className="space-y-2">
                  {preciosList.map(ruta => {
                    const id       = ruta.id_precioviajes || ruta.id;
                    const deleting = deletingPrecioId === id;
                    const editing  = editingPrecioId  === id;
                    const saving   = savingPrecioId   === id;

                    return (
                      <div key={id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                        {editing ? (
                          <>
                            <input
                              value={editingPrecioForm.Origen}
                              onChange={e => setEditingPrecioForm(p => ({ ...p, Origen: e.target.value }))}
                              placeholder="Origen"
                              className="w-full px-2.5 py-1.5 border border-violet-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                            />
                            <input
                              value={editingPrecioForm.Destino}
                              onChange={e => setEditingPrecioForm(p => ({ ...p, Destino: e.target.value }))}
                              placeholder="Destino"
                              className="w-full px-2.5 py-1.5 border border-violet-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                            />
                            <div className="relative">
                              <span className="absolute left-2.5 top-1.5 text-gray-400 text-sm">$</span>
                              <input
                                type="number" min="0" step="0.01"
                                value={editingPrecioForm.Precio}
                                onChange={e => setEditingPrecioForm(p => ({ ...p, Precio: e.target.value }))}
                                placeholder="Precio"
                                className="w-full pl-6 pr-3 py-1.5 border border-violet-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdatePrecio(id)}
                                disabled={saving}
                                className="flex-1 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                              >
                                {saving ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FaCheck className="text-[10px]" />}
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingPrecioId(null)}
                                className="px-3 py-1.5 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-300 transition-all"
                              >
                                Cancelar
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {ruta.origen} <span className="text-gray-400">→</span> {ruta.destino}
                              </p>
                              <p className="text-xs text-violet-600 font-bold">
                                ${Number(ruta.precio).toLocaleString('es-CO')}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => { setEditingPrecioId(id); setEditingPrecioForm({ Origen: ruta.origen, Destino: ruta.destino, Precio: ruta.precio }); }}
                                className="p-1.5 text-violet-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-all"
                                title="Editar ruta"
                              >
                                <FaEdit className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleEliminarPrecio(id)}
                                disabled={deleting}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                title="Eliminar ruta"
                              >
                                {deleting
                                  ? <div className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                  : <FaTrash className="text-xs" />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Ver Vehículos ── */}
      {showCarrosModal && (
        <Modal title="Todos los Vehículos" maxWidth="max-w-3xl" onClose={() => setShowCarrosModal(false)}>
          {loadingCarros ? (
            <div className="flex items-center justify-center py-10 gap-3">
              <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400 text-sm">Cargando vehículos...</span>
            </div>
          ) : carrosList.length === 0 ? (
            <div className="text-center py-10">
              <FaCar className="text-gray-300 text-3xl mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No hay vehículos registrados.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {carrosList.map((car, idx) => {
                  const carId    = car.id_carros || car.id;
                  const estadoInfo = getEstadoInfo(car.id_estados);
                  const saving   = savingCarroId === carId;
                  return (
                    <div key={carId ?? idx} className="border border-gray-100 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{car.placa || 'Sin placa'}</p>
                          <p className="text-xs text-gray-400">{car.conductor}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${estadoInfo.color}`}>
                          {estadoInfo.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-violet-400 shrink-0" />
                          {car.precioviaje
                            ? `${car.precioviaje.origen} → ${car.precioviaje.destino}`
                            : '—'}
                        </span>
                        <span className="flex items-center gap-1"><FaClock className="text-violet-400 shrink-0" />{car.horasalida || '—'}</span>
                        <span className="flex items-center gap-1"><FaCalendarAlt className="text-violet-400 shrink-0" />{formatFecha(car.fecha)}</span>
                        <span className="flex items-center gap-1"><FaPhone className="text-violet-400 shrink-0" />{car.telefono || '—'}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-50">
                        <select
                          value={carroEstados[carId] ?? ''}
                          onChange={e => setCarroEstados(p => ({ ...p, [carId]: e.target.value }))}
                          className="flex-1 min-w-[140px] py-1.5 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
                        >
                          <option value="">Cambiar estado...</option>
                          {estadosList.length > 0
                            ? estadosList.map(e => (
                                <option key={e.id_estados || e.id} value={e.id_estados || e.id}>
                                  {e.estados || e.nombre || `Estado ${e.id_estados || e.id}`}
                                </option>
                              ))
                            : ESTADOS_LABELS.map(e => (
                                <option key={e.id} value={e.id}>{e.label}</option>
                              ))
                          }
                        </select>
                        <button
                          onClick={() => handleUpdateCarroEstado(carId)}
                          disabled={saving || !carroEstados[carId]}
                          className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-1"
                        >
                          {saving ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FaCheck />}
                          Actualizar
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ tipo: 'carro', id: carId, label: car.placa || `Vehículo #${carId}` })}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar vehículo"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6">
                <Pagination
                  currentPage={pageCarros}
                  lastPage={lastPageCarros}
                  onPageChange={p => fetchCarros(p)}
                  loading={loadingCarros}
                />
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ── Modal: Ver Reservas ── */}
      {showReservasModal && (
        <Modal title="Todas las Reservas" maxWidth="max-w-3xl" onClose={() => setShowReservasModal(false)}>
          {loadingReservas ? (
            <div className="flex items-center justify-center py-10 gap-3">
              <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400 text-sm">Cargando reservas...</span>
            </div>
          ) : reservasList.length === 0 ? (
            <div className="text-center py-10">
              <FaTicketAlt className="text-gray-300 text-3xl mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No hay reservas registradas.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {reservasList.map((r, idx) => {
                  const id       = r.id_reservarviajes || r.id_reservarviaje || r.id;
                  const estado   = r.estado?.toLowerCase();
                  const pendiente = !estado || estado === 'pendiente';
                  const procesando = procesandoResId === id;
                  const statusCls =
                    estado === 'confirmada'                        ? 'bg-green-100 text-green-700 border-green-200' :
                    estado === 'rechazada' || estado === 'cancelada' ? 'bg-red-100 text-red-700 border-red-200' :
                    'bg-yellow-100 text-yellow-700 border-yellow-200';

                  return (
                    <div key={id ?? idx} className="border border-gray-100 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-bold text-gray-800 text-sm">Reserva #{id} · Carro #{r.id_carros}</p>
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusCls}`}>
                          {r.estado || 'Pendiente'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><FaUser className="text-violet-400 shrink-0" />{r.nombre || '—'}</span>
                        <span className="flex items-center gap-1"><FaPhone className="text-violet-400 shrink-0" />{r.tel || r.telefono || '—'}</span>
                        <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-violet-400 shrink-0" />{r.ubicacion || '—'}</span>
                        <span className="flex items-center gap-1"><FaCar className="text-violet-400 shrink-0" />Asiento {r.asiento || r.Asiento || '—'}</span>
                      </div>
                      <div className="flex gap-2 pt-1 border-t border-gray-50 flex-wrap">
                        {pendiente && (
                          <>
                            <button
                              onClick={() => handleReservaEstado(r, 'Confirmada')}
                              disabled={procesando}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
                            >
                              {procesando ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FaCheck />}
                              Confirmar
                            </button>
                            <button
                              onClick={() => handleReservaEstado(r, 'rechazada')}
                              disabled={procesando}
                              className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50"
                            >
                              {procesando ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FaTimes />}
                              Rechazar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDeleteTarget({ tipo: 'reserva', id, label: `Reserva #${id}` })}
                          className="ml-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Eliminar reserva"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6">
                <Pagination
                  currentPage={pageReservas}
                  lastPage={lastPageReservas}
                  onPageChange={p => fetchReservas(p)}
                  loading={loadingReservas}
                />
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ── Modal: Ver Facturas ── */}
      {showFacturasModal && (
        <Modal title="Todas las Facturas" maxWidth="max-w-3xl" onClose={() => setShowFacturasModal(false)}>
          {loadingFacturas ? (
            <div className="flex items-center justify-center py-10 gap-3">
              <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400 text-sm">Cargando facturas...</span>
            </div>
          ) : facturasList.length === 0 ? (
            <div className="text-center py-10">
              <FaFileInvoice className="text-gray-300 text-3xl mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No hay facturas registradas.</p>
            </div>
          ) : (
            <>
              {/* Botón descargar todas */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleDescargarTodas}
                  disabled={downloadingAll}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {downloadingAll
                    ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generando ZIP...</>
                    : <><FaFileArchive className="text-xs" /> Descargar todas (.zip)</>}
                </button>
              </div>
              <div className="space-y-3">
                {facturasList.map((f, idx) => (
                  <div key={f.id_factura ?? idx} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                      <div>
                        <p className="font-bold text-gray-800 text-sm font-mono">{f.numero_factura || `#${f.id_factura}`}</p>
                        <p className="text-xs text-gray-400">
                          {f.created_at ? new Date(f.created_at).toLocaleDateString('es-ES') : '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                          <FaCheck className="text-[10px]" /> Confirmada
                        </span>
                        <button
                          onClick={() => handleDescargarFactura(f)}
                          disabled={downloadingId === f.id_factura}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold border border-violet-200 hover:bg-violet-200 transition-all disabled:opacity-50"
                        >
                          {downloadingId === f.id_factura
                            ? <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                            : <FaDownload className="text-[10px]" />}
                          PDF
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-600 mb-2">
                      <div>
                        <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Pasajero</p>
                        <p className="font-medium">{f.usuario?.name || f.usuario?.Nombre || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Conductor</p>
                        <p className="font-medium">{f.carro?.conductor || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Placa</p>
                        <p className="font-mono font-medium">{f.carro?.placa || '—'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600">
                      <div>
                        <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Origen</p>
                        <p className="font-medium">{f.origen || f.carro?.precioviaje?.origen || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Destino</p>
                        <p className="font-medium">{f.destino || f.carro?.precioviaje?.destino || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Subtotal</p>
                        <p className="font-medium">${(f.subtotal ?? 0).toLocaleString('es-CO')}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Total</p>
                        <p className="font-bold text-violet-600 text-sm">${(f.total ?? 0).toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Pagination
                  currentPage={pageFacturas}
                  lastPage={lastPageFacturas}
                  onPageChange={p => fetchFacturas(p)}
                  loading={loadingFacturas}
                />
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ── Modal: Invitar Conductor ── */}
      {showInviteModal && (
        <Modal title="Invitar Conductor" onClose={() => { setShowInviteModal(false); setInviteEmail(''); }}>
          <form onSubmit={handleInvitar} className="space-y-4">
            <p className="text-sm text-gray-500">
              Ingresa el correo del conductor. Recibirá un enlace de un solo uso válido por <strong>48 horas</strong> para crear su cuenta.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-violet-400 text-sm" />
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="conductor@correo.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isInviting || !inviteEmail}
                className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isInviting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <><FaEnvelope className="text-xs" /> Enviar invitación</>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setShowInviteModal(false); setInviteEmail(''); }}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Confirmar eliminación ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(15,10,40,0.85)', backdropFilter: 'blur(6px)' }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl text-center overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaTrash className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-bold text-white">Eliminar</h3>
              <p className="text-red-100 text-sm mt-1">{deleteTarget.label}</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-5">
                Esta acción es <span className="font-semibold text-red-600">irreversible</span>. ¿Confirmas?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-60"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageBg>
  );
};

export default IndexAdmin;
