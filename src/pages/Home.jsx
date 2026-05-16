import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';

import Navbar              from '../components/layout/Navbar';
import Footer              from '../components/layout/Footer';
import Carousel            from '../components/ui/Carousel';
import CarCard             from '../components/ui/CarCard';
import RegisterPromptModal from '../components/ui/RegisterPromptModal';

import { listarCarrosApi, listarReservasApi } from '../services/api';

// ── Helpers ──────────────────────────────────────────────────────────────────

const calcularAsientosDisponibles = (carsData, reservasArray) =>
  carsData.map((car) => {
    const carroId          = car.id_carros || car.id || car.ID;
    const reservasDelCarro = reservasArray.filter((r) => {
      const rId = r.id_carros || r.id_carro || r.carro_id || r.carroId;
      return rId == carroId && r.estado !== 'cancelada' && r.estado !== 'rechazada';
    });
    return {
      ...car,
      asientos_disponibles: Math.max(0, (car.asientos || 4) - reservasDelCarro.length),
    };
  });

const filtrarCarros = (cars, term) => {
  if (!term.trim()) return cars;
  const lower = term.toLowerCase();
  return cars.filter(
    (c) =>
      (c.conductor  && c.conductor.toLowerCase().includes(lower))  ||
      (c.destino    && c.destino.toLowerCase().includes(lower))    ||
      (c.placa      && c.placa.toLowerCase().includes(lower))      ||
      (c.horasalida && c.horasalida.toLowerCase().includes(lower)) ||
      (c.fecha      && c.fecha.toLowerCase().includes(lower))
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const Home = () => {
  const [userData,          setUserData]          = useState(null);
  const [cars,              setCars]              = useState([]);
  const [filteredCars,      setFilteredCars]      = useState([]);
  const [isLoading,         setIsLoading]         = useState(true);
  const [searchTerm,        setSearchTerm]        = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      try { setUserData(JSON.parse(stored)); } catch { /* sin usuario */ }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data   = await listarCarrosApi();
        let carsData = Array.isArray(data.data) ? data.data : [];

        try {
          const reservasData  = await listarReservasApi();
          const reservasArray = Array.isArray(reservasData) ? reservasData : (reservasData.data ?? []);
          carsData = calcularAsientosDisponibles(carsData, reservasArray);
        } catch {
          carsData = carsData.map((c) => ({ ...c, asientos_disponibles: c.asientos || 4 }));
        }

        setCars(carsData);
        setFilteredCars(carsData);
      } catch {
        setCars([]);
        setFilteredCars([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilteredCars(filtrarCarros(cars, value));
  };

  const handleVerDetalles = (carId) => {
    if (userData) navigate(`/ver-detalles/${carId}`);
    else setShowRegisterModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900 relative">

      {/* Decoración de fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <Navbar userData={userData} searchTerm={searchTerm} onSearch={handleSearch} />
      <Carousel />

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* Encabezado de sección */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            {userData ? 'Viajes disponibles' : 'Encuentra tu próximo viaje'}
          </h2>
          <p className="text-blue-200 text-base">
            {userData
              ? `Bienvenido de vuelta, ${userData?.Nombre || userData?.nombre || 'viajero'}`
              : 'Regístrate para reservar tu asiento y viajar seguro'}
          </p>
          <div className="mx-auto mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-blue-400 to-violet-400" />
        </div>

        {/* Estados de carga / vacío / grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="w-14 h-14 rounded-full border-4 border-violet-400 border-t-transparent animate-spin mb-4" />
            <p className="text-blue-200 text-lg">Cargando viajes disponibles...</p>
          </div>

        ) : !filteredCars.length ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <FaCar className="text-white/60 text-3xl" />
              </div>
            </div>
            <p className="text-white text-xl font-semibold mb-2">
              {searchTerm ? 'Sin resultados' : 'No hay viajes disponibles'}
            </p>
            <p className="text-blue-200">
              {searchTerm
                ? `No encontramos viajes para "${searchTerm}"`
                : 'Vuelve más tarde, pronto habrá nuevos viajes.'}
            </p>
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCars.map((car, idx) =>
              car ? (
                <div
                  key={car.id_carros || idx}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(idx * 60, 400)}ms` }}
                >
                  <CarCard
                    car={car}
                    userData={userData}
                    onVerDetalles={handleVerDetalles}
                  />
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Pie de sección */}
        {!isLoading && filteredCars.length > 0 && (
          <p className="text-center text-blue-300 text-sm mt-10 animate-fade-in">
            {userData
              ? '¿Necesitas ayuda? Contacta directamente con tu conductor.'
              : 'Regístrate gratis para ver precios, detalles del conductor y reservar tu asiento.'}
          </p>
        )}
      </main>

      <Footer />

      {showRegisterModal && (
        <RegisterPromptModal onClose={() => setShowRegisterModal(false)} />
      )}
    </div>
  );
};

export default Home;
