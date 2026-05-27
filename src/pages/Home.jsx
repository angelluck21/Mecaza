import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaTimes, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

import Navbar              from '../components/layout/Navbar';
import Footer              from '../components/layout/Footer';
import Carousel            from '../components/ui/Carousel';
import CarCard             from '../components/ui/CarCard';
import LoadingScreen       from '../components/ui/LoadingScreen';
import Pagination          from '../components/ui/Pagination';
import RegisterPromptModal from '../components/ui/RegisterPromptModal';

import { listarCarrosApi, listarPreciosApi } from '../services/api';
import './Home.css';

// Calcula asientos desde reservas embebidas en cada carro
const withSeats = (cars) => cars.map(c => {
  const occupied = (c.reservas || []).filter(r => {
    const est = (r.estado || '').toLowerCase();
    return est === 'pendiente' || est === 'confirmada';
  }).length;
  return { ...c, asientos_disponibles: Math.max(0, (c.asientos || 0) - occupied) };
});

// ── Componente ─────────────────────────────────────────────────────────────────

const Home = () => {
  const [userData,          setUserData]          = useState(null);
  const [initialLoading,    setInitialLoading]    = useState(true);
  const [loading,           setLoading]           = useState(false);
  const [cars,              setCars]              = useState([]);
  const [currentPage,       setCurrentPage]       = useState(1);
  const [lastPage,          setLastPage]          = useState(1);
  const [total,             setTotal]             = useState(0);
  const [precios,           setPrecios]           = useState([]);
  const [filterOpen,        setFilterOpen]        = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Filtros
  const [searchTerm,      setSearchTerm]      = useState('');
  const [selectedOrigen,  setSelectedOrigen]  = useState('');
  const [selectedDestino, setSelectedDestino] = useState('');
  const [selectedFecha,   setSelectedFecha]   = useState('');

  const debounceRef = useRef(null);
  const navigate    = useNavigate();

  // ── Opciones de filtros ───────────────────────────────────────────────────────
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

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchCars = async (params = {}) => {
    setLoading(true);
    try {
      const data = await listarCarrosApi(params);
      const raw  = Array.isArray(data.data) ? data.data : [];
      setCars(withSeats(raw));
      setCurrentPage(data.current_page ?? 1);
      setLastPage(data.last_page ?? 1);
      setTotal(data.total ?? 0);
    } catch {
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Auth check + carga inicial ────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        // Redirigir roles que no deben ver esta vista
        if (user.rol === 'conductor') { navigate('/conductor', { replace: true }); return; }
        if (user.rol === 'admin' || user.rol === 'administrador') { navigate('/indexAdmin', { replace: true }); return; }
        setUserData(user);
      } catch { /* sesión inválida, continuar como invitado */ }
    }

    Promise.all([
      fetchCars({ page: 1 }),
      listarPreciosApi()
        .then(r => setPrecios(Array.isArray(r.data?.data) ? r.data.data : []))
        .catch(() => {}),
    ]).finally(() => setInitialLoading(false));
  }, [navigate]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const buildParams = (overrides = {}) => {
    const base = {
      page:    1,
      origen:  selectedOrigen,
      destino: selectedDestino,
      fecha:   selectedFecha,
      search:  searchTerm,
    };
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
    const validDestinos = new Set(
      precios.filter(p => !next || p.origen === next).map(p => p.destino)
    );
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
    setFilterOpen(false);
  };

  const handlePageChange = (p) => {
    fetchCars(buildParams({ page: p }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Invitados → modal de registro; usuarios → navegar a detalle
  const handleVerDetalles = (id) => {
    if (userData) navigate(`/ver-detalles/${id}`);
    else          setShowRegisterModal(true);
  };

  if (initialLoading) return <LoadingScreen message="Cargando viajes…" />;

  const hasFilters  = !!(selectedOrigen || selectedDestino || selectedFecha || searchTerm.trim());
  const activeCount = [selectedOrigen, selectedDestino, selectedFecha].filter(Boolean).length;
  const firstName   = userData
    ? (userData.Nombre || userData.nombre || 'viajero').split(' ')[0]
    : null;

  // ── Contenido del dropdown de filtros ────────────────────────────────────────
  const filterContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {origenesDisponibles.length > 0 && (
        <div>
          <p className="filter-section-label">
            <FaMapMarkerAlt className="f-icon" /> Origen
          </p>
          <div className="filter-tags">
            {origenesDisponibles.map(o => (
              <button
                key={o} type="button"
                className={`filter-tag ${selectedOrigen === o ? 'active' : ''}`}
                onClick={() => handleOrigen(o)}
              >
                <FaMapMarkerAlt style={{ fontSize: '0.6rem', flexShrink: 0 }} /> {o}
              </button>
            ))}
          </div>
        </div>
      )}

      {destinosDisponibles.length > 0 && (
        <div>
          <p className="filter-section-label">
            <FaMapMarkerAlt className="f-icon" /> Destino
          </p>
          <div className="filter-tags">
            {destinosDisponibles.map(d => (
              <button
                key={d} type="button"
                className={`filter-tag ${selectedDestino === d ? 'active' : ''}`}
                onClick={() => handleDestino(d)}
              >
                <FaMapMarkerAlt style={{ fontSize: '0.6rem', flexShrink: 0 }} /> {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="filter-section-label">
          <FaCalendarAlt className="f-icon" /> Fecha del viaje
        </p>
        <div className="filter-date-wrap">
          <input
            type="date"
            value={selectedFecha}
            onChange={e => handleFecha(e.target.value)}
            className="filter-date-input"
          />
          {selectedFecha && (
            <button type="button" className="filter-date-clear" onClick={() => handleFecha('')}>
              <FaTimes />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="home-page">
      <Navbar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        filterConfig={{
          open:        filterOpen,
          onToggle:    () => setFilterOpen(o => !o),
          activeCount,
          hasActive:   hasFilters,
          onClear:     handleClearFilters,
          content:     filterContent,
        }}
      />
      <Carousel />

      <main className="home-main">

        {/* ── Encabezado ── */}
        <div className="home-section-header animate-fade-in-up">
          <div className="home-eyebrow">
            {userData ? 'Viajes disponibles' : 'Movilidad compartida'}
          </div>
          <h2 className="home-title">
            {userData
              ? <>Hola de nuevo, <em>{firstName}</em></>
              : <>Encuentra tu <em>próximo viaje</em></>}
          </h2>
          <p className="home-subtitle">
            {userData
              ? total > 0
                ? `${total} viaje${total !== 1 ? 's' : ''} disponible${total !== 1 ? 's' : ''} para ti hoy`
                : 'Explora los viajes disponibles y elige el tuyo'
              : 'Regístrate para reservar tu asiento y viajar seguro.'}
          </p>
        </div>

        {/* ── Estado de carga / resultados ── */}
        {loading ? (
          <div className="home-loading">
            <div className="home-spinner" />
            <p className="home-loading-text">Buscando viajes…</p>
          </div>

        ) : cars.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty-icon"><FaCar /></div>
            <p className="home-empty-title">
              {hasFilters ? 'Sin resultados' : 'No hay viajes disponibles'}
            </p>
            <p className="home-empty-desc">
              {selectedOrigen && selectedDestino
                ? `No hay viajes de ${selectedOrigen} a ${selectedDestino}.`
                : selectedOrigen  ? `No hay viajes desde ${selectedOrigen}.`
                : selectedDestino ? `No hay viajes hacia ${selectedDestino}.`
                : selectedFecha   ? 'No hay viajes para esta fecha.'
                : searchTerm      ? `Sin coincidencias para "${searchTerm}".`
                : 'Vuelve más tarde, pronto habrá nuevos viajes.'}
            </p>
            {hasFilters && (
              <button className="home-empty-btn" onClick={handleClearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>

        ) : (
          <>
            <div className="cars-grid">
              {cars.map((car, idx) =>
                car ? (
                  <div
                    key={car.id_carros || idx}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${Math.min(idx * 55, 380)}ms` }}
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

            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </>
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
