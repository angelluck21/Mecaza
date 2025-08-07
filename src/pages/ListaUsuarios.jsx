import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaUser, FaEnvelope, FaPhone, FaEye, FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';
import axios from 'axios';

const ListaUsuarios = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación
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
      navigate('/login');
      return;
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (userData) {
      fetchUsers();
    }
  }, [userData]);

  useEffect(() => {
    // Filtrar usuarios basado en el término de búsqueda
    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id?.toString().includes(searchTerm) ||
      user.rol?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/usuarios', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
        showToastNotification(`Se cargaron ${response.data.total} usuarios exitosamente`);
      } else {
        showToastNotification('Error al cargar usuarios', 'error');
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      showToastNotification('Error de conexión al cargar usuarios', 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const showToastNotification = (message, type = 'success') => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const handleViewUser = (userId) => {
    navigate(`/usuario/${userId}`);
  };

  const handleEditUser = (userId) => {
    navigate(`/editar-usuario/${userId}`);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/usuarios/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.data.success) {
          showToastNotification('Usuario eliminado exitosamente');
          fetchUsers(); // Recargar la lista
        } else {
          showToastNotification(response.data.message || 'Error al eliminar usuario', 'error');
        }
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        showToastNotification('Error al eliminar el usuario', 'error');
      }
    }
  };

  const getRolBadgeColor = (rol) => {
    switch (rol?.toLowerCase()) {
      case 'conductor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'usuario':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
                onClick={() => navigate(-1)}
                className="text-blue-900 hover:text-blue-700 font-medium transition-colors flex items-center"
              >
                ← Volver
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
                  onClick={() => navigate(-1)}
                  className="w-full text-left px-3 py-2 text-blue-900 hover:text-blue-700 font-medium"
                >
                  ← Volver
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-xl p-8 transform transition-all duration-300">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-900 mb-2">
                Lista de Usuarios
              </h1>
              <p className="text-lg text-gray-600">
                Gestiona todos los usuarios registrados en el sistema
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => navigate('/registro')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center"
              >
                <FaPlus className="mr-2" />
                Agregar Usuario
              </button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email, ID o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="overflow-x-auto">
            {isLoadingUsers ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500 text-lg">Cargando usuarios...</div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <FaUser className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'No hay usuarios registrados.'}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{user.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FaUser className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaPhone className="mr-2 text-gray-400" />
                          {user.tel || 'Sin teléfono'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRolBadgeColor(user.rol)}`}>
                          {user.rol || 'Sin rol'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewUser(user.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Ver detalles"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Editar"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Eliminar"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-6 text-sm text-gray-500 text-center">
            Mostrando {filteredUsers.length} de {users.length} usuarios
            {searchTerm && ` (filtrados por "${searchTerm}")`}
          </div>
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

export default ListaUsuarios; 