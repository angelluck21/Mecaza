import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaUser, FaMapMarkerAlt, FaClock, FaCalendar, FaPhone, FaArrowLeft, FaCheck, FaTimes, FaBell, FaExternalLinkAlt } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';
import axios from 'axios';

const ConductorNotificaciones = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [isLoadingReservas, setIsLoadingReservas] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        if (user.rol === 'conductor' || user.rol === 'admin') {
          setUserData(user);
        } else {
          navigate('/login');
          return;
        }
      } catch (error) {
        navigate('/login');
        return;
      }
    } else {
      navigate('/login');
      return;
    }
    setIsLoading(false);
    fetchReservasPendientes();
  }, [navigate]);

  const fetchReservasPendientes = async () => {
    setIsLoadingReservas(true);
    try {
      const response = await axios.get('https://api-mecaza.geekcorplab.com/api/listarreserva', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      console.log('Reservas obtenidas:', response.data);
      
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
      
      // Filtrar reservas pendientes (estado = 'pendiente' o sin estado)
      const pendientes = reservasArray.filter(reserva => 
        !reserva.estado || reserva.estado.toLowerCase() === 'pendiente'
      );
      
      setReservasPendientes(pendientes);
    } catch (error) {
      console.error('Error al obtener reservas pendientes:', error);
      setReservasPendientes([]);
    } finally {
      setIsLoadingReservas(false);
    }
  };

  const handleConfirmarReserva = async (reserva) => {
    try {
      const reservationId = reserva.id || reserva.id_reservarviaje || reserva.ID;
      
      const response = await axios.put(`https://api-mecaza.geekcorplab.com/api/confirmarreserva/${reservationId}`, {
        estado: 'confirmada'
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      console.log('Reserva confirmada:', response.data);
      alert('Reserva confirmada exitosamente');
      
      // Recargar la lista de reservas pendientes
      await fetchReservasPendientes();
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      alert(`Error al confirmar la reserva: ${error.message}`);
    }
  };

  const handleRechazarReserva = async (reserva) => {
    if (!window.confirm('¿Estás seguro de que quieres rechazar esta reserva?')) {
      return;
    }

    try {
      const reservationId = reserva.id || reserva.id_reservarviaje || reserva.ID;
      
      const response = await axios.put(`https://api-mecaza.geekcorplab.com/api/confirmarreserva/${reservationId}`, {
        estado: 'rechazada'
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      console.log('Reserva rechazada:', response.data);
      alert('Reserva rechazada');
      
      // Recargar la lista de reservas pendientes
      await fetchReservasPendientes();
    } catch (error) {
      console.error('Error al rechazar reserva:', error);
      alert(`Error al rechazar la reserva: ${error.message}`);
    }
  };

  const handleGoBack = () => {
    navigate('/conductor');
  };

  // Función para verificar si un texto es un link
  const isLink = (text) => {
    if (!text) return false;
    return text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.');
  };

  // Función para truncar un link largo
  const truncateLink = (link, maxLength = 50) => {
    if (!link) return '';
    if (link.length <= maxLength) return link;
    return link.substring(0, maxLength) + '...';
  };

  // Función para abrir link en nueva pestaña
  const openLink = (link) => {
    if (isLink(link)) {
      let url = link;
      if (link.startsWith('www.')) {
        url = 'https://' + link;
      }
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
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
              <span className="text-2xl font-bold text-blue-900">Notificaciones</span>
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
              Notificaciones de Reservas
            </h1>
            <p className="text-lg text-gray-600">
              Confirma o rechaza las reservas pendientes de los usuarios
            </p>
          </div>

          {isLoadingReservas ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando notificaciones...</span>
            </div>
          ) : reservasPendientes.length === 0 ? (
            <div className="text-center py-12">
              <FaBell className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay notificaciones</h3>
              <p className="text-gray-500 mb-6">No tienes reservas pendientes por confirmar.</p>
              <button
                onClick={fetchReservasPendientes}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Actualizar
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Reservas Pendientes: {reservasPendientes.length}
                </h3>
                <p className="text-blue-700 text-sm">
                  Revisa y confirma las reservas de los usuarios
                </p>
             </div>

              {reservasPendientes.map((reserva, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          Reserva #{reserva.id || reserva.id_reservarviaje || reserva.ID || index + 1}
                        </h3>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          Pendiente de Confirmación
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <FaMapMarkerAlt className="text-green-600 mr-2 mt-1" />
                            <div className="flex-1">
                              <span className="font-semibold">Ubicación:</span>
                              {isLink(reserva.ubicacion) ? (
                                <div className="mt-1">
                                  <div className="text-gray-700 break-all">
                                    {truncateLink(reserva.ubicacion)}
                                  </div>
                                  <button
                                    onClick={() => openLink(reserva.ubicacion)}
                                    className="mt-1 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                  >
                                    <FaExternalLinkAlt className="mr-1" />
                                    Abrir ubicación
                                  </button>
                                </div>
                              ) : (
                                <span className="ml-2 text-gray-700">{reserva.ubicacion || 'No especificada'}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <FaCalendar className="text-green-600 mr-2" />
                            <span className="font-semibold">Fecha de reserva:</span>
                            <span className="ml-2 text-gray-700">
                              {reserva.created_at ? new Date(reserva.created_at).toLocaleDateString('es-ES') : 'No especificada'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <FaCar className="text-blue-600 mr-2" />
                            <span className="font-semibold">Asiento:</span>
                            <span className="ml-2 text-gray-700">{reserva.asiento || 'No especificado'}</span>
                          </div>
                          {reserva.comentario && (
                            <div className="flex items-start">
                              <span className="font-semibold mr-2">Nombre:</span>
                              <span className="text-gray-700">{reserva.comentario}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <button
                        onClick={() => handleConfirmarReserva(reserva)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <FaCheck className="mr-1" />
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleRechazarReserva(reserva)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <FaTimes className="mr-1" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConductorNotificaciones; 