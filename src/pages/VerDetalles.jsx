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
  const [nombre, setNombre] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [precios, setPrecios] = useState(null);
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

    // Obtener detalles del carro y precios
    const fetchCarDetails = async () => {
      try {
        // Obtener carros
        const response = await fetch(`http://127.0.0.1:8000/api/listarcarro`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Todos los carros:', data);
        
        // Obtener precios
        const preciosResponse = await fetch('http://127.0.0.1:8000/api/listarprecio');
        if (preciosResponse.ok) {
          const preciosData = await preciosResponse.json();
          console.log('Precios obtenidos:', preciosData);
          
          // Manejar diferentes estructuras de respuesta de precios
          let preciosArray = [];
          if (Array.isArray(preciosData)) {
            preciosArray = preciosData;
          } else if (preciosData && Array.isArray(preciosData.data)) {
            preciosArray = preciosData.data;
          } else if (preciosData && preciosData.data) {
            preciosArray = [preciosData.data];
          } else {
            preciosArray = [preciosData];
          }
          
          // Tomar el primer registro de precios (o el más reciente)
          if (preciosArray.length > 0) {
            const preciosActuales = preciosArray[0];
            setPrecios({
              zaraMede: preciosActuales['zara-mede'] || preciosActuales.zaraMede || preciosActuales.ZaraMede || 120000,
              zaraCauca: preciosActuales['zara-cauca'] || preciosActuales.zaraCauca || preciosActuales.ZaraCauca || 30000,
              caucaMede: preciosActuales['cauca-mede'] || preciosActuales.caucaMede || preciosActuales.CaucaMede || 100000
            });
          }
        } else {
          console.log('No se pudieron obtener los precios, usando valores por defecto');
          setPrecios({
            zaraMede: 120000,
            zaraCauca: 30000,
            caucaMede: 100000
          });
        }
        
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
            conductor: carroEncontrado.Conductor || carroEncontrado.conductor || 'Conductor no especificado',
            placa: carroEncontrado.Placa || carroEncontrado.placa || 'Placa no especificada',
            asientos: parseInt(carroEncontrado.Asientos) || parseInt(carroEncontrado.asientos) || 4,
            asientos_disponibles: parseInt(carroEncontrado.Asientos) || parseInt(carroEncontrado.asientos) || 4,
            destino: carroEncontrado.Destino || carroEncontrado.destino || 'Destino no especificado',
            horasalida: carroEncontrado.Horasalida || carroEncontrado.horasalida || 'Hora no especificada',
            fecha: carroEncontrado.Fecha || carroEncontrado.fecha || '2024-01-15',
            imagencarro: carroEncontrado.Imagencarro || carroEncontrado.imagencarro || null,
            telefono: carroEncontrado.Telefono || carroEncontrado.telefono || '+1 234 567 890',
            email: carroEncontrado.email || 'conductor@email.com',
            estado: carroEncontrado.Estado || carroEncontrado.estado || 1
          });
        } else {
          console.log('Carro no encontrado con ID:', carId);
          console.log('Carros disponibles:', carrosArray);
        
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
    if (!selectedSeat || !pickupLocation.trim() || !nombre.trim()) {
      alert('Por favor selecciona un puesto, agrega tu ubicación de recogida y tu nombre');
      return;
    }
    setShowConfirmation(true);
  };

  const handleReserveTrip = async () => {
    setIsReserving(true);
    
    try {
      // Llamada real a la API usando las rutas proporcionadas
      const response = await fetch('http://127.0.0.1:8000/api/agregarreserva', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
                 body: JSON.stringify({
           Regate: 0, // Valor por defecto para regate
           Nombre: nombre.trim(),
           Ubicacion: pickupLocation,
           Asiento: selectedSeat,
           Usuario: userData.id || userData.id_users || userData.ID || 1
         })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al reservar el viaje');
      }

      const result = await response.json();
      console.log('Reserva creada exitosamente:', result);

      setShowConfirmation(false);
      setShowSuccess(true);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/indexLogin');
      }, 3000);
      
    } catch (error) {
      console.error('Error al reservar viaje:', error);
      alert(`Error al reservar el viaje: ${error.message}. Inténtalo de nuevo.`);
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


      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-8 transform transition-all duration-300">

          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
              Reserva Tu Viaje 
            </h1>
            <p className="text-lg text-gray-600">
              Confirma tu reserva y selecciona tu puesto
            </p>
          </div>

          {/* Información del carro */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            
            <div className="space-y-6">
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

            
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Precios por Ruta</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Zaragoza → Medellín</span>
                    <span className="font-bold text-green-600">
                      ${precios ? precios.zaraMede?.toLocaleString() : '120.000'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Zaragoza → Caucasia</span>
                    <span className="font-bold text-green-600">
                      ${precios ? precios.zaraCauca?.toLocaleString() : '30.000'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Caucasia → Medellín</span>
                    <span className="font-bold text-green-600">
                      ${precios ? precios.caucaMede?.toLocaleString() : '100.000'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha: Información del conductor */}
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
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Selecciona tu Asiento</h3>
            
            {/* Layout moderno de asientos */}
            <div className="max-w-md mx-auto">
              {/* Información del vehículo */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl p-4 text-white text-center mb-4">
                <h4 className="font-bold text-lg">{carDetails.placa}</h4>
                <p className="text-sm opacity-90">Vehículo disponible</p>
              </div>
              
              {/* Asientos */}
              <div className="bg-white rounded-b-xl shadow-xl p-6">
                {/* Fila del conductor */}
                <div className="mb-6">
                  <div className="text-center mb-3">
                    <span className="text-sm font-medium text-gray-600">Conductor</span>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <div className="w-16 h-12 bg-gradient-to-b from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-md border-2 border-gray-300">
                      <span className="text-xs font-bold text-gray-700">COND</span>
                    </div>
                    <div className="w-16 h-12 bg-gradient-to-b from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-md border-2 border-gray-300">
                      <span className="text-xs font-bold text-gray-700">COPIL</span>
                    </div>
                  </div>
                </div>
                
                {/* Separador */}
                <div className="border-t border-gray-200 mb-6"></div>
                
                {/* Asientos traseros */}
                <div className="mb-6">
                  <div className="text-center mb-3">
                    <span className="text-sm font-medium text-gray-600">Asientos Disponibles</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                    {[1, 2, 3, 4].map((seat) => (
                      <button
                        key={seat}
                        onClick={() => handleSeatSelection(seat)}
                        className={`w-16 h-12 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg transform hover:scale-105 border-2 ${
                          selectedSeat === seat
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400 shadow-blue-200 scale-110'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border-gray-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 hover:text-blue-700'
                        }`}
                      >
                        <span className="text-sm font-bold">{seat}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Información de estado */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center space-x-6 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span className="text-gray-600">Disponible</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Seleccionado</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span className="text-gray-600">Ocupado</span>
                    </div>
                  </div>
                </div>
                
                {/* Información de asientos */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Asientos disponibles:</span> {carDetails.asientos_disponibles || carDetails.asientos} de {carDetails.asientos}
                  </p>
                  {selectedSeat && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-700 font-semibold text-sm">
                        ✓ Has seleccionado el asiento {selectedSeat}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

                     {/* Información del pasajero */}
           <div className="mb-8">
             <h3 className="text-2xl font-bold text-gray-900 mb-4">Información del Pasajero</h3>
             <div className="grid md:grid-cols-2 gap-6">
               {/* Nombre del pasajero */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Tu Nombre</label>
                 <div className="relative">
                   <FaUser className="absolute left-3 top-3 text-gray-400" />
                                       <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ingresa tu nombre completo..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                 </div>
                 <p className="text-sm text-gray-600 mt-2">
                   Este nombre aparecerá en la reserva
                 </p>
               </div>
               
               {/* Ubicación de recogida */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación de Recogida</label>
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
             </div>
           </div>

          {/* Botón de confirmación */}
          <div className="text-center">
                         <button
               onClick={handleConfirmReservation}
               disabled={!selectedSeat || !pickupLocation.trim() || !nombre.trim()}
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
                   <span className="font-semibold">Pasajero:</span> {nombre}
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