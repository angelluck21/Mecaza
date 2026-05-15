import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants';

const menuStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fadeIn 0.2s ease-out; }
  .user-menu-container { position: relative; z-index: 999999 !important; }
  .user-menu-dropdown {
    position: absolute !important; z-index: 999999 !important;
    top: 100% !important; right: 0 !important;
    min-width: 12rem !important; background-color: white !important;
    border: 1px solid #e5e7eb !important; border-radius: 0.5rem !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important; margin-top: 0.5rem !important;
  }
`;

const UserMenu = ({ userData }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const go = (path) => { setOpen(false); navigate(path); };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    go('/login');
  };

  const isConductorOrAdmin = userData?.rol === ROLES.CONDUCTOR || userData?.rol === ROLES.ADMIN;

  return (
    <>
      <style>{menuStyles}</style>
      <div className="user-menu-container" ref={menuRef}>
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors focus:outline-none"
        >
          <FaUserCircle className="text-blue-900 text-2xl" />
          <span className="font-semibold text-blue-900">Hola, {userData?.Nombre || 'Usuario'}</span>
        </button>

        {open && (
          <div className="user-menu-dropdown animate-fade-in">
            <button onClick={() => go('/ver-perfil')}            className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors">Ver perfil</button>
            {!isConductorOrAdmin && (
              <button onClick={() => go('/mis-reservas')}        className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors">Mis Reservas</button>
            )}
            {isConductorOrAdmin && (
              <button onClick={() => go('/conductor-notificaciones')} className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors">Notificaciones</button>
            )}
            <div className="border-t border-gray-200 my-1" />
            <button onClick={handleLogout}                       className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors">Cerrar sesión</button>
          </div>
        )}
      </div>
    </>
  );
};

export default UserMenu;
