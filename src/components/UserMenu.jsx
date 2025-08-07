import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const UserMenu = ({ userData }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar el menú si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setOpen(false);
    navigate('/login');
  };

  const handleProfile = () => {
    setOpen(false);
    navigate('/ver-perfil'); // Ruta a la página de ver perfil
  };

  const handleSettings = () => {
    setOpen(false);
    navigate('/ajustes-perfil'); // Ruta a la página de ajustes de perfil
  };

  const handleMyReservations = () => {
    setOpen(false);
    navigate('/mis-reservas'); // Ruta a la página de mis reservas
  };

  return (
    <div className="relative" ref={menuRef} style={{ zIndex: 50 }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors focus:outline-none"
        style={{ zIndex: 50 }}
      >
        <FaUserCircle className="text-blue-900 text-2xl" />
        <span className="font-semibold text-blue-900">Hola, {userData?.Nombre || 'Usuario'}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border animate-fade-in"
          style={{ zIndex: 50 }}
        >
          <button
            onClick={handleProfile}
            className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-900"
          >
            Ver perfil
          </button>
          <button
            onClick={handleMyReservations}
            className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-900"
          >
            Mis Reservas
          </button>
         
          <div className="border-t my-1" />
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 