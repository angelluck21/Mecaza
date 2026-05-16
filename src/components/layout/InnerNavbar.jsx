import React, { useState } from 'react';
import { FaCar } from 'react-icons/fa';
import { ArrowLeftIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../ui/UserMenu';

/**
 * Navbar para páginas internas (perfil, reservas, conductor, etc.)
 * Props:
 *   userData   – usuario logueado
 *   title      – título opcional a mostrar en el centro (desktop)
 *   backTo     – ruta a la que volver (default: -1)
 *   actions    – nodo React extra para la derecha (botones adicionales)
 */
const InnerNavbar = ({ userData, title, backTo, actions }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  const rol = userData?.rol;
  const logoHref =
    rol === 'conductor'                            ? '/conductor'  :
    (rol === 'admin' || rol === 'administrador')   ? '/indexAdmin' :
    '/';

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md shadow-violet-100/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Izquierda: logo + volver */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-violet-700 transition-colors group"
            >
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Volver</span>
            </button>

            <div className="w-px h-5 bg-gray-200" />

            <a href={logoHref} className="flex items-center gap-2 group">
              <FaCar className="text-blue-900 text-xl group-hover:text-violet-700 transition-colors" />
              <span className="text-lg font-extrabold bg-gradient-to-r from-blue-900 to-violet-700 bg-clip-text text-transparent">
                Mecaza
              </span>
            </a>
          </div>

          {/* Centro: título (solo desktop) */}
          {title && (
            <p className="hidden md:block text-sm font-semibold text-gray-600 truncate">{title}</p>
          )}

          {/* Derecha: acciones + user menu */}
          <div className="hidden md:flex items-center gap-3">
            {actions}
            {userData && <UserMenu userData={userData} />}
          </div>

          {/* Móvil: hamburguesa */}
          <button
            onClick={() => setMenuOpen(p => !p)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-violet-700 hover:bg-violet-50 transition-all"
          >
            {menuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="md:hidden animate-slide-down border-t border-gray-100 py-3 space-y-1">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-all"
            >
              <ArrowLeftIcon className="w-4 h-4" /> Volver
            </button>
            {userData && (
              <div className="px-3 py-2 text-sm text-gray-600 font-medium">
                {userData?.Nombre || userData?.nombre || 'Usuario'}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default InnerNavbar;
