import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCar, FaPlus, FaEnvelope, FaUsers, FaCog } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';
import axios from 'axios';

const Conductor = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [reservas, setReservas] = useState([]);
  const [carros, setCarros] = useState([]);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      console.log('No hay token de autenticación');
      navigate('/login');
      return;
    }
    
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        
        // Verificar si es conductor o admin
        if (user.rol === 'conductor' || user.rol === 'admin') {
          setUserData(user);
        } else {
          console.log('Usuario no autorizado para acceder al panel de conductor');
          navigate('/indexLogin');
        }
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (userData) {
      fetchReservas();
      fetchCarros();
      fetchEstados();
    }
  }, [userData]);

  const fetchReservas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/listarreserva', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.data && response.data.reservas) {
        setReservas(response.data.reservas);
      } else {
        setReservas([]);
      }
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      console.log('Error response:', error.response);
      
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 400) {
          showToastNotification('Error 400: Solicitud incorrecta al cargar reservas. Verifica tu autenticación.', 'error');
        } else if (statusCode === 401) {
          showToastNotification('Error 401: No autorizado. Inicia sesión nuevamente.', 'error');
          navigate('/login');
        } else if (statusCode === 500) {
          showToastNotification('Error del servidor al cargar reservas. Intenta nuevamente.', 'error');
        } else {
          showToastNotification(`Error ${statusCode}: ${error.response.data?.message || 'Error al cargar reservas'}`, 'error');
        }
      } else if (error.request) {
        showToastNotification('Error de conexión. Verifica que el servidor esté ejecutándose.', 'error');
      } else {
        showToastNotification('Error inesperado al cargar reservas', 'error');
      }
      setReservas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCarros = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/listarcarro', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.data && response.data.carros) {
        setCarros(response.data.carros);
      } else {
        setCarros([]);
      }
    } catch (error) {
      console.error('Error al obtener carros:', error);
      console.log('Error response:', error.response);
      
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 400) {
          showToastNotification('Error 400: Solicitud incorrecta al cargar carros. Verifica tu autenticación.', 'error');
        } else if (statusCode === 401) {
          showToastNotification('Error 401: No autorizado. Inicia sesión nuevamente.', 'error');
          navigate('/login');
        } else if (statusCode === 500) {
          showToastNotification('Error del servidor al cargar carros. Intenta nuevamente.', 'error');
        } else {
          showToastNotification(`Error ${statusCode}: ${error.response.data?.message || 'Error al cargar carros'}`, 'error');
        }
      } else if (error.request) {
        showToastNotification('Error de conexión. Verifica que el servidor esté ejecutándose.', 'error');
      } else {
        showToastNotification('Error inesperado al cargar carros', 'error');
      }
      setCarros([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEstados = async () => {
    try {
      const estadosResponse = await axios.get('http://127.0.0.1:8000/api/listarestados', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (estadosResponse.data && estadosResponse.data.estados) {
        setEstados(estadosResponse.data.estados);
      } else {
        setEstados([]);
      }
    } catch (error) {
      console.error('Error al obtener estados:', error);
      setEstados([]);
    }
  };

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
              <span className="text-2xl font-bold text-blue-900">Mecaza Conductor</span>
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
              <a href="/conductor-notificaciones" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
                Notificaciones
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
                  href="/conductor-notificaciones" 
                  className="block px-3 py-2 text-blue-900 hover:text-blue-700 font-medium"
                >
                  Notificaciones
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
              Panel de Conductor
            </h1>
            <p className="text-lg text-gray-600">
              Gestiona tus viajes y vehículos del sistema Mecaza
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-green-600 p-3 rounded-lg mr-4">
                  <FaCar className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-900">Mis Vehículos</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Gestiona tus vehículos, actualiza estados y administra la información de tus carros.
              </p>
              <button
                onClick={() => console.log('Ver vehículos')}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <FaCar className="mr-2" />
                Ver Vehículos
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-3 rounded-lg mr-4">
                  <FaEnvelope className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900">Mis Reservas</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Revisa las reservas de tus viajes, gestiona pasajeros y actualiza el estado de los viajes.
              </p>
              <button
                onClick={() => console.log('Ver reservas')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <FaUsers className="mr-2" />
                Ver Reservas
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="bg-purple-600 p-3 rounded-lg mr-4">
                  <FaCog className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-purple-900">Notificaciones</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Revisa las notificaciones del sistema y mantente informado sobre tus viajes.
              </p>
              <button
                onClick={() => navigate('/conductor-notificaciones')}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <FaEnvelope className="mr-2" />
                Ver Notificaciones
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <div className="flex items-center">
                <FaCar className="text-2xl text-green-900 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-green-900">Mis Vehículos</h3>
                  <p className="text-2xl font-bold text-green-700">{carros.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="flex items-center">
                <FaUsers className="text-2xl text-purple-900 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-purple-900">Reservas Activas</h3>
                  <p className="text-2xl font-bold text-purple-700">{reservas.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <div className="flex items-center">
                <FaCog className="text-2xl text-orange-900 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-orange-900">Estados Disponibles</h3>
                  <p className="text-2xl font-bold text-orange-700">{estados.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
