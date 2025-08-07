import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon, Cog6ToothIcon, UserIcon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';

const IndexLogin = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        setUserData(user);
      } catch (error) {
        navigate('/login');
        return;
      }
    } else {
      navigate('/login');
      return;
    }

    const fetchCars = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/listarcarro');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const carsData = Array.isArray(data.data) ? data.data : [];
        setCars(carsData);
        setFilteredCars(carsData);
      } catch (err) {
        setCars([]);
        setFilteredCars([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, [navigate]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Cargando usuario...</div>
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

            <div className="hidden md:flex items-center space-x-6">
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
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-40 z-30"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white border-r border-gray-200 z-40 shadow-lg transition-transform duration-300 transform translate-x-0">
                <div className="px-2 pt-4 pb-3 space-y-1">
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
                  <div className="px-3 py-2 text-blue-900 font-medium border-b border-gray-200">
                    <span>¡Hola, {userData.Nombre || 'Usuario'}!</span>
                  </div>
                  
                  <button
                    onClick={() => { setIsMenuOpen(false); navigate('/ajustes-cuenta'); }}
                    className="w-full text-left px-3 py-2 text-blue-900 hover:bg-blue-50 rounded-md transition-colors font-medium flex items-center"
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-2" />
                    Ajustes de Cuenta
                  </button>
                  
                  <button
                    onClick={() => { localStorage.removeItem('userData'); localStorage.removeItem('authToken'); navigate('/login'); }}
                    className="w-full text-left px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      <div className="relative h-96 overflow-hidden bg-gradient-to-br from-blue-800 to-blue-600">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Carros Disponibles</h2>
        {!Array.isArray(filteredCars) || filteredCars.length === 0 ? (
          <div className="text-center">
            <div className="text-white text-lg">
              {!Array.isArray(filteredCars) ? 'Error al cargar carros' : 
               searchTerm ? 'No se encontraron carros que coincidan con tu búsqueda.' : 'No hay carros guardados.'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                      <span className="font-semibold">Fecha de salida:</span> {car.fecha ? new Date(car.fecha).toLocaleDateString('es-ES') : 'No especificada'}
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/ver-detalles/${car.id_carros || idx}`)}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Ver Detalles
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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

            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Inicio</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Viajes</a></li>
               
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Contacto</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-blue-400" />
                  <span className="text-gray-300">324 311 4965</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-blue-400" />
                  <span className="text-gray-300">Angelluiswar456@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="text-blue-400" />
                  <span className="text-gray-300">Bogata localidad de Kennedy</span>
                </div>
              </div>
            </div>
          </div>

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
    </div>
  );
};

export default IndexLogin;