import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCar, FaUser, FaMapMarkerAlt, FaClock, FaCalendar, FaPhone, FaEnvelope, FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';

const VerDetalles = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [carDetails, setCarDetails] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { carId } = useParams();

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

    // Obtener detalles del carro
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/listarcarro`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Todos los carros:', data);
        
        // Manejar diferentes estructuras de respuesta
        let carrosArray = [];
        if (Array.isArray(data)) {
          carrosArray = data;
        } else if (data && Array.isArray(data.data)) {
          carrosArray = data.data;
        } else {
          console.log('Estructura de datos inesperada:', data);
        }
        
        // Buscar el carro específico por ID
        const carroEncontrado = carrosArray.find(car => 
          car.id_carros == carId || 
          car.id == carId || 
          car.ID == carId
        );
        
        if (carroEncontrado) {
          console.log('Carro encontrado:', carroEncontrado);
          console.log('Claves disponibles en el carro:', Object.keys(carroEncontrado));
          console.log('Valores del carro:', {
            id_carros: carroEncontrado.id_carros,
            conductor: carroEncontrado.conductor,
            placa: carroEncontrado.placa,
            asientos: carroEncontrado.asientos,
            destino: carroEncontrado.destino,
            horasalida: carroEncontrado.horasalida,
            fecha: carroEncontrado.fecha,
            imagencarro: carroEncontrado.imagencarro
          });
          setCarDetails({
            id_carros: carroEncontrado.id_carros || carroEncontrado.id || carroEncontrado.ID,
            conductor: carroEncontrado.conductor || carroEncontrado.Conductor || 'Conductor no especificado',
            placa: carroEncontrado.placa || carroEncontrado.Placa || 'Placa no especificada',
            asientos: carroEncontrado.asientos || carroEncontrado.Asientos || 4,
            asientos_disponibles: carroEncontrado.asientos_disponibles || carroEncontrado.asientos || 4,
            destino: carroEncontrado.destino || carroEncontrado.Destino || 'Destino no especificado',
            horasalida: carroEncontrado.horasalida || carroEncontrado.Horasalida || 'Hora no especificada',
            fecha: carroEncontrado.fecha || carroEncontrado.Fecha || '2024-01-15',
            imagencarro: carroEncontrado.imagencarro || carroEncontrado.Imagencarro || null,
            telefono: carroEncontrado.telefono || '+1 234 567 890',
            email: carroEncontrado.email || 'conductor@email.com'
          });
        } else {
          console.log('Carro no encontrado con ID:', carId);
          console.log('Carros disponibles:', carrosArray);
          // Si no encuentra el carro, usar datos por defecto
          setCarDetails({
            id_carros: carId,
            conductor: 'Conductor no especificado',
            placa: 'Placa no especificada',
            asientos: 4,
            asientos_disponibles: 2,
            destino: 'Destino no especificado',
            horasalida: 'Hora no especificada',
            fecha: '2024-01-15',
            imagencarro: null,
            telefono: '+1 234 567 890',
            email: 'conductor@email.com'
          });
        }
      } catch (err) {
        console.error('Error al obtener detalles del carro:', err);
        // Si hay error, usar datos por defecto
        setCarDetails({
          id_carros: carId,
          conductor: 'Conductor no especificado',
          placa: 'Placa no especificada',
          asientos: 4,
          asientos_disponibles: 2,
          destino: 'Destino no especificado',
          horasalida: 'Hora no especificada',
          fecha: '2024-01-15',
          imagencarro: null,
          telefono: '+1 234 567 890',
          email: 'conductor@email.com'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarDetails();
  }, [carId, navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSeatSelection = (seatNumber) => {
    setSelectedSeat(seatNumber);
  };

  const handleConfirmReservation = () => {
    if (!selectedSeat || !pickupLocation.trim()) {
      alert('Por favor selecciona un puesto y agrega tu ubicación de recogida');
      return;
    }
    setShowConfirmation(true);
  };

  const handleReserveTrip = async () => {
    setIsReserving(true);
    
    try {
      // Simular llamada a API para reservar el viaje
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la llamada real a la API
      // const response = await fetch('http://localhost:8000/api/reservar-viaje', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify({
      //     car_id: carId,
      //     user_id: userData.id,
      //     asiento: selectedSeat,
      //     ubicacion_recogida: pickupLocation
      //   })
      // });

      setShowConfirmation(false);
      setShowSuccess(true);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/indexLogin');
      }, 3000);
      
    } catch (error) {
      console.error('Error al reservar viaje:', error);
      alert('Error al reservar el viaje. Inténtalo de nuevo.');
    } finally {
      setIsReserving(false);
    }
  };

  const handleCancelReservation = () => {
    setShowConfirmation(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Cargando detalles...</div>
      </div>
    );
  }

  if (!userData || !carDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Error al cargar los datos</div>
      </div>
    );
  }

  // Generar asientos disponibles
  const availableSeats = [];
  for (let i = 1; i <= carDetails.asientos; i++) {
    availableSeats.push(i);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 relative overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y nombre */}
            <div className="flex items-center space-x-3">
              <FaCar className="text-blue-900 text-3xl drop-shadow-lg" />
              <span className="text-2xl font-bold text-blue-900">Mecaza</span>
            </div>

            {/* Navegación - Desktop */}
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

            {/* Botón menú móvil */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-blue-900 hover:text-blue-700 p-2"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Menú móvil */}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-8 transform transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
              Detalles del Viaje
            </h1>
            <p className="text-lg text-gray-600">
              Confirma tu reserva y selecciona tu puesto
            </p>
          </div>

          {/* Información del carro */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Imagen del carro */}
            <div className="flex justify-center">
              {carDetails.imagencarro ? (
                <img 
                  src={carDetails.imagencarro} 
                  alt="Carro" 
                  className="w-full max-w-md h-64 object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full max-w-md h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-lg flex items-center justify-center">
                  <FaCar className="text-blue-600 text-6xl" />
                </div>
              )}
            </div>

            {/* Información del conductor */}
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                  <FaUser className="mr-2" />
                  Información del Conductor
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">Nombre:</span>
                    <p className="text-gray-900">{carDetails.conductor}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Placa:</span>
                    <p className="text-gray-900">{carDetails.placa}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Teléfono:</span>
                    <p className="text-gray-900 flex items-center">
                      <FaPhone className="mr-2 text-blue-600" />
                      {carDetails.telefono}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Email:</span>
                    <p className="text-gray-900 flex items-center">
                      <FaEnvelope className="mr-2 text-blue-600" />
                      {carDetails.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del viaje */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  Detalles del Viaje
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">Destino:</span>
                    <p className="text-gray-900">{carDetails.destino}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Fecha:</span>
                    <p className="text-gray-900 flex items-center">
                      <FaCalendar className="mr-2 text-green-600" />
                      {new Date(carDetails.fecha).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Hora de salida:</span>
                    <p className="text-gray-900 flex items-center">
                      <FaClock className="mr-2 text-green-600" />
                      {carDetails.horasalida}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Asientos disponibles:</span>
                    <p className="text-gray-900">{carDetails.asientos_disponibles || carDetails.asientos} de {carDetails.asientos}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Selección de puesto */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Selecciona tu Puesto</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {availableSeats.map((seat) => (
                <button
                  key={seat}
                  onClick={() => handleSeatSelection(seat)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedSeat === seat
                      ? 'border-blue-600 bg-blue-100 text-blue-900'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-center">
                    <FaUser className="mx-auto mb-2 text-xl" />
                    <span className="font-semibold">Puesto {seat}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ubicación de recogida */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ubicación de Recogida</h3>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Ingresa tu dirección de recogida..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              El conductor te recogerá en esta ubicación
            </p>
          </div>

          {/* Botón de confirmación */}
          <div className="text-center">
            <button
              onClick={handleConfirmReservation}
              disabled={!selectedSeat || !pickupLocation.trim()}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
            >
              <FaCheck className="mr-2" />
              Confirmar Reserva
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirmar Reserva</h3>
            <div className="space-y-4 mb-6">
              <div>
                <span className="font-semibold">Conductor:</span> {carDetails.conductor}
              </div>
              <div>
                <span className="font-semibold">Destino:</span> {carDetails.destino}
              </div>
              <div>
                <span className="font-semibold">Fecha:</span> {new Date(carDetails.fecha).toLocaleDateString('es-ES')}
              </div>
              <div>
                <span className="font-semibold">Hora:</span> {carDetails.horasalida}
              </div>
              <div>
                <span className="font-semibold">Puesto:</span> {selectedSeat}
              </div>
              <div>
                <span className="font-semibold">Ubicación:</span> {pickupLocation}
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleReserveTrip}
                disabled={isReserving}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isReserving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Reservando...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Confirmar
                  </>
                )}
              </button>
              <button
                onClick={handleCancelReservation}
                disabled={isReserving}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <FaTimes className="mr-2" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva Confirmada!</h3>
            <p className="text-gray-600 mb-6">
              Tu viaje ha sido reservado exitosamente. El conductor te contactará pronto.
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>Recordatorio:</strong> Llega 10 minutos antes de la hora de salida en tu ubicación de recogida.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Redirigiendo a la página principal...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerDetalles; 