import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar              from '../components/layout/Navbar';
import Footer              from '../components/layout/Footer';
import Carousel            from '../components/ui/Carousel';
import CarCard             from '../components/ui/CarCard';
import RegisterPromptModal from '../components/ui/RegisterPromptModal';

import { listarCarrosApi, listarReservasApi } from '../services/api';

// ── Helpers ──────────────────────────────────────────────────────────────────

const calcularAsientosDisponibles = (carsData, reservasArray) =>
  carsData.map((car) => {
    const carroId         = car.id_carros || car.id || car.ID;
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

  // ── Cargar usuario ──────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      try { setUserData(JSON.parse(stored)); } catch { /* sin usuario */ }
    }
  }, []);

  // ── Cargar carros y reservas ────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data     = await listarCarrosApi();
        let carsData   = Array.isArray(data.data) ? data.data : [];

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

  // ── Búsqueda ────────────────────────────────────────────────────────────────
  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilteredCars(filtrarCarros(cars, value));
  };

  const handleVerDetalles = (carId) => {
    if (userData) {
      navigate(`/ver-detalles/${carId}`);
    } else {
      setShowRegisterModal(true);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 relative overflow-hidden">
      <Navbar
        userData={userData}
        searchTerm={searchTerm}
        onSearch={handleSearch}
      />

      <Carousel />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {userData ? 'Carros Disponibles' : 'Viajes Disponibles'}
        </h2>

        {isLoading ? (
          <div className="text-center text-white text-xl">Cargando viajes...</div>
        ) : !filteredCars.length ? (
          <div className="text-center text-white text-lg">
            {searchTerm ? 'No se encontraron viajes que coincidan con tu búsqueda.' : 'No hay viajes disponibles en este momento.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCars.map((car, idx) =>
              car ? (
                <CarCard
                  key={car.id_carros || idx}
                  car={car}
                  userData={userData}
                  onVerDetalles={handleVerDetalles}
                />
              ) : null
            )}
          </div>
        )}

        <div className="text-center text-blue-100 mt-8">
          <p className="text-lg">
            {userData
              ? '¿Necesitas más información? Contacta con tu conductor.'
              : 'Regístrate para ver detalles completos de los viajes y reservar tu asiento.'}
          </p>
        </div>
      </div>

      <Footer />

      {showRegisterModal && (
        <RegisterPromptModal onClose={() => setShowRegisterModal(false)} />
      )}
    </div>
  );
};

export default Home;
