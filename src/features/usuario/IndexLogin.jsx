import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar } from 'react-icons/fa';

import Navbar        from '../../components/layout/Navbar';
import Footer        from '../../components/layout/Footer';
import Carousel      from '../../components/ui/Carousel';
import CarCard       from '../../components/ui/CarCard';
import LoadingScreen from '../../components/ui/LoadingScreen';
import Pagination    from '../../components/ui/Pagination';

import { listarCarrosApi, listarPreciosApi } from '../../services/api';

// Calcula asientos disponibles desde las reservas embebidas en cada carro
const withSeats = (cars) => cars.map(c => {
  const occupied = (c.reservas || []).filter(r => {
    const est = (r.estado || '').toLowerCase();
    return est === 'pendiente' || est === 'confirmada';
  }).length;
  return { ...c, asientos_disponibles: Math.max(0, (c.asientos || 0) - occupied) };
});

// ── Componente ─────────────────────────────────────────────────────────────────

const IndexLogin = () => {
  const [userData,        setUserData]        = useState(null);
  const [initialLoading,  setInitialLoading]  = useState(true);
  const [loading,         setLoading]         = useState(false);
  const [cars,            setCars]            = useState([]);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [lastPage,        setLastPage]        = useState(1);
  const [total,           setTotal]           = useState(0);
  const [precios,         setPrecios]         = useState([]);

  // Filtros
  const [searchTerm,     setSearchTerm]     = useState('');
  const [selectedOrigen, setSelectedOrigen] = useState('');
  const [selectedDestino,setSelectedDestino]= useState('');
  const [selectedFecha,  setSelectedFecha]  = useState('');

  const debounceRef = useRef(null);
  const navigate    = useNavigate();

  // ── Opciones del dropdown ─────────────────────────────────────────────────────
  const origenesDisponibles = useMemo(() =>
    [...new Set(precios.map(p => p.origen).filter(Boolean))].sort(),
    [precios]
  );

  const destinosDisponibles = useMemo(() => {
    const base = selectedOrigen
      ? precios.filter(p => p.origen === selectedOrigen)
      : precios;
    return [...new Set(base.map(p => p.destino).filter(Boolean))].sort();
  }, [precios, selectedOrigen]);

  // ── Fetch de carros (server-side: filtros + página) ───────────────────────────
  const fetchCars = async (params = {}) => {
    setLoading(true);
    try {
      const data    = await listarCarrosApi(params);
      const rawCars = Array.isArray(data.data) ? data.data : [];
      setCars(withSeats(rawCars));
      setCurrentPage(data.current_page ?? 1);
      setLastPage(data.last_page ?? 1);
      setTotal(data.total ?? 0);
    } catch {
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Auth + carga inicial ──────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { navigate('/login'); return; }
    try {
      const user = JSON.parse(stored);
      if (user.rol === 'conductor') { navigate('/conductor', { replace: true }); return; }
      setUserData(user);
    } catch { navigate('/login'); return; }

    Promise.all([
      fetchCars({ page: 1 }),
      listarPreciosApi().then(r => setPrecios(Array.isArray(r.data?.data) ? r.data.data : [])).catch(() => {}),
    ]).finally(() => setInitialLoading(false));
  }, [navigate]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const buildParams = (overrides = {}) => {
    const base = { page: 1, origen: selectedOrigen, destino: selectedDestino, fecha: selectedFecha, search: searchTerm };
    return Object.fromEntries(
      Object.entries({ ...base, ...overrides }).filter(([, v]) => v != null && v !== '')
    );
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() =>
      fetchCars(buildParams({ search: value, page: 1 }))
    , 400);
  };

  const handleOrigen = (origen) => {
    const next = origen === selectedOrigen ? '' : origen;
    const validDestinos = new Set(precios.filter(p => !next || p.origen === next).map(p => p.destino));
    const newDestino = validDestinos.has(selectedDestino) ? selectedDestino : '';
    setSelectedOrigen(next);
    setSelectedDestino(newDestino);
    fetchCars(buildParams({ origen: next, destino: newDestino, page: 1 }));
  };

  const handleDestino = (destino) => {
    const next = destino === selectedDestino ? '' : destino;
    setSelectedDestino(next);
    fetchCars(buildParams({ destino: next, page: 1 }));
  };

  const handleFecha = (fecha) => {
    setSelectedFecha(fecha);
    fetchCars(buildParams({ fecha, page: 1 }));
  };

  const handleClearFilters = () => {
    setSelectedOrigen('');
    setSelectedDestino('');
    setSelectedFecha('');
    setSearchTerm('');
    fetchCars({ page: 1 });
  };

  const handlePageChange = (p) => {
    fetchCars(buildParams({ page: p }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (initialLoading) return <LoadingScreen message="Cargando viajes..." />;

  const hasFilters = selectedOrigen || selectedDestino || selectedFecha || searchTerm.trim();

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
          onOrigen:    handleOrigen,
          onDestino:   handleDestino,
          onFecha:     handleFecha,
          onClear:     handleClearFilters,
          resultCount: total,
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

        {/* Estado de carga / resultados */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/60 text-sm">Buscando viajes...</p>
          </div>
        ) : cars.length === 0 ? (
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
                ? `No hay viajes de ${selectedOrigen} a ${selectedDestino}.`
                : selectedOrigen ? `No hay viajes desde ${selectedOrigen}.`
                : selectedDestino ? `No hay viajes hacia ${selectedDestino}.`
                : selectedFecha ? 'No hay viajes para esta fecha.'
                : searchTerm ? `Sin coincidencias para "${searchTerm}".`
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cars.map((car, idx) =>
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

            {/* Paginación */}
            <div className="mt-10">
              <Pagination
                currentPage={currentPage}
                lastPage={lastPage}
                total={total}
                onPageChange={handlePageChange}
                loading={loading}
                className="[&_button]:bg-white/10 [&_button]:text-white [&_button:hover:not(:disabled)]:bg-white/20 [&_button.bg-violet-600]:bg-violet-500"
              />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default IndexLogin;
