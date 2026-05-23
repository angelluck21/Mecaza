import React, { useState, useEffect, useRef } from 'react';
import { FaCar, FaTimes, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import UserMenu from '../ui/UserMenu';

const Navbar = ({ userData, searchTerm = '', onSearch, showSearch = true, filterProps = null }) => {
  const [isMenuOpen,    setIsMenuOpen]    = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [dropdownOpen]);

  const fp           = filterProps;
  const activeCount  = fp ? [fp.selectedOrigen, fp.selectedDestino, fp.selectedFecha].filter(Boolean).length : 0;
  const hasAnyFilter = activeCount > 0 || searchTerm.trim();

  // Texto de resumen cuando el dropdown está cerrado
  const summaryText = fp?.selectedOrigen && fp?.selectedDestino
    ? `${fp.selectedOrigen} → ${fp.selectedDestino}`
    : fp?.selectedOrigen  ? `Desde ${fp.selectedOrigen}`
    : fp?.selectedDestino ? `Hacia ${fp.selectedDestino}`
    : '';

  const handleClearAll = (e) => {
    e.stopPropagation();
    fp?.onClear();
    onSearch('');
  };

  // Chips usan onMouseDown + preventDefault para no quitar el foco del input
  const chipClick = (cb) => (e) => { e.preventDefault(); cb(); };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-violet-100/40' : 'bg-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
              <FaCar className="relative text-blue-900 text-3xl group-hover:text-violet-700 transition-colors duration-300" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-900 to-violet-700 bg-clip-text text-transparent">
              Mecaza
            </span>
          </a>

          {/* ── Búsqueda desktop + dropdown ── */}
          {showSearch && onSearch && (
            <div ref={containerRef} className="hidden md:block flex-1 max-w-md mx-8 relative">

              {/* Barra de búsqueda */}
              <div
                className={`flex items-center bg-gray-50 border transition-all duration-200 cursor-text ${
                  dropdownOpen
                    ? 'rounded-t-2xl rounded-b-none border-violet-400 ring-2 ring-violet-400 ring-b-0 bg-white border-b-white'
                    : 'rounded-full border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setDropdownOpen(true)}
              >
                <MagnifyingGlassIcon className="shrink-0 ml-3 h-4 w-4 text-gray-400 pointer-events-none" />

                <input
                  type="text"
                  placeholder={(!dropdownOpen && summaryText) ? summaryText : 'Buscar conductor, destino, placa...'}
                  value={searchTerm}
                  onChange={e => onSearch(e.target.value)}
                  onFocus={() => setDropdownOpen(true)}
                  className="flex-1 min-w-0 px-3 py-2 bg-transparent text-sm focus:outline-none placeholder:text-gray-400"
                />

                {/* Badge de filtros activos */}
                {activeCount > 0 && !searchTerm.trim() && (
                  <span className="shrink-0 mr-2 bg-violet-100 text-violet-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {activeCount}
                  </span>
                )}

                {/* Botón limpiar */}
                {hasAnyFilter && (
                  <button
                    onMouseDown={handleClearAll}
                    className="shrink-0 mr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* ── Dropdown ── */}
              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full bg-white border border-violet-400 border-t-0 rounded-b-2xl shadow-xl shadow-violet-100/60 z-50 overflow-hidden">
                  <div className="p-4 space-y-4">

                    {/* Origen */}
                    {fp && fp.origenesDisponibles.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FaMapMarkerAlt className="text-blue-400 text-[10px]" /> Desde
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {fp.origenesDisponibles.map(origen => {
                            const active = fp.selectedOrigen === origen;
                            return (
                              <button
                                key={origen}
                                onMouseDown={chipClick(() => fp.onOrigen(origen))}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                                  active
                                    ? 'bg-blue-500 text-white shadow-sm shadow-blue-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {origen}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Destino */}
                    {fp && fp.destinosDisponibles.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FaMapMarkerAlt className="text-violet-400 text-[10px]" /> Hasta
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {fp.destinosDisponibles.map(destino => {
                            const active = fp.selectedDestino === destino;
                            return (
                              <button
                                key={destino}
                                onMouseDown={chipClick(() => fp.onDestino(destino))}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                                  active
                                    ? 'bg-violet-500 text-white shadow-sm shadow-violet-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {destino}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Fecha + limpiar */}
                    {fp && (
                      <div className="flex items-end gap-3 pt-3 border-t border-gray-100">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <FaCalendarAlt className="text-blue-400 text-[10px]" /> Fecha
                          </p>
                          <input
                            type="date"
                            value={fp.selectedFecha}
                            onMouseDown={e => e.stopPropagation()}
                            onChange={e => fp.onFecha(e.target.value)}
                            className="w-full border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                          />
                        </div>
                        {hasAnyFilter && (
                          <button
                            onMouseDown={handleClearAll}
                            className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold whitespace-nowrap"
                          >
                            Limpiar todo
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pie con contador de resultados */}
                  {fp?.resultCount != null && (
                    <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {fp.resultCount} viaje{fp.resultCount !== 1 ? 's' : ''} disponible{fp.resultCount !== 1 ? 's' : ''}
                      </span>
                      <button
                        onMouseDown={e => { e.preventDefault(); setDropdownOpen(false); }}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
                      >
                        Ver resultados →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Acciones desktop */}
          <div className="hidden md:flex items-center space-x-4 shrink-0">
            {userData ? (
              <UserMenu userData={userData} />
            ) : (
              <>
                <a href="/login" className="text-blue-900 hover:text-violet-700 font-medium transition-colors duration-200 text-sm">
                  Iniciar Sesión
                </a>
                <a href="/registrar" className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-violet-600 text-white px-5 py-2 rounded-full font-semibold text-sm shadow-md hover:shadow-violet-300/60 hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95">
                  Registrarse
                </a>
              </>
            )}
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMenuOpen(p => !p)}
            className="md:hidden text-blue-900 hover:text-violet-700 p-2 rounded-lg hover:bg-violet-50 transition-all"
          >
            {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-down border-t border-gray-100 pb-4">
            {showSearch && onSearch && (
              <div className="px-2 pt-3 pb-2 space-y-3">
                {/* Búsqueda móvil */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar conductor, destino, placa..."
                    value={searchTerm}
                    onChange={e => onSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder:text-gray-400"
                  />
                </div>

                {/* Filtros móvil */}
                {fp && (
                  <div className="bg-gray-50 rounded-2xl p-3 space-y-3">
                    {fp.origenesDisponibles.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <FaMapMarkerAlt className="text-blue-400 text-[9px]" /> Desde
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {fp.origenesDisponibles.map(origen => (
                            <button key={origen} onClick={() => fp.onOrigen(origen)}
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                                fp.selectedOrigen === origen ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
                              }`}
                            >
                              {origen}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {fp.destinosDisponibles.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <FaMapMarkerAlt className="text-violet-400 text-[9px]" /> Hasta
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {fp.destinosDisponibles.map(destino => (
                            <button key={destino} onClick={() => fp.onDestino(destino)}
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                                fp.selectedDestino === destino ? 'bg-violet-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
                              }`}
                            >
                              {destino}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <FaCalendarAlt className="text-blue-400 text-[9px]" /> Fecha
                      </p>
                      <input type="date" value={fp.selectedFecha}
                        onChange={e => fp.onFecha(e.target.value)}
                        className="w-full border border-gray-200 text-gray-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400"
                      />
                    </div>
                    {(fp.selectedOrigen || fp.selectedDestino || fp.selectedFecha || searchTerm) && (
                      <button onClick={() => { fp.onClear(); onSearch(''); }}
                        className="w-full py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="px-2 space-y-1 mt-1">
              <a href="/"          className="block px-3 py-2 text-blue-900 hover:text-violet-700 hover:bg-violet-50 rounded-lg font-medium transition-all">Inicio</a>
              <a href="/login"     className="block px-3 py-2 text-blue-900 hover:text-violet-700 hover:bg-violet-50 rounded-lg font-medium transition-all">Iniciar Sesión</a>
              <a href="/registrar" className="block px-3 py-2 bg-gradient-to-r from-blue-700 to-violet-600 text-white rounded-lg font-semibold text-center hover:opacity-90 transition-all">
                Registrarse
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
