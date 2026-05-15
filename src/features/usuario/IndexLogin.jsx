import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar    from '../../components/layout/Navbar';
import Footer    from '../../components/layout/Footer';
import Carousel  from '../../components/ui/Carousel';
import CarCard   from '../../components/ui/CarCard';
import LoadingScreen from '../../components/ui/LoadingScreen';

import { listarCarrosApi, listarReservasApi } from '../../services/api';

// ── Helpers (misma lógica que Home, compartida en utils) ───────────────────────

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

const IndexLogin = () => {
  const [userData,     setUserData]     = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [cars,         setCars]         = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [searchTerm,   setSearchTerm]   = useState('');
  const navigate = useNavigate();

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { navigate('/login'); return; }

    try {
      setUserData(JSON.parse(stored));
    } catch {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const data    = await listarCarrosApi();
        let carsData  = Array.isArray(data.data) ? data.data : [];

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
  }, [navigate]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilteredCars(filtrarCarros(cars, value));
  };

  if (isLoading) return <LoadingScreen />;
  if (!userData) return <LoadingScreen message="Cargando usuario..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 relative overflow-hidden">
      <Navbar userData={userData} searchTerm={searchTerm} onSearch={handleSearch} />

      <Carousel />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Carros Disponibles</h2>

        {!filteredCars.length ? (
          <div className="text-center text-white text-lg">
            {searchTerm ? 'No se encontraron carros que coincidan con tu búsqueda.' : 'No hay carros disponibles.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredCars.map((car, idx) =>
              car ? (
                <CarCard
                  key={car.id_carros || idx}
                  car={car}
                  userData={userData}
                  onVerDetalles={(id) => navigate(`/ver-detalles/${id}`)}
                />
              ) : null
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default IndexLogin;
