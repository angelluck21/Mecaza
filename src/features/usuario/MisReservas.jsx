import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCar, FaUser, FaMapMarkerAlt, FaClock, FaCalendar,
  FaArrowLeft, FaTrash, FaSync, FaCarSide,
} from 'react-icons/fa';
import { Bars3Icon } from '@heroicons/react/24/outline';

import UserMenu            from '../../components/ui/UserMenu';
import CarImage            from '../../components/ui/CarImage';
import ToastNotification   from '../../components/ui/ToastNotification';

import { listarCarrosApi, listarReservasApi, eliminarReservaApi } from '../../services/api';
import { getCarImageUrl } from '../../utils';
import { useToast }        from '../../hooks/useToast';

// ── Component ─────────────────────────────────────────────────────────────────

const MisReservas = () => {
  const [isMenuOpen,         setIsMenuOpen]         = useState(false);
  const [userData,           setUserData]           = useState(null);
  const [isLoading,          setIsLoading]          = useState(true);
  const [reservations,       setReservations]       = useState([]);
  const [cars,               setCars]               = useState([]);
  const [showDeleteModal,    setShowDeleteModal]    = useState(false);
  const [reservationToDelete,setReservationToDelete]= useState(null);
  const [isDeleting,         setIsDeleting]         = useState(false);

  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  // ── Obtener datos del carro asociado ─────────────────────────────────────────
  const getCarInfo = (reservation) => {
    const carroId = reservation.id_carros || reservation.id_carro || reservation.carro_id;
    if (!carroId) return null;
    return cars.find(
      (car) => car.id_carros == carroId || car.id == carroId || car.ID == carroId,
    );
  };

  // ── Carga inicial ─────────────────────────────────────────────────────────────
  const fetchData = async (user) => {
    try {
      const [carsResp, reservasResp] = await Promise.all([
        listarCarrosApi(),
        listarReservasApi(),
      ]);

      const carsData = Array.isArray(carsResp.data)
        ? carsResp.data
        : [];

      const reservasArray = Array.isArray(reservasResp)
        ? reservasResp
        : (reservasResp.data ?? []);

      setCars(carsData);

      const userId = user?.id || user?.ID || user?.id_users;
      if (userId) {
        setReservations(
          reservasArray.filter((r) => {
            const rUserId = r.id_users || r.id_user || r.user_id;
            return rUserId == userId;
          }),
        );
      } else {
        setReservations([]);
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
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  // ── Eliminar reserva ──────────────────────────────────────────────────────────
  const handleDeleteReservation = (reservation) => {
    setReservationToDelete(reservation);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;

    const reservationId =
      reservationToDelete.id_reservarviajes ||
      reservationToDelete.id_reservarviaje  ||
      reservationToDelete.id               ||
      reservationToDelete.ID;

    if (!reservationId) {
      showToast('No se pudo identificar la reserva.', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      await eliminarReservaApi(reservationId);
      showToast('Reserva cancelada exitosamente.', 'success');
      setShowDeleteModal(false);
      setReservationToDelete(null);
      await fetchData(userData);
    } catch (error) {
      const status = error.response?.status;
      if (status === 404)      showToast('Reserva no encontrada.', 'error');
      else if (status === 401) showToast('No autorizado para cancelar esta reserva.', 'error');
      else if (status === 403) showToast('Sin permisos para cancelar esta reserva.', 'error');
      else if (error.request)  showToast('Error de conexión con el servidor.', 'error');
      else                     showToast('Error inesperado al cancelar la reserva.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Helpers de UI ─────────────────────────────────────────────────────────────
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'pendiente':  return 'bg-yellow-100 text-yellow-800';
      default:           return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmada': return '✅ Confirmada';
      case 'pendiente':  return '⏳ Pendiente';
      case 'rechazada':  return '❌ Rechazada';
      case 'cancelada':  return '❌ Cancelada';
      default:           return '⏳ Pendiente';
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Cargando reservas...</div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 relative overflow-hidden">
      <ToastNotification
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* Navbar */}
      <nav className="bg-white shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FaCar className="text-blue-900 text-3xl drop-shadow-lg" />
              <span className="text-2xl font-bold text-blue-900">Mecaza</span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => navigate(-1)}
                className="text-blue-900 hover:text-blue-700 font-medium transition-colors flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Volver
              </button>
              <UserMenu userData={userData} />
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-blue-900 hover:text-blue-700 p-2"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full text-left px-3 py-2 text-blue-900 hover:text-blue-700 font-medium flex items-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Volver
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('userData');
                    localStorage.removeItem('authToken');
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4">Mis Reservas</h1>
            <p className="text-lg text-gray-600 mb-6">Gestiona tus reservas de viaje</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <FaSync className="inline mr-2 text-blue-600" />
                <strong>Reservas disponibles:</strong> Solo tus reservas personales
              </p>
            </div>
          </div>

          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <FaCar className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No tienes reservas</h3>
              <p className="text-gray-500 mb-6">Aún no has realizado ninguna reserva de viaje.</p>
              <button
                onClick={() => navigate('/indexLogin')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Explorar Viajes
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {reservations.map((reservation) => {
                const reservaId =
                  reservation.id_reservarviajes ||
                  reservation.id_reservarviaje  ||
                  reservation.id               ||
                  reservation.ID;
                const carInfo = getCarInfo(reservation);

                return (
                  <div
                    key={reservaId}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <FaCarSide className="text-blue-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Reserva #{reservaId}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {reservation.created_at
                              ? `Creada el ${new Date(reservation.created_at).toLocaleDateString('es-ES')}`
                              : 'Fecha no disponible'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(reservation.estado)} mt-4 md:mt-0`}>
                        {getStatusText(reservation.estado)}
                      </span>
                    </div>

                    {/* Info en 3 columnas */}
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Vehículo */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FaCar className="text-blue-600 mr-2" />
                          Vehículo
                        </h4>
                        {carInfo ? (
                          <div className="space-y-3">
                            <CarImage
                              imageUrl={getCarImageUrl(carInfo.imagencarro)}
                              conductorName={carInfo.conductor || 'Conductor'}
                              className="w-full h-32 object-cover rounded-lg shadow-md"
                              fallbackClassName="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-md"
                              fallbackIconSize="text-3xl"
                            />
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium">Conductor:</span> <span className="text-gray-700">{carInfo.conductor || '—'}</span></p>
                              <p><span className="font-medium">Placa:</span> <span className="text-gray-700">{carInfo.placa || '—'}</span></p>
                              <p>
                                <FaMapMarkerAlt className="inline text-blue-600 mr-1" />
                                <span className="font-medium">Destino:</span> <span className="text-gray-700">{carInfo.destino || '—'}</span>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Información del vehículo no disponible.</p>
                        )}
                      </div>

                      {/* Pasajero */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FaUser className="text-green-600 mr-2" />
                          Pasajero
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Nombre:</span>{' '}
                            <span className="text-gray-700">
                              {userData?.nombre || userData?.Nombre || userData?.name || '—'}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Asiento:</span>{' '}
                            <span className="text-gray-700">{reservation.asiento || reservation.Asiento || '—'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Viaje */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FaCalendar className="text-purple-600 mr-2" />
                          Detalles del Viaje
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <FaCalendar className="inline text-purple-600 mr-1" />
                            <span className="font-medium">Fecha:</span>{' '}
                            <span className="text-gray-700">
                              {carInfo?.fecha
                                ? new Date(carInfo.fecha).toLocaleDateString('es-ES')
                                : '—'}
                            </span>
                          </p>
                          <p>
                            <FaClock className="inline text-purple-600 mr-1" />
                            <span className="font-medium">Hora:</span>{' '}
                            <span className="text-gray-700">{carInfo?.horasalida || '—'}</span>
                          </p>
                          <p>
                            <FaMapMarkerAlt className="inline text-purple-600 mr-1" />
                            <span className="font-medium">Ubicación:</span>{' '}
                            <span className="text-gray-700">{reservation.ubicacion || '—'}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botón cancelar */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleDeleteReservation(reservation)}
                        className="group w-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-8 py-4 rounded-2xl hover:from-red-600 hover:via-red-700 hover:to-red-800 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-2xl flex items-center justify-center font-bold text-lg border-2 border-red-400 hover:border-red-300"
                      >
                        <div className="mr-4 p-2 bg-red-400/20 rounded-full group-hover:bg-red-300/30 transition-all duration-300">
                          <FaTrash className="text-2xl group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                        <span className="group-hover:tracking-wide transition-all duration-300">
                          Cancelar Reserva
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal confirmación de cancelación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-3xl text-center">
              <div className="w-20 h-20 bg-red-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold">Confirmar Cancelación</h3>
              <p className="text-red-100 mt-2">¿Estás seguro de que quieres cancelar esta reserva?</p>
            </div>

            <div className="p-6 text-center">
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-gray-600 font-medium">
                  Reserva #{reservationToDelete?.id_reservarviajes || reservationToDelete?.id}
                </p>
                <p className="text-sm text-gray-500 mt-1">Esta acción no se puede deshacer.</p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => { setShowDeleteModal(false); setReservationToDelete(null); }}
                  disabled={isDeleting}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold border-2 border-gray-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-bold shadow-lg disabled:opacity-50"
                >
                  {isDeleting ? 'Eliminando...' : 'Sí, Cancelar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisReservas;
