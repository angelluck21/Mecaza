import React, { useState, useEffect } from "react";
import { FaCar } from 'react-icons/fa';
import { MagnifyingGlassIcon, UserIcon, Bars3Icon } from '@heroicons/react/24/outline';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y nombre */}
            <div className="flex items-center space-x-3">
              <FaCar className="text-blue-900 text-3xl drop-shadow-lg" />
              <span className="text-2xl font-bold text-blue-900">Mecaza</span>
            </div>

            {/* Barra de búsqueda - Desktop */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar contenido..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Navegación - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
                Inicio
              </a>
              <a href="/login" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
                Iniciar Sesión
              </a>
              <a 
                href="/registrar" 
                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Registrarse
              </a>
            </div>

            {/* Botón menú móvil */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-blue-900 hover:text-blue-700 p-2"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Menú móvil */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Barra de búsqueda móvil */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Buscar contenido..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                
                <a 
                  href="/" 
                  className="block px-3 py-2 text-blue-900 hover:text-blue-700 font-medium"
                >
                  Inicio
                </a>
                <a 
                  href="/login" 
                  className="block px-3 py-2 text-blue-900 hover:text-blue-700 font-medium"
                >
                  Iniciar Sesión
                </a>
                <a 
                  href="/registrar" 
                  className="block px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Registrarse
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-8 transform transition-all duration-300">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
              Bienvenido a Mecaza
            </h1>
            <p className="text-lg text-gray-600">
              Tu plataforma de confianza para viajes seguros y cómodos
            </p>
          </div>

          {/* Contenido adicional aquí */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Viajes Seguros</h3>
              <p className="text-gray-600">Conductores verificados y viajes seguros garantizados.</p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Precios Justos</h3>
              <p className="text-gray-600">Tarifas transparentes sin costos ocultos.</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">24/7 Disponible</h3>
              <p className="text-gray-600">Servicio disponible las 24 horas del día.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
