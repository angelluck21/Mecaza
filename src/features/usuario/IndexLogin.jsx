import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';

import Navbar       from '../../components/layout/Navbar';
import Footer       from '../../components/layout/Footer';
import Carousel     from '../../components/ui/Carousel';
import CarCard      from '../../components/ui/CarCard';
import LoadingScreen from '../../components/ui/LoadingScreen';
import PageBg       from '../../components/ui/PageBg';

import { listarCarrosApi, listarReservasApi } from '../../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const calcularAsientosDisponibles = (carsData, reservasArray) =>
  carsData.map((car) => {
    const carroId         = car.id_carros || car.id || car.ID;
    const reservasDelCarro = reservasArray.filter((r) => {
      const rId = r.id_carros || r.id_carro || r.carro_id || r.carroId;
      return rId == carroId && r.estado !== 'cancelada' && r.estado !== 'rechazada';
    });
    return { ...car, asientos_disponibles: Math.max(0, (car.asientos || 4) - reservasDelCarro.length) };
  });

const filtrarCarros = (cars, term) => {
  if (!term.trim()) return cars;
  const lower = term.toLowerCase();
  return cars.filter((c) =>
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

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { navigate('/login'); return; }
    try {
      const user = JSON.parse(stored);
      if (user.rol === 'conductor') { navigate('/conductor', { replace: true }); return; }
      setUserData(user);
    } catch { navigate('/login'); return; }

    (async () => {
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
        setCars([]); setFilteredCars([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [navigate]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilteredCars(filtrarCarros(cars, value));
  };

  if (isLoading) return <LoadingScreen message="Cargando viajes..." />;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <Navbar userData={userData} searchTerm={searchTerm} onSearch={handleSearch} />
      <Carousel />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="text-center mb-10 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Viajes disponibles
          </h2>
          <p className="text-blue-200">
            Bienvenido, <span className="font-semibold text-white">{userData?.Nombre || userData?.nombre || 'viajero'}</span>
          </p>
          <div className="mx-auto mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-blue-400 to-violet-400" />
        </div>

        {!filteredCars.length ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <FaCar className="text-white/60 text-3xl" />
              </div>
            </div>
            <p className="text-white text-xl font-semibold mb-2">
              {searchTerm ? 'Sin resultados' : 'No hay viajes disponibles'}
            </p>
            <p className="text-blue-200 text-sm">
              {searchTerm ? `No encontramos coincidencias para "${searchTerm}"` : 'Vuelve más tarde, pronto habrá nuevos viajes.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCars.map((car, idx) =>
              car ? (
                <div key={car.id_carros || idx} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(idx * 60, 400)}ms` }}>
                  <CarCard car={car} userData={userData} onVerDetalles={(id) => navigate(`/ver-detalles/${id}`)} />
                </div>
              ) : null
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default IndexLogin;
