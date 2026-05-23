import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCar, FaPlus, FaTrash, FaListAlt,
  FaMapMarkerAlt, FaClock, FaCalendarAlt, FaPhone,
  FaUser, FaCheck, FaTimes, FaIdCard, FaPlay, FaFlagCheckered,
  FaSync, FaRoad, FaStar, FaRoute,
} from 'react-icons/fa';

import PageBg            from '../../components/ui/PageBg';
import InnerNavbar       from '../../components/layout/InnerNavbar';
import LoadingScreen     from '../../components/ui/LoadingScreen';
import FormInput         from '../../components/ui/FormInput';
import ToastNotification from '../../components/ui/ToastNotification';
import Pagination        from '../../components/ui/Pagination';
import { useToast }      from '../../hooks/useToast';

import {
  misReservasApi, listarEstadosApi, listarPreciosApi,
  crearCarroApi, eliminarCarroApi,
  confirmarReservaApi, iniciarViajeApi, terminarViajeApi,
  historialConductorApi, asignarViajeApi, misCarrosApi,
} from '../../services/api';
import { compressImage, getEstadoInfo, formatFecha } from '../../utils';

// ── Modal base ────────────────────────────────────────────────────────────────
const Modal = ({ title, accent = 'violet', onClose, children }) => {
  const accents = {
    violet: 'from-violet-700 to-blue-700',
    green:  'from-green-600 to-emerald-600',
    red:    'from-red-600 to-rose-600',
    blue:   'from-blue-700 to-cyan-600',
    orange: 'from-orange-500 to-amber-500',
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,5,30,0.80)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className={`bg-gradient-to-r ${accents[accent]} px-6 py-4 flex items-center justify-between shrink-0`}>
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl leading-none transition-colors">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
};

