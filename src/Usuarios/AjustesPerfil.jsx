import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaUser, FaEnvelope, FaLock, FaSave, FaArrowLeft, FaCamera, FaPhone } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';
import axios from 'axios';

const AjustesPerfil = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();


 
  const [profileData, setProfileData] = useState({
    user: '',
    nombre: '',
    email: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');
    
    if (!storedUserData || !authToken) {
      console.log('No hay datos de usuario o token, redirigiendo al login');
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(storedUserData);
      
      // Verificar que el usuario tenga un ID válido
      const userId = user.id || user.id_users || user.ID || user.user_id || user.userId;
      
      console.log('=== DEBUG AJUSTES PERFIL ===');
      console.log('Usuario completo:', user);
      console.log('ID extraído:', userId);
      console.log('Token presente:', !!authToken);
      console.log('============================');
      
      if (!userId) {
        console.error('Usuario sin ID válido:', user);
        navigate('/login');
        return;
      }
      
      setUserData(user);
      
             setProfileData({
         user: userId,
         nombre: user.Nombre || user.nombre || user.name || '',
         email: user.Correo || user.correo || user.email || user.Email || '',
         telefono: user.Telefono || user.telefono || user.tel || user.phone || '',
         contrasena: '',
         confirmarContrasena: ''
       });

      if (user.fotoPerfil) {
        setImagePreview(user.fotoPerfil);
      }
      
    } catch (error) {
      console.error('Error al parsear datos del usuario:', error);
      navigate('/login');
      return;
    }
    
    setIsLoading(false);
  }, [navigate]);

  const showToastNotification = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000); // 5 segundos como en el login
  };

  // Función auxiliar para obtener el teléfono del usuario
  const getUserPhone = (user) => {
    const phone = user.Telefono || user.telefono || user.tel || user.phone;
    return phone && phone.trim() !== '' ? phone : 'Sin teléfono';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (profileData.contrasena && profileData.contrasena !== profileData.confirmarContrasena) {
      showToastNotification('Las contraseñas no coinciden', 'error');
      return;
    }
    
    setIsSaving(true);
    
    try {

      const storedUserData = localStorage.getItem('userData');
      const user = JSON.parse(storedUserData);
      
                          const dataToSend = {
          Nombre: profileData.nombre,      // Campo requerido
          Correo: profileData.email,       // Campo requerido
          Rol: user.rol || user.Rol || 'usuario',  // Campo requerido - no editable
          Telefono: profileData.telefono || getUserPhone(user)  // Campo requerido - valor por defecto
        };
       
       if (profileData.contrasena) {
         dataToSend.Contrasena = profileData.contrasena;  // Campo opcional
       }
      
      // Obtener el ID del usuario del localStorage
      const userId = user.id || user.id_users || user.ID || user.user_id || user.userId;
      
      if (profileImage) {
        const formData = new FormData();
        formData.append('foto_perfil', profileImage);
        formData.append('user_id', userId);

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
        
                                   console.log('=== DEBUG ACTUALIZAR PERFIL ===');
          console.log('Usuario completo del localStorage:', user);
          console.log('ID del usuario extraído:', userId);
          console.log('Datos a enviar:', dataToSend);
          console.log('Teléfono del usuario original:', getUserPhone(user));
          console.log('Teléfono del formulario:', profileData.telefono);
          console.log('Teléfono final enviado:', dataToSend.Telefono);
          console.log('Token de autorización:', localStorage.getItem('authToken') ? 'Presente' : 'Ausente');
          console.log('URL de la petición:', `http://127.0.0.1:8000/api/actualizarusuario/${userId}`);
          console.log('Headers de la petición:', {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          });
          console.log('================================');
        
        if (!userId) {
          throw new Error('No se pudo identificar el ID del usuario');
        }
        
        const response = await axios.put(`http://127.0.0.1:8000/api/actualizarusuario/${userId}`, dataToSend, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
      
      showToastNotification('¡Perfil actualizado exitosamente! ✅');
      
      const updatedUserData = {
        ...userData,
        Nombre: profileData.nombre,
        Correo: profileData.email,
        fotoPerfil: imagePreview
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      
             setProfileData({
         ...profileData,
         contrasena: '',
         confirmarContrasena: '',
         telefono: profileData.telefono  // Mantener el teléfono
       });
      
      setProfileImage(null);
      
         } catch (error) {
       console.error('Error completo al actualizar perfil:', error);
       
       if (error.response) {
         // El servidor respondió con un código de estado de error
         const statusCode = error.response.status;
         const errorData = error.response.data;
         
         console.log('=== ERROR DEL SERVIDOR ===');
         console.log('Status:', statusCode);
         console.log('Datos del error:', errorData);
         console.log('==========================');
         
         if (statusCode === 500) {
           showToastNotification('Error interno del servidor. Por favor, contacta al administrador del sistema.', 'error');
         } else if (statusCode === 400) {
           showToastNotification(`Error en los datos enviados: ${errorData.message || 'Datos inválidos'}`, 'error');
         } else if (statusCode === 401) {
           showToastNotification('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error');
           navigate('/login');
         } else if (statusCode === 404) {
           showToastNotification('Usuario no encontrado en el sistema.', 'error');
         } else {
           showToastNotification(`Error del servidor (${statusCode}): ${errorData.message || 'Error desconocido'}`, 'error');
         }
       } else if (error.request) {
         // La petición se hizo pero no se recibió respuesta
         console.error('No se recibió respuesta del servidor:', error.request);
         showToastNotification('No se pudo conectar con el servidor. Verifica tu conexión a internet.', 'error');
       } else {
         // Error en la configuración de la petición
         console.error('Error en la configuración de la petición:', error.message);
         showToastNotification(`Error de configuración: ${error.message}`, 'error');
       }
     } finally {
       setIsSaving(false);
     }
  };

  const handleGoBack = () => {
    navigate(-1);
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
      {showNotification && (
        <div className={`fixed top-6 right-6 z-50 max-w-sm w-full transform transition-all duration-500 ease-out ${
          showNotification ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
        }`}>
          <div className={`relative overflow-hidden rounded-2xl shadow-2xl border ${
            notificationType === 'success'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400' 
              : 'bg-gradient-to-r from-red-500 to-pink-600 border-red-400'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            
            <div className="relative p-6 flex items-start space-x-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                'bg-white/20 backdrop-blur-sm'
              }`}>
                <FaCar className={`text-2xl text-white`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-lg font-semibold text-white`}>
                  {notificationType === 'success' ? '¡Éxito!' : 'Error'}
                </p>
                                <p className={`text-sm mt-1 ${
                  notificationType === 'success' ? 'text-green-100' : 'text-red-100'
                }`}>
                  {notificationMessage}
                </p>
              </div>
              
              <button
                onClick={() => setShowNotification(false)}
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/20 text-white`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoinjoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={`h-1 ${
              notificationType === 'success' ? 'bg-green-400' : 'bg-red-400'
            }`}>
              <div className={`h-full bg-white animate-pulse`} style={{animationDuration: '4s'}}></div>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FaCar className="text-blue-900 text-3xl drop-shadow-lg" />
              <span className="text-2xl font-bold text-blue-900">Mecaza</span>
            </div>

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

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-blue-900 hover:text-blue-700 p-2"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>

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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-8 transform transition-all duration-300">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
              Ajustes de Perfil
            </h1>
            <p className="text-lg text-gray-600">
              Modifica tu nombre, email, contraseña y foto de perfil
            </p>
          </div>

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

          <form onSubmit={handleSaveProfile} className="space-y-6">
           

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

            {/* Campo de Rol - No editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol de Usuario</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={userData.rol === 'admin' ? 'Administrador' : 
                         userData.rol === 'conductor' ? 'Conductor' : 'Usuario'}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                El rol no se puede modificar desde esta interfaz
              </p>
            </div>

            {/* Campo de Teléfono - Opcional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="tel"
                  value={profileData.telefono || ''}
                  onChange={(e) => setProfileData({...profileData, telefono: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tu número de teléfono"
                />
              </div>
             
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña  </label>
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