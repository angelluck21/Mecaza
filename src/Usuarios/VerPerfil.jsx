import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaUser, FaEnvelope, FaCog, FaArrowLeft, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';
import axios from 'axios';

const VerPerfil = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const navigate = useNavigate();


useEffect(() => {
  const fetchUserData = async () => {
    try {
      // Obtener datos del usuario del localStorage
      const storedUserData = localStorage.getItem('userData');
      const authToken = localStorage.getItem('authToken');
      
      if (!storedUserData || !authToken) {
        console.log('No hay datos de usuario o token, redirigiendo al login');
        navigate('/login');
        return;
      }

      const user = JSON.parse(storedUserData);
      const userId = user.id_users || user.id || user.ID || user.id_user || user.user_id || user.userId;
      
      if (!userId) {
        console.error('No se pudo identificar el ID del usuario');
        navigate('/login');
        return;
      }

      // Hacer petición al backend para obtener datos actualizados
      console.log('🔄 Sincronizando datos del usuario con la base de datos...');
      const response = await axios.get('http://127.0.0.1:8000/api/listarusuario', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.data) {
        // Buscar el usuario actual en la lista de usuarios
        const usuarios = response.data.data;
        const userDataActualizado = usuarios.find(u => 
          (u.id_users || u.id || u.ID || u.id_user || u.user_id || u.userId) == userId
        );
        
        if (userDataActualizado) {
          console.log('✅ Datos actualizados del backend:', userDataActualizado);
          
          // Actualizar localStorage con los datos frescos
          localStorage.setItem('userData', JSON.stringify(userDataActualizado));
          setUserData(userDataActualizado);
        } else {
          console.log('⚠️ Usuario no encontrado en la lista, usando datos del localStorage');
          setUserData(user);
        }
      } else {
        console.log('⚠️ Error en la respuesta del backend, usando datos del localStorage');
        setUserData(user);
      }
      
    } catch (error) {
      console.error('Error al sincronizar datos del usuario:', error);
      // Fallback: usar datos del localStorage
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        setUserData(user);
      } else {
        navigate('/login');
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  fetchUserData();
}, [navigate]);

  const handleGoBack = () => {
    navigate(-1); // Regresar a la página anterior
  };

  const handleEditProfile = () => {
    navigate('/ajustes-perfil');
  };

  const showToastNotification = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const closeNotification = () => {
    setShowNotification(false);
  };



  const handleDeleteProfile = async () => {
    if (!window.confirm('⚠️ ¿Estás completamente seguro de que deseas eliminar tu cuenta?\n\nEsta acción es irreversible y se perderá toda tu información, reservas y datos del sistema.\n\n¿Deseas continuar?')) {
      return;
    }

    try {
      // Obtener el ID del usuario del localStorage
      const storedUserData = localStorage.getItem('userData');
      const user = JSON.parse(storedUserData);
      
      // Debug: Mostrar toda la estructura del usuario
      console.log('Datos completos del usuario:', user);
      console.log('Claves disponibles:', Object.keys(user));
      
      // Intentar obtener el ID de diferentes formas posibles
      const userId = user.id_users || user.id || user.ID || user.id_user || user.user_id || user.userId;
      const authToken = localStorage.getItem('authToken');
      
      console.log('ID del usuario a eliminar:', userId);
      console.log('Token de autenticación:', authToken ? 'Presente' : 'Ausente');

      if (!userId) {
        console.error('No se pudo encontrar el ID del usuario. Estructura disponible:', user);
        showToastNotification('No se pudo identificar tu cuenta de usuario. Por favor, contacta al soporte técnico.', 'error');
        return;
      }

      if (!authToken) {
        showToastNotification('Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.', 'warning');
        navigate('/login');
        return;
      }

      const response = await axios.delete(`http://127.0.0.1:8000/api/eliminarusuario/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      console.log('Usuario eliminado:', response.data);
      showToastNotification('Tu cuenta ha sido eliminada exitosamente del sistema Mecaza. Gracias por haber sido parte de nuestra comunidad.', 'success');
      
      // Limpiar localStorage y redirigir al login después de mostrar la notificación
      setTimeout(() => {
        localStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 401) {
          showToastNotification('Tu sesión ha expirado o no tienes permisos para realizar esta acción. Por favor, inicia sesión nuevamente.', 'error');
          navigate('/login');
        } else if (statusCode === 404) {
          showToastNotification('No se pudo encontrar tu cuenta en el sistema. Esto puede deberse a que ya fue eliminada o hay un problema con la base de datos.', 'error');
        } else if (statusCode === 500) {
          showToastNotification('Estamos experimentando problemas técnicos en este momento. Por favor, intenta nuevamente en unos minutos o contacta al soporte técnico.', 'error');
        } else {
          showToastNotification(`${error.response.data?.message || 'Ocurrió un problema inesperado al procesar tu solicitud.'} Por favor, intenta nuevamente o contacta al soporte.`, 'error');
        }
      } else if (error.request) {
        showToastNotification('No se pudo conectar con el servidor de Mecaza. Verifica tu conexión a internet y que el servicio esté disponible. Si el problema persiste, contacta al soporte técnico.', 'error');
      } else {
        showToastNotification(`Ocurrió un problema inesperado: ${error.message}. Por favor, intenta nuevamente o contacta al soporte técnico si el problema persiste.`, 'error');
      }
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
      {/* Notificación personalizada */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`rounded-lg shadow-2xl border-l-4 p-4 max-w-sm transform transition-all duration-300 ${
            notificationType === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : notificationType === 'error' 
              ? 'bg-red-50 border-red-500 text-red-800'
              : 'bg-yellow-50 border-yellow-500 text-yellow-800'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notificationType === 'success' ? (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : notificationType === 'error' ? (
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium leading-5">
                  {notificationMessage}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={closeNotification}
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  onClick={() => { localStorage.removeItem('userData'); localStorage.removeItem('authToken'); navigate('/index'); }}
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
                {userData.Nombre || userData.nombre || userData.name || userData.nombre_usuario || userData.nombreUsuario || userData.NOMBRE || 'Usuario'}
              </h2>
              <p className="text-gray-600 mb-4">
                {userData.rol === 'admin' ? 'Administrador' : 
                 userData.rol === 'conductor' ? 'Conductor' : 'Usuario'}
              </p>
              
              {/* Debug temporal para ver qué campos están disponibles */}
              <details className="mt-2 text-xs text-gray-500 cursor-pointer">
                <summary className="hover:text-blue-600">🔍 Debug: Ver campos disponibles</summary>
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-left">
                  <div><strong>Nombre:</strong> {userData.Nombre || 'null'}</div>
                  <div><strong>nombre:</strong> {userData.nombre || 'null'}</div>
                  <div><strong>name:</strong> {userData.name || 'null'}</div>
                  <div><strong>nombre_usuario:</strong> {userData.nombre_usuario || 'null'}</div>
                  <div><strong>nombreUsuario:</strong> {userData.nombreUsuario || 'null'}</div>
                  <div><strong>NOMBRE:</strong> {userData.NOMBRE || 'null'}</div>
                  <div><strong>Rol:</strong> {userData.rol || 'null'}</div>
                  <div><strong>ID:</strong> {userData.id_users || userData.id || userData.ID || 'null'}</div>
                </div>
              </details>
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
                  <label className="block text-sm font-medium text-gray-500">Número de Usuario</label>
                  <p className="text-gray-900 font-medium">{userData.id_users || userData.id || userData.ID || userData.id_user || userData.user_id || userData.userId || 'No disponible'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nombre</label>
                  <p className="text-gray-900 font-medium">{userData.Nombre || userData.nombre || userData.name || userData.nombre_usuario || userData.nombreUsuario || userData.NOMBRE || 'No especificado'}</p>
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
                      <label className="block text-sm font-medium text-gray-500">Número de Teléfono</label>
                      <p className="text-gray-900 font-medium">
                        {userData.tel || userData.Telefono || userData.telefono || userData.phone || userData.TELEFONO || 'No registrado'}
                      </p>
                  
                      

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
