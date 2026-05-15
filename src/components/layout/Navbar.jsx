import React, { useState } from 'react';
import { FaCar } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../ui/UserMenu';

/**
 * Barra de navegación principal.
 * Props:
 *   userData      – objeto del usuario logueado (o null)
 *   searchTerm    – valor actual del input de búsqueda
 *   onSearch      – callback (value: string) => void
 *   showSearch    – mostrar barra de búsqueda (default true)
 */
const Navbar = ({ userData, searchTerm = '', onSearch, showSearch = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const SearchInput = ({ className = '' }) => (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Buscar por conductor, destino, placa..."
        value={searchTerm}
        onChange={(e) => onSearch?.(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
  );

  return (
    <nav className="bg-white shadow-lg relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <FaCar className="text-blue-900 text-3xl drop-shadow-lg" />
            <span className="text-2xl font-bold text-blue-900">Mecaza</span>
          </div>

          {/* Búsqueda desktop */}
          {showSearch && onSearch && (
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <SearchInput className="w-full" />
            </div>
          )}

          {/* Acciones desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {userData ? (
              <UserMenu userData={userData} />
            ) : (
              <>
                <a href="/login"     className="text-blue-900 hover:text-blue-700 font-medium transition-colors">Iniciar Sesión</a>
                <a href="/registrar" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">Registrarse</a>
              </>
            )}
          </div>

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen((p) => !p)} className="text-blue-900 hover:text-blue-700 p-2">
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {showSearch && onSearch && <SearchInput className="mb-4" />}
              <a href="/"          className="block px-3 py-2 text-blue-900 hover:text-blue-700 font-medium">Inicio</a>
              <a href="/login"     className="block px-3 py-2 text-blue-900 hover:text-blue-700 font-medium">Iniciar Sesión</a>
              <a href="/registrar" className="block px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">Registrarse</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
