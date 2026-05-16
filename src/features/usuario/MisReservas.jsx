import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCar, FaUser, FaMapMarkerAlt, FaClock,
  FaCalendarAlt, FaTrash, FaCarSide, FaTicketAlt,
} from 'react-icons/fa';

import PageBg            from '../../components/ui/PageBg';
import InnerNavbar       from '../../components/layout/InnerNavbar';
import LoadingScreen     from '../../components/ui/LoadingScreen';
import CarImage          from '../../components/ui/CarImage';
import ToastNotification from '../../components/ui/ToastNotification';
import { useToast }      from '../../hooks/useToast';
import { listarCarrosApi, listarReservasApi, eliminarReservaApi } from '../../services/api';
import { getCarImageUrl } from '../../utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS = {
  confirmada: { label: 'Confirmada', cls: 'bg-green-100 text-green-700 border-green-200' },
  pendiente:  { label: 'Pendiente',  cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  rechazada:  { label: 'Rechazada',  cls: 'bg-red-100 text-red-700 border-red-200' },
  cancelada:  { label: 'Cancelada',  cls: 'bg-red-100 text-red-700 border-red-200' },
};
const getStatus = (s) => STATUS[s?.toLowerCase()] ?? STATUS.pendiente;

// ── Component ─────────────────────────────────────────────────────────────────

