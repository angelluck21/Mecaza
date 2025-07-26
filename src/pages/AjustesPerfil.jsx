import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaUser, FaEnvelope, FaLock, FaSave, FaArrowLeft, FaCamera } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';
import axios from 'axios';

const AjustesPerfil = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Estado del formulario simplificado
  const [profileData, setProfileData] = useState({
    nombre: '',
    email: '',
    contrasena: '',
    confirmarContrasena: ''
  });

  // Estado para la imagen de perfil
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    // Obtener datos del usuario del localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        setUserData(user);
        
        // Cargar datos del perfil
        setProfileData({
          nombre: user.Nombre || '',
          email: user.Correo || '',
          contrasena: '',
          confirmarContrasena: ''
        });

        // Cargar imagen de perfil si existe
        if (user.fotoPerfil) {
          setImagePreview(user.fotoPerfil);
        }
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

  const showToastNotification = (message, type = 'success') => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (profileData.contrasena && profileData.contrasena !== profileData.confirmarContrasena) {
      showToastNotification('Las contraseñas no coinciden', 'error');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Preparar datos para enviar (solo enviar contraseña si se cambió)
      const dataToSend = {
        nombre: profileData.nombre,
        email: profileData.email
      };
      
      if (profileData.contrasena) {
        dataToSend.contrasena = profileData.contrasena;
      }
      
      // Si hay una nueva imagen, subirla primero
      if (profileImage) {
        const formData = new FormData();
        formData.append('foto_perfil', profileImage);
        formData.append('user_id', userData.id || userData.Correo);

        const imageResponse = await fetch('http://127.0.0.1:8000/api/actualizar-foto-perfil', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (!imageResponse.ok) {
          throw new Error('Error al subir la imagen de perfil');
        }
      }
      
      // Enviar datos del perfil
      const response = await axios.put('http://127.0.0.1:8000/api/actualizar-perfil', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      console.log('Perfil actualizado:', response.data);
      showToastNotification('¡Perfil actualizado exitosamente! ✅');
      
      // Actualizar datos en localStorage
      const updatedUserData = {
        ...userData,
        Nombre: profileData.nombre,
        Correo: profileData.email,
        fotoPerfil: imagePreview // Guardar la nueva imagen
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      
      // Limpiar campos de contraseña
      setProfileData({
        ...profileData,
        contrasena: '',
        confirmarContrasena: ''
      });
      
      // Limpiar imagen temporal
      setProfileImage(null);
      
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      showToastNotification('Error al actualizar el perfil. Inténtalo de nuevo.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Regresar a la página anterior
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
      {/* Notificación Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-white rounded-lg shadow-2xl border-l-4 border-green-500 p-4 max-w-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaUser className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {notificationMessage}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setShowNotification(false)}
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
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

      {/* Contenido principal */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-8 transform transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
              Ajustes de Perfil
            </h1>
            <p className="text-lg text-gray-600">
              Modifica tu nombre, email, contraseña y foto de perfil
            </p>
          </div>

          {/* Foto de perfil */}
          <div className="flex flex-col items-center space-y-4 mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden shadow-lg">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Foto de perfil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-4xl text-blue-600" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                <FaCamera className="text-sm" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 text-center">Haz clic en la cámara para cambiar tu foto</p>
          </div>

          {/* Formulario simplificado */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={profileData.nombre}
                  onChange={(e) => setProfileData({...profileData, nombre: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Contraseña actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña (opcional)</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="password"
                  value={profileData.contrasena}
                  onChange={(e) => setProfileData({...profileData, contrasena: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deja vacío si no quieres cambiar"
                />
              </div>
            </div>

            {/* Confirmar contraseña */}
            {profileData.contrasena && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="password"
                    value={profileData.confirmarContrasena}
                    onChange={(e) => setProfileData({...profileData, confirmarContrasena: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Repite la nueva contraseña"
                    required={!!profileData.contrasena}
                  />
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave className="mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={handleGoBack}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors font-semibold flex items-center justify-center"
              >
                <FaArrowLeft className="mr-2" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AjustesPerfil; 