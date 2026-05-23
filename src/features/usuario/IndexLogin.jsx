import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';

import Navbar        from '../../components/layout/Navbar';
import Footer        from '../../components/layout/Footer';
import Carousel      from '../../components/ui/Carousel';
import CarCard       from '../../components/ui/CarCard';
import LoadingScreen from '../../components/ui/LoadingScreen';
import PageBg        from '../../components/ui/PageBg';

import { listarCarrosApi, listarReservasApi } from '../../services/api';
import { calcularAsientosDisponibles }        from '../../utils';

const filtrarCarros = (cars, term, origen, destino, fecha) => {
  let r = cars;
  if (origen)    r = r.filter(c => c.precioviaje?.origen === origen);
  if (destino)   r = r.filter(c => c.precioviaje?.destino === destino);
  if (fecha)     r = r.filter(c => c.fecha?.startsWith(fecha));
  if (term.trim()) {
    const q = term.toLowerCase();
    r = r.filter(c =>
      c.conductor?.toLowerCase().includes(q)          ||
      c.precioviaje?.origen?.toLowerCase().includes(q) ||
      c.precioviaje?.destino?.toLowerCase().includes(q)||
      c.placa?.toLowerCase().includes(q)              ||
      c.horasalida?.toLowerCase().includes(q)         ||
      c.fecha?.toLowerCase().includes(q)
    );
  }
  return r;
};

// ── Componente ─────────────────────────────────────────────────────────────────

const IndexLogin = () => {
  const [userData,       setUserData]       = useState(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [cars,           setCars]           = useState([]);
  const [filteredCars,   setFilteredCars]   = useState([]);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [selectedOrigen, setSelectedOrigen] = useState('');
  const [selectedDestino,setSelectedDestino]= useState('');
  const [selectedFecha,  setSelectedFecha]  = useState('');
  const navigate = useNavigate();

  // ── Origenes únicos disponibles ──────────────────────────────────────────────
  const origenesDisponibles = useMemo(() =>
    [...new Set(cars.map(c => c.precioviaje?.origen).filter(Boolean))].sort(),
    [cars]
  );

  // ── Destinos filtrados según el origen seleccionado ──────────────────────────
  const destinosDisponibles = useMemo(() => {
    const base = selectedOrigen
      ? cars.filter(c => c.precioviaje?.origen === selectedOrigen)
      : cars;
    return [...new Set(base.map(c => c.precioviaje?.destino).filter(Boolean))].sort();
  }, [cars, selectedOrigen]);

  const hasFilters = selectedOrigen || selectedDestino || selectedFecha || searchTerm.trim();

  // ── Carga inicial ─────────────────────────────────────────────────────────────
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
        const data = await listarCarrosApi();
        let carsData = (Array.isArray(data.data) ? data.data : [])
          .filter(c => parseInt(c.id_estados ?? 0) !== 5);
        try {
          const reservasData  = await listarReservasApi();
          const reservasArray = Array.isArray(reservasData) ? reservasData : (reservasData.data ?? []);
          carsData = calcularAsientosDisponibles(carsData, reservasArray);
        } catch {
          carsData = carsData.map(c => ({ ...c, asientos_disponibles: c.asientos || 4 }));
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

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilteredCars(filtrarCarros(cars, value, selectedOrigen, selectedDestino, selectedFecha));
  };

  const handleOrigen = (origen) => {
    const next = origen === selectedOrigen ? '' : origen;
    setSelectedOrigen(next);
    // Resetear destino si no existe en el nuevo origen
    const validDestinos = new Set(
      cars.filter(c => !next || c.precioviaje?.origen === next)
          .map(c => c.precioviaje?.destino).filter(Boolean)
    );
    const newDestino = validDestinos.has(selectedDestino) ? selectedDestino : '';
    setSelectedDestino(newDestino);
    setFilteredCars(filtrarCarros(cars, searchTerm, next, newDestino, selectedFecha));
  };

  const handleDestino = (destino) => {
    const next = destino === selectedDestino ? '' : destino;
    setSelectedDestino(next);
    setFilteredCars(filtrarCarros(cars, searchTerm, selectedOrigen, next, selectedFecha));
  };

  const handleFecha = (fecha) => {
    setSelectedFecha(fecha);
    setFilteredCars(filtrarCarros(cars, searchTerm, selectedOrigen, selectedDestino, fecha));
  };

  const handleClearFilters = () => {
    setSelectedOrigen('');
    setSelectedDestino('');
    setSearchTerm('');
    setSelectedFecha('');
    setFilteredCars(cars);
  };

  if (isLoading) return <LoadingScreen message="Cargando viajes..." />;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <Navbar
        userData={userData}
        searchTerm={searchTerm}
        onSearch={handleSearch}
        filterProps={{
          origenesDisponibles,
          destinosDisponibles,
          selectedOrigen,
          selectedDestino,
          selectedFecha,
          onOrigen:  handleOrigen,
          onDestino: handleDestino,
          onFecha:   handleFecha,
          onClear:   handleClearFilters,
          resultCount: filteredCars.length,
        }}
      />
      <Carousel />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* Título */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Viajes disponibles</h2>
          <p className="text-blue-200">
            Bienvenido,{' '}
            <span className="font-semibold text-white">
              {userData?.Nombre || userData?.nombre || 'viajero'}
            </span>
          </p>
          <div className="mx-auto mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-blue-400 to-violet-400" />
        </div>

        {/* ── Resultados ── */}
        {filteredCars.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <FaCar className="text-white/60 text-3xl" />
              </div>
            </div>
            <p className="text-white text-xl font-semibold mb-2">
              {hasFilters ? 'Sin resultados' : 'No hay viajes disponibles'}
            </p>
            <p className="text-blue-200 text-sm">
              {selectedOrigen && selectedDestino
                ? `No hay viajes de ${selectedOrigen} a ${selectedDestino}${selectedFecha ? ` el ${new Date(selectedFecha + 'T12:00:00').toLocaleDateString('es-ES')}` : ''}.`
                : selectedOrigen
                  ? `No hay viajes desde ${selectedOrigen}.`
                  : selectedDestino
                    ? `No hay viajes hacia ${selectedDestino}.`
                    : selectedFecha
                      ? `No hay viajes para esta fecha.`
                      : searchTerm
                        ? `Sin coincidencias para "${searchTerm}".`
                        : 'Vuelve más tarde, pronto habrá nuevos viajes.'}
            </p>
            {hasFilters && (
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
                <div
                  key={car.id_carros || idx}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(idx * 60, 400)}ms` }}
                >
                  <CarCard
                    car={car}
                    userData={userData}
                    onVerDetalles={id => navigate(`/ver-detalles/${id}`)}
                  />
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
