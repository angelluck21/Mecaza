import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaPlus, FaUsers, FaCog, FaSync, FaTicketAlt } from 'react-icons/fa';

import PageBg        from '../../components/ui/PageBg';
import InnerNavbar   from '../../components/layout/InnerNavbar';
import LoadingScreen from '../../components/ui/LoadingScreen';
import StatCard      from '../../components/ui/StatCard';
import SectionCard   from '../../components/ui/SectionCard';
import ToastNotification from '../../components/ui/ToastNotification';
import { useToast }  from '../../hooks/useToast';

import { listarCarrosApi, listarReservasApi, agregarPrecioApi, agregarEstadoApi } from '../../services/api';

// ── Constantes ────────────────────────────────────────────────────────────────

const ESTADOS = [
  { id: 1, label: 'Esperando pasajeros', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 2, label: 'En viaje',            color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 3, label: 'En mantenimiento',    color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 4, label: 'Fuera de servicio',   color: 'bg-red-100 text-red-700 border-red-200' },
];

const RUTAS = [
  { key: 'ZaraMede',  label: 'Zaragoza → Medellín' },
  { key: 'ZaraCauca', label: 'Zaragoza → Caucasia' },
  { key: 'CaucaMede', label: 'Caucasia → Medellín' },
];

// ── Modal base ────────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
    style={{ background: 'rgba(15,10,40,0.75)', backdropFilter: 'blur(6px)' }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in overflow-hidden">
      <div className="bg-gradient-to-r from-blue-800 to-violet-700 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none transition-colors">&times;</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ── Acción card ───────────────────────────────────────────────────────────────

const ActionCard = ({ icon, title, desc, btnLabel, btnColor = 'violet', onClick }) => {
  const colors = {
    violet: 'from-violet-600 to-blue-600 hover:shadow-violet-300/40',
    green:  'from-green-600  to-emerald-500 hover:shadow-green-300/40',
    blue:   'from-blue-600   to-cyan-500 hover:shadow-blue-300/40',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-3 hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${colors[btnColor]} flex items-center justify-center text-white shadow-sm`}>
          {icon}
        </div>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed flex-1">{desc}</p>
      <button
        onClick={onClick}
        className={`w-full py-2.5 bg-gradient-to-r ${colors[btnColor]} text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95`}
      >
        <FaPlus className="text-xs" /> {btnLabel}
      </button>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const IndexAdmin = () => {
  const [userData,      setUserData]      = useState(null);
  const [isLoading,     setIsLoading]     = useState(true);
  const [stats,         setStats]         = useState({ totalVehiculos: 0, totalReservas: 0, reservasHoy: 0 });
  const [isLoadingStats,setIsLoadingStats] = useState(false);

  const [showPreciosModal, setShowPreciosModal] = useState(false);
  const [showEstadoModal,  setShowEstadoModal]  = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [precios,   setPrecios]   = useState({ ZaraMede: '', ZaraCauca: '', CaucaMede: '' });
  const [estadoSel, setEstadoSel] = useState('');

  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  // ── Auth + carga stats ────────────────────────────────────────────────────
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
      const [vRes, rRes] = await Promise.all([listarCarrosApi(), listarReservasApi()]);
      const vehiculos  = Array.isArray(vRes.data) ? vRes.data : [];
      const reservas   = Array.isArray(rRes) ? rRes : (rRes.data ?? []);
      const fechaHoy   = new Date().toISOString().split('T')[0];
      const hoy        = reservas.filter(r => r.created_at && new Date(r.created_at).toISOString().startsWith(fechaHoy)).length;
      setStats({ totalVehiculos: vehiculos.length, totalReservas: reservas.length, reservasHoy: hoy });
    } catch {
      setStats({ totalVehiculos: 0, totalReservas: 0, reservasHoy: 0 });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // ── Guardar precios ────────────────────────────────────────────────────────
  const handleSavePrecios = async (e) => {
    e.preventDefault();
    if (!precios.ZaraMede || !precios.ZaraCauca || !precios.CaucaMede) {
      showToast('Completa todos los campos de precio.', 'error'); return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ZaraMede:  parseFloat(precios.ZaraMede),
        ZaraCauca: parseFloat(precios.ZaraCauca),
        CaucaMede: parseFloat(precios.CaucaMede),
      };
      await agregarPrecioApi(payload);
      showToast('Precios guardados correctamente.', 'success');
      setPrecios({ ZaraMede: '', ZaraCauca: '', CaucaMede: '' });
      setShowPreciosModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al guardar precios.', 'error');
    } finally { setIsSaving(false); }
  };

  // ── Guardar estado ────────────────────────────────────────────────────────
  const handleSaveEstado = async (e) => {
    e.preventDefault();
    if (!estadoSel) { showToast('Selecciona un estado.', 'error'); return; }
    setIsSaving(true);
    try {
      const estado = ESTADOS.find(s => s.id === parseInt(estadoSel));
      await agregarEstadoApi({ Estados: estado.label });
      showToast('Estado guardado correctamente.', 'success');
      setEstadoSel('');
      setShowEstadoModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al guardar estado.', 'error');
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <LoadingScreen message="Cargando panel..." />;
  if (!userData)  return null;

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up delay-100">
          <StatCard icon={<FaCar />}       label="Total vehículos"  value={stats.totalVehiculos} color="blue"   loading={isLoadingStats} />
          <StatCard icon={<FaTicketAlt />} label="Total reservas"   value={stats.totalReservas}  color="violet" loading={isLoadingStats} />
          <StatCard icon={<FaUsers />}     label="Reservas hoy"     value={stats.reservasHoy}    color="green"  loading={isLoadingStats} />
        </div>

        {/* Refresh */}
        <div className="flex justify-end animate-fade-in">
          <button
            onClick={fetchStats}
            disabled={isLoadingStats}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <FaSync className={isLoadingStats ? 'animate-spin' : ''} />
            {isLoadingStats ? 'Actualizando...' : 'Actualizar stats'}
          </button>
        </div>

        {/* Acciones */}
        <SectionCard title="Acciones del sistema" icon={<FaCog className="text-sm" />} className="animate-fade-in-up delay-200">
          <div className="grid sm:grid-cols-3 gap-4 mt-1">
            <ActionCard
              icon={<FaCar />}
              title="Estado del viaje"
              desc="Configura los estados disponibles para los viajes del sistema."
              btnLabel="Agregar estado"
              btnColor="green"
              onClick={() => setShowEstadoModal(true)}
            />
            <ActionCard
              icon={<FaTicketAlt />}
              title="Precios de rutas"
              desc="Gestiona los precios por ruta: Zaragoza, Caucasia y Medellín."
              btnLabel="Agregar precios"
              btnColor="blue"
              onClick={() => setShowPreciosModal(true)}
            />
            <ActionCard
              icon={<FaUsers />}
              title="Ver usuarios"
              desc="Consulta y administra la lista completa de usuarios registrados."
              btnLabel="Ver usuarios"
              btnColor="violet"
              onClick={() => navigate('/lista-usuarios')}
            />
          </div>
        </SectionCard>
      </div>

      {/* Modal Estado */}
      {showEstadoModal && (
        <Modal title="Agregar Estado de Viaje" onClose={() => { setShowEstadoModal(false); setEstadoSel(''); }}>
          <form onSubmit={handleSaveEstado} className="space-y-4">
            <p className="text-sm text-gray-500">Selecciona el estado que deseas configurar en el sistema.</p>
            <div className="grid grid-cols-1 gap-2">
              {ESTADOS.map(e => (
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
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isSaving || !estadoSel} className="flex-1 py-2.5 bg-gradient-to-r from-blue-700 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                {isSaving ? 'Guardando...' : 'Guardar estado'}
              </button>
              <button type="button" onClick={() => setShowEstadoModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Precios */}
      {showPreciosModal && (
        <Modal title="Agregar Precios de Rutas" onClose={() => { setShowPreciosModal(false); setPrecios({ ZaraMede: '', ZaraCauca: '', CaucaMede: '' }); }}>
          <form onSubmit={handleSavePrecios} className="space-y-4">
            <p className="text-sm text-gray-500">Configura los precios por ruta en pesos colombianos.</p>
            {RUTAS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-medium">$</span>
                  <input
                    type="number" min="0" step="0.01" required
                    value={precios[key]}
                    onChange={e => setPrecios(p => ({ ...p, [key]: e.target.value }))}
                    placeholder="0.00"
                    className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isSaving} className="flex-1 py-2.5 bg-gradient-to-r from-blue-700 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                {isSaving ? 'Guardando...' : 'Guardar precios'}
              </button>
              <button type="button" onClick={() => setShowPreciosModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </PageBg>
  );
};

export default IndexAdmin;
