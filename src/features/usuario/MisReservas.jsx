import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCar, FaUser, FaMapMarkerAlt, FaClock,
  FaCalendarAlt, FaTrash, FaCarSide, FaTicketAlt,
  FaWhatsapp, FaStar, FaTimes, FaFileInvoice, FaRoad,
} from 'react-icons/fa';

import PageBg            from '../../components/ui/PageBg';
import InnerNavbar       from '../../components/layout/InnerNavbar';
import LoadingScreen     from '../../components/ui/LoadingScreen';
import CarImage          from '../../components/ui/CarImage';
import ToastNotification from '../../components/ui/ToastNotification';
import { useToast }      from '../../hooks/useToast';
import {
  listarCarrosApi, listarReservasApi,
  confirmarReservaApi, calificarReservaApi,
} from '../../services/api';
import { getCarImageUrl } from '../../utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS = {
  confirmada:  { label: 'Confirmada',  cls: 'bg-green-100 text-green-700 border-green-200' },
  en_viaje:    { label: 'En viaje',    cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  pendiente:   { label: 'Pendiente',   cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  rechazada:   { label: 'Rechazada',   cls: 'bg-red-100 text-red-700 border-red-200' },
  cancelada:   { label: 'Cancelada',   cls: 'bg-red-100 text-red-700 border-red-200' },
  completada:  { label: 'Completada',  cls: 'bg-violet-100 text-violet-700 border-violet-200' },
};

// Si el carro está "En viaje" (id_estados=2) y la reserva es confirmada → mostrar "En viaje"
const getDisplayStatus = (reservation, carInfo) => {
  const estado = reservation.estado?.toLowerCase();
  if (estado === 'confirmada' && parseInt(carInfo?.id_estados) === 2) {
    return STATUS.en_viaje;
  }
  return STATUS[estado] ?? STATUS.pendiente;
};

const waLink = (tel) => {
  const digits = String(tel ?? '').replace(/\D/g, '');
  const num = digits.startsWith('57') ? digits : `57${digits}`;
  return `https://wa.me/${num}`;
};

// ── Star rating ───────────────────────────────────────────────────────────────

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1 justify-center">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="focus:outline-none transition-transform active:scale-90"
      >
        <FaStar className={`text-3xl transition-colors ${n <= value ? 'text-yellow-400' : 'text-gray-200'}`} />
      </button>
    ))}
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const MisReservas = () => {
  const [userData,            setUserData]            = useState(null);
  const [isLoading,           setIsLoading]           = useState(true);
  const [reservations,        setReservations]        = useState([]);
  const [historial,           setHistorial]           = useState([]);
  const [cars,                setCars]                = useState([]);
  const [showDeleteModal,     setShowDeleteModal]     = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [isDeleting,          setIsDeleting]          = useState(false);
  const [motivoCancelacion,   setMotivoCancelacion]   = useState('');

  // Calificación
  const [showRatingModal,  setShowRatingModal]  = useState(false);
  const [ratingReserva,    setRatingReserva]    = useState(null);
  const [ratingStars,      setRatingStars]      = useState(0);
  const [ratingComentario, setRatingComentario] = useState('');
  const [isSavingRating,   setIsSavingRating]   = useState(false);

  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  const getCarInfo = (r) => {
    // Usar datos embebidos en la reserva (persisten aunque el carro esté inactivo)
    if (r.carro && typeof r.carro === 'object') return r.carro;
    // Fallback: buscar en la lista de carros activos
    const id = r.id_carros || r.id_carro || r.carro_id;
    if (!id) return null;
    return cars.find(c =>
      String(c.id_carros) === String(id) ||
      String(c.id)        === String(id)
    );
  };

  const fetchData = async (user) => {
    try {
      const [carsResp, reservasResp] = await Promise.all([listarCarrosApi(), listarReservasApi()]);
      const rawCars       = Array.isArray(carsResp)     ? carsResp     : (carsResp.data ?? []);
      const carsData      = Array.isArray(rawCars)      ? rawCars      : (Array.isArray(rawCars.data) ? rawCars.data : []);
      const reservasArray = Array.isArray(reservasResp) ? reservasResp : (reservasResp.data ?? []);
      setCars(carsData);

      const userId = user?.id || user?.ID || user?.id_users;
      const misReservas = userId
        ? reservasArray.filter(r => (r.id_users || r.id_user || r.user_id) == userId)
        : [];

      // Activas: excluir rechazadas, canceladas y completadas calificadas
      const visibles = misReservas.filter(r => {
        const estado = r.estado?.toLowerCase();
        if (estado === 'rechazada' || estado === 'cancelada') return false;
        if (estado === 'completada' && r.calificacion != null) return false;
        return true;
      });
      setReservations(visibles);

      // Historial: rechazadas, canceladas y completadas calificadas
      const hist = misReservas.filter(r => {
        const estado = r.estado?.toLowerCase();
        if (estado === 'rechazada' || estado === 'cancelada') return true;
        if (estado === 'completada' && r.calificacion != null) return true;
        return false;
      });
      setHistorial(hist);

      // Abrir modal de calificación si hay una completada sin calificar
      const pendienteRating = misReservas.find(
        r => r.estado?.toLowerCase() === 'completada' && r.calificacion == null
      );
      if (pendienteRating) {
        setRatingReserva(pendienteRating);
        setRatingStars(0);
        setRatingComentario('');
        setShowRatingModal(true);
      }
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

  const handleSaveRating = async () => {
    if (ratingStars === 0) { showToast('Selecciona una calificación.', 'error'); return; }
    const id = ratingReserva?.id_reservarviajes || ratingReserva?.id;
    setIsSavingRating(true);
    try {
      await calificarReservaApi(id, ratingStars, ratingComentario.trim() || null);
      showToast('¡Calificación guardada!', 'success');
      setShowRatingModal(false);
      await fetchData(userData);
    } catch {
      showToast('Error al guardar la calificación.', 'error');
    } finally { setIsSavingRating(false); }
  };

  const confirmDelete = async () => {
    const id = reservationToDelete?.id_reservarviajes || reservationToDelete?.id_reservarviaje || reservationToDelete?.id;
    if (!id) { showToast('No se pudo identificar la reserva.', 'error'); return; }
    setIsDeleting(true);
    try {
      await confirmarReservaApi(id, 'cancelada', motivoCancelacion.trim() || null);
      showToast('Reserva cancelada.', 'success');
      setShowDeleteModal(false);
      setReservationToDelete(null);
      setMotivoCancelacion('');
      await fetchData(userData);
    } catch (err) {
      const s = err.response?.status;
      if (s === 404)        showToast('Reserva no encontrada.', 'error');
      else if (s === 401)   showToast('No autorizado.', 'error');
      else if (err.request) showToast('Sin conexión al servidor.', 'error');
      else                  showToast('Error inesperado.', 'error');
    } finally { setIsDeleting(false); }
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
              <p className="text-blue-200 text-sm">
                {reservations.length} reserva{reservations.length !== 1 ? 's' : ''} encontrada{reservations.length !== 1 ? 's' : ''}
              </p>
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
              const reservaId    = reservation.id_reservarviajes || reservation.id_reservarviaje || reservation.id;
              const carInfo      = getCarInfo(reservation);
              const estado       = reservation.estado?.toLowerCase();
              const carEnViaje   = parseInt(carInfo?.id_estados) === 2;
              const displayStatus = getDisplayStatus(reservation, carInfo);
              const yaCalificada  = reservation.calificacion != null;
              const conductorTel  = carInfo?.telefono;
              const puedeCancel   = estado !== 'completada' && estado !== 'cancelada' && estado !== 'rechazada' && !carEnViaje;

              return (
                <div
                  key={reservaId}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-fade-in-up hover:shadow-lg transition-all"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {/* Borde superior */}
                  <div className={`h-1.5 ${carEnViaje ? 'bg-blue-500' : estado === 'completada' ? 'bg-violet-500' : 'bg-gradient-to-r from-blue-600 via-violet-500 to-purple-600'}`} />

                  {/* Banner "En viaje" */}
                  {carEnViaje && (
                    <div className="bg-blue-50 border-b border-blue-100 px-5 py-2 flex items-center gap-2">
                      <FaRoad className="text-blue-500 text-xs animate-pulse" />
                      <p className="text-blue-700 text-xs font-semibold">Tu viaje está en curso ahora mismo</p>
                    </div>
                  )}

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
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${displayStatus.cls}`}>
                        {displayStatus.label}
                      </span>
                    </div>

                    {/* Contenido */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      {/* Imagen */}
                      <div className="sm:col-span-1">
                        <div className="rounded-xl overflow-hidden bg-gray-50 h-28">
                          {carInfo
                            ? <CarImage
                                imageUrl={getCarImageUrl(carInfo.imagencarro)}
                                conductorName={carInfo.conductor}
                                className="w-full h-full object-cover"
                                fallbackClassName="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-violet-100"
                              />
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
                            <FaMapMarkerAlt className="text-blue-400 text-xs mt-1 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Origen</p>
                              <p className="font-medium text-gray-700">{carInfo?.precioviaje?.origen || '—'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-1">
                            <FaMapMarkerAlt className="text-violet-400 text-xs mt-1 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Destino</p>
                              <p className="font-medium text-gray-700">{carInfo?.precioviaje?.destino || '—'}</p>
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

                        {/* Ubicación de recogida */}
                        {(reservation.ubicacion || reservation.Ubicacion) && (
                          <div className="flex items-start gap-1.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                            <FaMapMarkerAlt className="text-blue-400 text-xs mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide">Tu punto de recogida</p>
                              <p className="text-xs text-blue-700 font-medium leading-tight">{reservation.ubicacion || reservation.Ubicacion}</p>
                            </div>
                          </div>
                        )}

                        {/* Calificación existente */}
                        {yaCalificada && (
                          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(n => (
                                <FaStar key={n} className={`text-xs ${n <= reservation.calificacion ? 'text-yellow-400' : 'text-gray-200'}`} />
                              ))}
                            </div>
                            <p className="text-xs text-yellow-700 font-medium">Tu calificación del viaje</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2 flex-wrap">

                      {/* WhatsApp al conductor (reservas confirmadas o en viaje) */}
                      {(estado === 'confirmada' || carEnViaje) && conductorTel && (
                        <a
                          href={waLink(conductorTel)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-all active:scale-95"
                        >
                          <FaWhatsapp /> Contactar conductor
                        </a>
                      )}

                      {/* Ver factura (viaje completado) */}
                      {estado === 'completada' && (
                        <button
                          onClick={() => navigate('/mis-facturas')}
                          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-all active:scale-95"
                        >
                          <FaFileInvoice className="text-xs" /> Ver factura
                        </button>
                      )}

                      {/* Calificar (completada sin calificación) */}
                      {estado === 'completada' && !yaCalificada && (
                        <button
                          onClick={() => {
                            setRatingReserva(reservation);
                            setRatingStars(0);
                            setRatingComentario('');
                            setShowRatingModal(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-white text-sm font-semibold rounded-xl hover:bg-yellow-500 transition-all active:scale-95"
                        >
                          <FaStar className="text-xs" /> Calificar viaje
                        </button>
                      )}

                      {/* Cancelar (solo si no está en viaje, completada, cancelada o rechazada) */}
                      {puedeCancel && (
                        <button
                          onClick={() => openDelete(reservation)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-200 hover:bg-red-100 transition-all active:scale-95"
                        >
                          <FaTrash className="text-xs" /> Cancelar reserva
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Historial ── */}
        {historial.length > 0 && (
          <div className="mt-10 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <FaRoad className="text-blue-300 text-sm" />
              <h2 className="text-lg font-bold text-white">Historial de viajes</h2>
              <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full">{historial.length}</span>
            </div>
            <div className="space-y-3">
              {historial.map((r, idx) => {
                const rid     = r.id_reservarviajes || r.id;
                const carInfo = getCarInfo(r);
                const estado  = r.estado?.toLowerCase();
                const cls     =
                  estado === 'completada' ? 'bg-violet-100 text-violet-700 border-violet-200' :
                  estado === 'cancelada'  ? 'bg-gray-100 text-gray-500 border-gray-200'       :
                  'bg-red-100 text-red-600 border-red-200';
                const label   =
                  estado === 'completada' ? 'Completada' :
                  estado === 'cancelada'  ? 'Cancelada'  : 'Rechazada';

                return (
                  <div key={rid ?? idx}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <FaCarSide className="text-white text-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {carInfo?.precioviaje?.origen || '—'} → {carInfo?.precioviaje?.destino || '—'}
                        </p>
                        <p className="text-blue-200 text-xs">
                          {carInfo?.conductor || '—'} · {carInfo?.fecha ? new Date(carInfo.fecha).toLocaleDateString('es-ES') : '—'}
                        </p>
                        {estado === 'completada' && r.calificacion != null && (
                          <div className="flex gap-0.5 mt-0.5">
                            {[1,2,3,4,5].map(n => (
                              <FaStar key={n} className={`text-[10px] ${n <= r.calificacion ? 'text-yellow-400' : 'text-white/20'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${cls}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal: Cancelar reserva ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,10,40,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl text-center overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaTrash className="text-white text-xl" />
              </div>
              <h3 className="text-lg font-bold text-white">Cancelar reserva</h3>
              <p className="text-red-100 text-sm mt-1">Reserva #{reservationToDelete?.id_reservarviajes || reservationToDelete?.id}</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-5">
                Esta acción <span className="font-semibold text-red-600">no se puede deshacer</span>. ¿Confirmas la cancelación?
              </p>
              <textarea
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="(Opcional) ¿Cuál es el motivo de la cancelación?"
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
                rows="3"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setReservationToDelete(null); setMotivoCancelacion(''); }}
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

      {/* ── Modal: Calificación ── */}
      {showRatingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,10,40,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowRatingModal(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">¿Cómo estuvo el viaje?</h3>
                <p className="text-yellow-100 text-xs mt-0.5">Tu opinión ayuda a mejorar Mecaza</p>
              </div>
              <button onClick={() => setShowRatingModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition-all">
                <FaTimes className="text-white" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Toca las estrellas para calificar</p>
                <StarRating value={ratingStars} onChange={setRatingStars} />
                {ratingStars > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'][ratingStars]}
                  </p>
                )}
              </div>
              <textarea
                value={ratingComentario}
                onChange={(e) => setRatingComentario(e.target.value)}
                placeholder="(Opcional) Cuéntanos más sobre tu experiencia..."
                className="w-full p-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                rows="3"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRatingModal(false)}
                  disabled={isSavingRating}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Omitir
                </button>
                <button
                  onClick={handleSaveRating}
                  disabled={isSavingRating || ratingStars === 0}
                  className="flex-1 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSavingRating ? 'Guardando...' : 'Enviar'}
                </button>
              </div>

              {/* Acceso directo a factura */}
              <button
                onClick={() => { setShowRatingModal(false); navigate('/mis-facturas'); }}
                className="w-full flex items-center justify-center gap-2 text-xs text-violet-600 hover:text-violet-800 transition-colors"
              >
                <FaFileInvoice /> Ver mi factura del viaje
              </button>
            </div>
          </div>
        </div>
      )}
    </PageBg>
  );
};

export default MisReservas;
