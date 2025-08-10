import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCar, FaPlus, FaEnvelope, FaUsers, FaCog } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';
import axios from 'axios';

const IndexAdmin = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [emailData, setEmailData] = useState({
    email: '',
    name: '',
    role: '',
    department: ''
  });
  const [showPreciosModal, setShowPreciosModal] = useState(false);
  const [isSavingPrecios, setIsSavingPrecios] = useState(false);
  const [preciosData, setPreciosData] = useState({
    'ZaraMede': '',
    'ZaraCauca': '',
    'CaucaMede': ''
  });

  // Estados para el modal de estado del carro
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [isSavingEstado, setIsSavingEstado] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [estadosDisponibles] = useState([
    { id: 1, nombre: 'En Viaje', color: '#10B981' },
    { id: 2, nombre: 'Esperando Pasajeros', color: '#F59E0B' },
    { id: 3, nombre: 'Cupos Llenos', color: '#EF4444' },
    { id: 4, nombre: 'Cancelado', color: '#6B7280' },
    { id: 5, nombre: 'Finalizado', color: '#3B82F6' },
    { id: 6, nombre: 'En Mantenimiento', color: '#8B5CF6' }
  ]);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        console.log('IndexAdmin - Rol del usuario:', user.rol); // Debug log
        
        // Verificar si es administrador (tanto 'admin' como 'administrador')
        if (user.rol === 'admin' || user.rol === 'administrador') {
          console.log('IndexAdmin - Usuario autorizado, estableciendo datos'); // Debug log
          setUserData(user);
        } else {
          console.log('IndexAdmin - Usuario no autorizado, redirigiendo a indexLogin'); // Debug log
          navigate('/indexLogin');
        }
      } catch (error) {
        console.error('IndexAdmin - Error al parsear datos del usuario:', error); // Debug log
        navigate('/login');
      }
    } else {
      console.log('IndexAdmin - No hay datos de usuario, redirigiendo a login'); // Debug log
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

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

  const handleSavePrecios = async (e) => {
    e.preventDefault();
    
    if (!preciosData['ZaraMede'] || !preciosData['ZaraCauca'] || !preciosData['CaucaMede']) {
      showToastNotification('Por favor, completa todos los campos de precios', 'error');
      return;
    }
    
    setIsSavingPrecios(true);
    
    const dataToSend = {
      'ZaraMede': parseFloat(preciosData['ZaraMede']) || 0,
      'ZaraCauca': parseFloat(preciosData['ZaraCauca']) || 0,
      'CaucaMede': parseFloat(preciosData['CaucaMede']) || 0
    };
    
    try {
      // Llamada a la ruta /agregarprecio que conecta con PrecioviajeController::Create
      const response = await axios.put('http://127.0.0.1:8000/api/agregarprecio', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (response.data && response.data.success) {
        showToastNotification('¡Precios guardados exitosamente! 💰');
        
        setPreciosData({
          'ZaraMede': '',
          'ZaraCauca': '',
          'CaucaMede': ''
        });
        
        setShowPreciosModal(false);
      } else {
        showToastNotification('Advertencia: El servidor no confirmó el guardado', 'error');
      }
      
    } catch (error) {
      console.error('Error al guardar precios:', error);
      if (error.response) {
        if (error.response.status === 500) {
          showToastNotification('Error del servidor: Verifica que el PrecioviajeController esté configurado correctamente', 'error');
        } else if (error.response.status === 422) {
          showToastNotification('Error de validación: Verifica los datos enviados', 'error');
        } else {
          showToastNotification(`Error: ${error.response.data.message || 'No se pudieron guardar los precios'}`, 'error');
        }
      } else if (error.request) {
        showToastNotification('Error de conexión. Verifica que el servidor esté ejecutándose.', 'error');
      } else {
        showToastNotification('Error inesperado al guardar los precios', 'error');
      }
    } finally {
      setIsSavingPrecios(false);
    }
  };

  const handleSaveEstado = async (e) => {
    e.preventDefault();
    
    if (!estadoSeleccionado) {
      showToastNotification('Por favor, selecciona un estado del viaje', 'error');
      return;
    }
    
    setIsSavingEstado(true);
    
    const estadoElegido = estadosDisponibles.find(estado => estado.id === parseInt(estadoSeleccionado));
    
    const dataToSend = {
      Estados: estadoElegido.nombre
    };
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/agregarestados', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.data && response.data.success) {
        showToastNotification('¡Estado del viaje guardado exitosamente! 🚗');
        
        setEstadoSeleccionado('');
        setShowEstadoModal(false);
      } else {
        showToastNotification('Advertencia: El servidor no confirmó el guardado', 'error');
      }
      
    } catch (error) {
      if (error.response) {
        if (error.response.status === 500) {
          showToastNotification('Error del servidor: Verifica que el controlador esté configurado correctamente', 'error');
        } else if (error.response.status === 422) {
          showToastNotification('Error de validación: Verifica los datos enviados', 'error');
        } else {
          showToastNotification(`Error: ${error.response.data.message || 'No se pudo guardar el estado'}`, 'error');
        }
      } else if (error.request) {
        showToastNotification('Error de conexión. Verifica que el servidor esté ejecutándose.', 'error');
      } else {
        showToastNotification('Error inesperado al guardar el estado', 'error');
      }
    } finally {
      setIsSavingEstado(false);
    }
  };

  const limpiarFormulario = () => {
    setPreciosData({
      'ZaraMede': '',
      'ZaraCauca': '',
      'CaucaMede': ''
    });
  };

  const limpiarFormularioEstado = () => {
    setEstadoSeleccionado('');
  };

  const abrirModalPrecios = () => {
    setShowPreciosModal(true);
    limpiarFormulario();
  };

  const abrirModalEstado = () => {
    setShowEstadoModal(true);
    limpiarFormularioEstado();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 relative overflow-hidden">
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

      <nav className="bg-white shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FaCar className="text-blue-900 text-3xl drop-shadow-lg" />
              <span className="text-2xl font-bold text-blue-900">Mecaza Admin</span>
            </div>

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

            <div className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
                Inicio
              </a>
              <a href="/index2" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
                Panel Admin
              </a>
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
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Buscar en el sistema..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                
                <a 
                  href="/" 
                  className="block px-3 py-2 text-blue-900 hover:text-blue-700 font-medium"
                >
                  Inicio
                </a>
                <a 
                  href="/index2" 
                  className="block px-3 py-2 text-blue-900 hover:text-blue-700 font-medium"
                >
                  Panel Admin
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-8 transform transition-all duration-300">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
              Panel Administrativo
            </h1>
            <p className="text-lg text-gray-600">
              Gestiona vehículos y usuarios del sistema Mecaza
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-green-600 p-3 rounded-lg mr-4">
                  <FaCar className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-900">Agregar Estado del Viaje</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Configura los estados de los viajes: esperando pasajeros, en viaje, cupos llenos y otros estados del sistema.
              </p>
              <button
                onClick={abrirModalEstado}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <FaPlus className="mr-2" />
                Agregar Estado
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-3 rounded-lg mr-4">
                  <FaEnvelope className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900">Agregar Precios</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Gestiona precios de viajes, configura rutas y administra la información de los vehículos del sistema.
              </p>
              <button
                onClick={abrirModalPrecios}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <FaPlus className="mr-2" />
                Agregar Precios
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-purple-600 p-3 rounded-lg mr-4">
                  <FaCog className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-purple-900">Ver Estadísticas</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Consulta estadísticas detalladas de vehículos, usuarios activos y viajes realizados.
              </p>
              <button
                onClick={() => console.log('Ver estadísticas')}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <FaUsers className="mr-2" />
                Ver Estadísticas
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <div className="flex items-center">
                <FaCar className="text-2xl text-green-900 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-green-900">Total Vehículos</h3>
                  <p className="text-2xl font-bold text-green-700">24</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="flex items-center">
                <FaUsers className="text-2xl text-purple-900 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-purple-900">Usuarios Activos</h3>
                  <p className="text-2xl font-bold text-purple-700">156</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <div className="flex items-center">
                <FaCog className="text-2xl text-orange-900 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-orange-900">Viajes Hoy</h3>
                  <p className="text-2xl font-bold text-orange-700">89</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Seleccionar Estado del Viaje */}
      {showEstadoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <button
              onClick={() => {
                setShowEstadoModal(false);
                limpiarFormularioEstado();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
              aria-label="Cerrar"
            >
              &times;
            </button>
            
            <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
              Guardar Estado del Viaje
            </h2>

            <form onSubmit={handleSaveEstado} className="space-y-6">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Estados Disponibles
                </h3>
                
                {/* Selector de Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Selecciona el estado del viaje *</label>
                  <select
                    value={estadoSeleccionado}
                    onChange={(e) => setEstadoSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecciona un estado...</option>
                    {estadosDisponibles.map((estado) => (
                      <option key={estado.id} value={estado.id}>
                        {estado.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Información adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FaCar className="text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Estados de Viaje</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Selecciona el estado actual del viaje. Esto ayudará a los pasajeros a conocer el estado de su viaje.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isSavingEstado || !estadoSeleccionado}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                  >
                    {isSavingEstado ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FaCar className="mr-2" />
                        Guardar Estado
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowEstadoModal(false);
                      limpiarFormularioEstado();
                    }}
                    disabled={isSavingEstado}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Precios */}
      {showPreciosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => {
                setShowPreciosModal(false);
                limpiarFormulario();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
              aria-label="Cerrar"
            >
              &times;
            </button>
            
            <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
              Agregar Precios de Viajes
            </h2>

            <form onSubmit={handleSavePrecios} className="space-y-5">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Agregar Nuevos Precios
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Caucasia - Medellín (cauca-mede)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="text"
                      min="0"
                      step="0.01"
                      value={preciosData['CaucaMede']}
                      onChange={(e) => setPreciosData({...preciosData, 'CaucaMede': e.target.value})}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Zaragoza - Medellín (zara-mede)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="text"
                      min="0"
                      step="0.01"
                      value={preciosData['ZaraMede']}
                      onChange={(e) => setPreciosData({...preciosData, 'ZaraMede': e.target.value})}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Zaragoza - Caucasia (zara-cauca)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="text"
                      min="0"
                      step="0.01"
                      value={preciosData['ZaraCauca']}
                      onChange={(e) => setPreciosData({...preciosData, 'ZaraCauca': e.target.value})}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FaCar className="text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Información de Precios</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Los precios configurados aquí se aplicarán a todos los viajes en estas rutas. Asegúrate de establecer precios competitivos y rentables.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isSavingPrecios}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                  >
                    {isSavingPrecios ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FaCar className="mr-2" />
                        Guardar Precios
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowPreciosModal(false);
                      setPreciosData({
                        'ZaraMede': '',
                        'ZaraCauca': '',
                        'CaucaMede': ''
                      });
                    }}
                    disabled={isSavingPrecios}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
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

export default IndexAdmin;
