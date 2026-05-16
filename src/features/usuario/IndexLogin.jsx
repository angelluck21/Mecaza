import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaChevronDown, FaFilter, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';

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

const filtrarCarros = (cars, term, ruta) => {
  let result = cars;
  if (ruta) {
    result = result.filter((c) =>
      c.destino && c.destino.toLowerCase() === ruta.toLowerCase()
    );
  }
  if (term.trim()) {
    const lower = term.toLowerCase();
    result = result.filter((c) =>
      (c.conductor  && c.conductor.toLowerCase().includes(lower))  ||
      (c.destino    && c.destino.toLowerCase().includes(lower))    ||
      (c.placa      && c.placa.toLowerCase().includes(lower))      ||
      (c.horasalida && c.horasalida.toLowerCase().includes(lower)) ||
      (c.fecha      && c.fecha.toLowerCase().includes(lower))
    );
  }
  return result;
};

// ── Component ─────────────────────────────────────────────────────────────────

const IndexLogin = () => {
  const [userData,      setUserData]      = useState(null);
  const [isLoading,     setIsLoading]     = useState(true);
  const [cars,          setCars]          = useState([]);
  const [filteredCars,  setFilteredCars]  = useState([]);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [selectedRuta,  setSelectedRuta]  = useState('');
  const [filterOpen,    setFilterOpen]    = useState(false);
  const navigate = useNavigate();

  // Rutas únicas extraídas de los carros cargados
  const rutasDisponibles = useMemo(() =>
    [...new Set(cars.map((c) => c.destino).filter(Boolean))].sort(),
    [cars]
  );

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
    setFilteredCars(filtrarCarros(cars, value, selectedRuta));
  };

  const handleRuta = (ruta) => {
    const next = ruta === selectedRuta ? '' : ruta;
    setSelectedRuta(next);
    setFilteredCars(filtrarCarros(cars, searchTerm, next));
  };

  const handleClearFilters = () => {
    setSelectedRuta('');
    setSearchTerm('');
    setFilteredCars(cars);
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
        <div className="text-center mb-8 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Viajes disponibles
          </h2>
          <p className="text-blue-200">
            Bienvenido, <span className="font-semibold text-white">{userData?.Nombre || userData?.nombre || 'viajero'}</span>
          </p>
          <div className="mx-auto mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-blue-400 to-violet-400" />
        </div>

        {/* ── Panel de filtro por ruta ── */}
        {rutasDisponibles.length > 0 && (
          <div className="mb-8 animate-fade-in-up">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-lg">

              {/* Cabecera del panel */}
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/30 flex items-center justify-center">
                    <FaFilter className="text-violet-300 text-xs" />
                  </div>
                  <span className="font-semibold text-sm">Filtrar por ruta</span>
                  {selectedRuta && (
                    <span className="bg-violet-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {selectedRuta}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {(selectedRuta || searchTerm) && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleClearFilters(); }}
                      className="flex items-center gap-1 text-xs text-red-300 hover:text-red-200 transition-colors"
                    >
                      <FaTimes className="text-[10px]" /> Limpiar
                    </button>
                  )}
                  <FaChevronDown
                    className={`text-white/50 text-xs transition-transform duration-300 ${filterOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {/* Contenido desplegable */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  filterOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 pb-5 pt-1 border-t border-white/10">
                  <p className="text-blue-200 text-xs mb-3">Selecciona un destino para filtrar los viajes:</p>
                  <div className="flex flex-wrap gap-2">
                    {rutasDisponibles.map((ruta) => {
                      const isActive  = selectedRuta === ruta;
                      const count     = cars.filter((c) => c.destino === ruta).length;
                      return (
                        <button
                          key={ruta}
                          type="button"
                          onClick={() => handleRuta(ruta)}
                          className={[
                            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95',
                            isActive
                              ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30 scale-105'
                              : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10',
                          ].join(' ')}
                        >
                          <FaMapMarkerAlt className={`text-xs shrink-0 ${isActive ? 'text-violet-200' : 'text-blue-300'}`} />
                          {ruta}
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!filteredCars.length ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <FaCar className="text-white/60 text-3xl" />
              </div>
            </div>
            <p className="text-white text-xl font-semibold mb-2">
              {searchTerm || selectedRuta ? 'Sin resultados' : 'No hay viajes disponibles'}
            </p>
            <p className="text-blue-200 text-sm">
              {selectedRuta
                ? `No hay viajes hacia "${selectedRuta}"${searchTerm ? ` que coincidan con "${searchTerm}"` : ''}.`
                : searchTerm
                  ? `No encontramos coincidencias para "${searchTerm}".`
                  : 'Vuelve más tarde, pronto habrá nuevos viajes.'}
            </p>
            {(searchTerm || selectedRuta) && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl transition-colors"
              >
                Limpiar filtros
              </button>
            )}
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
