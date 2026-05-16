import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCar, FaPlus, FaTrash, FaListAlt,
  FaMapMarkerAlt, FaClock, FaCalendarAlt, FaPhone,
  FaUser, FaCheck, FaTimes, FaIdCard,
} from 'react-icons/fa';

import PageBg            from '../../components/ui/PageBg';
import InnerNavbar       from '../../components/layout/InnerNavbar';
import LoadingScreen     from '../../components/ui/LoadingScreen';
import StatCard          from '../../components/ui/StatCard';
import SectionCard       from '../../components/ui/SectionCard';
import FormInput         from '../../components/ui/FormInput';
import ToastNotification from '../../components/ui/ToastNotification';
import { useToast }      from '../../hooks/useToast';

import {
  listarCarrosApi, listarReservasApi, listarEstadosApi,
  crearCarroApi, eliminarCarroApi, actualizarEstadoCarroApi,
  confirmarReservaApi,
} from '../../services/api';
import { compressImage } from '../../utils';

// ── Modal base ────────────────────────────────────────────────────────────────

const Modal = ({ title, accent = 'violet', onClose, children }) => {
  const accents = {
    violet: 'from-violet-700 to-blue-700',
    green:  'from-green-600 to-emerald-600',
    red:    'from-red-600 to-rose-600',
    blue:   'from-blue-700 to-cyan-600',
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

// ── Action card ───────────────────────────────────────────────────────────────

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

// ── Fila de info ──────────────────────────────────────────────────────────────

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-2 text-sm">
    <span className="text-violet-400 mt-0.5 shrink-0">{icon}</span>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-gray-700">{value || '—'}</p>
    </div>
  </div>
);

// ── Component principal ───────────────────────────────────────────────────────

const Conductor = () => {
  const [userData,  setUserData]  = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modales
  const [showAddCar,     setShowAddCar]     = useState(false);
  const [showReservas,   setShowReservas]   = useState(false);
  const [showCarros,     setShowCarros]     = useState(false);
  const [showEstadoModal,setShowEstadoModal]= useState(false);
  const [showDeleteModal,setShowDeleteModal]= useState(false);

  // Datos
  const [reservas,      setReservas]      = useState([]);
  const [carros,        setCarros]        = useState([]);
  const [estados,       setEstados]       = useState([]);
  const [selectedCarro, setSelectedCarro] = useState(null);
  const [carroToDelete, setCarroToDelete] = useState(null);

  // Loading states
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [loadingCarros,   setLoadingCarros]   = useState(false);
  const [isSaving,        setIsSaving]        = useState(false);
  const [isDeleting,      setIsDeleting]      = useState(false);
  const [procesando,      setProcesando]      = useState(null);

  // Formulario agregar carro
  const [carData, setCarData] = useState({
    Placa: '', Conductor: '', Imagencarro: null,
    Asientos: '', Destino: '', Horasalida: '',
    Fecha: '', Telefono: '', Estado: '',
  });
  const [newEstado, setNewEstado] = useState('');

  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  // ── Auth ────────────────────────────────────────────────────────────────────
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

  // Cargar estados al abrir modal agregar carro o cambiar estado
  useEffect(() => {
    if (showAddCar || showEstadoModal) fetchEstados();
    if (showAddCar && userData) {
      const nombre = userData.Nombre || userData.nombre || userData.name || '';
      setCarData(p => ({ ...p, Conductor: nombre }));
    }
  }, [showAddCar, showEstadoModal, userData]);

  // ── Cargar datos ─────────────────────────────────────────────────────────────
  const fetchEstados = async () => {
    try {
      const { data } = await listarEstadosApi();
      setEstados(Array.isArray(data.data) ? data.data : []);
    } catch { /* silencioso */ }
  };

  const fetchReservas = async () => {
    setLoadingReservas(true);
    setShowReservas(true);
    try {
      const [carsResp, reservasResp] = await Promise.all([listarCarrosApi(), listarReservasApi()]);
      const allCarros   = Array.isArray(carsResp.data)  ? carsResp.data  : [];
      const allReservas = Array.isArray(reservasResp)   ? reservasResp   : (reservasResp.data ?? []);

      const nombreConductor = (userData?.Nombre || userData?.nombre || '').toLowerCase().trim();
      const misCarros       = allCarros.filter(c => (c.conductor || '').toLowerCase().trim() === nombreConductor);
      const idsCarros       = misCarros.map(c => String(c.id_carros || c.id));

      setReservas(
        allReservas.filter(r => idsCarros.includes(String(r.id_carros || r.id_carro || r.carro_id))),
      );
    } catch { showToast('Error al cargar reservas.', 'error'); }
    finally { setLoadingReservas(false); }
  };

  const fetchCarros = async () => {
    setLoadingCarros(true);
    setShowCarros(true);
    try {
      const resp = await listarCarrosApi();
      const all  = Array.isArray(resp.data) ? resp.data : [];
      const nombreConductor = (userData?.Nombre || userData?.nombre || '').toLowerCase().trim();
      setCarros(all.filter(c => (c.conductor || '').toLowerCase().trim() === nombreConductor));
    } catch { showToast('Error al cargar vehículos.', 'error'); }
    finally { setLoadingCarros(false); }
  };

  // ── Agregar carro ─────────────────────────────────────────────────────────────
  const handleAddCar = async (e) => {
    e.preventDefault();
    const { Conductor, Placa, Asientos, Destino, Horasalida, Fecha, Telefono, Estado, Imagencarro } = carData;

    if (!Conductor || !Placa || !Asientos || !Destino || !Horasalida || !Fecha || !Telefono || !Estado) {
      showToast('Completa todos los campos requeridos.', 'error'); return;
    }

    const userId = userData?.id || userData?.id_users || userData?.ID;
    if (!userId) { showToast('No se pudo identificar tu cuenta. Inicia sesión de nuevo.', 'error'); return; }

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
      formData.append('Destino',    Destino.trim());
      formData.append('Horasalida', Horasalida.trim());
      formData.append('Fecha',      Fecha.trim());
      formData.append('Estado',     Estado);
      formData.append('Userid',     parseInt(userId));

      if (Imagencarro) {
        const compressed = await compressImage(Imagencarro);
        formData.append('Imagencarro', compressed);
      }

      await crearCarroApi(formData);
      showToast('Vehículo registrado exitosamente.', 'success');
      setCarData({ Placa: '', Conductor: '', Imagencarro: null, Asientos: '', Destino: '', Horasalida: '', Fecha: '', Telefono: '', Estado: '' });
      setShowAddCar(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : 'Error al guardar el vehículo.';
      showToast(msg, 'error');
    } finally { setIsSaving(false); }
  };

  // ── Actualizar estado carro ───────────────────────────────────────────────────
  const handleUpdateEstado = async (e) => {
    e.preventDefault();
    if (!newEstado || !selectedCarro) { showToast('Selecciona un estado.', 'error'); return; }
    setIsSaving(true);
    try {
      const carroId = selectedCarro.id_carros || selectedCarro.id;
      await actualizarEstadoCarroApi(carroId, parseInt(newEstado));
      showToast('Estado actualizado correctamente.', 'success');
      setShowEstadoModal(false);
      setSelectedCarro(null);
      setNewEstado('');
      await fetchCarros();
    } catch { showToast('Error al actualizar el estado.', 'error'); }
    finally { setIsSaving(false); }
  };

  // ── Eliminar carro ────────────────────────────────────────────────────────────
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
    } catch { showToast('Error al eliminar el vehículo.', 'error'); }
    finally { setIsDeleting(false); }
  };

  // ── Confirmar / rechazar reserva ──────────────────────────────────────────────
  const cambiarEstadoReserva = async (reserva, estado) => {
    const id = reserva.id_reservarviajes || reserva.id_reservarviaje || reserva.id || reserva.ID;
    setProcesando(id);
    try {
      await confirmarReservaApi(id, estado);
      showToast(estado === 'Confirmada' ? 'Reserva confirmada.' : 'Reserva rechazada.', estado === 'Confirmada' ? 'success' : 'error');
      await fetchReservas();
    } catch { showToast('Error al actualizar la reserva.', 'error'); }
    finally { setProcesando(null); }
  };

  if (isLoading) return <LoadingScreen message="Cargando panel..." />;
  if (!userData)  return null;

  const nombre = userData.Nombre || userData.nombre || userData.name || 'Conductor';

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <PageBg>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />

      <InnerNavbar
        userData={userData}
        title="Panel de Conductor"
        backTo="/"
      />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">

        {/* Bienvenida */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-extrabold text-white">Hola, {nombre} 👋</h1>
          <p className="text-blue-200 mt-1 text-sm">Gestiona tus vehículos y reservas desde aquí.</p>
        </div>

        {/* Acciones */}
        <div className="grid sm:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <ActionCard
            icon={<FaPlus />}
            title="Agregar Vehículo"
            desc="Registra un nuevo vehículo con imagen, ruta y horario."
            btnLabel="Agregar"
            gradient="from-violet-600 to-blue-600"
            onClick={() => setShowAddCar(true)}
          />
          <ActionCard
            icon={<FaListAlt />}
            title="Ver Reservas"
            desc="Consulta las reservas activas de tus vehículos."
            btnLabel="Ver reservas"
            gradient="from-blue-600 to-cyan-500"
            onClick={fetchReservas}
          />
          <ActionCard
            icon={<FaCar />}
            title="Mis Vehículos"
            desc="Administra, actualiza el estado o elimina tus carros."
            btnLabel="Ver vehículos"
            gradient="from-green-600 to-emerald-500"
            onClick={fetchCarros}
          />
        </div>
      </div>

      {/* ── Modal: Agregar Vehículo ── */}
      {showAddCar && (
        <Modal title="Registrar Vehículo" accent="violet" onClose={() => setShowAddCar(false)}>
          <form onSubmit={handleAddCar} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Conductor"
                icon={<FaUser />}
                value={carData.Conductor}
                onChange={e => setCarData(p => ({ ...p, Conductor: e.target.value }))}
                placeholder="Tu nombre"
                required
              />
              <FormInput
                label="Teléfono"
                icon={<FaPhone />}
                value={carData.Telefono}
                onChange={e => setCarData(p => ({ ...p, Telefono: e.target.value }))}
                placeholder="300 000 0000"
                required
              />
              <FormInput
                label="Placa"
                icon={<FaIdCard />}
                value={carData.Placa}
                onChange={e => setCarData(p => ({ ...p, Placa: e.target.value }))}
                placeholder="ABC-123"
                required
              />
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Asientos</label>
                <select
                  value={carData.Asientos}
                  onChange={e => setCarData(p => ({ ...p, Asientos: e.target.value }))}
                  required
                  className="w-full py-2.5 px-4 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  <option value="">Seleccionar</option>
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <FormInput
                label="Destino"
                icon={<FaMapMarkerAlt />}
                value={carData.Destino}
                onChange={e => setCarData(p => ({ ...p, Destino: e.target.value }))}
                placeholder="Medellín"
                required
                className="col-span-2"
              />
              <FormInput
                label="Hora de salida"
                icon={<FaClock />}
                type="time"
                value={carData.Horasalida}
                onChange={e => setCarData(p => ({ ...p, Horasalida: e.target.value }))}
                required
              />
              <FormInput
                label="Fecha"
                icon={<FaCalendarAlt />}
                type="date"
                value={carData.Fecha}
                onChange={e => setCarData(p => ({ ...p, Fecha: e.target.value }))}
                required
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Estado</label>
              <select
                value={carData.Estado}
                onChange={e => setCarData(p => ({ ...p, Estado: e.target.value }))}
                required
                className="w-full py-2.5 px-4 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="">Seleccionar estado</option>
                {estados.map(est => (
                  <option key={est.id_estados || est.id} value={est.id_estados || est.id}>
                    {est.estados || est.Estados || est.nombre || `Estado ${est.id_estados || est.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Imagen del vehículo</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setCarData(p => ({ ...p, Imagencarro: e.target.files[0] || null }))}
                required
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCar(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Registrar Vehículo'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Reservas ── */}
      {showReservas && (
        <Modal title="Reservas de mis vehículos" accent="blue" onClose={() => setShowReservas(false)}>
          {loadingReservas ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Cargando...</p>
            </div>
          ) : reservas.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-gray-500 text-sm">No hay reservas para tus vehículos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservas.map((r, idx) => {
                const id = r.id_reservarviajes || r.id_reservarviaje || r.id || r.ID;
                const enProceso = procesando === id;
                const estado = r.estado?.toLowerCase();
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
                      <InfoRow icon={<FaMapMarkerAlt />} label="Ubicación"  value={r.ubicacion} />
                      <InfoRow icon={<FaCar />}          label="Asiento"    value={r.asiento} />
                      <InfoRow icon={<FaUser />}         label="Pasajero"   value={r.nombre} />
                      <InfoRow icon={<FaPhone />}        label="Teléfono"   value={r.tel} />
                    </div>
                    {(!estado || estado === 'pendiente') && (
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => cambiarEstadoReserva(r, 'Confirmada')}
                          disabled={enProceso}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {enProceso ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FaCheck />}
                          Confirmar
                        </button>
                        <button
                          onClick={() => cambiarEstadoReserva(r, 'rechazada')}
                          disabled={enProceso}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {enProceso ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FaTimes />}
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}

      {/* ── Modal: Mis Carros ── */}
      {showCarros && (
        <Modal title="Mis Vehículos" accent="green" onClose={() => setShowCarros(false)}>
          {loadingCarros ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Cargando...</p>
            </div>
          ) : carros.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">🚗</div>
              <p className="text-gray-500 text-sm">No tienes vehículos registrados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {carros.map((carro, idx) => {
                const id = carro.id_carros || carro.id;
                return (
                  <div key={id ?? idx} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-800 text-sm">{carro.placa || 'Sin placa'}</p>
                      <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-semibold">
                        {carro.asientos} asientos
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <InfoRow icon={<FaMapMarkerAlt />} label="Destino"    value={carro.destino} />
                      <InfoRow icon={<FaClock />}        label="Hora"       value={carro.horasalida} />
                      <InfoRow icon={<FaCalendarAlt />}  label="Fecha"      value={carro.fecha} />
                      <InfoRow icon={<FaPhone />}        label="Teléfono"   value={carro.telefono} />
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => { setSelectedCarro(carro); setNewEstado(''); setShowEstadoModal(true); }}
                        className="flex-1 py-2 bg-blue-500 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-all active:scale-95"
                      >
                        Cambiar Estado
                      </button>
                      <button
                        onClick={() => { setCarroToDelete(carro); setShowDeleteModal(true); }}
                        className="flex items-center justify-center w-9 h-9 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}

      {/* ── Modal: Cambiar Estado ── */}
      {showEstadoModal && selectedCarro && (
        <Modal title={`Estado — ${selectedCarro.placa}`} accent="blue" onClose={() => { setShowEstadoModal(false); setSelectedCarro(null); }}>
          <form onSubmit={handleUpdateEstado} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nuevo estado</label>
              <select
                value={newEstado}
                onChange={e => setNewEstado(e.target.value)}
                required
                className="w-full py-2.5 px-4 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="">Seleccionar estado</option>
                {estados.map(est => (
                  <option key={est.id_estados || est.id} value={est.id_estados || est.id}>
                    {est.estados || est.Estados || est.nombre || `Estado ${est.id_estados || est.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowEstadoModal(false); setSelectedCarro(null); }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" disabled={isSaving}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                {isSaving ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Confirmar eliminación ── */}
      {showDeleteModal && carroToDelete && (
        <Modal title="Eliminar Vehículo" accent="red" onClose={() => { setShowDeleteModal(false); setCarroToDelete(null); }}>
          <div className="text-center space-y-4">
            <div className="text-5xl">🗑️</div>
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
