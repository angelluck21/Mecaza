import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCar, FaUser, FaMapMarkerAlt, FaClock, FaCalendar, FaPhone, FaEnvelope, FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';
import CarImage from '../components/CarImage';

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
  const [reservasExistentes, setReservasExistentes] = useState([]);
  const [asientosOcupados, setAsientosOcupados] = useState([]);
  const [estados, setEstados] = useState([]);
  const navigate = useNavigate();
  const { carId } = useParams();

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
      return `http://127.0.0.1:8000${imagePath}`;
    }
    
    // Si es solo el nombre del archivo, construir URL
    if (!imagePath.includes('/')) {
      return `http://127.0.0.1:8000/storage/carros/${imagePath}`;
    }
    
    // Construir URL completa
    return `http://127.0.0.1:8000/storage/${imagePath}`;
  };

  // Función helper para obtener el nombre del estado optimizada con useMemo
  const getEstadoNombre = (estadoId) => {
    const estado = estados.find(e => (e.id_estados || e.id) == estadoId);
    if (estado) {
      return estado.estados || estado.nombre || estado.Nombre || estado.estado || estado.Estado || estado.Estados || `Estado ${estadoId}`;
    }
    
    // Fallback a nombres por defecto si no se encuentran en la lista
    const estadosDefault = {
      1: 'Disponible',
      2: 'En Mantenimiento', 
      3: 'En Viaje',
      4: 'No Disponible'
    };
    return estadosDefault[estadoId] || `Estado ${estadoId}`;
  };

  useEffect(() => {
    // Obtener datos del usuario del localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        setUserData(user);
        // Establecer automáticamente el nombre del usuario desde localStorage
        const userName = user.Nombre || user.nombre || user.name || '';
        setNombre(userName);
      } catch (error) {
        navigate('/login');
        return;
      }
    } else {
      navigate('/login');
      return;
    }

    // Función para cargar estados
    const fetchEstados = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/listarestados');
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setEstados(data);
        } else if (data && Array.isArray(data.data)) {
          setEstados(data.data);
        } else {
          setEstados([]);
        }
        
      } catch (error) {
        setEstados([]);
      }
    };

    // Obtener detalles del carro, precios y reservas existentes
    const fetchCarDetails = async () => {
      try {
        // Cargar carros
        const carrosResponse = await fetch(`http://127.0.0.1:8000/api/listarcarro`);
        
        if (!carrosResponse.ok) {
          throw new Error(`Error HTTP: ${carrosResponse.status}`);
        }
        
        const carrosData = await carrosResponse.json();
        
        // Extraer el array de carros de la respuesta
        let carrosArray = [];
        if (Array.isArray(carrosData)) {
          carrosArray = carrosData;
        } else if (carrosData && Array.isArray(carrosData.data)) {
          carrosArray = carrosData.data;
        } else {
          setIsLoading(false);
          return;
        }
        
        // Buscar el carro específico
        const carroEncontrado = carrosArray.find(car => {
          const carIdNum = car.id_carros || car.id || car.ID;
          return carIdNum == carId;
        });
        
        if (!carroEncontrado) {
          setIsLoading(false);
          return;
        }
        
        // Cargar precios
        const preciosResponse = await fetch('http://127.0.0.1:8000/api/listarprecio');
        
        if (preciosResponse.ok) {
          const preciosData = await preciosResponse.json();
          
          // Extraer el array de precios de la respuesta
          let preciosArray = [];
          if (Array.isArray(preciosData)) {
            preciosArray = preciosData;
          } else if (preciosData && Array.isArray(preciosData.data)) {
            preciosArray = preciosData.data;
          }
          
          if (preciosArray.length > 0) {
            const preciosActuales = preciosArray[0];
            setPrecios({
              zaraMede: preciosActuales['zara-mede'] || 120000,
              zaraCauca: preciosActuales['zara-cauca'] || 30000,
              caucaMede: preciosActuales['cauca-mede'] || 100000
            });
          }
        }
        
        // Cargar reservas
        const reservasResponse = await fetch('http://127.0.0.1:8000/api/listarreserva');
        
        if (reservasResponse.ok) {
          const reservasData = await reservasResponse.json();
          
          // Extraer el array de reservas de la respuesta
          let reservasArray = [];
          if (Array.isArray(reservasData)) {
            reservasArray = reservasData;
          } else if (reservasData && Array.isArray(reservasData.data)) {
            reservasArray = reservasData.data;
          }
          
          // Filtrar reservas del carro actual
          const reservasDelCarro = reservasArray.filter(reserva => 
            reserva.id_carros == carId && 
            reserva.estado !== 'cancelada' && 
            reserva.estado !== 'rechazada'
          );
          
          // Extraer asientos ocupados
          const asientosOcupados = reservasDelCarro.map(reserva => 
            parseInt(reserva.Asiento || reserva.asiento || 0)
          ).filter(asiento => asiento > 0);
          
          // Establecer datos del carro
          const carDetailsToSet = {
            id_carros: carroEncontrado.id_carros,
            conductor: carroEncontrado.conductor || carroEncontrado.Conductor,
            placa: carroEncontrado.placa || carroEncontrado.Placa,
            asientos: parseInt(carroEncontrado.asientos) || parseInt(carroEncontrado.Asientos) || 4,
            asientos_disponibles: (parseInt(carroEncontrado.asientos) || parseInt(carroEncontrado.Asientos) || 4) - asientosOcupados.length,
            destino: carroEncontrado.destino || carroEncontrado.Destino,
            horasalida: carroEncontrado.horasalida || carroEncontrado.Horasalida,
            fecha: carroEncontrado.fecha || carroEncontrado.Fecha,
            imagencarro: carroEncontrado.imagencarro || carroEncontrado.Imagencarro,
            telefono: carroEncontrado.telefono || carroEncontrado.Telefono,
            email: carroEncontrado.email,
            estado: carroEncontrado.estado || carroEncontrado.Estado || carroEncontrado.id_estados,
            id_estados: carroEncontrado.id_estados || carroEncontrado.estado || carroEncontrado.Estado
          };
          
          // Actualizar estados
          setReservasExistentes(reservasDelCarro);
          setAsientosOcupados(asientosOcupados);
          setCarDetails(carDetailsToSet);
        }
        
      } catch (error) {
        // Error silencioso para mejor UX
      } finally {
        setIsLoading(false);
      }
    };

    // Ejecutar las funciones de carga
    const loadData = async () => {
      try {
        await fetchEstados();
        await fetchCarDetails();
      } catch (error) {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [carId, navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSeatSelection = (seatNumber) => {
    // Verificar si el asiento ya está ocupado
    if (asientosOcupados.includes(seatNumber)) {
      alert(`El asiento ${seatNumber} ya está ocupado. Por favor selecciona otro asiento.`);
      return;
    }
    setSelectedSeat(seatNumber);
  };

  const handleConfirmReservation = () => {
    if (!userData) {
      alert('Debes estar autenticado para hacer una reserva. Por favor, inicia sesión.');
      navigate('/login');
      return;
    }
    
    if (!selectedSeat || !pickupLocation.trim() || !nombre.trim()) {
      alert('Por favor selecciona un puesto, agrega tu ubicación de recogida y tu nombre');
      return;
    }
    
    // Verificar que el asiento seleccionado no esté ocupado
    if (asientosOcupados.includes(selectedSeat)) {
      alert('El asiento seleccionado ya está ocupado. Por favor selecciona otro asiento.');
      return;
    }
    
    // Verificar que haya asientos disponibles
    if (carDetails.asientos_disponibles <= 0) {
      alert('No hay asientos disponibles en este carro. Todos los asientos están ocupados.');
      return;
    }
    
    // Verificar que el ID del usuario esté disponible
    const userId = userData.id || userData.id_users || userData.ID || userData.user_id || userData.userId;
    if (!userId) {
      alert('Error: No se pudo identificar tu cuenta de usuario. Por favor, inicia sesión nuevamente.');
      navigate('/login');
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleReserveTrip = async () => {
    setIsReserving(true);
    
    // Obtener el ID del usuario de múltiples fuentes posibles
    const userId = userData.id || userData.id_users || userData.ID || userData.user_id || userData.userId || 1;
    
    // Obtener el ID del carro y validar que no sea null
    const carroId = carDetails.id_carros || carDetails.id || carId;
    if (!carroId) {
      alert('Error: No se pudo identificar el carro. Por favor, recarga la página e intenta nuevamente.');
      return;
    }
   
    try {
      // Preparar los datos a enviar - CORREGIDO
      const dataToSend = {
        Regate: 0,
        Nombre: nombre.trim(),
        Ubicacion: pickupLocation,
        Asiento: selectedSeat, // Asegurar que se envíe el asiento seleccionado
        Usuario: userId,
        id_carros: carroId,
        estado: 'pendiente',
        // Agregar información del conductor para el email
        conductorEmail: carDetails.email || 'conductor@mecaza.com',
        conductorNombre: carDetails.conductor,
        placa: carDetails.placa,
        destino: carDetails.destino,
        fecha: carDetails.fecha,
        hora: carDetails.horasalida
      };

      // Debug: verificar que el asiento se esté enviando
      console.log('🔍 Datos a enviar:', dataToSend);
      console.log('🔍 Asiento seleccionado:', selectedSeat);
       
      // Llamada real a la API usando las rutas proporcionadas
      const response = await fetch('http://127.0.0.1:8000/api/agregarreserva', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al reservar el viaje');
      }

      const responseData = await response.json();
      console.log('✅ Respuesta del servidor:', responseData);

      setShowConfirmation(false);
      setShowSuccess(true);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/indexLogin');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error al reservar:', error);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl font-semibold mb-2">Cargando detalles del carro...</div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Error de autenticación</div>
          <div className="text-blue-200 text-sm mb-4">No se pudieron cargar tus datos de usuario</div>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  if (!carDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Error al cargar el carro</div>
          <div className="text-blue-200 text-sm mb-4">No se pudieron cargar los detalles del carro</div>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver Atrás
          </button>
        </div>
      </div>
    );
  }

  // Generar asientos disponibles optimizado con useMemo
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
              <p className="text-lg text-gray-600 mb-4">
                Confirma tu reserva y selecciona tu puesto
              </p>
              {/* Caja verde eliminada */}
              {estados.length > 0 && estados[0].estados === 'Disponible' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Modo de respaldo:</strong> Algunos datos se cargaron desde valores por defecto debido a problemas de conexión. La funcionalidad básica está disponible.
                  </p>
                </div>
              )}
            </div>

          {/* Información del carro */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            
            <div className="space-y-6">
                             {/* Imagen del carro */}
                <div className="flex justify-center">
                  <CarImage 
                    imageUrl={getCarImageUrl(carDetails.imagencarro)}
                    conductorName={carDetails.conductor}
                    className="w-full max-w-md h-64 object-cover rounded-lg shadow-lg"
                    fallbackClassName="w-full max-w-md h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-lg flex items-center justify-center"
                    fallbackIconSize="text-6xl"
                  />
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
                                      <span className="font-semibold text-gray-700">Estado del Carro:</span>
                                      <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                          (carDetails.estado === 1 || carDetails.Estado === 1 || carDetails.id_estados === 1) ? 'bg-green-100 text-green-800' : 
                                          (carDetails.estado === 2 || carDetails.Estado === 2 || carDetails.id_estados === 2) ? 'bg-yellow-100 text-yellow-800' :
                                          (carDetails.estado === 3 || carDetails.Estado === 3 || carDetails.id_estados === 3) ? 'bg-orange-100 text-orange-800' :
                                          (carDetails.estado === 4 || carDetails.Estado === 4 || carDetails.id_estados === 4) ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {getEstadoNombre(carDetails.estado || carDetails.Estado || carDetails.id_estados || 1)}
                                        </span>

                                      </div>
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
                                      <p className="text-gray-900">
                                        {carDetails.asientos_disponibles || carDetails.asientos} de {carDetails.asientos}
                                        {asientosOcupados.length > 0 && (
                                          <span className="text-red-600 text-sm ml-2">
                                            ({asientosOcupados.length} ocupado{asientosOcupados.length > 1 ? 's' : ''})
                                          </span>
                                        )}
                                      </p>
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
                    {[1, 2, 3, 4].map((seat) => {
                      const isOcupado = asientosOcupados.includes(seat);
                      const isSeleccionado = selectedSeat === seat;
                      
                      return (
                      <button
                        key={seat}
                        onClick={() => handleSeatSelection(seat)}
                         disabled={isOcupado}
                        className={`w-16 h-12 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg transform border-2 ${
                          isOcupado
                            ? 'bg-gradient-to-br from-red-400 to-red-500 text-white border-red-300 cursor-not-allowed opacity-75'
                            : isSeleccionado
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400 shadow-blue-200 scale-110'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border-gray-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 hover:text-blue-700 hover:scale-105'
                        }`}
                      >
                        <span className="text-sm font-bold">
                          {isOcupado ? '✗' : seat}
                        </span>
                      </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Información de estado */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center space-x-4 text-xs">
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
                  {asientosOcupados.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-red-700 font-semibold text-sm">
                        ⚠️ {asientosOcupados.length} asiento(s) ocupado(s): {asientosOcupados.sort().join(', ')}
                      </p>
                    </div>
                  )}
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
                      placeholder="Tu nombre se toma automáticamente de tu cuenta..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      readOnly={nombre.trim() !== ''}
                     />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {nombre.trim() !== '' ? 
                      '✓ Nombre tomado automáticamente de tu cuenta' : 
                      'Este nombre aparecerá en la reserva'
                    }
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
                disabled={!selectedSeat || !pickupLocation.trim() || !nombre.trim() || carDetails.asientos_disponibles <= 0}
                 className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
               >
                <FaCheck className="mr-2" />
                {carDetails.asientos_disponibles <= 0 ? 'Sin Asientos Disponibles' : 'Confirmar Reserva'}
              </button>
              {carDetails.asientos_disponibles <= 0 && (
                <p className="text-red-600 text-sm mt-2">
                  ⚠️ No hay asientos disponibles en este carro
                </p>
              )}
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
                    <span className="font-semibold">Pasajero:</span> {nombre || 'No especificado'}
                 </div>
                <div>
                  <span className="font-semibold">Puesto:</span> {selectedSeat === 'conductor' ? 'Conductor' : selectedSeat === 'copiloto' ? 'Copiloto' : selectedSeat === 'trasero' ? 'Trasero' : 'No seleccionado'}
                </div>
                <div>
                  <span className="font-semibold">Ubicación:</span> {pickupLocation || 'No especificada'}
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva Creada!</h3>
            <p className="text-gray-600 mb-6">
              Tu reserva ha sido creada exitosamente y está pendiente de confirmación por el conductor.
            </p>
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Estado:</strong> Pendiente de confirmación por el conductor. Te notificaremos cuando sea confirmada.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>Recordatorio:</strong> Una vez confirmada, llega 10 minutos antes de la hora de salida en tu ubicación de recogida.
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