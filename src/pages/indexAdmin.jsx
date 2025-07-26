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
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [showAddEmailModal, setShowAddEmailModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [carData, setCarData] = useState({
    Imagencarro: '',
    Placa: '',
    Conductor: '',
    Asientos: '',
    Destino: '',
    Horasalida: '',
    Fecha: ''
  });
  
  console.log('Estado inicial de carData:', carData);
  const [emailData, setEmailData] = useState({
    email: '',
    name: '',
    role: '',
    department: ''
  });

  useEffect(() => {
    // Verificar si el usuario está logueado y es administrador
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        if (user.rol === 'admin') {
          setUserData(user);
        } else {
          // Si no es admin, redirigir al dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        navigate('/login');
      }
    } else {
      // Si no hay datos de usuario, redirigir al login
      navigate('/login');
    }
    setIsLoading(false);
  }, [navigate]);

  const _handleLogout = () => {
    // Limpiar datos del usuario
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    setUserData(null);
    // Redirigir al index principal
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCarData({...carData, image: file});
    }
  };

  const showToastNotification = (message, type = 'success') => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000); // La notificación desaparece después de 4 segundos
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    
    // Validar que todos los campos requeridos estén llenos
    if (!carData.Conductor || !carData.Placa || !carData.Asientos || !carData.Destino || !carData.Horasalida || !carData.Fecha) {
      showToastNotification('Por favor, completa todos los campos requeridos', 'error');
      return;
    }
    
    try {
      console.log('=== INICIANDO GUARDADO DE VEHÍCULO ===');
      console.log('Datos a enviar:', carData);
      console.log('Verificación de campos:');
      console.log('- conductor:', carData.Conductor, '¿Está vacío?', !carData.Conductor);
      console.log('- placa:', carData.Placa, '¿Está vacío?', !carData.Placa);
      console.log('- asientos:', carData.Asientos, '¿Está vacío?', !carData.Asientos);
      console.log('- destino:', carData.Destino, '¿Está vacío?', !carData.Destino);
      console.log('- horasalida:', carData.Horasalida, '¿Está vacío?', !carData.Horasalida);
      console.log('- fecha:', carData.Fecha, '¿Está vacío?', !carData.Fecha);
      console.log('- imagencarro:', carData.Imagencarro, '¿Está vacío?', !carData.Imagencarro);
      
      console.log('URL de la API:', 'http://127.0.0.1:8000/api/agregarcarros');
      
      // Preparar los datos para enviar, convirtiendo asientos a número
      const dataToSend = {
        ...carData,
        Asientos: parseInt(carData.Asientos) || 0
      };
      
      console.log('Datos procesados a enviar:', dataToSend);
      
      // Aquí puedes ajustar la URL y los campos según tu backend
      const response = await axios.post('http://127.0.0.1:8000/api/agregarcarros', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      
      console.log('=== RESPUESTA EXITOSA ===');
      console.log('Respuesta de la API:', response.data);
      console.log('Status de la respuesta:', response.status);
      console.log('Headers de la respuesta:', response.headers);
      
      showToastNotification('¡Vehículo registrado exitosamente! 🚗');
              setCarData({
          Imagencarro: '',
          Placa: '',
          Conductor: '',
          Asientos: '',
          Destino: '',
          Horasalida: '',
          Fecha: ''
        });
      console.log('Cerrando modal...');
      setShowAddCarModal(false);
      console.log('Modal cerrado');
      // Si quieres actualizar la lista de vehículos, hazlo aquí
    } catch (error) {
      console.error('=== ERROR AL GUARDAR ===');
      console.error('Error completo:', error);
      console.error('Error message:', error.message);
      
      if (error.response) {
        console.error('Error de la API:', error.response.data);
        console.error('Status del error:', error.response.status);
        console.error('Headers del error:', error.response.headers);
        showToastNotification(`Error: ${error.response.data.message || 'No se pudo guardar el vehículo'}`, 'error');
      } else if (error.request) {
        console.error('Error de red:', error.request);
        console.error('Request config:', error.config);
        showToastNotification('Error de conexión. Verifica que el servidor esté ejecutándose.', 'error');
      } else {
        console.error('Error:', error.message);
        showToastNotification('Error inesperado al guardar el vehículo', 'error');
      }
    }
  };

  const handleAddEmail = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para agregar el email administrativo
    console.log('Agregando email administrativo:', emailData);
    setEmailData({
      email: '',
      name: '',
      role: '',
      department: ''
    });
    setShowAddEmailModal(false);
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
              <span className="text-2xl font-bold text-blue-900">Mecaza Admin</span>
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
              <a href="/" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
                Inicio
              </a>
              <a href="/index2" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
                Panel Admin
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

      {/* Contenido principal */}
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

          {/* Opciones administrativas */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Agregar Carro */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-3 rounded-lg mr-4">
                  <FaCar className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900">Gestión de Vehículos</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Agrega nuevos vehículos al sistema con información completa: placa, conductor, puestos, destino, horarios y mapa.
              </p>
              <button
                onClick={() => {
                  console.log('Abriendo modal, estado actual de carData:', carData);
                  setShowAddCarModal(true);
                }}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <FaPlus className="mr-2" />
                Agregar Vehículo
              </button>
            </div>

            {/* Agregar Email Administrativo */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-teal-600 p-3 rounded-lg mr-4">
                  <FaEnvelope className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-teal-900">Gestión de Usuarios</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Agrega nuevos usuarios administrativos con roles específicos y departamentos asignados.
              </p>
              <button
                onClick={() => setShowAddEmailModal(true)}
                className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <FaPlus className="mr-2" />
                Agregar Usuario
              </button>
            </div>

            {/* Ver Estadísticas */}
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

          {/* Estadísticas rápidas */}
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
                    onChange={(e) => {
                      console.log('Escribiendo en placa:', e.target.value);
                      setCarData({...carData, Placa: e.target.value});
                    }}
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
                    onChange={(e) => {
                      console.log('Escribiendo en conductor:', e.target.value);
                      setCarData({...carData, Conductor: e.target.value});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
              </div>
              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Vehículo (texto de prueba)</label>
                                  <input
                    type="text"
                    value={carData.Imagencarro || ''}
                    onChange={(e) => {
                      console.log('Escribiendo en imagencarro:', e.target.value);
                      setCarData({ ...carData, Imagencarro: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Escribe un texto de prueba"
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
                    onChange={(e) => {
                      console.log('Escribiendo en asientos:', e.target.value);
                      setCarData({...carData, Asientos: e.target.value});
                    }}
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
                    onChange={(e) => {
                      console.log('Seleccionando destino:', e.target.value);
                      setCarData({...carData, Destino: e.target.value});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                  <option value="">Seleccionar destino</option>
                  <option value="Medellin">Medellín</option>
                  <option value="Caucasia">Caucasia</option>
                  <option value="Zaragoza">Zaragoza</option>
                </select>
              </div>
              {/* Enlace del Mapa */}
             
              {/* Hora de Salida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Salida</label>
                                  <input
                    type="text"
                    value={carData.Horasalida}
                    onChange={(e) => {
                      console.log('Escribiendo en horasalida:', e.target.value);
                      setCarData({...carData, Horasalida: e.target.value});
                    }}
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
                    onChange={(e) => {
                      console.log('Escribiendo en fecha:', e.target.value);
                      setCarData({...carData, Fecha: e.target.value});
                    }}
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

      {/* Modal Agregar Email Administrativo */}
      {showAddEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-teal-900 mb-6">Agregar Usuario Administrativo</h2>
            <form onSubmit={handleAddEmail}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={emailData.name}
                    onChange={(e) => setEmailData({...emailData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={emailData.email}
                    onChange={(e) => setEmailData({...emailData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={emailData.role}
                    onChange={(e) => setEmailData({...emailData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="admin">Administrador</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="operator">Operador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                  <input
                    type="text"
                    value={emailData.department}
                    onChange={(e) => setEmailData({...emailData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEmailModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
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

export default IndexAdmin;
