import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle, FaSignOutAlt, FaCar, FaBell, FaTicketAlt } from 'react-icons/fa';
import { UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants';

const UserMenu = ({ userData }) => {
  const [open, setOpen] = useState(false);
  const menuRef         = useRef(null);
  const navigate        = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (path) => { setOpen(false); navigate(path); };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    go('/login');
  };

  const rol        = userData?.rol;
  const isConductor = rol === ROLES.CONDUCTOR;
  const isAdmin     = rol === ROLES.ADMIN || rol === 'administrador';
  const isUsuario   = !isConductor && !isAdmin;

  const nombre = userData?.Nombre || userData?.nombre || 'Usuario';

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all duration-200 ${
          open
            ? 'border-violet-400 bg-violet-50 text-violet-800'
            : 'border-gray-200 bg-gray-50 text-blue-900 hover:border-violet-300 hover:bg-violet-50'
        }`}
      >
        <FaUserCircle className={`text-xl transition-colors ${open ? 'text-violet-600' : 'text-blue-700'}`} />
        <span className="font-semibold text-sm max-w-[120px] truncate">{nombre}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl shadow-violet-100/60 border border-gray-100 overflow-hidden animate-scale-in z-[99999]">

          {/* Info usuario */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-violet-50 border-b border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Conectado como</p>
            <p className="text-sm font-bold text-blue-900 truncate">{nombre}</p>
            <span className="inline-block mt-0.5 text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full capitalize">
              {userData?.rol || 'usuario'}
            </span>
          </div>

          {/* Opciones */}
          <div className="py-1">
            <MenuItem icon={<UserCircleIcon className="w-4 h-4" />} onClick={() => go('/ver-perfil')}>
              Ver perfil
            </MenuItem>

            {isUsuario && (
              <MenuItem icon={<FaTicketAlt className="w-4 h-4" />} onClick={() => go('/mis-reservas')}>
                Mis Reservas
              </MenuItem>
            )}

            {isConductor && (
              <>
                <MenuItem icon={<FaCar className="w-4 h-4" />} onClick={() => go('/conductor')}>
                  Mi Panel
                </MenuItem>
                <MenuItem icon={<FaBell className="w-4 h-4" />} onClick={() => go('/conductor-notificaciones')}>
                  Notificaciones
                </MenuItem>
              </>
            )}

            {isAdmin && (
              <MenuItem icon={<FaCar className="w-4 h-4" />} onClick={() => go('/indexAdmin')}>
                Mi Panel
              </MenuItem>
            )}

            <MenuItem icon={<Cog6ToothIcon className="w-4 h-4" />} onClick={() => go('/ajustes-perfil')}>
              Ajustes
            </MenuItem>
          </div>

          {/* Cerrar sesión */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon, children, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:text-violet-700 hover:bg-violet-50 transition-colors"
  >
    <span className="text-gray-400 group-hover:text-violet-500">{icon}</span>
    <span className="font-medium">{children}</span>
  </button>
);

export default UserMenu;