const ActionCard = ({ icon, title, desc, btnLabel, gradient, onClick }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3 hover:-translate-y-0.5">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white shadow-sm`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
    </div>
    <p className="text-xs text-gray-500 leading-relaxed flex-1">{desc}</p>
    <button
      onClick={onClick}
      className={`w-full py-2.5 bg-gradient-to-r ${gradient} text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95`}
    >
      <FaPlus className="text-xs" /> {btnLabel}
    </button>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-2 text-sm">
    <span className="text-violet-400 mt-0.5 shrink-0">{icon}</span>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-gray-700">{value || '—'}</p>
    </div>
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
const Conductor = () => {
  const [userData,  setUserData]  = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modales
  const [showAddCar,      setShowAddCar]      = useState(false);
  const [showAsignar,     setShowAsignar]      = useState(false);
  const [showReservas,    setShowReservas]     = useState(false);
  const [showCarros,      setShowCarros]       = useState(false);
  const [showDeleteModal, setShowDeleteModal]  = useState(false);
  const [showHistorial,   setShowHistorial]    = useState(false);

  // Datos
  const [reservas,       setReservas]       = useState([]);
  const [carros,         setCarros]         = useState([]);
  const [rutas,          setRutas]          = useState([]);
  const [estados,        setEstados]        = useState([]);
  const [carroToDelete,  setCarroToDelete]  = useState(null);
  const [carroAAsignar,  setCarroAAsignar]  = useState(null);
  const [historial,      setHistorial]      = useState([]);

  // Dashboard
  const [dashCarros,   setDashCarros]   = useState([]);
  const [dashReservas, setDashReservas] = useState([]);
  const [loadingDash,  setLoadingDash]  = useState(true);

  // Loading
  const [loadingReservas,  setLoadingReservas]  = useState(false);
  const [loadingCarros,    setLoadingCarros]    = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [isSaving,         setIsSaving]         = useState(false);
  const [isDeleting,       setIsDeleting]       = useState(false);
  const [isAsignando,      setIsAsignando]      = useState(false);
  const [procesando,       setProcesando]       = useState(null);
  const [accionCarroId,    setAccionCarroId]    = useState(null);

  // Paginación reservas
  const [pageReservas,      setPageReservas]      = useState(1);
  const [lastPageReservas,  setLastPageReservas]  = useState(1);

  // Paginación historial
  const [pageHistorial,     setPageHistorial]     = useState(1);
  const [lastPageHistorial, setLastPageHistorial] = useState(1);

  // Formulario nuevo vehículo
  const [carData, setCarData] = useState({
    Conductor: '', Placa: '', Telefono: '', Asientos: '', Imagencarro: null,
  });

  // Formulario asignar viaje
  const [viajeData, setViajeData] = useState({ id_precioviaje: '', horasalida: '', fecha: '' });

  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  // ── Auth ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    const token  = localStorage.getItem('authToken');
    if (!token || !stored) { navigate('/login'); return; }
    try {
      const user = JSON.parse(stored);
      if (user.rol !== 'conductor' && user.rol !== 'admin') {
        showToast('Sin permisos para el panel de conductor.', 'error');
        navigate('/indexLogin');
        return;
      }
      setUserData(user);
    } catch { navigate('/login'); }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => { if (userData) loadDashboard(); }, [userData]);

  // ── Cargar dashboard ───────────────────────────────────────────────────────────
  const loadDashboard = async () => {
    setLoadingDash(true);
    try {
      const [carsResp, resResp] = await Promise.all([misCarrosApi(), misReservasApi(1)]);
      const misCarros = Array.isArray(carsResp.data?.data) ? carsResp.data.data : [];
      const activeRes = Array.isArray(resResp.data?.data) ? resResp.data.data : [];
      setDashCarros(misCarros);
      setDashReservas(activeRes);
    } catch { /* silencioso */ }
    finally { setLoadingDash(false); }
  };

  const fetchRutas = async () => {
    if (rutas.length > 0) return;
    try {
      const { data } = await listarPreciosApi();
      setRutas(Array.isArray(data.data) ? data.data : []);
    } catch { /* silencioso */ }
  };

  const fetchEstados = async () => {
    if (estados.length > 0) return;
    try {
      const { data } = await listarEstadosApi();
      setEstados(Array.isArray(data.data) ? data.data : []);
    } catch { /* silencioso */ }
  };

  const fetchReservas = async (page = 1) => {
    setLoadingReservas(true);
    setShowReservas(true);
    try {
      const { data } = await misReservasApi(page);
      setReservas(Array.isArray(data.data) ? data.data : []);
      setPageReservas(data.current_page ?? 1);
      setLastPageReservas(data.last_page ?? 1);
    } catch { showToast('Error al cargar reservas.', 'error'); }
    finally { setLoadingReservas(false); }
  };

  const fetchCarros = async () => {
    setLoadingCarros(true);
    setShowCarros(true);
    try {
      const { data } = await misCarrosApi();
      setCarros(Array.isArray(data.data) ? data.data : []);
    } catch { showToast('Error al cargar vehículos.', 'error'); }
    finally { setLoadingCarros(false); }
  };

  const fetchHistorial = async (page = 1) => {
    setLoadingHistorial(true);
    setShowHistorial(true);
    try {
      const { data } = await historialConductorApi(page);
      setHistorial(Array.isArray(data.data) ? data.data : []);
      setPageHistorial(data.current_page ?? 1);
      setLastPageHistorial(data.last_page ?? 1);
    } catch { showToast('Error al cargar el historial.', 'error'); }
    finally { setLoadingHistorial(false); }
  };

  // ── Crear vehículo ────────────────────────────────────────────────────────────
  const handleAddCar = async (e) => {
    e.preventDefault();
    const { Conductor, Placa, Asientos, Telefono, Imagencarro } = carData;
    if (!Conductor || !Placa || !Asientos || !Telefono || !Imagencarro) {
      showToast('Completa todos los campos.', 'error'); return;
    }
    const userId = userData?.id || userData?.id_users || userData?.ID;
    if (!userId) { showToast('No se pudo identificar tu cuenta.', 'error'); return; }

    const nombreLogueado = userData?.Nombre || userData?.nombre || userData?.name || '';
    if (Conductor.trim().toLowerCase() !== nombreLogueado.toLowerCase()) {
      showToast('El nombre del conductor debe coincidir con tu cuenta.', 'error'); return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('Conductor',  Conductor.trim());
      formData.append('Telefono',   Telefono.trim());
      formData.append('Placa',      Placa.trim());
      formData.append('Asientos',   Asientos);
      formData.append('Userid',     parseInt(userId));
      const compressed = await compressImage(Imagencarro);
      formData.append('Imagencarro', compressed);

      await crearCarroApi(formData);
      showToast('Vehículo registrado. Ahora asígnale un viaje desde "Vehículos inactivos".', 'success');
      setCarData({ Conductor: '', Placa: '', Telefono: '', Asientos: '', Imagencarro: null });
      setShowAddCar(false);
      await loadDashboard();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors ? Object.values(errors).flat()[0] : (err.response?.data?.message || 'Error al guardar.');
      showToast(String(msg), 'error');
    } finally { setIsSaving(false); }
  };

  // ── Asignar viaje ─────────────────────────────────────────────────────────────
  const handleAsignarViaje = async (e) => {
    e.preventDefault();
    if (!carroAAsignar || !viajeData.id_precioviaje || !viajeData.horasalida || !viajeData.fecha) {
      showToast('Completa todos los campos del viaje.', 'error'); return;
    }
    const id = carroAAsignar.id_carros || carroAAsignar.id;
    setIsAsignando(true);
    try {
      await asignarViajeApi(id, {
        id_precioviaje: parseInt(viajeData.id_precioviaje),
        horasalida:     viajeData.horasalida,
        fecha:          viajeData.fecha,
      });
      showToast('¡Viaje asignado! El vehículo ya está activo.', 'success');
      setShowAsignar(false);
      setCarroAAsignar(null);
      setViajeData({ id_precioviaje: '', horasalida: '', fecha: '' });
      await loadDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al asignar el viaje.', 'error');
    } finally { setIsAsignando(false); }
  };

  // ── Eliminar vehículo ─────────────────────────────────────────────────────────
  const handleDeleteCarro = async () => {
    if (!carroToDelete) return;
    setIsDeleting(true);
    try {
      const id = carroToDelete.id_carros || carroToDelete.id;
      await eliminarCarroApi(id);
      showToast('Vehículo eliminado.', 'success');
      setShowDeleteModal(false);
      setCarroToDelete(null);
      await fetchCarros();
      await loadDashboard();
    } catch { showToast('Error al eliminar el vehículo.', 'error'); }
    finally { setIsDeleting(false); }
  };

  // ── Iniciar / terminar viaje ──────────────────────────────────────────────────
  const handleIniciarViaje = async (carroId) => {
    setAccionCarroId(carroId);
    try {
      await iniciarViajeApi(carroId);
      showToast('¡Viaje iniciado!', 'success');
      await loadDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al iniciar el viaje.', 'error');
    } finally { setAccionCarroId(null); }
  };

  const handleTerminarViaje = async (carroId) => {
    setAccionCarroId(carroId);
    try {
      await terminarViajeApi(carroId);
      showToast('Viaje finalizado. El vehículo quedó inactivo.', 'success');
      await loadDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al finalizar el viaje.', 'error');
    } finally { setAccionCarroId(null); }
  };

  // ── Confirmar / rechazar reserva ──────────────────────────────────────────────
  const cambiarEstadoReserva = async (reserva, estado) => {
    const id = reserva.id_reservarviajes || reserva.id_reservarviaje || reserva.id || reserva.ID;
    setProcesando(id);
    try {
      await confirmarReservaApi(id, estado);
      showToast(estado === 'Confirmada' ? 'Reserva confirmada.' : 'Operación exitosa.', 'success');
      await loadDashboard();
      await fetchReservas(pageReservas);
    } catch { showToast('Error al actualizar la reserva.', 'error'); }
    finally { setProcesando(null); }
  };

  if (isLoading) return <LoadingScreen message="Cargando panel..." />;
  if (!userData)  return null;

  const nombre = userData.Nombre || userData.nombre || userData.name || 'Conductor';

  // Separar carros activos (1,2,3) e inactivos (4,5)
  const carrosActivos   = dashCarros.filter(c => ![4, 5].includes(parseInt(c.id_estados)));
  const carrosInactivos = dashCarros.filter(c => [4, 5].includes(parseInt(c.id_estados)));

  return (
    <PageBg>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />

      <InnerNavbar userData={userData} title="Panel de Conductor" backTo="/" />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">

        {/* Bienvenida */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-extrabold text-white">Hola, {nombre}</h1>
          <p className="text-blue-200 mt-1 text-sm">Gestiona tus vehículos y reservas desde aquí.</p>
        </div>

        {/* Acciones */}
        <div className="grid sm:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <ActionCard
            icon={<FaPlus />}
            title="Agregar Vehículo"
            desc="Registra un nuevo vehículo. Luego asígnale un viaje."
            btnLabel="Agregar"
            gradient="from-violet-600 to-blue-600"
            onClick={() => {
              setCarData(p => ({
                ...p,
                Conductor: userData?.Nombre || userData?.nombre || userData?.name || '',
                Telefono:  userData?.Telefono || userData?.telefono || userData?.tel || '',
              }));
              setShowAddCar(true);
            }}
          />
          <ActionCard
            icon={<FaListAlt />}
            title="Ver Reservas"
            desc="Consulta y gestiona las reservas de tus vehículos."
            btnLabel="Ver reservas"
            gradient="from-blue-600 to-cyan-500"
            onClick={() => fetchReservas(1)}
          />
          <ActionCard
            icon={<FaCar />}
            title="Mis Vehículos"
            desc="Administra, elimina o revisa el estado de tus carros."
            btnLabel="Ver vehículos"
            gradient="from-green-600 to-emerald-500"
            onClick={fetchCarros}
          />
          <ActionCard
            icon={<FaRoad />}
            title="Historial"
            desc="Consulta los viajes completados y sus pasajeros."
            btnLabel="Ver historial"
            gradient="from-orange-500 to-amber-500"
            onClick={() => fetchHistorial(1)}
          />
        </div>

        {/* ── Vehículos activos ── */}
        <div className="animate-fade-in-up" style={{ animationDelay: '160ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">Mis vehículos activos</h2>
              <p className="text-blue-200 text-xs mt-0.5">Gestiona pasajeros e inicia o termina el viaje</p>
            </div>
            <button onClick={loadDashboard} disabled={loadingDash}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white text-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50">
              <FaSync className={`text-xs ${loadingDash ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {loadingDash ? (
            <div className="bg-white/10 rounded-2xl p-10 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/70 text-sm">Cargando tus vehículos...</p>
            </div>
          ) : carrosActivos.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <FaCar className="text-violet-400 text-2xl" />
              </div>
              <h3 className="text-gray-800 font-bold mb-1">Sin vehículos activos</h3>
              <p className="text-gray-400 text-sm">Agrega un vehículo y asígnale un viaje para verlo aquí.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {carrosActivos.map(carro => {
                const id = carro.id_carros || carro.id;
                const estadoNum  = parseInt(carro.id_estados);
                const estadoInfo = getEstadoInfo(carro.id_estados);
                const reservasDelCarro = dashReservas
                  .filter(r => String(r.id_carros || r.id_carro || r.carro_id) === String(id))
                  .filter(r => { const est = r.estado?.toLowerCase(); return est === 'pendiente' || est === 'confirmada'; });

                return (
                  <div key={id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-blue-600 via-violet-500 to-purple-600" />
                    <div className="p-5 space-y-5">

                      {/* Info vehículo */}
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg text-sm tracking-wider">
                              {carro.placa || '—'}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${estadoInfo.color}`}>
                              {estadoInfo.label}
                            </span>
                          </div>
                          <p className="text-gray-700 font-semibold text-base flex items-center gap-1.5">
                            <FaMapMarkerAlt className="text-violet-500 text-sm" />
                            {carro.precioviaje
                              ? `${carro.precioviaje.origen} → ${carro.precioviaje.destino}`
                              : 'Ruta no asignada'}
                          </p>
                          {carro.precioviaje?.precio && (
                            <p className="text-violet-600 font-bold text-sm">
                              ${Number(carro.precioviaje.precio).toLocaleString('es-CO')} por pasajero
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 space-y-1 text-right">
                          <p className="flex items-center gap-1.5 justify-end">
                            <FaCalendarAlt className="text-violet-400 text-xs" />{formatFecha(carro.fecha)}
                          </p>
                          <p className="flex items-center gap-1.5 justify-end">
                            <FaClock className="text-violet-400 text-xs" />{carro.horasalida || '—'}
                          </p>
                          <p className="flex items-center gap-1.5 justify-end">
                            <FaCar className="text-violet-400 text-xs" />{carro.asientos} asientos
                          </p>
                        </div>
                      </div>

                      {/* Pasajeros */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pasajeros</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            reservasDelCarro.length >= parseInt(carro.asientos) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                          }`}>
                            {reservasDelCarro.length} / {carro.asientos}
                          </span>
                        </div>
                        {reservasDelCarro.length === 0 ? (
                          <div className="flex items-center gap-2 py-3 px-3 bg-gray-50 rounded-xl text-gray-400 text-sm">
                            <FaUser className="text-gray-300" /> Sin reservas todavía
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {reservasDelCarro.map((r, idx) => {
                              const resId = r.id_reservarviajes || r.id;
                              const estRes = r.estado?.toLowerCase();
                              const statusCls =
                                estRes === 'confirmada' ? 'bg-green-100 text-green-700 border-green-200' :
                                estRes === 'completada' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                'bg-yellow-100 text-yellow-700 border-yellow-200';
                              return (
                                <div key={resId ?? idx} className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                      {(r.nombre || r.name || '?')[0]?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-gray-800 truncate">{r.nombre || r.name || '—'}</p>
                                      <p className="text-xs text-gray-400">Asiento {r.asiento || r.Asiento || '—'}</p>
                                    </div>
                                  </div>
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusCls}`}>
                                    {r.estado || 'Pendiente'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Botones de viaje */}
                      {(estadoNum === 1 || estadoNum === 2) && (
                        <div className="pt-1 border-t border-gray-100">
                          {estadoNum === 1 && (
                            <button onClick={() => handleIniciarViaje(id)} disabled={accionCarroId === id}
                              className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 text-sm">
                              {accionCarroId === id ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FaPlay className="text-xs" />}
                              Iniciar viaje
                            </button>
                          )}
                          {estadoNum === 2 && (
                            <button onClick={() => handleTerminarViaje(id)} disabled={accionCarroId === id}
                              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 text-sm">
                              {accionCarroId === id ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FaFlagCheckered className="text-xs" />}
                              Terminar viaje
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Vehículos inactivos ── */}
        {!loadingDash && carrosInactivos.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: '220ms' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-white">Vehículos inactivos</h2>
                <p className="text-blue-200/60 text-xs mt-0.5">
                  Fuera de servicio o con viaje terminado — asígnales un nuevo viaje para activarlos
                </p>
              </div>
              <span className="bg-white/10 text-white/70 text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
                {carrosInactivos.length} vehículo{carrosInactivos.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {carrosInactivos.map(carro => {
                const id         = carro.id_carros || carro.id;
                const estadoNum  = parseInt(carro.id_estados);
                const estadoInfo = getEstadoInfo(carro.id_estados);
                const esTerminado = estadoNum === 5;
                return (
                  <div key={id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">

                    <div className={`h-1.5 ${esTerminado ? 'bg-gradient-to-r from-gray-400 to-slate-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`} />

                    <div className="relative h-32 bg-gradient-to-br from-slate-100 to-gray-200 overflow-hidden">
                      {carro.imagencarro ? (
                        <img
                          src={carro.imagencarro.startsWith('http') ? carro.imagencarro : `http://localhost:8000${carro.imagencarro}`}
                          alt={carro.placa}
                          className="w-full h-full object-cover opacity-80"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaCar className="text-gray-300 text-5xl" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shadow-sm ${estadoInfo.color}`}>
                          {estadoInfo.label}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="font-mono font-extrabold text-white text-sm tracking-widest bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg">
                          {carro.placa || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 space-y-3">
                      <div className="space-y-1.5">
                        <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                          <FaUser className="text-violet-400 text-xs shrink-0" />
                          {carro.conductor || '—'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <FaCar className="text-gray-300 text-xs shrink-0" />
                          {carro.asientos} asientos
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {esTerminado ? 'Último viaje' : 'Sin viaje asignado'}
                        </p>
                        {carro.precioviaje ? (
                          <>
                            <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                              <FaMapMarkerAlt className="text-violet-400 text-xs shrink-0" />
                              {carro.precioviaje.origen} → {carro.precioviaje.destino}
                            </p>
                            {carro.fecha && (
                              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                <FaCalendarAlt className="text-gray-300 text-xs shrink-0" />
                                {formatFecha(carro.fecha)}
                                {carro.horasalida && ` · ${carro.horasalida}`}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Ninguna ruta asignada aún</p>
                        )}
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <button
                        onClick={() => {
                          setCarroAAsignar(carro);
                          setViajeData({ id_precioviaje: String(carro.id_precioviaje || ''), horasalida: '', fecha: '' });
                          fetchRutas();
                          setShowAsignar(true);
                        }}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-violet-500/30 transition-all active:scale-95"
                      >
                        <FaRoute className="text-xs" /> Asignar nuevo viaje
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── Modal: Agregar Vehículo ── */}
      {showAddCar && (
        <Modal title="Registrar Vehículo" accent="violet" onClose={() => setShowAddCar(false)}>
          <p className="text-xs text-gray-400 mb-4">
            Ingresa los datos del vehículo. Una vez creado, podrás asignarle un viaje desde el panel de vehículos inactivos.
          </p>
          <form onSubmit={handleAddCar} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Conductor" icon={<FaUser />}
                value={carData.Conductor}
                onChange={e => setCarData(p => ({ ...p, Conductor: e.target.value }))}
                placeholder="Tu nombre" required />
              <FormInput label="Teléfono" icon={<FaPhone />}
                value={carData.Telefono}
                onChange={e => setCarData(p => ({ ...p, Telefono: e.target.value }))}
                placeholder="300 000 0000" required />
              <FormInput label="Placa" icon={<FaIdCard />}
                value={carData.Placa}
                onChange={e => setCarData(p => ({ ...p, Placa: e.target.value }))}
                placeholder="ABC-123" required />
              <FormInput label="Asientos" icon={<FaCar className="text-xs" />}
                type="number" min="1" max="20"
                value={carData.Asientos}
                onChange={e => setCarData(p => ({ ...p, Asientos: e.target.value }))}
                placeholder="Ej. 4" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Imagen del vehículo</label>
              <input type="file" accept="image/*" required
                onChange={e => setCarData(p => ({ ...p, Imagencarro: e.target.files[0] || null }))}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAddCar(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={isSaving}
                className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
                {isSaving ? 'Guardando...' : 'Registrar Vehículo'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Asignar Viaje ── */}
      {showAsignar && carroAAsignar && (
        <Modal title={`Asignar viaje — ${carroAAsignar.placa}`} accent="blue" onClose={() => { setShowAsignar(false); setCarroAAsignar(null); }}>
          <p className="text-xs text-gray-400 mb-4">
            Define la ruta, fecha y hora de salida. El vehículo pasará a "Esperando pasajeros" automáticamente.
          </p>
          <form onSubmit={handleAsignarViaje} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ruta del viaje</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 text-violet-400 text-sm pointer-events-none" />
                <select value={viajeData.id_precioviaje}
                  onChange={e => setViajeData(p => ({ ...p, id_precioviaje: e.target.value }))}
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400">
                  <option value="">Seleccionar ruta</option>
                  {rutas.map(r => {
                    const rid = r.id_precioviajes || r.id;
                    return (
                      <option key={rid} value={rid}>
                        {r.origen} → {r.destino} (${Number(r.precio).toLocaleString('es-CO')})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Hora de salida</label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-3 text-violet-400 text-xs pointer-events-none" />
                  <input type="time" required value={viajeData.horasalida}
                    onChange={e => setViajeData(p => ({ ...p, horasalida: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Fecha</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-3 text-violet-400 text-xs pointer-events-none" />
                  <input type="date" required value={viajeData.fecha}
                    onChange={e => setViajeData(p => ({ ...p, fecha: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowAsignar(false); setCarroAAsignar(null); }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button type="submit" disabled={isAsignando}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
                {isAsignando ? 'Asignando...' : 'Asignar viaje'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Ver Reservas ── */}
      {showReservas && (
        <Modal title="Reservas de mis vehículos" accent="blue" onClose={() => setShowReservas(false)}>
          {loadingReservas ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Cargando...</p>
            </div>
          ) : reservas.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <FaListAlt className="text-blue-300 text-xl" />
              </div>
              <p className="text-gray-500 text-sm">No hay reservas para tus vehículos.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {reservas.map((r, idx) => {
                  const id = r.id_reservarviajes || r.id_reservarviaje || r.id || r.ID;
                  const enProceso = procesando === id;
                  const estado    = r.estado?.toLowerCase();
                  const statusCls = estado === 'confirmada'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : estado === 'rechazada' || estado === 'cancelada'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200';
                  return (
                    <div key={id ?? idx} className="border border-gray-100 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-800 text-sm">Reserva #{id}</p>
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${statusCls}`}>
                          {r.estado || 'Pendiente'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <InfoRow icon={<FaMapMarkerAlt />} label="Ubicación" value={r.ubicacion} />
                        <InfoRow icon={<FaCar />}          label="Asiento"   value={r.asiento} />
                        <InfoRow icon={<FaUser />}         label="Pasajero"  value={r.nombre} />
                        <InfoRow icon={<FaPhone />}        label="Teléfono"  value={r.tel} />
                      </div>
                      {(!estado || estado === 'pendiente') && (
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <button onClick={() => cambiarEstadoReserva(r, 'Confirmada')} disabled={enProceso}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 transition-all active:scale-95 disabled:opacity-50">
                            {enProceso ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FaCheck />}
                            Confirmar
                          </button>
                          <button onClick={() => cambiarEstadoReserva(r, 'rechazada')} disabled={enProceso}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50">
                            {enProceso ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FaTimes />}
                            Rechazar
                          </button>
                        </div>
                      )}
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

      {/* ── Modal: Mis Vehículos ── */}
      {showCarros && (
        <Modal title="Mis Vehículos" accent="green" onClose={() => setShowCarros(false)}>
          {loadingCarros ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Cargando...</p>
            </div>
          ) : carros.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-3">
                <FaCar className="text-green-300 text-xl" />
              </div>
              <p className="text-gray-500 text-sm">No tienes vehículos registrados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {carros.map((carro, idx) => {
                const id         = carro.id_carros || carro.id;
                const estadoInfo = getEstadoInfo(carro.id_estados);
                return (
                  <div key={id ?? idx} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-800 text-sm">{carro.placa || 'Sin placa'}</p>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${estadoInfo.color}`}>
                        {estadoInfo.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <InfoRow icon={<FaUser />}  label="Conductor" value={carro.conductor} />
                      <InfoRow icon={<FaPhone />} label="Teléfono"  value={carro.telefono} />
                      <InfoRow icon={<FaIdCard />} label="Placa"    value={carro.placa} />
                      <InfoRow icon={<FaCar className="text-xs" />} label="Asientos" value={carro.asientos} />
                    </div>
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      <button onClick={() => { setCarroToDelete(carro); setShowDeleteModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 text-xs font-bold rounded-xl hover:bg-red-100 transition-all">
                        <FaTrash className="text-[10px]" /> Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}

      {/* ── Modal: Historial ── */}
      {showHistorial && (
        <Modal title="Historial de viajes" accent="orange" onClose={() => setShowHistorial(false)}>
          {loadingHistorial ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Cargando historial...</p>
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                <FaRoad className="text-orange-300 text-xl" />
              </div>
              <p className="text-gray-500 text-sm">Aún no tienes viajes completados.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {historial.map((viaje, idx) => {
                  const ruta      = viaje.precioviaje ? `${viaje.precioviaje.origen} → ${viaje.precioviaje.destino}` : 'Ruta no especificada';
                  const pasajeros = viaje.reservas ?? [];
                  const ingresos  = pasajeros.length * parseFloat(viaje.precioviaje?.precio ?? 0);
                  const califs    = pasajeros.filter(p => p.calificacion != null);
                  const promedio  = califs.length
                    ? (califs.reduce((s, p) => s + p.calificacion, 0) / califs.length).toFixed(1)
                    : null;
                  const claveUnica = `${viaje.id_carros}_${viaje.viaje_numero ?? idx}_${viaje.fecha ?? idx}`;
                  return (
                    <div key={claveUnica} className="border border-gray-100 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                            <FaRoad className="text-orange-400 text-xs" /> {ruta}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {viaje.placa} · {formatFecha(viaje.fecha)} · {viaje.horasalida}
                            {viaje.viaje_numero > 1 && (
                              <span className="ml-2 bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                Viaje #{viaje.viaje_numero}
                              </span>
                            )}
                          </p>
                        </div>
                        {promedio && (
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-400 text-xs" />
                            <span className="text-xs font-bold text-gray-700">{promedio}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                        <span>{pasajeros.length} pasajero{pasajeros.length !== 1 ? 's' : ''}</span>
                        {ingresos > 0 && <span className="font-bold text-green-600">+${ingresos.toLocaleString('es-CO')}</span>}
                      </div>
                      {pasajeros.length > 0 && (
                        <div className="space-y-1.5">
                          {pasajeros.map((p, i) => (
                            <div key={p.id_reservarviajes ?? i} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                                  {(p.usuario?.name || p.nombre || '?')[0]?.toUpperCase()}
                                </div>
                                <span className="text-gray-700 font-medium">{p.usuario?.name || p.nombre || '—'}</span>
                              </div>
                              {p.calificacion != null && (
                                <div className="flex gap-0.5">
                                  {[1,2,3,4,5].map(n => (
                                    <FaStar key={n} className={`text-[10px] ${n <= p.calificacion ? 'text-yellow-400' : 'text-gray-200'}`} />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6">
                <Pagination
                  currentPage={pageHistorial}
                  lastPage={lastPageHistorial}
                  onPageChange={p => fetchHistorial(p)}
                  loading={loadingHistorial}
                />
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ── Modal: Confirmar eliminación ── */}
      {showDeleteModal && carroToDelete && (
        <Modal title="Eliminar Vehículo" accent="red" onClose={() => { setShowDeleteModal(false); setCarroToDelete(null); }}>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto">
              <FaTrash className="text-red-400 text-xl" />
            </div>
            <p className="text-gray-700 text-sm">
              ¿Seguro que quieres eliminar el vehículo <strong>{carroToDelete.placa}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setCarroToDelete(null); }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleDeleteCarro} disabled={isDeleting}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </PageBg>
  );
};

export default Conductor;