const MisReservas = () => {
  const [userData,           setUserData]           = useState(null);
  const [isLoading,          setIsLoading]          = useState(true);
  const [reservations,       setReservations]       = useState([]);
  const [cars,               setCars]               = useState([]);
  const [showDeleteModal,    setShowDeleteModal]    = useState(false);
  const [reservationToDelete,setReservationToDelete] = useState(null);
  const [isDeleting,         setIsDeleting]         = useState(false);

  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  const getCarInfo = (r) => {
    const id = r.id_carros || r.id_carro || r.carro_id;
    if (!id) return null;
    return cars.find(c => c.id_carros == id || c.id == id || c.ID == id);
  };

  const fetchData = async (user) => {
    try {
      const [carsResp, reservasResp] = await Promise.all([listarCarrosApi(), listarReservasApi()]);
      const carsData     = Array.isArray(carsResp) ? carsResp : (carsResp.data ?? []);
      const reservasArray = Array.isArray(reservasResp) ? reservasResp : (reservasResp.data ?? []);
      setCars(carsData);
      const userId = user?.id || user?.ID || user?.id_users;
      setReservations(
        userId
          ? reservasArray.filter(r => (r.id_users || r.id_user || r.user_id) == userId)
          : []
      );
    } catch {
      showToast('Error al cargar las reservas.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { navigate('/login'); return; }
    try {
      const user = JSON.parse(stored);
      setUserData(user);
      fetchData(user);
    } catch { navigate('/login'); }
  }, [navigate]);

  const openDelete = (r) => { setReservationToDelete(r); setShowDeleteModal(true); };

  const confirmDelete = async () => {
    const id = reservationToDelete?.id_reservarviajes || reservationToDelete?.id_reservarviaje || reservationToDelete?.id || reservationToDelete?.ID;
    if (!id) { showToast('No se pudo identificar la reserva.', 'error'); return; }
    setIsDeleting(true);
    try {
      await eliminarReservaApi(id);
      showToast('Reserva cancelada exitosamente.', 'success');
      setShowDeleteModal(false);
      setReservationToDelete(null);
      await fetchData(userData);
    } catch (err) {
      const s = err.response?.status;
      if (s === 404)      showToast('Reserva no encontrada.', 'error');
      else if (s === 401) showToast('No autorizado.', 'error');
      else if (err.request) showToast('Sin conexión al servidor.', 'error');
      else showToast('Error inesperado.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingScreen message="Cargando reservas..." />;

  return (
    <PageBg>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />
      <InnerNavbar userData={userData} title="Mis Reservas" />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center text-white shadow">
              <FaTicketAlt />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Mis Reservas</h1>
              <p className="text-blue-200 text-sm">{reservations.length} reserva{reservations.length !== 1 ? 's' : ''} encontrada{reservations.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Sin reservas */}
        {reservations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-scale-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                <FaTicketAlt className="text-violet-400 text-3xl" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No tienes reservas aún</h3>
            <p className="text-gray-500 text-sm mb-6">Explora los viajes disponibles y reserva tu asiento.</p>
            <button
              onClick={() => navigate('/indexLogin')}
              className="px-6 py-3 bg-gradient-to-r from-blue-700 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Explorar viajes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation, idx) => {
              const reservaId = reservation.id_reservarviajes || reservation.id_reservarviaje || reservation.id || reservation.ID;
              const carInfo   = getCarInfo(reservation);
              const status    = getStatus(reservation.estado);

              return (
                <div
                  key={reservaId}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-fade-in-up hover:shadow-lg transition-all"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {/* Borde superior degradado */}
                  <div className="h-1 bg-gradient-to-r from-blue-600 via-violet-500 to-purple-600" />

                  <div className="p-5">
                    {/* Header reserva */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                          <FaCarSide className="text-violet-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">Reserva #{reservaId}</p>
                          <p className="text-xs text-gray-400">
                            {reservation.created_at
                              ? new Date(reservation.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
                              : 'Fecha no disponible'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Contenido */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      {/* Vehículo */}
                      <div className="sm:col-span-1">
                        <div className="rounded-xl overflow-hidden bg-gray-50 h-28">
                          {carInfo
                            ? <CarImage imageUrl={getCarImageUrl(carInfo.imagencarro)} conductorName={carInfo.conductor} />
                            : <div className="w-full h-full flex items-center justify-center"><FaCar className="text-3xl text-gray-300" /></div>
                          }
                        </div>
                      </div>

                      {/* Info */}
                      <div className="sm:col-span-2 space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Conductor</p>
                            <p className="font-medium text-gray-700">{carInfo?.conductor || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Placa</p>
                            <p className="font-mono font-medium text-gray-700">{carInfo?.placa || '—'}</p>
                          </div>
                          <div className="flex items-start gap-1">
                            <FaMapMarkerAlt className="text-violet-400 text-xs mt-1 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Destino</p>
                              <p className="font-medium text-gray-700">{carInfo?.destino || '—'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1">
                            <FaCalendarAlt className="text-violet-400 text-xs mt-1 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Fecha</p>
                              <p className="font-medium text-gray-700">
                                {carInfo?.fecha ? new Date(carInfo.fecha).toLocaleDateString('es-ES') : '—'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1">
                            <FaClock className="text-violet-400 text-xs mt-1 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Hora</p>
                              <p className="font-medium text-gray-700">{carInfo?.horasalida || '—'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1">
                            <FaUser className="text-violet-400 text-xs mt-1 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Asiento</p>
                              <p className="font-medium text-gray-700">{reservation.asiento || reservation.Asiento || '—'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botón cancelar */}
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <button
                        onClick={() => openDelete(reservation)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-200 hover:bg-red-100 transition-all active:scale-95"
                      >
                        <FaTrash className="text-xs" /> Cancelar reserva
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal confirmar cancelación */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(15,10,40,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in text-center overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaTrash className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-bold text-white">Cancelar reserva</h3>
              <p className="text-red-100 text-sm mt-1">
                Reserva #{reservationToDelete?.id_reservarviajes || reservationToDelete?.id}
              </p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-5">
                Esta acción <span className="font-semibold text-red-600">no se puede deshacer</span>. ¿Confirmas la cancelación?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setReservationToDelete(null); }}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Volver
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-60"
                >
                  {isDeleting ? 'Cancelando...' : 'Sí, cancelar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageBg>
  );
};

export default MisReservas;
