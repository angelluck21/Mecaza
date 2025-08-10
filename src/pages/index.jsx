import React, { useState, useEffect } from "react";
import { FaCar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { MagnifyingGlassIcon, UserIcon, Bars3Icon } from '@heroicons/react/24/outline';
// Importar el UserMenu
import UserMenu from '../components/UserMenu';
import Login from '../Usuarios/login';
import Registrar from '../Usuarios/Registrar';
import IndexLogin from './indexLogin';
import index from  './index';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [userData, setUserData] = useState(null);
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  // Datos del carrusel
  const carouselData = [
    {
      id: 1,
      title: "Viajes Seguros y Confiables",
      subtitle: "Conductores verificados para tu tranquilidad",
      icon: "🛡️"
    },
    {
      id: 2,
      title: "Destinos Increíbles",
      subtitle: "Explora nuevos lugares con comodidad",
      icon: "🌍"
    },
    {
      id: 3,
      title: "Precios Justos",
      subtitle: "Tarifas transparentes sin sorpresas",
      icon: "💰"
    }
  ];

  useEffect(() => {
   
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
      }
    }

    const fetchCars = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/listarcarro');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos de carros recibidos:', data);
        const carsData = Array.isArray(data.data) ? data.data : [];
        setCars(carsData);
        setFilteredCars(carsData); // Inicializar filteredCars con todos los carros
      } catch (err) {
        console.error('Error al obtener carros:', err);
        setCars([]);
        setFilteredCars([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, []);

 
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselData.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
  };

  const handleViewDetails = (carId) => {
    if (userData) {
     
      navigate(`/ver-detalles/${carId}`);
    } else {
      
      setShowRegisterModal(true);
    }
  };

  // Función de búsqueda
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    
    if (!searchValue.trim()) {
      setFilteredCars(cars);
      return;
    }
    
    const filtered = cars.filter(car => {
      const searchLower = searchValue.toLowerCase();
      return (
        (car.conductor && car.conductor.toLowerCase().includes(searchLower)) ||
        (car.destino && car.destino.toLowerCase().includes(searchLower)) ||
        (car.placa && car.placa.toLowerCase().includes(searchLower)) ||
        (car.horasalida && car.horasalida.toLowerCase().includes(searchLower)) ||
        (car.fecha && car.fecha.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredCars(filtered);
  };

  console.log('Estado actual de cars en index:', cars);
  console.log('Longitud de cars en index:', cars.length);
  console.log('isLoading en index:', isLoading);
  console.log('userData en index:', userData);

 
  useEffect(() => {
    console.log('=== CAMBIO EN ESTADO DE CARS ===');
    console.log('Nuevo valor de cars:', cars);
    console.log('Longitud:', cars.length);
    console.log('¿Es array?', Array.isArray(cars));
  }, [cars]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 relative overflow-hidden">
     
      <nav className="bg-white shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
           
            <div className="flex items-center space-x-3">
              <FaCar className="text-blue-900 text-3xl drop-shadow-lg" />
              <span className="text-2xl font-bold text-blue-900">Mecaza</span>
            </div>

            {/* Barra de búsqueda - Desktop */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar por conductor, destino, placa..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Navegación - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              {userData ? (
                <UserMenu userData={userData} />
              ) : (
                <>
                  <a href="/Login" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
                    Iniciar Sesión
                  </a>
                  <a 
                    href="/registrar" 
                    className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Registrarse
                  </a>
                </>
              )}
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
                    placeholder="Buscar por conductor, destino, placa..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
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
                  href="/login" 
                  className="block px-3 py-2 text-blue-900 hover:text-blue-700 font-medium"
                >
                  Iniciar Sesión
                </a>
                <a 
                  href="/registrar" 
                  className="block px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Registrarse
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Carrusel Header */}
      <div className="relative h-96 overflow-hidden bg-gradient-to-br from-blue-800 to-blue-600">
        {/* Slides */}
        <div className="flex transition-transform duration-500 ease-in-out h-full">
          {carouselData.map((slide, index) => (
            <div
              key={slide.id}
              className="w-full flex-shrink-0 relative"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-blue-700/40 z-10"></div>
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <div className="text-8xl mb-6 drop-shadow-lg">
                    {slide.icon}
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-blue-100 drop-shadow-lg">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controles del carrusel */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-blue-600 bg-opacity-80 hover:bg-opacity-100 text-white p-2 rounded-full transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-blue-600 bg-opacity-80 hover:bg-opacity-100 text-white p-2 rounded-full transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {carouselData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-blue-400' : 'bg-white bg-opacity-70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Sección de bienvenida */}
       

        {/* Lista de carros disponibles */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            {userData ? 'Carros Disponibles' : 'Viajes Disponibles'}
          </h2>
          
          {isLoading ? (
            <div className="text-center">
              <div className="text-white text-xl">Cargando viajes...</div>
            </div>
          ) : !Array.isArray(filteredCars) || filteredCars.length === 0 ? (
            <div className="text-center">
              <div className="text-white text-lg">
                {!Array.isArray(filteredCars) ? 'Error al cargar viajes' : 
                 searchTerm ? 'No se encontraron viajes que coincidan con tu búsqueda.' : 'No hay viajes disponibles en este momento.'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCars.map((car, idx) => {
                if (!car) return null;
                return (
                  <div key={car.id_carros || idx} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    {car.imagencarro ? (
                      <img src={car.imagencarro} alt="Carro" className="w-full h-32 object-cover rounded-lg mb-4" />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                        <FaCar className="text-blue-600 text-4xl" />
                      </div>
                    )}
                    <div className="text-center w-full">
                      <div className="text-blue-900 font-bold text-lg mb-2">{car.conductor || 'Conductor'}</div>
                      <div className="text-gray-600 mb-2">
                        <span className="font-semibold">Placa:</span> {car.placa || 'No especificada'}
                      </div>
                      <div className="text-gray-600 mb-2">
                        <span className="font-semibold">Asientos:</span> {car.asientos || 'No especificados'}
                      </div>
                      <div className="text-gray-600 mb-2">
                        <span className="font-semibold">Destino:</span> {car.destino || 'No especificado'}
                      </div>
                      <div className="text-gray-600 mb-2">
                        <span className="font-semibold">Hora:</span> {car.horasalida || 'No especificada'}
                      </div>
                      <div className="text-gray-600 mb-2">
                        <span className="font-semibold">Fecha:</span> {car.fecha ? new Date(car.fecha).toLocaleDateString('es-ES') : 'No especificada'}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleViewDetails(car.id_carros || idx)}
                      className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {userData ? 'Reservar Viaje' : 'Ver Detalles'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="text-center text-blue-100">
          <p className="text-lg">
            {userData 
              ? '¿Necesitas más información? Contacta con tu conductor.'
              : 'Regístrate para reservar viajes y acceder a más funcionalidades.'
            }
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo y descripción */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <FaCar className="text-blue-400 text-3xl" />
                <span className="text-2xl font-bold text-blue-400">Mecaza</span>
              </div>
              <p className="text-gray-300 mb-4">
                Tu plataforma confiable para encontrar viajes seguros y cómodos. 
                Conectamos conductores verificados con pasajeros que buscan una experiencia de viaje excepcional.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <FaFacebook className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <FaTwitter className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <FaInstagram className="text-xl" />
                </a>
              </div>
            </div>

            

            {/* Contacto */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Contacto</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-blue-400" />
                  <span className="text-gray-300">+57 3243114965</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-blue-400" />
                  <span className="text-gray-300">mecaza@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="text-blue-400" />
                  <span className="text-gray-300">Medellin, Colombia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 Mecaza. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Política de Privacidad
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Términos de Servicio
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Registro */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUser className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">¡Regístrate para continuar!</h3>
            <p className="text-gray-600 mb-6">
              Para ver los detalles completos del viaje y hacer tu reserva, necesitas crear una cuenta en Mecaza.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setShowRegisterModal(false); navigate('/registrar'); }}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Registrarse
              </button>
              <button
                onClick={() => { setShowRegisterModal(false); navigate('/login'); }}
                className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Ya tengo cuenta
              </button>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-full text-gray-500 py-2 px-4 hover:text-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default Index;
