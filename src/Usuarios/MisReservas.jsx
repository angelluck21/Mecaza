import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaUser, FaMapMarkerAlt, FaClock, FaCalendar, FaPhone, FaArrowLeft, FaTrash, FaSync, FaCarSide } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';
import CarImage from '../components/CarImage';
import axios from 'axios';

const MisReservas = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [cars, setCars] = useState([]);

  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const navigate = useNavigate();

  // Función helper para construir la URL de la imagen del carro
  const getCarImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === '') {
      return null;
    }
    
    // Si ya es una URL completa, devolverla
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si empieza con /storage, construir URL completa
    if (imagePath.startsWith('/storage/')) {
      return `https://api-mecaza.geekcorplab.com${imagePath}`;
    }
    
    // Si es solo el nombre del archivo, construir URL
    if (!imagePath.includes('/')) {
      return `https://api-mecaza.geekcorplab.com/storage/carros/${imagePath}`;
    }
    
    // Construir URL completa
    return `https://api-mecaza.geekcorplab.com/storage/${imagePath}`;
  };

  // Función para obtener información del carro asociado a una reserva
  const getCarInfo = (reservation) => {
    const carroId = reservation.id_carros || reservation.id_carro || reservation.carro_id;
    if (!carroId) return null;
    
    return cars.find(car => 
      (car.id_carros == carroId) || 
      (car.id == carroId) || 
      (car.ID == carroId)
    );
  };

  useEffect(() => {
    // Obtener datos del usuario del localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        console.log('Datos del usuario parseados:', user);
        setUserData(user);
        
        // Cargar datos iniciales después de establecer userData
        fetchInitialData(user);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        navigate('/login');
        return;
      }
    } else {
      console.log('No hay datos de usuario, redirigiendo al login');
      navigate('/login');
      return;
    }
  }, [navigate]);

  const fetchInitialData = async (userDataParam) => {
    try {
      // Cargar carros y reservas en paralelo
      const [carsResponse, reservationsResponse] = await Promise.all([
        axios.get('https://api-mecaza.geekcorplab.com/api/listarcarro'),
        axios.get('https://api-mecaza.geekcorplab.com/api/listarreserva')
      ]);

      // Procesar carros
      let carsData = [];
      if (carsResponse.data && Array.isArray(carsResponse.data.data)) {
        carsData = carsResponse.data.data;
      } else if (Array.isArray(carsResponse.data)) {
        carsData = carsResponse.data;
      }
      setCars(carsData);

      // Procesar reservas - filtrar solo las del usuario logueado
      let reservasArray = [];
      if (reservationsResponse.data && Array.isArray(reservationsResponse.data.data)) {
        reservasArray = reservationsResponse.data.data;
      } else if (Array.isArray(reservationsResponse.data)) {
        reservasArray = reservationsResponse.data;
      }
      
      // Filtrar solo las reservas del usuario logueado
      const userId = userDataParam?.id || userDataParam?.ID || userDataParam?.id_users;
      if (userId) {
        const reservasDelUsuario = reservasArray.filter(reserva => {
          const reservaUserId = reserva.id_users || reserva.id_user || reserva.user_id;
          return reservaUserId == userId;
        });
        
        console.log('🔍 Debug usuario logueado:', {
          id: userId,
          nombre: userDataParam?.nombre || userDataParam?.Nombre || userDataParam?.name,
          email: userDataParam?.email || userDataParam?.Email,
          datosCompletos: userDataParam
        });
        
        console.log('🔍 Debug reservas del usuario:', reservasDelUsuario);
        
        console.log('Usuario logueado ID:', userId);
        console.log('Total de reservas del sistema:', reservasArray.length);
        console.log('Reservas del usuario logueado:', reservasDelUsuario.length);
        
        setReservations(reservasDelUsuario);
      } else {
        console.log('No se pudo identificar el ID del usuario logueado');
        console.log('Datos del usuario recibidos:', userDataParam);
        setReservations([]);
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para actualizar el estado de una reserva
  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      // Verificar que tengamos un ID válido
      if (!reservationId) {
        console.error('ID de reserva no válido para actualizar estado:', reservationId);
        return;
      }
      
      const response = await axios.put(`https://api-mecaza.geekcorplab.com/api/confirmarreserva/${reservationId}`, {
        estado: newStatus
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      console.log('Estado de reserva actualizado:', response.data);
      
      // Recargar las reservas para mostrar el nuevo estado
      await fetchInitialData(userData);
    } catch (error) {
      console.error('Error al actualizar estado de reserva:', error);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };



  const handleDeleteReservation = async (reservation) => {
    // Abrir modal de confirmación
    setReservationToDelete(reservation);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;
    
    // Según la consola, el campo correcto es id_reservarviajes (con 's')
    const reservationId = reservationToDelete.id_reservarviajes || reservationToDelete.id_reservarviaje || reservationToDelete.id || reservationToDelete.ID;
    
    // Verificar que tengamos un ID válido
    if (!reservationId) {
      alert('Error: No se pudo identificar la reserva a eliminar');
      console.error('ID de reserva no encontrado:', reservationToDelete);
      return;
    }

    try {
      const response = await axios.delete(`https://api-mecaza.geekcorplab.com/api/eliminarreserva/${reservationId}`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log('Reserva eliminada:', response.data);
      
      if (response.data && response.data.message) {
        alert(response.data.message);
      } else {
        alert('Reserva eliminada exitosamente');
      }
      
      await fetchInitialData(userData);
      
      // Cerrar modal y limpiar estado
      setShowDeleteModal(false);
      setReservationToDelete(null);
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      
      let errorMessage = 'Error al eliminar la reserva';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 404) {
          errorMessage = 'Reserva no encontrada';
        } else if (error.response.status === 401) {
          errorMessage = 'No autorizado para eliminar esta reserva';
        } else if (error.response.status === 403) {
          errorMessage = 'No tienes permisos para eliminar esta reserva';
        }
      } else if (error.request) {
        errorMessage = 'Error de conexión. Verifica que el servidor esté ejecutándose.';
      }
      
      alert(errorMessage);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setReservationToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rechazada':
        return 'bg-red-100 text-red-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmada':
        return '✅ Confirmada';
      case 'pendiente':
        return '⏳ Pendiente de Confirmación';
      case 'rechazada':
        return '❌ Rechazada';
      case 'cancelada':
        return '❌ Cancelada';
      default:
        return '⏳ Pendiente de Confirmación';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Cargando reservas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 relative overflow-hidden">
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
                onClick={handleGoBack}
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
                  onClick={handleGoBack}
                  className="w-full text-left px-3 py-2 text-blue-900 hover:text-blue-700 font-medium flex items-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Volver
                </button>
                <button
                  onClick={() => { localStorage.removeItem('userData'); localStorage.removeItem('authToken'); navigate('/login'); }}
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
                     {/* Header */}
           <div className="text-center mb-8">
             <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
               Mis Reservas
             </h1>
             <p className="text-lg text-gray-600 mb-6">
               Gestiona tus reservas de viaje de manera organizada
             </p>
                           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <FaSync className="inline mr-2 text-blue-600" />
                  <strong>Reservas disponibles:</strong> Solo tus reservas personales
                </p>
              </div>
           </div>

          

           {/* Lista de reservas */}
           {reservations.length === 0 ? (
             <div className="text-center py-12">
               <FaCar className="text-gray-400 text-6xl mx-auto mb-4" />
               <h3 className="text-xl font-semibold text-gray-600 mb-2">No tienes reservas</h3>
               <p className="text-gray-500 mb-6">Aún no has realizado ninguna reserva de viaje personal.</p>
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
                const carInfo = getCarInfo(reservation);
                return (
                                     <div key={reservation.id_reservarviajes || reservation.id_reservarviaje || reservation.id || reservation.ID} 
                        className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                    
                     {/* Header de la reserva */}
                     <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                       <div className="flex items-center space-x-4">
                         <div className="bg-blue-100 p-3 rounded-full">
                           <FaCarSide className="text-blue-600 text-xl" />
                         </div>
                         <div>
                           <h3 className="text-xl font-bold text-gray-900">
                             Reserva #{reservation.id_reservarviajes || reservation.id_reservarviaje || reservation.id || reservation.ID}
                           </h3>
                          <p className="text-sm text-gray-500">
                            Creada el {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                          </p>
                        </div>
                      </div>
                      
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(reservation.estado)} mt-4 md:mt-0`}>
                        {getStatusText(reservation.estado)}
                      </span>
                    </div>

                    {/* Contenido de la reserva */}
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Información del carro */}
                      <div className="md:col-span-1">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FaCar className="text-blue-600 mr-2" />
                          Información del Vehículo
                        </h4>
                        
                        {carInfo ? (
                          <div className="space-y-3">
                            {/* Imagen del carro */}
                            <div className="mb-3">
                              <CarImage 
                                imageUrl={getCarImageUrl(carInfo.imagencarro)}
                                conductorName={carInfo.conductor || 'Conductor'}
                                className="w-full h-32 object-cover rounded-lg shadow-md"
                                fallbackClassName="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-md"
                                fallbackIconSize="text-3xl"
                              />
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center">
                                <FaUser className="text-blue-600 mr-2 w-4" />
                                <span className="font-medium">Conductor:</span>
                                <span className="ml-2 text-gray-700">{carInfo.conductor || 'No especificado'}</span>
                              </div>
                              <div className="flex items-center">
                                <FaCar className="text-blue-600 mr-2 w-4" />
                                <span className="font-medium">Placa:</span>
                                <span className="ml-2 text-gray-700">{carInfo.placa || 'No especificada'}</span>
                              </div>
                              <div className="flex items-center">
                                <FaMapMarkerAlt className="text-blue-600 mr-2 w-4" />
                                <span className="font-medium">Destino:</span>
                                <span className="ml-2 text-gray-700">{carInfo.destino || 'No especificado'}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">
                            Información del vehículo no disponible
                          </div>
                        )}
                      </div>

                      {/* Información del pasajero */}
                      <div className="md:col-span-1">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FaUser className="text-green-600 mr-2" />
                          Información del Pasajero
                        </h4>
                        
                                                 <div className="space-y-2 text-sm">
                           <div className="flex items-center">
                             <FaUser className="text-green-600 mr-2 w-4" />
                             <span className="font-medium">Nombre:</span>
                             <span className="ml-2 text-gray-700">
                               {(() => {
                                 const nombre = userData?.nombre || userData?.Nombre || userData?.name;
                                 console.log(`🔍 Debug nombre usuario en reserva ${reservation.id_reservarviajes}:`, {
                                   nombre: nombre,
                                   userData: userData,
                                   camposDisponibles: {
                                     'userData.nombre': userData?.nombre,
                                     'userData.Nombre': userData?.Nombre,
                                     'userData.name': userData?.name
                                   }
                                 });
                                 return nombre || 'No especificado';
                               })()}
                             </span>
                           </div>
                           <div className="flex items-center">
                             <FaCar className="text-green-600 mr-2 w-4" />
                             <span className="font-medium">Puesto:</span>
                             <span className="ml-2 text-gray-700">{reservation.asiento || reservation.Asiento || 'No especificado'}</span>
                           </div>
                         </div>
                      </div>

                      {/* Información del viaje */}
                      <div className="md:col-span-1">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FaCalendar className="text-purple-600 mr-2" />
                          Detalles del Viaje
                        </h4>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <FaCalendar className="text-purple-600 mr-2 w-4" />
                            <span className="font-medium">Fecha:</span>
                            <span className="ml-2 text-gray-700">
                              {carInfo?.fecha ? new Date(carInfo.fecha).toLocaleDateString('es-ES') : 'No especificada'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FaClock className="text-purple-600 mr-2 w-4" />
                            <span className="font-medium">Hora:</span>
                            <span className="ml-2 text-gray-700">{carInfo?.horasalida || 'No especificada'}</span>
                          </div>
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-purple-600 mr-2 w-4" />
                            <span className="font-medium">Ubicación:</span>
                            <span className="ml-2 text-gray-700">{reservation.ubicacion || 'No especificada'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                                         {/* Acción de eliminar */}
                     <div className="mt-6 pt-4 border-t border-gray-200">
                       <button
                         onClick={() => handleDeleteReservation(reservation)}
                         className="group w-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-8 py-4 rounded-2xl hover:from-red-600 hover:via-red-700 hover:to-red-800 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-2xl hover:shadow-red-500/25 flex items-center justify-center font-bold text-lg border-2 border-red-400 hover:border-red-300"
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

       {/* Modal de confirmación de eliminación */}
       {showDeleteModal && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 animate-in">
             {/* Header del modal */}
             <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-3xl text-center">
               <div className="w-20 h-20 bg-red-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FaTrash className="text-3xl text-white" />
               </div>
               <h3 className="text-2xl font-bold">Confirmar Cancelación</h3>
               <p className="text-red-100 mt-2">¿Estás seguro de que quieres cancelar esta reserva?</p>
             </div>

             {/* Contenido del modal */}
             <div className="p-6 text-center">
               <div className="bg-gray-50 rounded-xl p-4 mb-6">
                 <p className="text-gray-600 font-medium">
                   Reserva #{reservationToDelete?.id_reservarviajes || reservationToDelete?.id_reservarviaje || reservationToDelete?.id || reservationToDelete?.ID}
                 </p>
                 <p className="text-sm text-gray-500 mt-1">
                   Esta acción no se puede deshacer
                 </p>
               </div>

               {/* Botones de acción */}
               <div className="flex space-x-4">
                 <button
                   onClick={closeDeleteModal}
                   className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold border-2 border-gray-200 hover:border-gray-300"
                 >
                   Cancelar
                 </button>
                 <button
                   onClick={confirmDelete}
                   className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                 >
                   Sí, Eliminar
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