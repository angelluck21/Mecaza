import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCar, FaPlus, FaEnvelope, FaUsers, FaCog, FaMapMarkerAlt, FaClock, FaUserFriends, FaDollarSign, FaUser } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';
import axios from 'axios';


const Conductor = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [showReservasModal, setShowReservasModal] = useState(false);
  const [reservas, setReservas] = useState([]);
  const [isLoadingReservas, setIsLoadingReservas] = useState(false);
  const [showCarrosModal, setShowCarrosModal] = useState(false);
  const [carros, setCarros] = useState([]);
  const [isLoadingCarros, setIsLoadingCarros] = useState(false);
  const [showUpdateEstadoModal, setShowUpdateEstadoModal] = useState(false);
  const [selectedCarro, setSelectedCarro] = useState(null);
  const [newEstado, setNewEstado] = useState('');
  const [estados, setEstados] = useState([]);
  const [isLoadingEstados, setIsLoadingEstados] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [carData, setCarData] = useState({
    Placa: '',
    Conductor: '', // Valor por defecto para evitar null
    Asientos: '',
    Destino: '',
    Horasalida: '',
    Fecha: '',
    Telefono: '',
    Estado: '', // Nuevo campo para el estado
    Userid: '', // Valor por defecto para evitar null
  });
  

  
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        
        // Verificar si es conductor o admin
        if (user.rol === 'conductor' || user.rol === 'admin') {
          setUserData(user);
        } else {
          showAuthError('No tienes permisos para acceder al panel de conductor');
          navigate('/dashboard');
        }
      } catch (error) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
    setIsLoading(false);
  }, [navigate]);

  const _handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    setUserData(null);
    navigate('/');
  };

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (ya se redirigió)
  if (!userData) {
    return null;
  }

  const showToastNotification = (message, type = 'success') => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  // Función para mostrar notificación de error de autorización
  const showAuthError = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000); // Más tiempo para mensajes de error
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    
    // Debug: mostrar el estado actual
    console.log('Estado actual del formulario:', carData);
    
    // Validación más estricta con verificación de strings vacíos
    if (!carData.Conductor || carData.Conductor.trim() === '' || 
        !carData.Placa || carData.Placa.trim() === '' || 
        !carData.Asientos || carData.Asientos.trim() === '' || 
        !carData.Destino || carData.Destino.trim() === '' || 
        !carData.Horasalida || carData.Horasalida.trim() === '' || 
        !carData.Fecha || carData.Fecha.trim() === '' || 
        !carData.Telefono || carData.Telefono.trim() === '' || 
        !carData.Userid || carData.Userid.trim() === '') {
      showToastNotification('Por favor, completa todos los campos requeridos', 'error');
      return;
    }
    
    try {
      const dataToSend = {
        Conductor: carData.Conductor.trim(),
        Telefono: carData.Telefono.trim(),
        Placa: carData.Placa.trim(),
        Asientos: parseInt(carData.Asientos) || 0,
        Destino: carData.Destino.trim(),
        Horasalida: carData.Horasalida.trim(),
        Fecha: carData.Fecha.trim(),
        Estado: carData.Estado,
        Userid: parseInt(carData.Userid) || 0
      };
      
      // Debug: mostrar qué se está enviando
      console.log('Datos a enviar:', dataToSend);
        console.log('Conductor específicamente:', dataToSend.Conductor);
      
      const response = await axios.post('http://127.0.0.1:8000/api/agregarcarros', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      showToastNotification('¡Vehículo registrado exitosamente! 🚗');
      setCarData({
        Placa: '',
        Conductor: '',
        Asientos: '',
        Destino: '',
        Horasalida: '',
        Fecha: '',
        Telefono: '',
        Estados: '',
        Userid: ''
      });
      setShowAddCarModal(false);
    } catch (error) {
      if (error.response) {
        showToastNotification(`Error: ${error.response.data.message || 'No se pudo guardar el vehículo'}`, 'error');
      } else if (error.request) {
        showToastNotification('Error de conexión. Verifica que el servidor esté ejecutándose.', 'error');
      } else {
        showToastNotification('Error inesperado al guardar el vehículo', 'error');
      }
    }
  };

  const handleViewReservas = async () => {
    setIsLoadingReservas(true);
    setShowReservasModal(true);
    
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/listarreserva', {
        headers: {
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
      
      setReservas(reservasArray);
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      showToastNotification('Error al cargar las reservas', 'error');
      setReservas([]);
    } finally {
      setIsLoadingReservas(false);
    }
  };

  const handleViewCarros = async () => {
    setIsLoadingCarros(true);
    setShowCarrosModal(true);
    
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/listarcarro', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log('Carros obtenidos:', response.data);
      
      // Manejar diferentes estructuras de respuesta
      let carrosArray = [];
      if (response.data && Array.isArray(response.data)) {
        carrosArray = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        carrosArray = response.data.data;
      } else if (response.data && response.data.data) {
        carrosArray = [response.data.data];
      } else {
        carrosArray = [];
      }
      
      console.log('Carros procesados:', carrosArray);
      console.log('Ejemplo de carro:', carrosArray[0]);
      
              // Obtener estados para mostrar nombres en lugar de números
        try {
          const estadosResponse = await axios.get('http://127.0.0.1:8000/api/listarestados', {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          });
          
          console.log('Respuesta completa de estados:', estadosResponse.data);
          
          let estadosArray = [];
          // Según el backend, los datos vienen en response.data.data
          if (estadosResponse.data && estadosResponse.data.data) {
            estadosArray = Array.isArray(estadosResponse.data.data) 
              ? estadosResponse.data.data 
              : [estadosResponse.data.data];
          } else if (estadosResponse.data && Array.isArray(estadosResponse.data)) {
            estadosArray = estadosResponse.data;
          } else {
            estadosArray = [];
          }
          
          console.log('Estados procesados:', estadosArray);
          console.log('Ejemplo de estado:', estadosArray[0]);
          
          // Crear un mapa de estados para acceso rápido
          const estadosMap = {};
          estadosArray.forEach(estado => {
            console.log('Procesando estado:', estado);
            console.log('Campos disponibles:', Object.keys(estado));
            
            const id = estado.id_estados || estado.id;
            const nombre = estado.nombre || estado.Nombre || estado.estado || estado.Estado || estado.Estados || `Estado ${id}`;
            estadosMap[id] = nombre;
            console.log(`Mapeando estado ID ${id} -> ${nombre}`);
            console.log('Estado completo:', estado);
          });
        
          console.log('Mapa de estados creado:', estadosMap);
          
          // Agregar el nombre del estado a cada carro
          carrosArray = carrosArray.map(carro => {
            console.log('Procesando carro:', carro);
            console.log('Campos del carro:', Object.keys(carro));
            
            const estadoId = carro.id_estados || carro.Estado;
            const estadoNombre = estadosMap[estadoId] || getEstadoNombre(estadoId);
            console.log(`Carro ${carro.placa || carro.Placa}: ID estado ${estadoId} -> ${estadoNombre}`);
            console.log(`Mapa de estados disponible:`, estadosMap);
            console.log(`Estado ID ${estadoId} en mapa:`, estadosMap[estadoId]);
            
            return {
              ...carro,
              estadoNombre: estadoNombre
            };
          });
        
        } catch (estadosError) {
          console.error('Error al obtener estados:', estadosError);
          // Si no se pueden obtener los estados, usar nombres por defecto
          carrosArray = carrosArray.map(carro => ({
            ...carro,
            estadoNombre: getEstadoNombre(carro.id_estados || carro.Estado)
          }));
        }
      
      setCarros(carrosArray);
    } catch (error) {
      console.error('Error al obtener carros:', error);
      showToastNotification('Error al cargar los carros', 'error');
      setCarros([]);
    } finally {
      setIsLoadingCarros(false);
    }
  };

     // Función auxiliar para obtener nombre del estado por ID
   const getEstadoNombre = (estadoId) => {
     const estados = {
       1: 'Disponible',
       2: 'En Viaje',
       3: 'En Mantenimiento',
       4: 'Fuera de Servicio'
     };
     console.log(`getEstadoNombre llamado con ID: ${estadoId}, resultado: ${estados[estadoId] || `Estado ${estadoId}`}`);
     return estados[estadoId] || `Estado ${estadoId}`;
   };

  const handleUpdateEstado = async () => {
    if (!selectedCarro || !newEstado) {
      showToastNotification('Por favor selecciona un carro y un estado', 'error');
      return;
    }

    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/actualizarestadocarro/${selectedCarro.id_carros || selectedCarro.id}`, {
        Estadoid: newEstado
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log('Estado actualizado:', response.data);
      showToastNotification('Estado del carro actualizado correctamente', 'success');
      
      // Actualizar la lista de carros
      handleViewCarros();
      
      // Cerrar modales
      setShowUpdateEstadoModal(false);
      setSelectedCarro(null);
      setNewEstado('');
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      showToastNotification('Error al actualizar el estado del carro', 'error');
    }
  };

  const handleGetEstados = async () => {
    setIsLoadingEstados(true);
    
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/listarestados', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log('Estados obtenidos:', response.data);
      
      // Según el backend, los datos vienen en response.data.data
      let estadosArray = [];
      if (response.data && response.data.data) {
        estadosArray = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
      } else if (response.data && Array.isArray(response.data)) {
        estadosArray = response.data;
      } else {
        estadosArray = [];
      }
      
      console.log('Estados procesados para la lista:', estadosArray);
      setEstados(estadosArray);
    } catch (error) {
      console.error('Error al obtener estados:', error);
      showToastNotification('Error al cargar los estados', 'error');
      setEstados([]);
    } finally {
      setIsLoadingEstados(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 relative overflow-hidden">
      {/* Notificación Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-white rounded-lg shadow-2xl border-l-4 border-green-500 p-4 max-w-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCar className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {notificationMessage}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setShowNotification(false)}
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Navbar */}
      <nav className="bg-white shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y nombre */}
            <div className="flex items-center space-x-3">
              <FaCar className="text-blue-900 text-3xl drop-shadow-lg" />
              <span className="text-2xl font-bold text-blue-900">Agregar Vehículo</span>
            </div>

            {/* Barra de búsqueda - Desktop */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar en el sistema..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Navegación - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
            
              <a href="/index2" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
                Panel Conductor
              </a>
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
                {/* Barra de búsqueda móvil */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Buscar en el sistema..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                
               
                <a 
                  href="/index2" 
                  className="block px-3 py-2 text-blue-900 hover:text-blue-700 font-medium"
                >
                  Panel Conductor
                </a>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-8 transform transition-all duration-300">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
              Agregar Vehículo
            </h1>
            <p className="text-lg text-gray-600">
              Registra tu vehículo en el sistema Mecaza
            </p>
          </div>

                     {/* Botones para el conductor */}
           <div className="flex justify-center space-x-6 flex-wrap">
             {/* Botón para agregar vehículo */}
             <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 max-w-md mb-6">
               <div className="flex items-center mb-6">
                 <div className="bg-blue-600 p-4 rounded-lg mr-4">
                   <FaCar className="text-3xl text-white" />
                 </div>
                 <h3 className="text-2xl font-bold text-blue-900">Registrar Vehículo</h3>
               </div>
               <p className="text-gray-600 mb-8 leading-relaxed text-center">
                 Completa la información de tu vehículo: placa, conductor, puestos, destino, horarios y estado del viaje.
               </p>
               <button
                 onClick={() => setShowAddCarModal(true)}
                 className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg text-lg"
               >
                 <FaPlus className="mr-3 text-xl" />
                 Agregar Vehículo
               </button>
             </div>

             {/* Botón para ver reservas */}
             <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 max-w-md mb-6">
               <div className="flex items-center mb-6">
                 <div className="bg-green-600 p-4 rounded-lg mr-4">
                   <FaUsers className="text-3xl text-white" />
                 </div>
                 <h3 className="text-2xl font-bold text-green-900">Ver Reservas</h3>
               </div>
               <p className="text-gray-600 mb-8 leading-relaxed text-center">
                 Consulta todas las reservas realizadas por los usuarios. Revisa detalles, ubicaciones y comentarios.
               </p>
               <button
                 onClick={handleViewReservas}
                 className="w-full bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg text-lg"
               >
                 <FaUsers className="mr-3 text-xl" />
                 Ver Reservas
               </button>
             </div>

             {/* Botón para gestionar carros */}
             <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 max-w-md mb-6">
               <div className="flex items-center mb-6">
                 <div className="bg-purple-600 p-4 rounded-lg mr-4">
                   <FaCog className="text-3xl text-white" />
                 </div>
                 <h3 className="text-2xl font-bold text-purple-900">Gestionar Carros</h3>
               </div>
               <p className="text-gray-600 mb-8 leading-relaxed text-center">
                 Ver y actualizar el estado de los carros. Cambia el estado de los vehículos según el viaje.
               </p>
               <button
                 onClick={handleViewCarros}
                 className="w-full bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg text-lg"
               >
                 <FaCog className="mr-3 text-xl" />
                 Gestionar Carros
               </button>
             </div>
           </div>
        </div>
      </div>

      {/* Modal Agregar Carro */}
      {showAddCarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            {/* Botón de cerrar arriba a la derecha */}
            <button
              onClick={() => setShowAddCarModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
              aria-label="Cerrar"
            >
              &times;
            </button>
            <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Agregar Vehículo</h2>
            <form onSubmit={handleAddCar} className="space-y-5">
              {/* Placa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                <input
                  type="text"
                  value={carData.Placa}
                  onChange={(e) => setCarData({...carData, Placa: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Conductor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
                <input
                  type="text"
                  value={carData.Conductor}
                  onChange={(e) => setCarData({...carData, Conductor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Puestos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de Puestos</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={carData.Asientos}
                  onChange={(e) => setCarData({...carData, Asientos: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 15"
                  required
                />
              </div>
              
              {/* Destino */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                <select
                  value={carData.Destino}
                  onChange={(e) => setCarData({...carData, Destino: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar destino</option>
                  <option value="Medellin">Medellín</option>
                  <option value="Caucasia">Caucasia</option>
                  <option value="Zaragoza">Zaragoza</option>
                </select>
              </div>

              {/* Estado del Viaje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">estados</label>
                <input
                  type="text"
                  value={carData.Estado}
                  onChange={(e) => setCarData({...carData, Estado: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {/* Hora de Salida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Salida</label>
                <input
                  type="text"
                  value={carData.Horasalida}
                  onChange={(e) => setCarData({...carData, Horasalida: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="text"
                  value={carData.Telefono}
                  onChange={(e) => setCarData({...carData, Telefono: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Día */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
                <input
                  type="text"
                  value={carData.Fecha}
                  placeholder="Ej: año-mes-dia"
                  onChange={(e) => setCarData({...carData, Fecha: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID del Conductor</label>
                <input
                  type="text"
                  value={carData.Userid}
                  placeholder="Ej: 1"
                  onChange={(e) => setCarData({...carData, Userid: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCarModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
             )}

       {/* Modal Ver Carros */}
       {showCarrosModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full mx-4 overflow-y-auto max-h-[90vh]">
             {/* Botón de cerrar arriba a la derecha */}
             <button
               onClick={() => setShowCarrosModal(false)}
               className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
               aria-label="Cerrar"
             >
               &times;
             </button>
             
             <h2 className="text-3xl font-bold text-purple-900 mb-8 text-center">Gestionar Carros</h2>
             
             {isLoadingCarros ? (
               <div className="flex items-center justify-center py-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                 <span className="ml-3 text-gray-600">Cargando carros...</span>
               </div>
             ) : carros.length === 0 ? (
               <div className="text-center py-8">
                 <FaCar className="text-6xl text-gray-300 mx-auto mb-4" />
                 <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay carros</h3>
                 <p className="text-gray-500">Aún no se han registrado carros en el sistema.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 <div className="bg-purple-50 rounded-lg p-4 mb-6">
                   <h3 className="text-lg font-semibold text-purple-900 mb-2">
                     Total de Carros: {carros.length}
                   </h3>
                   <p className="text-purple-700 text-sm">
                     Aquí puedes ver y actualizar el estado de todos los carros
                   </p>
                 </div>
                 
                 <div className="grid gap-4">
                   {carros.map((carro, index) => (
                     <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                       <div className="grid md:grid-cols-2 gap-4">
                         {/* Información principal */}
                         <div className="space-y-3">
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">ID Carro:</span>
                             <span className="text-purple-600 font-bold">#{carro.id_carros || carro.id || index + 1}</span>
                           </div>
                           
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">Placa:</span>
                             <span className="text-gray-900 font-mono">{carro.placa || carro.Placa || 'N/A'}</span>
                           </div>
                           
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">Conductor:</span>
                             <span className="text-gray-900">{carro.conductor || carro.Conductor || 'N/A'}</span>
                           </div>
                           
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">Destino:</span>
                             <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                               {carro.destino || carro.Destino || 'N/A'}
                             </span>
                           </div>
                         </div>
                         
                         {/* Información adicional */}
                         <div className="space-y-3">
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">Asientos:</span>
                             <span className="text-gray-900">{carro.asientos || carro.Asientos || 'N/A'}</span>
                           </div>
                           
                                                       <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-700">Estado Actual:</span>
                              <div className="flex flex-col items-end">
                                <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                                  (carro.id_estados || carro.Estado) == 1 
                                    ? 'bg-green-100 text-green-800' 
                                    : (carro.id_estados || carro.Estado) == 2
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : (carro.id_estados || carro.Estado) == 3
                                    ? 'bg-orange-100 text-orange-800'
                                    : (carro.id_estados || carro.Estado) == 4
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {carro.estadoNombre || getEstadoNombre(carro.id_estados || carro.Estado) || `Estado ${carro.id_estados || carro.Estado}`}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                  ID: {carro.id_estados || carro.Estado || 'N/A'}
                                </span>
                              </div>
                            </div>
                           
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">Fecha:</span>
                             <span className="text-gray-900 text-sm">
                               {carro.fecha || carro.Fecha || 'N/A'}
                             </span>
                           </div>
                           
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">Hora:</span>
                             <span className="text-gray-900 text-sm">
                               {carro.horasalida || carro.Horasalida || 'N/A'}
                             </span>
                           </div>
                         </div>
                       </div>
                       
                       {/* Botón para actualizar estado */}
                       <div className="border-t border-gray-200 mt-4 pt-4">
                         <button
                           onClick={() => {
                             setSelectedCarro(carro);
                             setShowUpdateEstadoModal(true);
                           }}
                           className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                         >
                           Actualizar Estado
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
             
             {/* Botón de cerrar */}
             <div className="mt-8 text-center">
               <button
                 onClick={() => setShowCarrosModal(false)}
                 className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
               >
                 Cerrar
               </button>
             </div>
           </div>
         </div>
       )}

               {/* Modal Actualizar Estado */}
        {showUpdateEstadoModal && selectedCarro && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full mx-4 overflow-y-auto max-h-[90vh]">
              {/* Botón de cerrar arriba a la derecha */}
              <button
                onClick={() => {
                  setShowUpdateEstadoModal(false);
                  setSelectedCarro(null);
                  setNewEstado('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
                aria-label="Cerrar"
              >
                &times;
              </button>
              
              <h2 className="text-3xl font-bold text-purple-900 mb-8 text-center">Actualizar Estado</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Columna izquierda: Formulario de actualización */}
                <div className="space-y-6">
                                     {/* Información del carro */}
                   <div className="bg-purple-50 rounded-lg p-4">
                     <h3 className="font-semibold text-purple-900 mb-2">Carro Seleccionado:</h3>
                     <div className="space-y-2 text-sm">
                       <div><span className="font-semibold">Placa:</span> {selectedCarro.placa || selectedCarro.Placa}</div>
                       <div><span className="font-semibold">Conductor:</span> {selectedCarro.conductor || selectedCarro.Conductor}</div>
                       <div><span className="font-semibold">Destino:</span> {selectedCarro.destino || selectedCarro.Destino}</div>
                       <div className="flex items-center justify-between">
                         <span className="font-semibold">Estado Actual:</span>
                         <div className="flex flex-col items-end">
                           <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                             (selectedCarro.id_estados || selectedCarro.Estado) == 1 
                               ? 'bg-green-100 text-green-800' 
                               : (selectedCarro.id_estados || selectedCarro.Estado) == 2
                               ? 'bg-yellow-100 text-yellow-800'
                               : (selectedCarro.id_estados || selectedCarro.Estado) == 3
                               ? 'bg-orange-100 text-orange-800'
                               : (selectedCarro.id_estados || selectedCarro.Estado) == 4
                               ? 'bg-red-100 text-red-800'
                               : 'bg-gray-100 text-gray-800'
                           }`}>
                             {selectedCarro.estadoNombre || getEstadoNombre(selectedCarro.id_estados || selectedCarro.Estado) || `Estado ${selectedCarro.id_estados || selectedCarro.Estado}`}
                           </span>
                           <span className="text-xs text-gray-500 mt-1">
                             ID: {selectedCarro.id_estados || selectedCarro.Estado || 'N/A'}
                           </span>
                         </div>
                       </div>
                     </div>
                   </div>
                  
                  {/* Selector de estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nuevo Estado (ID):</label>
                    <input
                      type="number"
                      value={newEstado}
                      onChange={(e) => setNewEstado(e.target.value)}
                      placeholder="Ingresa el ID del estado"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa el ID del estado que deseas asignar al carro
                    </p>
                  </div>
                  
                  {/* Botones */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handleUpdateEstado}
                      disabled={!newEstado}
                      className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Actualizar
                    </button>
                    <button
                      onClick={() => {
                        setShowUpdateEstadoModal(false);
                        setSelectedCarro(null);
                        setNewEstado('');
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
                
                {/* Columna derecha: Lista de estados disponibles */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Estados Disponibles:</h3>
                    <p className="text-blue-700 text-sm mb-4">
                      Consulta la lista de estados disponibles y sus IDs
                    </p>
                    <button
                      onClick={handleGetEstados}
                      disabled={isLoadingEstados}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isLoadingEstados ? 'Cargando...' : 'Cargar Estados'}
                    </button>
                  </div>
                  
                  {/* Lista de estados */}
                  {estados.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Estados Registrados:</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {estados.map((estado, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                                ID: {estado.id_estados || estado.id || index + 1}
                              </span>
                                                             <span className="text-gray-900 font-medium">
                                 {estado.nombre || estado.Nombre || estado.estado || estado.Estado || estado.Estados || `Estado ${estado.id_estados || estado.id || index + 1}`}
                               </span>
                            </div>
                            <button
                              onClick={() => setNewEstado(estado.id_estados || estado.id || index + 1)}
                              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                            >
                              Usar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isLoadingEstados && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Cargando estados...</span>
                    </div>
                  )}
                  
                  {!isLoadingEstados && estados.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="text-gray-400 text-4xl mb-2">📋</div>
                      <h4 className="text-gray-600 font-medium">No hay estados cargados</h4>
                      <p className="text-gray-500 text-sm">Haz clic en "Cargar Estados" para ver la lista</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

       {/* Modal Ver Reservas */}
      {showReservasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            {/* Botón de cerrar arriba a la derecha */}
            <button
              onClick={() => setShowReservasModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
              aria-label="Cerrar"
            >
              &times;
            </button>
            
            <h2 className="text-3xl font-bold text-green-900 mb-8 text-center">Lista de Reservas</h2>
            
            {isLoadingReservas ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Cargando reservas...</span>
              </div>
            ) : reservas.length === 0 ? (
              <div className="text-center py-8">
                <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay reservas</h3>
                <p className="text-gray-500">Aún no se han realizado reservas en el sistema.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Lista de reservas */}
                <div className="grid gap-6">
                  {reservas.map((reserva, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                      {/* Header de la reserva */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Reserva #{reserva.id_reservarviaje || reserva.id || index + 1}
                          </div>
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Asiento {reserva.asiento || reserva.Asiento || 'N/A'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {reserva.created_at ? new Date(reserva.created_at).toLocaleString('es-ES') : 'Fecha no disponible'}
                        </div>
                      </div>
                      
                      {/* Información principal */}
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Información del usuario */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <FaUser className="mr-2 text-blue-600" />
                            Información del Usuario
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">ID Usuario:</span>
                              <span className="font-medium text-gray-900">{reserva.id_users || reserva.Usuario || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nombre:</span>
                              <span className="font-medium text-gray-900">{reserva.comentario || reserva.Comentario || 'No especificado'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Información del viaje */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-green-600" />
                            Detalles del Viaje
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Ubicación:</span>
                              <span className="font-medium text-gray-900 max-w-xs truncate" title={reserva.ubicacion || reserva.Ubicacion || 'No especificada'}>
                                {reserva.ubicacion || reserva.Ubicacion || 'No especificada'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Asiento:</span>
                              <span className="font-medium text-gray-900">{reserva.asiento || reserva.Asiento || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Estado de la reserva */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <FaCog className="mr-2 text-green-600" />
                            Estado de la Reserva
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estado:</span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                Confirmada
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Información adicional */}
                      {(reserva.ubicacion || reserva.Ubicacion) && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h5 className="font-medium text-gray-900 mb-2">Ubicación Detallada:</h5>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {reserva.ubicacion || reserva.Ubicacion}
                          </p>
                        </div>
                      )}
                      

                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Botón de cerrar */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowReservasModal(false)}
                className="bg-gray-300 text-gray-700 py-3 px-8 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Conductor;
