import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaUser, FaEnvelope, FaCog, FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';
import axios from 'axios';

const VerPerfil = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener datos del usuario del localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        setUserData(user);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        navigate('/login');
        return;
      }
    } else {
      console.log('No hay datos de usuario, redirigiendo al login');
      navigate('/login');
      return;
    }
    setIsLoading(false);
  }, [navigate]);

  const handleGoBack = () => {
    navigate(-1); // Regresar a la página anterior
  };

  const handleEditProfile = () => {
    navigate('/ajustes-perfil');
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // Obtener el ID del usuario del localStorage
      const storedUserData = localStorage.getItem('userData');
      const user = JSON.parse(storedUserData);
      const userId = user.id_users || user.id || user.ID;
      
      console.log('Datos del usuario:', user);
      console.log('ID del usuario a eliminar:', userId);

      if (!userId) {
        alert('No se pudo obtener el ID del usuario');
        return;
      }

      const response = await axios.delete(`http://127.0.0.1:8000/api/eliminarusuario/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      console.log('Usuario eliminado:', response.data);
      alert('Tu cuenta ha sido eliminada exitosamente');
      
      // Limpiar localStorage y redirigir al login
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      navigate('/login');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert(`Error al eliminar la cuenta: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 relative overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y nombre */}
            <div className="flex items-center space-x-3">
              <FaCar className="text-blue-900 text-3xl drop-shadow-lg" />
              <span className="text-2xl font-bold text-blue-900">Mecaza</span>
            </div>

            {/* Navegación - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={handleGoBack}
                className="text-blue-900 hover:text-blue-700 font-medium transition-colors flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Volver
              </button>
              <UserMenu userData={userData} />
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
                <button
                  onClick={handleGoBack}
                  className="w-full text-left px-3 py-2 text-blue-900 hover:text-blue-700 font-medium flex items-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Volver
                </button>
                <button
                  onClick={() => { localStorage.removeItem('userData'); localStorage.removeItem('authToken'); navigate('/login'); }}
                  className="w-full text-left px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-8 transform transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
              Mi Perfil
            </h1>
            <p className="text-lg text-gray-600">
              Información de tu cuenta
            </p>
          </div>

          {/* Foto de perfil y información básica */}
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
            {/* Foto de perfil */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden shadow-lg">
                {userData.fotoPerfil ? (
                  <img 
                    src={userData.fotoPerfil} 
                    alt="Foto de perfil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-4xl text-blue-600" />
                )}
              </div>
            </div>

            {/* Información del usuario */}
                         <div className="flex-1 text-center md:text-left">
               <h2 className="text-2xl font-bold text-gray-900 mb-2">
                 {userData.Nombre || userData.nombre || userData.name || 'Usuario'}
               </h2>
              <p className="text-gray-600 mb-4">
                {userData.rol === 'admin' ? 'Administrador' : 
                 userData.rol === 'conductor' ? 'Conductor' : 'Usuario'}
              </p>
            </div>
          </div>

          {/* Detalles del perfil */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Información personal */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                Información Personal
              </h3>
                             <div className="space-y-3">
                 <div>
                   <label className="block text-sm font-medium text-gray-500">ID de Usuario</label>
                   <p className="text-gray-900 font-medium">{userData.id_users || userData.id || userData.ID || 'No disponible'}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-500">Nombre</label>
                   <p className="text-gray-900 font-medium">{userData.Nombre || userData.nombre || userData.name || 'No especificado'}</p>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-500">Rol</label>
                   <p className="text-gray-900 font-medium">
                     {userData.rol === 'admin' ? 'Administrador' : 
                      userData.rol === 'conductor' ? 'Conductor' : 'Usuario'}
                   </p>
                 </div>
               </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaEnvelope className="mr-2 text-blue-600" />
                Información de Contacto
              </h3>
              <div className="space-y-3">
                                 <div>
                   <label className="block text-sm font-medium text-gray-500">Correo electrónico</label>
                   <p className="text-gray-900 font-medium">{userData.Correo || userData.correo || userData.email || userData.Email || 'No especificado'}</p>
                 </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Estado de la cuenta</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activa
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaCog className="mr-2 text-blue-600" />
              Información de la Cuenta
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Tipo de cuenta</label>
                <p className="text-gray-900 font-medium">
                    {userData.rol === 'admin' ? 'Cuenta Administrativa' : 
                   userData.rol === 'conductor' ? 'Cuenta de Conductor' : 'Cuenta de Usuario'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Acceso</label>
                <p className="text-gray-900 font-medium">
                  {userData.rol === 'admin' ? 'Panel Administrativo' : 
                   userData.rol === 'conductor' ? 'Panel de Conductor' : 'Acceso General'}
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={handleEditProfile}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
            >
              <FaEdit className="mr-2" />
              Editar Perfil
            </button>
            <button
              onClick={handleGoBack}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors font-semibold flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" />
              Volver
            </button>
            <button
              onClick={handleDeleteProfile}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center"
            >
              <FaTrash className="mr-2" />
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerPerfil;
