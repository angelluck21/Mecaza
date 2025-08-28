import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Estilos CSS para las animaciones y z-index
const userMenuStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out;
  }
  
  .user-menu-container {
    position: relative;
    z-index: 999999 !important;
  }
  
  .user-menu-dropdown {
    position: absolute !important;
    z-index: 999999 !important;
    top: 100% !important;
    right: 0 !important;
    min-width: 12rem !important;
    background-color: white !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 0.5rem !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
    margin-top: 0.5rem !important;
  }
`;

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

  const handleNotifications = () => {
    setOpen(false);
    navigate('/conductor-notificaciones'); // Ruta a las notificaciones del conductor
  };

  return (
    <>
      <style>{userMenuStyles}</style>
      <div className="user-menu-container" ref={menuRef}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors focus:outline-none"
        >
          <FaUserCircle className="text-blue-900 text-2xl" />
          <span className="font-semibold text-blue-900">Hola, {userData?.Nombre || 'Usuario'}</span>
        </button>
        {open && (
          <div className="user-menu-dropdown animate-fade-in">
            <button
              onClick={handleProfile}
              className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors"
            >
              Ver perfil
            </button>
            {/* Solo mostrar "Mis Reservas" para usuarios que NO sean conductores */}
            {userData?.rol !== 'conductor' && (
              <button
                onClick={handleMyReservations}
                className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors"
              >
                Mis Reservas
              </button>
            )}
            {(userData?.rol === 'conductor' || userData?.rol === 'admin') && (
              <button
                onClick={handleNotifications}
                className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-900 transition-colors"
              >
                Notificaciones
              </button>
            )}
           
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default UserMenu; 