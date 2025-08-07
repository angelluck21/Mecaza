import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaUser, FaMapMarkerAlt, FaClock, FaCalendar, FaPhone, FaArrowLeft, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';
import axios from 'axios';

const MisReservas = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [editingReservation, setEditingReservation] = useState(null);
  const [editForm, setEditForm] = useState({
    ubicacion: '',
    comentario: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener datos del usuario del localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        setUserData(user);
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

    // Obtener reservas del usuario
    fetchUserReservations();
  }, [navigate]);

  const fetchUserReservations = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/listarreserva', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      
      
      console.log('Reservas recibidas:', response.data);
      
      // Manejar diferentes estructuras de respuesta
      let reservasArray = [];
      if (response.data && Array.isArray(response.data)) {
        reservasArray = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        reservasArray = response.data.data;
      } else if (response.data && response.data.data) {
        reservasArray = [response.data.data];
      } else {
        reservasArray = [];
      }
      
      // Debug: mostrar la estructura de la primera reserva si existe
      if (reservasArray.length > 0) {
        console.log('Estructura de la primera reserva:', reservasArray[0]);
        console.log('Campos disponibles:', Object.keys(reservasArray[0]));
      }
      
      // Filtrar reservas del usuario actual
      const userReservations = reservasArray.filter(reservation => 
        reservation.id_users == userData.id || 
        reservation.id_users == userData.id_users || 
        reservation.id_users == userData.ID
      );
      
      setReservations(userReservations);
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEditReservation = (reservation) => {
    setEditingReservation(reservation);
    setEditForm({
      ubicacion: reservation.ubicacion || '',
      comentario: reservation.comentario || ''
    });
  };
  

  const handleUpdateReservation = async () => {
    try {
      // Usar el ID correcto basado en la estructura del backend
      const reservationId = editingReservation.id || editingReservation.id_reservarviaje || editingReservation.ID;
      
      const response = await fetch(`http://127.0.0.1:8000/api/actualizarreserva/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ubicacion: editForm.ubicacion,
          comentario: editForm.comentario
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la reserva');
      }

      const result = await response.json();
      console.log('Reserva actualizada exitosamente:', result);
      
      // Actualizar la lista de reservas
      await fetchUserReservations();
      setEditingReservation(null);
      setEditForm({ ubicacion: '', comentario: '' });
      
      alert('Reserva actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      alert(`Error al actualizar la reserva: ${error.message}`);
    }
  };

  const handleDeleteReservation = async (reservation) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      return;
    }

    // Usar el ID correcto basado en la estructura del backend
    const reservationId = reservation.id || reservation.id_reservarviaje || reservation.ID;

    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/eliminarreserva/${reservationId}`, {
        headers: {
          'Authorization':  'Bearer ' + localStorage.getItem('authToken'),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log('Reserva cancelada:', response.data);
      alert('Reserva cancelada exitosamente');
      
      // Recargar la lista de reservas
      await fetchUserReservations();
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      alert(`Error al cancelar la reserva: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
              Mis Reservas
            </h1>
            <p className="text-lg text-gray-600">
              Gestiona tus reservas de viaje
            </p>
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
              {reservations.map((reservation) => (
                <div key={reservation.id || reservation.id_reservarviaje || reservation.ID} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          Reserva #{reservation.id || reservation.id_reservarviaje || reservation.ID}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.estado)}`}>
                          {reservation.estado || 'Pendiente'}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <FaUser className="text-blue-600 mr-2" />
                            <span className="font-semibold">Conductor:</span>
                            <span className="ml-2 text-gray-700">{reservation.regate || 'No especificado'}</span>
                          </div>
                          <div className="flex items-center">
                            <FaCar className="text-blue-600 mr-2" />
                            <span className="font-semibold">Placa:</span>
                            <span className="ml-2 text-gray-700">{reservation.ubicacion || 'No especificada'}</span>
                          </div>
                          <div className="flex items-center">
                            <FaPhone className="text-blue-600 mr-2" />
                            <span className="font-semibold">Teléfono:</span>
                            <span className="ml-2 text-gray-700">{reservation.comentario || 'No especificado'}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-green-600 mr-2" />
                            <span className="font-semibold">Ubicación:</span>
                            <span className="ml-2 text-gray-700">{reservation.ubicacion || 'No especificada'}</span>
                          </div>
                          <div className="flex items-center">
                            <FaCalendar className="text-green-600 mr-2" />
                            <span className="font-semibold">Fecha de reserva:</span>
                            <span className="ml-2 text-gray-700">
                              {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString('es-ES') : 'No especificada'}
                            </span>
                          </div>
                          {reservation.comentario && (
                            <div className="flex items-start">
                              <span className="font-semibold mr-2">Comentario:</span>
                              <span className="text-gray-700">{reservation.comentario}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <button
                        onClick={() => handleEditReservation(reservation)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <FaEdit className="mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteReservation(reservation)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <FaTrash className="mr-1" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de edición */}
      {editingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Editar Reserva</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación de recogida
                </label>
                <input
                  type="text"
                  value={editForm.ubicacion}
                  onChange={(e) => setEditForm({...editForm, ubicacion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingresa tu ubicación de recogida"
                />
              </div>
              <div>
                <label className="block-2 text-sm font-medium text-gray-700 mb-2">
                  Comentario adicional
                </label>
                <textarea
                  value={editForm.comentario}
                  onChange={(e) => setEditForm({...editForm, comentario: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Comentarios adicionales..."
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleUpdateReservation}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaCheck className="mr-2" />
                Actualizar
              </button>
              <button
                onClick={() => {
                  setEditingReservation(null);
                  setEditForm({ ubicacion: '', comentario: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors flex items-center justify-center"
              >
                <FaTimes className="mr-2" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisReservas;