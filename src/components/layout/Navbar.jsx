import React, { useState, useEffect } from 'react';
import { FaCar } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import UserMenu from '../ui/UserMenu';

const Navbar = ({ userData, searchTerm = '', onSearch, showSearch = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const SearchInput = ({ className = '' }) => (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Buscar conductor, destino, placa..."
        value={searchTerm}
        onChange={(e) => onSearch?.(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all placeholder:text-gray-400"
      />
      <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
    </div>
  );

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-violet-100/40'
          : 'bg-white shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
              <FaCar className="relative text-blue-900 text-3xl group-hover:text-violet-700 transition-colors duration-300" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-900 to-violet-700 bg-clip-text text-transparent">
              Mecaza
            </span>
          </a>

          {/* Búsqueda desktop */}
          {showSearch && onSearch && (
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <SearchInput className="w-full" />
            </div>
          )}

          {/* Acciones desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {userData ? (
              <UserMenu userData={userData} />
            ) : (
              <>
                <a
                  href="/login"
                  className="text-blue-900 hover:text-violet-700 font-medium transition-colors duration-200 text-sm"
                >
                  Iniciar Sesión
                </a>
                <a
                  href="/registrar"
                  className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-violet-600 text-white px-5 py-2 rounded-full font-semibold text-sm shadow-md hover:shadow-violet-300/60 hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Registrarse
                </a>
              </>
            )}
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMenuOpen((p) => !p)}
            className="md:hidden text-blue-900 hover:text-violet-700 p-2 rounded-lg hover:bg-violet-50 transition-all"
          >
            {isMenuOpen
              ? <XMarkIcon  className="h-6 w-6" />
              : <Bars3Icon  className="h-6 w-6" />
            }
          </button>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-down border-t border-gray-100 pb-4">
            {showSearch && onSearch && (
              <div className="px-2 pt-3 pb-2">
                <SearchInput />
              </div>
            )}
            <div className="px-2 space-y-1">
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
