import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCar, FaPlus, FaEnvelope, FaUsers, FaCog, FaMapMarkerAlt, FaClock, FaUserFriends, FaDollarSign, FaUser, FaBell, FaCheck, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import UserMenu from '../components/UserMenu';
import axios from 'axios';


const Conductor = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [showReservasModal, setShowReservasModal] = useState(false);
  const [reservas, setReservas] = useState([]);
  const [isLoadingReservas, setIsLoadingReservas] = useState(false);
  const [showCarrosModal, setShowCarrosModal] = useState(false);
  const [carros, setCarros] = useState([]);
  const [isLoadingCarros, setIsLoadingCarros] = useState(false);
  const [showUpdateEstadoModal, setShowUpdateEstadoModal] = useState(false);
  const [selectedCarro, setSelectedCarro] = useState(null);
  const [newEstado, setNewEstado] = useState('');
  const [estados, setEstados] = useState([]);
  const [isLoadingEstados, setIsLoadingEstados] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [carroToDelete, setCarroToDelete] = useState(null);
  const [isDeletingCarro, setIsDeletingCarro] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [carData, setCarData] = useState({
    Placa: '',
    Conductor: '', // Valor por defecto para evitar null
    Imagencarro: '',
    Asientos: '',
    Destino: '',
    Horasalida: '',
    Fecha: '',
    Telefono: '',
     // Valor por defecto para evitar null
  });
  

  
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      console.log('No hay token de autenticación');
      navigate('/login');
      return;
    }
    
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        
        // Verificar si es conductor o admin
        if (user.rol === 'conductor' || user.rol === 'admin') {
          setUserData(user);
        } else {
          showAuthError('No tienes permisos para acceder al panel de conductor');
          navigate('/indexLogin');
        }
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        navigate('/login');
      }
    } else {
      console.log('No hay datos de usuario almacenados');
      navigate('/login');
    }
    setIsLoading(false);
  }, [navigate]);

  // Cargar estados automáticamente cuando se abra el modal
  useEffect(() => {
    if (showUpdateEstadoModal) {
      handleGetEstados();
    }
  }, [showUpdateEstadoModal]);

  // Cargar estados automáticamente cuando se abra el modal de agregar carro
  useEffect(() => {
    if (showAddCarModal) {
      handleGetEstados();
      
      // Pre-llenar el campo Conductor con el nombre del usuario logueado
      const conductorLogueado = userData?.Nombre || userData?.nombre || userData?.name || '';
      if (conductorLogueado) {
        setCarData(prev => ({
          ...prev,
          Conductor: conductorLogueado
        }));
        console.log('Campo Conductor pre-llenado con:', conductorLogueado);
      }
    }
  }, [showAddCarModal, userData]);

  const _handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    setUserData(null);
    navigate('/');
  };

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (ya se redirigió)
  if (!userData) {
    return null;
  }

  // Función para comprimir imagen
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones (máximo 800px de ancho)
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a blob con calidad 0.7 (70%)
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, 'image/jpeg', 0.7);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const showToastNotification = (message, type = 'success') => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000); // Aumentado a 5 segundos para mejor legibilidad
  };

  // Función para mostrar notificación de error de autorización
  const showAuthError = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000); // Más tiempo para mensajes de error
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    
    // Validación de campos requeridos
    if (!carData.Conductor || carData.Conductor.trim() === '' ||
        !carData.Placa || carData.Placa.trim() === '' || 
        !carData.Asientos || carData.Asientos.trim() === '' || 
        !carData.Destino || carData.Destino.trim() === '' || 
        !carData.Horasalida || carData.Horasalida.trim() === '' || 
        !carData.Fecha || carData.Fecha.trim() === '' || 
        !carData.Telefono || carData.Telefono.trim() === '' ||
        !carData.Estado || carData.Estado === '') {
      showToastNotification('Por favor, completa todos los campos requeridos incluyendo el estado del carro', 'error');
      return;
    }
    
    try {
      // Obtener el ID del usuario logueado
      const userId = userData.id || userData.id_users || userData.ID || userData.user_id || userData.userId;
      
      if (!userId) {
        showToastNotification('Error: No se pudo identificar tu cuenta de usuario. Por favor, inicia sesión nuevamente.', 'error');
        return;
      }
      
      // Verificar que el ID sea un número válido
      if (isNaN(userId) || userId <= 0) {
        showToastNotification('Error: ID de usuario inválido. Por favor, inicia sesión nuevamente.', 'error');
        return;
      }
      
      // Convertir a número si es string
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum) || userIdNum <= 0) {
        showToastNotification('Error: ID de usuario inválido. Por favor, inicia sesión nuevamente.', 'error');
        return;
      }
      
      // Verificar que el conductor sea el usuario logueado
      const conductorLogueado = userData.Nombre || userData.nombre || userData.name;
      if (carData.Conductor.trim() !== conductorLogueado) {
        showToastNotification('Error: El nombre del conductor debe coincidir con tu nombre de usuario', 'error');
        return;
      }
      
      console.log('ID del usuario logueado (original):', userId);
      console.log('ID del usuario logueado (convertido):', userIdNum);
      console.log('userData completo:', userData);
      console.log('Conductor logueado:', conductorLogueado);
      console.log('Conductor en formulario:', carData.Conductor.trim());
      
      // Crear FormData para enviar datos con imagen
      const formData = new FormData();
      formData.append('Conductor', carData.Conductor.trim());
      formData.append('Telefono', carData.Telefono.trim());
      formData.append('Placa', carData.Placa.trim());
      formData.append('Asientos', carData.Asientos);
      formData.append('Destino', carData.Destino.trim());
      formData.append('Horasalida', carData.Horasalida.trim());
      formData.append('Fecha', carData.Fecha.trim());
      formData.append('Estado', carData.Estado);
      formData.append('Userid', userIdNum);
      
      // Agregar imagen si existe (comprimida)
      if (carData.Imagencarro) {
        const compressedImage = await compressImage(carData.Imagencarro);
        formData.append('Imagencarro', compressedImage);
      }
      
      console.log('FormData a enviar:', formData);
      console.log('Estado seleccionado:', carData.Estado);
      console.log('ID del usuario a enviar:', userId);
      console.log('Enviando petición a:', 'http://127.0.0.1:8000/api/agregarcarros');
      
      // Verificar cada campo del FormData
      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value);
      }
      
      // Verificar que el Userid esté presente
      const formDataUserId = formData.get('Userid');
      console.log('Userid en FormData:', formDataUserId);
      console.log('Tipo de Userid:', typeof formDataUserId);
      
      // Enviar datos al endpoint que conecta con AgregarcarrosController::Create
      const response = await axios.post('http://127.0.0.1:8000/api/agregarcarros', formData, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data && response.data.success) {
        showToastNotification('¡Vehículo registrado exitosamente! 🚗');
        
        // Limpiar formulario
        setCarData({
          Placa: '',
          Conductor: '',
          Imagencarro: '',
          Asientos: '',
          Destino: '',
          Horasalida: '',
          Fecha: '',
          Telefono: '',
          Estado: '',
        });
        
        // Cerrar modal automáticamente
        setShowAddCarModal(false);
      } else {
        showToastNotification('Advertencia: El servidor no confirmó el registro', 'error');
      }
      
    } catch (error) {
      console.error('Error al guardar carro:', error);
      
      if (error.response) {
        if (error.response.status === 500) {
          showToastNotification('Error del servidor: Verifica que el controlador esté configurado correctamente', 'error');
        } else if (error.response.status === 422) {
          showToastNotification('Error de validación: Verifica los datos enviados', 'error');
        } else {
          showToastNotification(`Error: ${error.response.data?.message || 'No se pudo guardar el vehículo'}`, 'error');
        }
      } else if (error.request) {
        showToastNotification('Error de conexión. Verifica que el servidor esté ejecutándose.', 'error');
      } else {
        showToastNotification('Error inesperado al guardar el vehículo', 'error');
      }
    }
  };

  const handleViewReservas = async () => {
    setIsLoadingReservas(true);
    setShowReservasModal(true);
    
    try {
      // Obtener todas las reservas
      const reservasResponse = await axios.get('http://127.0.0.1:8000/api/listarreserva', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      console.log('Todas las reservas obtenidas:', reservasResponse.data);
      
      // Obtener todos los carros
      const carrosResponse = await axios.get('http://127.0.0.1:8000/api/listarcarro', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      console.log('Todos los carros obtenidos:', carrosResponse.data);
      
      // Procesar las respuestas
      let reservasArray = [];
      if (reservasResponse.data && Array.isArray(reservasResponse.data)) {
        reservasArray = reservasResponse.data;
      } else if (reservasResponse.data && Array.isArray(reservasResponse.data.data)) {
        reservasArray = reservasResponse.data.data;
      } else if (reservasResponse.data && reservasResponse.data.data) {
        reservasArray = [reservasResponse.data.data];
      }
      
      let carrosArray = [];
      if (carrosResponse.data && Array.isArray(carrosResponse.data)) {
        carrosArray = carrosResponse.data;
      } else if (carrosResponse.data && Array.isArray(carrosResponse.data.data)) {
        carrosArray = carrosResponse.data.data;
      } else if (carrosResponse.data && carrosResponse.data.data) {
        carrosArray = [carrosResponse.data.data];
      }
      
      console.log('Reservas procesadas:', reservasArray);
      console.log('Carros procesados:', carrosArray);
      
      // Obtener el nombre del conductor logueado
      const conductorLogueado = userData.Nombre || userData.nombre || '';
      console.log('Conductor logueado:', conductorLogueado);
      
      // Filtrar solo los carros del conductor logueado
      const carrosDelConductor = carrosArray.filter(carro => {
        const conductorCarro = carro.conductor || carro.Conductor || '';
        const perteneceAlConductor = conductorCarro.toLowerCase().includes(conductorLogueado.toLowerCase()) ||
                                    conductorLogueado.toLowerCase().includes(conductorCarro.toLowerCase());
        
        console.log(`Carro ${carro.placa || carro.Placa}: Conductor "${conductorCarro}" vs Logueado "${conductorLogueado}" -> ${perteneceAlConductor}`);
        
        return perteneceAlConductor;
      });
      
      console.log('Carros del conductor logueado:', carrosDelConductor);
      console.log('Total de carros del conductor:', carrosDelConductor.length);
      
      // Obtener los IDs de los carros del conductor
      const idsCarrosConductor = carrosDelConductor.map(carro => 
        carro.id_carros || carro.id
      );
      
      console.log('IDs de carros del conductor:', idsCarrosConductor);
      
      // Filtrar solo las reservas de los carros del conductor
      const reservasDelConductor = reservasArray.filter(reserva => {
        const carroId = reserva.id_carros || reserva.id_carro || reserva.carro_id;
        const perteneceAlConductor = idsCarrosConductor.includes(carroId);
        
        console.log(`Reserva ${reserva.id || 'N/A'}: Carro ID ${carroId} -> ${perteneceAlConductor ? 'PERTENECE' : 'NO PERTENECE'} al conductor`);
        
        return perteneceAlConductor;
      });
      
      console.log('Reservas del conductor logueado:', reservasDelConductor);
      console.log('Total de reservas del conductor:', reservasDelConductor.length);
      
      // Enriquecer las reservas con información completa del carro
      const reservasEnriquecidas = reservasDelConductor.map(reserva => {
        const carroId = reserva.id_carros || reserva.id_carro || reserva.carro_id;
        const carroEncontrado = carrosDelConductor.find(carro => 
          (carro.id_carros || carro.id) == carroId
        );
        
        console.log(`Reserva ${reserva.id || 'N/A'}: Encontrado carro:`, carroEncontrado);
        
        const carroInfo = {
          id: carroEncontrado ? (carroEncontrado.id_carros || carroEncontrado.id) : 'N/A',
          placa: carroEncontrado ? (carroEncontrado.placa || carroEncontrado.Placa) : 'N/A',
          conductor: carroEncontrado ? (carroEncontrado.conductor || carroEncontrado.Conductor) : 'N/A'
        };
        
        console.log(`Reserva ${reserva.id || 'N/A'}: Info del carro enriquecida:`, carroInfo);
        
        return {
          ...reserva,
          carroInfo
        };
      });
      
      console.log('Reservas enriquecidas del conductor:', reservasEnriquecidas);
      console.log('Total de reservas enriquecidas:', reservasEnriquecidas.length);
      
      setReservas(reservasEnriquecidas);
      
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      console.log('Error response:', error.response);
      
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 400) {
          showToastNotification('Error 400: Solicitud incorrecta al cargar reservas. Verifica tu autenticación.', 'error');
        } else if (statusCode === 401) {
          showToastNotification('Error 401: No autorizado. Inicia sesión nuevamente.', 'error');
          navigate('/login');
        } else if (statusCode === 500) {
          showToastNotification('Error del servidor al cargar reservas. Intenta nuevamente.', 'error');
        } else {
          showToastNotification(`Error ${statusCode}: ${error.response.data?.message || 'Error desconocido'}`, 'error');
        }
      } else {
        showToastNotification('Error de conexión al cargar las reservas', 'error');
      }
      setReservas([]);
    } finally {
      setIsLoadingReservas(false);
    }
  };

  const handleViewCarros = async () => {
    setIsLoadingCarros(true);
    setShowCarrosModal(true);
    
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/listarcarro', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      console.log('Carros obtenidos:', response.data);
      
      // Manejar diferentes estructuras de respuesta
      let carrosArray = [];
      if (response.data && Array.isArray(response.data)) {
        carrosArray = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        carrosArray = response.data.data;
      } else if (response.data && response.data.data) {
        carrosArray = [response.data.data];
      } else {
        carrosArray = [];
      }
      
      console.log('Carros procesados:', carrosArray);
      console.log('Ejemplo de carro:', carrosArray[0]);
      
      // Filtrar solo los carros del conductor logueado
      let carrosDelConductor = carrosArray.filter(carro => {
        const conductorCarro = carro.conductor || carro.Conductor || '';
        const conductorLogueado = userData.Nombre || userData.nombre || '';
        
        console.log(`Comparando: "${conductorCarro}" con "${conductorLogueado}"`);
        
        // Comparar nombres de conductor (ignorar mayúsculas/minúsculas)
        return conductorCarro.toLowerCase().includes(conductorLogueado.toLowerCase()) ||
               conductorLogueado.toLowerCase().includes(conductorCarro.toLowerCase());
      });
      
      console.log('Carros del conductor logueado:', carrosDelConductor);
      console.log('Total de carros del conductor:', carrosDelConductor.length);
      
      // Debug: Verificar campos de imagen de cada carro
      carrosDelConductor.forEach((carro, index) => {
        console.log(`Carro ${index + 1} - Campos de imagen:`, {
          placa: carro.placa || carro.Placa,
          imagencarro: carro.imagencarro,
          'carro.imagencarro': carro.imagencarro,
          'carro.Imagencarro': carro.Imagencarro,
          'carro.imagen': carro.imagen,
          'carro.Imagen': carro.Imagen
        });
        
        // Mostrar todos los campos disponibles del carro
        console.log(`Carro ${index + 1} - Todos los campos:`, Object.keys(carro));
        console.log(`Carro ${index + 1} - Datos completos:`, carro);
      });
      
      if (carrosDelConductor.length === 0) {
        console.log('No se encontraron carros para este conductor');
        setCarros([]);
        return;
      }
      
      // Obtener estados para mostrar nombres en lugar de números
      try {
        const estadosResponse = await axios.get('http://127.0.0.1:8000/api/listarestados', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        console.log('Respuesta completa de estados:', estadosResponse.data);
        
        let estadosArray = [];
        // Según el backend, los datos vienen en response.data.data
        if (estadosResponse.data && estadosResponse.data.data) {
          estadosArray = Array.isArray(estadosResponse.data.data) 
            ? estadosResponse.data.data 
            : [estadosResponse.data.data];
        } else if (estadosResponse.data && Array.isArray(estadosResponse.data)) {
          estadosArray = estadosResponse.data;
        } else {
          estadosArray = [];
        }
        
        console.log('Estados procesados:', estadosArray);
        console.log('Ejemplo de estado:', estadosArray[0]);
        
        // Crear un mapa de estados para acceso rápido
        const estadosMap = {};
        estadosArray.forEach(estado => {
          console.log('Procesando estado:', estado);
          console.log('Campos disponibles:', Object.keys(estado));
          
          const id = estado.id_estados || estado.id;
          const nombre = estado.nombre || estado.Nombre || estado.estado || estado.Estado || estado.Estados || `Estado ${id}`;
          estadosMap[id] = nombre;
          console.log(`Mapeando estado ID ${id} -> ${nombre}`);
          console.log('Estado completo:', estado);
        });
      
        console.log('Mapa de estados creado:', estadosMap);
        
        // Agregar el nombre del estado a cada carro
        carrosDelConductor = carrosDelConductor.map(carro => {
          console.log('Procesando carro:', carro);
          console.log('Campos del carro:', Object.keys(carro));
          
          const estadoId = carro.id_estados || carro.Estado;
          console.log(`Carro ${carro.placa || carro.Placa}: ID estado original: ${estadoId}, tipo: ${typeof estadoId}`);
          
          // Usar getEstadoNombre directamente para asegurar que funcione
          const estadoNombre = getEstadoNombre(estadoId);
          console.log(`Carro ${carro.placa || carro.Placa}: Nombre del estado: ${estadoNombre}`);
          
          return {
            ...carro,
            estadoNombre: estadoNombre
          };
        });
      
      } catch (estadosError) {
        console.error('Error al obtener estados:', estadosError);
        // Si no se pueden obtener los estados, usar nombres por defecto
        carrosDelConductor = carrosDelConductor.map(carro => ({
          ...carro,
          estadoNombre: getEstadoNombre(carro.id_estados || carro.Estado)
        }));
      }
    
      setCarros(carrosDelConductor);
    } catch (error) {
      console.error('Error al obtener carros:', error);
      console.log('Error response:', error.response);
      
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 400) {
          showToastNotification('Error 400: Solicitud incorrecta al cargar carros. Verifica tu autenticación.', 'error');
        } else if (statusCode === 401) {
          showToastNotification('Error 401: No autorizado. Inicia sesión nuevamente.', 'error');
          navigate('/login');
        } else if (statusCode === 500) {
          showToastNotification('Error del servidor al cargar carros. Intenta nuevamente.', 'error');
        } else {
          showToastNotification(`Error ${statusCode}: ${error.response.data?.message || 'Error desconocido'}`, 'error');
        }
      } else {
        showToastNotification('Error de conexión al cargar los carros', 'error');
      }
      setCarros([]);
    } finally {
      setIsLoadingCarros(false);
    }
  };

  // Función para cargar los carros del conductor logueado
  const handleViewMyCars = async () => {
    setIsLoadingMyCars(true);
    setShowMyCarsModal(true);
    
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/listarcarro', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      console.log('Todos los carros obtenidos:', response.data);
      
      // Manejar diferentes estructuras de respuesta
      let carrosArray = [];
      if (response.data && Array.isArray(response.data.data)) {
        carrosArray = response.data.data;
      } else if (Array.isArray(response.data)) {
        carrosArray = response.data;
      } else if (response.data && response.data.data) {
        carrosArray = [response.data.data];
      } else {
        carrosArray = [];
      }
      
      console.log('Carros procesados:', carrosArray);
      
      // Filtrar solo los carros del conductor logueado
      const conductorLogueado = userData.Nombre || userData.nombre || '';
      const carrosDelConductor = carrosArray.filter(carro => {
        const conductorCarro = carro.conductor || carro.Conductor || '';
        const perteneceAlConductor = conductorCarro.toLowerCase().includes(conductorLogueado.toLowerCase()) ||
                                    conductorLogueado.toLowerCase().includes(conductorCarro.toLowerCase());
        
        console.log(`Carro ${carro.placa || carro.Placa}:`, {
          conductorCarro,
          conductorLogueado,
          perteneceAlConductor
        });
        
        return perteneceAlConductor;
      });
      
      console.log('Carros del conductor logueado:', carrosDelConductor);
      console.log('Total de carros del conductor:', carrosDelConductor.length);
      
      // Obtener estados para mostrar nombres en lugar de números
      try {
        const estadosResponse = await axios.get('http://127.0.0.1:8000/api/listarestados', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        let estadosArray = [];
        if (estadosResponse.data && estadosResponse.data.data) {
          estadosArray = Array.isArray(estadosResponse.data.data) 
            ? estadosResponse.data.data 
            : [estadosResponse.data.data];
        } else if (estadosResponse.data && Array.isArray(estadosResponse.data)) {
          estadosArray = estadosResponse.data;
        }
        
        // Crear un mapa de estados para acceso rápido
        const estadosMap = {};
        estadosArray.forEach(estado => {
          const id = estado.id_estados || estado.id;
          const nombre = estado.estados || estado.nombre || estado.Nombre || estado.estado || estado.Estado || `Estado ${id}`;
          estadosMap[id] = nombre;
        });
        
        // Agregar el nombre del estado a cada carro
        const carrosConEstados = carrosDelConductor.map(carro => {
          const estadoId = carro.id_estados || carro.Estado;
          const estadoNombre = estadosMap[estadoId] || getEstadoNombre(estadoId);
          
          return {
            ...carro,
            estadoNombre: estadoNombre
          };
        });
        
        setMyCars(carrosConEstados);
      } catch (estadosError) {
        console.error('Error al obtener estados:', estadosError);
        // Si no se pueden obtener los estados, usar nombres por defecto
        const carrosConEstados = carrosDelConductor.map(carro => ({
          ...carro,
          estadoNombre: getEstadoNombre(carro.id_estados || carro.Estado)
        }));
        setMyCars(carrosConEstados);
      }
      
    } catch (error) {
      console.error('Error al obtener carros:', error);
      
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 400) {
          showToastNotification('Error 400: Solicitud incorrecta al cargar carros. Verifica tu autenticación.', 'error');
        } else if (statusCode === 401) {
          showToastNotification('Error 401: No autorizado. Inicia sesión nuevamente.', 'error');
          navigate('/login');
        } else if (statusCode === 500) {
          showToastNotification('Error del servidor al cargar carros. Intenta nuevamente.', 'error');
        } else {
          showToastNotification(`Error ${statusCode}: ${error.response.data?.message || 'Error desconocido'}`, 'error');
        }
      } else {
        showToastNotification('Error de conexión al cargar los carros', 'error');
      }
      setMyCars([]);
    } finally {
      setIsLoadingMyCars(false);
    }
  };

     // Función auxiliar para obtener nombre del estado por ID - CORREGIDA
   const getEstadoNombre = (estadoId) => {
     // Debug: ver qué ID está llegando
     console.log('🔍 getEstadoNombre recibió:', estadoId, 'tipo:', typeof estadoId);
     
     // Convertir a número si es string
     const id = parseInt(estadoId);
     
     // Mapeo de estados con nombres más descriptivos
     const estados = {
       1: '🚗 Disponible',
       2: '🛣️ En Viaje', 
       3: '🔧 En Mantenimiento',
       4: '❌ Fuera de Servicio'
     };
     
     // Si el ID es válido y está en nuestro mapeo, devolver el nombre descriptivo
     if (id && estados[id]) {
       console.log(`✅ Estado ID ${id} -> ${estados[id]}`);
       return estados[id];
     }
     
     // Si no es un ID válido, devolver un mensaje descriptivo
     console.log(`❌ Estado ID ${estadoId} no válido, devolviendo estado por defecto`);
     return `🔍 Estado ${estadoId || 'Desconocido'}`;
   };

  // Función helper para construir la URL de la imagen del carro
  const getCarImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Si ya es una URL completa, devolverla
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si empieza con /storage, construir URL completa
    if (imagePath.startsWith('/storage/')) {
      return `http://127.0.0.1:8000${imagePath}`;
    }
    
    // Si es solo el nombre del archivo, construir URL
    if (!imagePath.includes('/')) {
      return `http://127.0.0.1:8000/storage/carros/${imagePath}`;
    }
    
    // Construir URL completa
    return `http://127.0.0.1:8000/storage/${imagePath}`;
  };

  const handleUpdateEstado = async () => {
    if (!selectedCarro || !newEstado) {
      showToastNotification('Por favor selecciona un carro y un estado', 'error');
      return;
    }

    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/actualizarestadocarro/${selectedCarro.id_carros || selectedCarro.id}`, {
        Estadoid: newEstado
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log('Estado actualizado:', response.data);
      showToastNotification('Estado del carro actualizado correctamente', 'success');
      
      // Actualizar la lista de carros
      handleViewCarros();
      
      // Cerrar modales
      setShowUpdateEstadoModal(false);
      setSelectedCarro(null);
      setNewEstado('');
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      showToastNotification('Error al actualizar el estado del carro', 'error');
    }
  };

  // Función para asignar estado directamente desde el botón "Usar"
  const handleAssignEstado = async (estadoId) => {
    if (!selectedCarro) {
      showToastNotification('Error: No se seleccionó ningún carro', 'error');
      return;
    }

    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/actualizarestadocarro/${selectedCarro.id_carros || selectedCarro.id}`, {
        Estadoid: estadoId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log('Estado actualizado:', response.data);
      showToastNotification('Estado del carro actualizado correctamente', 'success');
      
      // Actualizar la lista de carros
      handleViewCarros();
      
      // Cerrar modales
      setShowUpdateEstadoModal(false);
      setSelectedCarro(null);
      setNewEstado('');
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      showToastNotification('Error al actualizar el estado del carro', 'error');
    }
  };

  const handleGetEstados = async () => {
    setIsLoadingEstados(true);
    console.log('🔄 Iniciando carga de estados...');
    
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/listarestados', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log('📡 Respuesta completa del servidor:', response);
      console.log('📊 Datos de estados obtenidos:', response.data);
      console.log('🔍 Estructura de response.data:', {
        hasData: !!response.data.data,
        dataType: typeof response.data.data,
        isArray: Array.isArray(response.data.data),
        message: response.data.message
      });
      
      // Según el backend, los datos vienen en response.data.data
      let estadosArray = [];
      if (response.data && response.data.data) {
        // Si data es un array, usarlo directamente
        if (Array.isArray(response.data.data)) {
          estadosArray = response.data.data;
        } 
        // Si data es un objeto, convertirlo a array
        else if (typeof response.data.data === 'object') {
          estadosArray = [response.data.data];
        }
        // Si data es un string o número, crear un array con ese valor
        else {
          estadosArray = [response.data.data];
        }
      } else if (response.data && Array.isArray(response.data)) {
        estadosArray = response.data;
      } else {
        estadosArray = [];
      }
      
      console.log('🔧 Estados procesados para la lista:', estadosArray);
      console.log('📝 Primer estado (ejemplo):', estadosArray[0]);
      
      if (estadosArray.length > 0) {
        console.log('✅ Estados encontrados:', estadosArray.length);
        estadosArray.forEach((estado, index) => {
          console.log(`Estado ${index + 1}:`, {
            id: estado.id_estados,
            nombre: estado.estados, // Según Postman, el campo es "estados"
            completo: estado
          });
        });
      } else {
        console.log('⚠️ No se encontraron estados en la respuesta');
        console.log('🔍 Revisando estructura completa de response.data:', response.data);
      }
      
      setEstados(estadosArray);
    } catch (error) {
      console.error('❌ Error al obtener estados:', error);
      if (error.response) {
        console.error('📡 Respuesta de error:', error.response.data);
        console.error('🔢 Status code:', error.response.status);
      }
      showToastNotification('Error al cargar los estados', 'error');
      setEstados([]);
    } finally {
      setIsLoadingEstados(false);
      console.log('🏁 Carga de estados finalizada');
    }
  };

  // Función para eliminar carro
  const handleDeleteCarro = async () => {
    if (!carroToDelete) {
      showToastNotification('Error: No se seleccionó ningún carro para eliminar', 'error');
      return;
    }

    setIsDeletingCarro(true);
    
    try {
      const carroId = carroToDelete.id_carros || carroToDelete.id || carroToDelete.ID;
      console.log('Eliminando carro con ID:', carroId);
      
      const response = await axios.delete(`http://127.0.0.1:8000/api/eliminarcarro/${carroId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      console.log('Carro eliminado:', response.data);
      
      // Mostrar notificación de éxito con detalles del carro eliminado
      const carroInfo = `🚗 Vehículo ${carroToDelete.placa || carroToDelete.Placa || 'N/A'} eliminado exitosamente`;
      showToastNotification(carroInfo, 'success');
      
      // Actualizar la lista de carros
      handleViewCarros();
      
      // Cerrar modales
      setShowDeleteConfirmModal(false);
      setCarroToDelete(null);
    } catch (error) {
      console.error('Error al eliminar carro:', error);
      
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 404) {
          showToastNotification('Error: El carro no fue encontrado', 'error');
        } else if (statusCode === 403) {
          showToastNotification('Error: No tienes permisos para eliminar este carro', 'error');
        } else if (statusCode === 500) {
          showToastNotification('Error del servidor al eliminar el carro', 'error');
        } else {
          showToastNotification(`Error ${statusCode}: ${error.response.data?.message || 'Error al eliminar el carro'}`, 'error');
        }
      } else if (error.request) {
        showToastNotification('Error de conexión. Verifica que el servidor esté ejecutándose.', 'error');
      } else {
        showToastNotification('Error inesperado al eliminar el carro', 'error');
      }
    } finally {
      setIsDeletingCarro(false);
    }
  };

  // Función para confirmar eliminación de carro
  const confirmDeleteCarro = (carro) => {
    setCarroToDelete(carro);
    setShowDeleteConfirmModal(true);
  };

  // Función para verificar si un texto es un link
  const isLink = (text) => {
    if (!text) return false;
    return text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.');
  };

  // Función para truncar un link largo
  const truncateLink = (link, maxLength = 50) => {
    if (!link) return '';
    if (link.length <= maxLength) return link;
    return link.substring(0, maxLength) + '...';
  };

  // Función para abrir link en nueva pestaña
  const openLink = (link) => {
    if (isLink(link)) {
      let url = link;
      if (link.startsWith('www.')) {
        url = 'https://' + link;
      }
      window.open(url, '_blank');
    }
  };

  // Función para confirmar reserva
  const handleConfirmarReserva = async (reserva) => {
    try {
      console.log('Confirmando reserva:', reserva);
      console.log('Campos disponibles:', Object.keys(reserva));
      
      const reservationId = reserva.id || reserva.id_reservarviaje || reserva.ID;
      console.log('ID de reserva:', reservationId);
      
      if (!reservationId || reservationId === 'undefined') {
        showToastNotification('❌ Error: ID de reserva no válido. Verifica los datos de la reserva.', 'error');
        return;
      }
      
      const response = await axios.put(`http://127.0.0.1:8000/api/confirmarreserva/${reservationId}`, {
        estado: 'confirmada'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      console.log('Reserva confirmada:', response.data);
      
      // Mostrar notificación de éxito con detalles
      const reservaInfo = `Reserva #${reservationId} confirmada exitosamente`;
      showToastNotification(reservaInfo, 'success');
      
      // Recargar la lista de reservas
      await handleViewReservas();
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      
      let errorMessage = '❌ Error al confirmar la reserva';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = `❌ ${error.response.data.message}`;
        } else if (error.response.status === 404) {
          errorMessage = '❌ Reserva no encontrada en el sistema';
        } else if (error.response.status === 400) {
          errorMessage = '❌ Datos de reserva inválidos';
        }
      } else if (error.request) {
        errorMessage = '❌ Error de conexión. Verifica que el servidor esté ejecutándose.';
      }
      
      showToastNotification(errorMessage, 'error');
    }
  };

  // Función para rechazar reserva
  const handleRechazarReserva = async (reserva) => {
    if (!window.confirm('¿Estás seguro de que quieres rechazar esta reserva?')) {
      return;
    }

    try {
      console.log('Rechazando reserva:', reserva);
      console.log('Campos disponibles:', Object.keys(reserva));
      
      const reservationId = reserva.id || reserva.id_reservarviaje || reserva.ID;
      console.log('ID de reserva:', reservationId);
      
      if (!reservationId || reservationId === 'undefined') {
        showToastNotification('❌ Error: ID de reserva no válido. Verifica los datos de la reserva.', 'error');
        return;
      }
      
      const response = await axios.put(`http://127.0.0.1:8000/api/confirmarreserva/${reservationId}`, {
        estado: 'rechazada'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      console.log('Reserva rechazada:', response.data);
      
      // Mostrar notificación de éxito con detalles
      const reservaInfo = `Reserva #${reservationId} rechazada exitosamente`;
      showToastNotification(reservaInfo, 'success');
      
      // Recargar la lista de reservas
      await handleViewReservas();
    } catch (error) {
      console.error('Error al rechazar reserva:', error);
      
      let errorMessage = '❌ Error al rechazar la reserva';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = `❌ ${error.response.data.message}`;
        } else if (error.response.status === 404) {
          errorMessage = '❌ Reserva no encontrada en el sistema';
        } else if (error.response.status === 400) {
          errorMessage = '❌ Datos de reserva inválidos';
        }
      } else if (error.request) {
        errorMessage = '❌ Error de conexión. Verifica que el servidor esté ejecutándose.';
      }
      
      showToastNotification(errorMessage, 'error');
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 relative">
      {/* Notificación Toast Mejorada */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`rounded-xl shadow-2xl p-6 max-w-md transform transition-all duration-300 hover:scale-105 ${
            notificationMessage.includes('eliminado') 
              ? 'bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500' 
              : 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-full ${
                  notificationMessage.includes('eliminado') 
                    ? 'bg-red-200' 
                    : 'bg-green-200'
                }`}>
                  {notificationMessage.includes('eliminado') ? (
                    <FaTimes className="h-6 w-6 text-red-600" />
                  ) : (
                  <FaCheck className="h-6 w-6 text-green-600" />
                  )}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold mb-1 ${
                    notificationMessage.includes('eliminado') 
                      ? 'text-red-800' 
                      : 'text-green-800'
                  }`}>
                    {notificationMessage.includes('eliminado') ? '🚗 Vehículo Eliminado' : '✅ Operación Exitosa'}
                  </h4>
                  <button
                    onClick={() => setShowNotification(false)}
                    className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p className={`text-sm leading-relaxed font-medium ${
                  notificationMessage.includes('eliminado') 
                    ? 'text-red-700' 
                    : 'text-green-700'
                }`}>
                  {notificationMessage}
                </p>
                <div className={`mt-3 flex items-center text-xs ${
                  notificationMessage.includes('eliminado') 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  <FaCar className="mr-2" />
                  <span className="font-semibold">Sistema Mecaza</span>
                  {notificationMessage.includes('eliminado') && (
                    <span className="ml-2 bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                      ELIMINADO
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Navbar */}
      <nav className="bg-white shadow-lg relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y nombre */}
            <div className="flex items-center space-x-3">
              <FaCar className="text-blue-900 text-3xl drop-shadow-lg" />
              <span className="text-2xl font-bold text-blue-900">Agregar Vehículo</span>
            </div>

            {/* Barra de búsqueda - Desktop */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar en el sistema..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Navegación - Desktop */}
            <div className="hidden md:flex items-center space-x-6" style={{ zIndex: 99999, position: 'relative' }}>
            
              <a href="/index2" className="text-blue-900 hover:text-blue-700 font-medium transition-colors">
                Panel Conductor
              </a>
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
                {/* Barra de búsqueda móvil */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Buscar en el sistema..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                
               
                <a 
                  href="/index2" 
                  className="block px-3 py-2 text-blue-900 hover:text-blue-700 font-medium"
                >
                  Panel Conductor
                </a>
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
              Agregar Vehículo
            </h1>
            <p className="text-lg text-gray-600">
              Registra tu vehículo en el sistema Mecaza
            </p>
          </div>

                     {/* Botones para el conductor */}
           <div className="flex justify-center space-x-6 flex-wrap">
             {/* Botón para agregar vehículo */}
             <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 max-w-md mb-6">
               <div className="flex items-center mb-6">
                 <div className="bg-blue-600 p-4 rounded-lg mr-4">
                   <FaCar className="text-3xl text-white" />
                 </div>
                 <h3 className="text-2xl font-bold text-blue-900">Registrar Vehículo</h3>
               </div>
               <p className="text-gray-600 mb-8 leading-relaxed text-center">
                 Completa la información de tu vehículo: placa, conductor, puestos, destino, horarios y estado del viaje.
               </p>
               <button
                 onClick={() => setShowAddCarModal(true)}
                 className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg text-lg"
               >
                 <FaPlus className="mr-3 text-xl" />
                 Agregar Vehículo
               </button>
             </div>

             {/* Botón para ver reservas */}
             <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 max-w-md mb-6">
               <div className="flex items-center mb-6">
                 <div className="bg-green-600 p-4 rounded-lg mr-4">
                   <FaUsers className="text-3xl text-white" />
                 </div>
                 <h3 className="text-2xl font-bold text-green-900">Gestionar Reservas</h3>
               </div>
               <p className="text-gray-600 mb-8 leading-relaxed text-center">
                 Consulta y gestiona todas las reservas. Confirma o rechaza solicitudes pendientes de los usuarios.
               </p>
               <button
                 onClick={handleViewReservas}
                 className="w-full bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg text-lg"
               >
                 <FaUsers className="mr-3 text-xl" />
                 Gestionar Reservas
               </button>
             </div>



             {/* Botón para gestionar carros */}
             <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 max-w-md mb-6">
               <div className="flex items-center mb-6">
                 <div className="bg-purple-600 p-4 rounded-lg mr-4">
                   <FaCog className="text-3xl text-white" />
                 </div>
                 <h3 className="text-2xl font-bold text-purple-900">Gestionar Carros</h3>
               </div>
               <p className="text-gray-600 mb-8 leading-relaxed text-center">
                 Ver y actualizar el estado de los carros. Cambia el estado de los vehículos según el viaje.
               </p>
               <button
                 onClick={handleViewCarros}
                 className="w-full bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-md hover:shadow-lg text-lg"
               >
                 <FaCog className="mr-3 text-xl" />
                 Gestionar Carros
               </button>
             </div>


           </div>
        </div>
      </div>

      {/* Modal Agregar Carro */}
      {showAddCarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            {/* Botón de cerrar arriba a la derecha */}
            <button
              onClick={() => setShowAddCarModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
              aria-label="Cerrar"
            >
              &times;
            </button>
            <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Agregar Vehículo</h2>
            
            {/* Botón para cargar estados - ELIMINADO */}
            
            <form onSubmit={handleAddCar} className="space-y-5">
              {/* Placa */}


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                <input
                  type="text"
                  value={carData.Placa}
                  onChange={(e) => setCarData({...carData, Placa: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Carro</label>
      <input
      type="file"
      name="Imagencarro"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file && file.size > 2 * 1024 * 1024) { // 2MB
          showToastNotification('La imagen debe ser menor a 2MB. Se comprimirá automáticamente.', 'warning');
        }
        setCarData({ ...carData, Imagencarro: file });
      }}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
</div>
              {/* Conductor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conductor 
                  <span className="text-xs text-green-600 ml-2">
                    (Se llena automáticamente)
                  </span>
                </label>
                <input
                  type="text"
                  value={carData.Conductor}
                  onChange={(e) => setCarData({...carData, Conductor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  required
                  readOnly
                  placeholder="Se llena automáticamente con tu nombre"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este campo se llena automáticamente con tu nombre de usuario
                </p>
              </div>
              {/* Puestos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de Puestos</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={carData.Asientos}
                  onChange={(e) => setCarData({...carData, Asientos: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 4"
                  required
                />
              </div>
              
              {/* Destino */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                <select
                  value={carData.Destino}
                  onChange={(e) => setCarData({...carData, Destino: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar destino</option>
                  <option value="Medellin">Medellín</option>
                  <option value="Caucasia">Caucasia</option>
                  <option value="Zaragoza">Zaragoza</option>
                </select>
              </div>

   

            
              
              {/* Hora de Salida */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha del Viaje</label>
                  <input
                    type="date"
                    value={carData.Fecha}
                    onChange={(e) => setCarData({...carData, Fecha: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Selecciona la fecha del viaje
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Salida</label>
                  <input
                    type="time"
                    value={carData.Horasalida}
                    onChange={(e) => setCarData({...carData, Horasalida: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Selecciona la hora de salida
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="text"
                  value={carData.Telefono}
                  onChange={(e) => setCarData({...carData, Telefono: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Estado del Carro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del Carro 
                  {carData.Estado && (
                    <span className="ml-2 text-xs text-green-600">
                      (Seleccionado: {estados.find(e => (e.id_estados || e.id) == carData.Estado)?.estados || `Estado ${carData.Estado}`})
                    </span>
                  )}
                </label>
                <select
                  value={carData.Estado || ''}
                  onChange={(e) => setCarData({...carData, Estado: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar estado</option>
                  {estados.map((estado, index) => (
                    <option key={index} value={estado.id_estados || estado.id}>
                      {estado.estados || estado.nombre || estado.Nombre || `Estado ${estado.id_estados || estado.id}`}
                    </option>
                  ))}
                </select>
                {estados.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Cargando estados... Si no aparecen, haz clic en "Cargar Estados"
                  </p>
                )}
                {estados.length > 0 && (
                  <p className="text-sm text-blue-600 mt-1">
                    ✓ {estados.length} estado(s) disponible(s) para seleccionar
                  </p>
                )}
              </div>

              {/* Día - Eliminado ya que ahora usamos el campo de fecha */}
              
              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCarModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
             )}

       {/* Modal Ver Carros */}
       {showCarrosModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full mx-4 overflow-y-auto max-h-[90vh]">
             {/* Botón de cerrar arriba a la derecha */}
             <button
               onClick={() => setShowCarrosModal(false)}
               className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
               aria-label="Cerrar"
             >
               &times;
             </button>
             
             <h2 className="text-3xl font-bold text-purple-900 mb-8 text-center">Gestionar Carros</h2>
             
             {isLoadingCarros ? (
               <div className="flex items-center justify-center py-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                 <span className="ml-3 text-gray-600">Cargando carros...</span>
               </div>
             ) : carros.length === 0 ? (
               <div className="text-center py-8">
                 <FaCar className="text-6xl text-gray-300 mx-auto mb-4" />
                 <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay carros</h3>
                 <p className="text-gray-500">Aún no se han registrado carros en el sistema.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 <div className="bg-purple-50 rounded-lg p-4 mb-6">
                   <h3 className="text-lg font-semibold text-purple-900 mb-2">
                     Total de Carros: {carros.length}
                   </h3>
                   <p className="text-purple-700 text-sm">
                     Aquí puedes ver y actualizar el estado de todos los carros
                   </p>
                 </div>
                 
                 <div className="grid gap-4">
                   {carros.map((carro, index) => (
                     <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                       {/* Imagen del carro */}
                       <div className="mb-4 flex justify-center">
                         {carro.imagencarro ? (
                           <div className="relative">
                             <img 
                               src={getCarImageUrl(carro.imagencarro)}
                               alt={`Imagen del carro ${carro.placa || carro.Placa}`}
                               className="w-full max-w-xs h-32 object-cover rounded-lg shadow-md"
                               onError={(e) => {
                                 e.target.style.display = 'none';
                                 e.target.nextSibling.style.display = 'block';
                               }}
                             />
                             <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                               ✓ Imagen
                             </div>
                           </div>
                         ) : null}
                         
                         {/* Fallback si no hay imagen o si falla */}
                         <div className={`w-full max-w-xs h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-md flex items-center justify-center ${carro.imagencarro ? 'hidden' : 'block'}`}>
                           <FaCar className="text-4xl text-blue-600" />
                           <span className="ml-2 text-blue-800 font-medium text-sm">Sin imagen</span>
                         </div>
                         

                       </div>
                       
                       <div className="grid md:grid-cols-2 gap-4">
                         {/* Información principal */}
                         <div className="space-y-3">
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">ID Carro:</span>
                             <span className="text-purple-600 font-bold">#{carro.id_carros || carro.id || index + 1}</span>
                           </div>
                           
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">Placa:</span>
                             <span className="text-gray-900 font-mono">{carro.placa || carro.Placa || 'N/A'}</span>
                           </div>
                           
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">Conductor:</span>
                             <span className="text-gray-900">{carro.conductor || carro.Conductor || 'N/A'}</span>
                           </div>
                           
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">Destino:</span>
                             <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                               {carro.destino || carro.Destino || 'N/A'}
                             </span>
                           </div>
                         </div>
                         
                         {/* Información adicional */}
                         <div className="space-y-3">
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">Asientos:</span>
                             <span className="text-gray-900">{carro.asientos || carro.Asientos || 'N/A'}</span>
                           </div>
                           
                                                       <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-700">Estado Actual:</span>
                              <div className="flex flex-col items-end">
                                <span className={`px-3 py-2 rounded-full text-sm font-bold shadow-sm ${
                                  (carro.id_estados || carro.Estado) == 1 
                                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                                    : (carro.id_estados || carro.Estado) == 2
                                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300'
                                    : (carro.id_estados || carro.Estado) == 3
                                    ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300'
                                    : (carro.id_estados || carro.Estado) == 4
                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                                }`}>
                                  {getEstadoNombre(carro.id_estados || carro.Estado)}
                                </span>
                                <span className="text-xs text-gray-500 mt-2 font-mono">
                                  ID: {carro.id_estados || carro.Estado || 'N/A'}
                                </span>
                              </div>
                            </div>
                           
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">Fecha:</span>
                             <span className="text-gray-900 text-sm">
                               {carro.fecha || carro.Fecha || 'N/A'}
                             </span>
                           </div>
                           
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-gray-700">Hora:</span>
                             <span className="text-gray-900 text-sm">
                               {carro.horasalida || carro.Horasalida || 'N/A'}
                             </span>
                           </div>
                         </div>
                       </div>
                       
                       {/* Botones de acción */}
                       <div className="border-t border-gray-200 mt-4 pt-4">
                         <div className="grid grid-cols-2 gap-3">
                           <button
                             onClick={() => {
                               setSelectedCarro(carro);
                               setShowUpdateEstadoModal(true);
                             }}
                             className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center"
                           >
                             <FaCog className="mr-2" />
                             Actualizar Estado
                           </button>
                           <button
                             onClick={() => confirmDeleteCarro(carro)}
                             className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center"
                           >
                             <FaTimes className="mr-2" />
                             Eliminar
                           </button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
             
             {/* Botón de cerrar */}
             <div className="mt-8 text-center">
               <button
                 onClick={() => setShowCarrosModal(false)}
                 className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
               >
                 Cerrar
               </button>
             </div>
           </div>
         </div>
       )}

               {/* Modal Actualizar Estado */}
        {showUpdateEstadoModal && selectedCarro && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full mx-4 overflow-y-auto max-h-[90vh]">
              {/* Botón de cerrar arriba a la derecha */}
              <button
                onClick={() => {
                  setShowUpdateEstadoModal(false);
                  setSelectedCarro(null);
                  setNewEstado('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
                aria-label="Cerrar"
              >
                &times;
              </button>
              
              <h2 className="text-3xl font-bold text-purple-900 mb-8 text-center">Actualizar Estado</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Columna izquierda: Formulario de actualización */}
                <div className="space-y-6">
                                     {/* Información del carro */}
                   <div className="bg-purple-50 rounded-lg p-4">
                     <h3 className="font-semibold text-purple-900 mb-2">Carro Seleccionado:</h3>
                     <div className="space-y-2 text-sm">
                       <div><span className="font-semibold">Placa:</span> {selectedCarro.placa || selectedCarro.Placa}</div>
                       <div><span className="font-semibold">Conductor:</span> {selectedCarro.conductor || selectedCarro.Conductor}</div>
                       <div><span className="font-semibold">Destino:</span> {selectedCarro.destino || selectedCarro.Destino}</div>
                       <div className="flex items-center justify-between">
                         <span className="font-semibold">Estado Actual:</span>
                         <div className="flex flex-col items-end">
                           <span className={`px-3 py-2 rounded-full text-sm font-bold shadow-sm ${
                             (selectedCarro.id_estados || selectedCarro.Estado) == 1 
                               ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                               : (selectedCarro.id_estados || selectedCarro.Estado) == 2
                               ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300'
                               : (selectedCarro.id_estados || selectedCarro.Estado) == 3
                               ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300'
                               : (selectedCarro.id_estados || selectedCarro.Estado) == 4
                               ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                               : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                           }`}>
                             {(() => {
                               const estadoId = selectedCarro.id_estados || selectedCarro.Estado;
                               const nombreEstado = getEstadoNombre(estadoId);
                               console.log(`Renderizando estado para carro seleccionado: ID=${estadoId}, Nombre=${nombreEstado}`);
                               return nombreEstado;
                             })()}
                           </span>
                           <span className="text-xs text-gray-500 mt-2 font-mono">
                             ID: {selectedCarro.id_estados || selectedCarro.Estado || 'N/A'}
                           </span>
                         </div>
                       </div>
                     </div>
                   </div>
                  
                  {/* Estado seleccionado */}
                  {newEstado && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Estado Seleccionado:</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                            ID: {newEstado}
                          </span>
                                                     <span className="text-green-900 font-medium">
                             {estados.find(e => (e.id_estados || e.id) == newEstado)?.estados || 
                              estados.find(e => (e.id_estados || e.id) == newEstado)?.nombre || 
                              estados.find(e => (e.id_estados || e.id) == newEstado)?.Nombre || 
                              estados.find(e => (e.id_estados || e.id) == newEstado)?.estado || 
                              estados.find(e => (e.id_estados || e.id) == newEstado)?.Estado || 
                              estados.find(e => (e.id_estados || e.id) == newEstado)?.Estados || 
                              `Estado ${newEstado}`}
                           </span>
                        </div>
                        <button
                          onClick={() => setNewEstado('')}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Cambiar
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Botones */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handleUpdateEstado}
                      disabled={!newEstado}
                      className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Actualizar
                    </button>
                    <button
                      onClick={() => {
                        setShowUpdateEstadoModal(false);
                        setSelectedCarro(null);
                        setNewEstado('');
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
                
                {/* Columna derecha: Lista de estados disponibles */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Estados Disponibles:</h3>
                    <p className="text-blue-700 text-sm mb-4">
                      Estados disponibles para asignar al carro
                    </p>
                  </div>
                  
                  {/* Lista de estados */}
                  {estados.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Estados Registrados:</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {estados.map((estado, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center space-x-3">
                              <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-300">
                                ID: {estado.id_estados || estado.id || index + 1}
                              </span>
                              <span className="text-gray-900 font-semibold text-lg">
                               {estado.estados || estado.nombre || estado.Nombre || estado.estado || estado.Estado || estado.Estados || `Estado ${estado.id_estados || estado.id || index + 1}`}
                             </span>
                            </div>
                            <button
                              onClick={() => handleAssignEstado(estado.id_estados || estado.id || index + 1)}
                              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm font-bold shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                              🎯 Usar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isLoadingEstados && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Cargando estados...</span>
                    </div>
                  )}
                  
                  {!isLoadingEstados && estados.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="text-gray-400 text-4xl mb-2">📋</div>
                      <h4 className="text-gray-600 font-medium">No hay estados cargados</h4>
                      <p className="text-gray-500 text-sm">Los estados se cargan automáticamente</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

       {/* Modal Ver Reservas */}
      {showReservasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-6xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            {/* Botón de cerrar arriba a la derecha */}
            <button
              onClick={() => setShowReservasModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
              aria-label="Cerrar"
            >
              &times;
            </button>
            
            <h2 className="text-3xl font-bold text-green-900 mb-8 text-center">Gestión de Reservas</h2>
            
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Total de Reservas: {reservas.length}
              </h3>
              <p className="text-green-700 text-sm">
                Confirma o rechaza las reservas pendientes de los usuarios
              </p>
            </div>
            
            {isLoadingReservas ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Cargando reservas...</span>
              </div>
            ) : reservas.length === 0 ? (
              <div className="text-center py-8">
                <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay reservas</h3>
                <p className="text-gray-500">Aún no se han realizado reservas en el sistema.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Lista de reservas */}
                <div className="grid gap-6">
                  {reservas.map((reserva, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                      {/* Header de la reserva */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Reserva #{reserva.id_reservarviaje || reserva.id || index + 1}
                          </div>
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Asiento {reserva.asiento || reserva.Asiento || 'N/A'}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            !reserva.estado || reserva.estado.toLowerCase() === 'pendiente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {!reserva.estado || reserva.estado.toLowerCase() === 'pendiente'
                              ? 'Pendiente'
                              : 'Confirmado por el usuario'
                            }
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {reserva.created_at ? new Date(reserva.created_at).toLocaleString('es-ES') : 'Fecha no disponible'}
                        </div>
                      </div>
                      
                      {/* Información principal */}
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Información del usuario */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <FaUser className="mr-2 text-blue-600" />
                            Información del Usuario
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nombre:</span>
                              <span className="font-medium text-gray-900">{reserva.comentario || reserva.Comentario || 'No especificado'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Información del viaje */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-green-600" />
                            Detalles del Viaje
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Asiento:</span>
                              <span className="font-medium text-gray-900">{reserva.asiento || reserva.Asiento || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Placa:</span>
                              <span className="font-medium text-gray-900">
                                {(() => {
                                  const placa = reserva.carroInfo?.placa || 'N/A';
                                  console.log(`Renderizando placa para reserva ${reserva.id || 'N/A'}:`, {
                                    carroInfo: reserva.carroInfo,
                                    placa: placa
                                  });
                                  return placa;
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Estado de la reserva */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <FaCog className="mr-2 text-green-600" />
                            Estado de la Reserva
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estado:</span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                Confirmada
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Información adicional */}
                      {(reserva.ubicacion || reserva.Ubicacion) && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h5 className="font-medium text-gray-900 mb-2">Ubicación Detallada:</h5>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-700 break-all">
                              {reserva.ubicacion || reserva.Ubicacion}
                            </p>
                            {isLink(reserva.ubicacion || reserva.Ubicacion) && (
                              <button
                                onClick={() => openLink(reserva.ubicacion || reserva.Ubicacion)}
                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                              >
                                <FaExternalLinkAlt className="mr-1" />
                                Abrir ubicación
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Botones de acción para reservas pendientes */}
                      {(!reserva.estado || reserva.estado.toLowerCase() === 'pendiente') && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex space-x-3 justify-center">
                            <button
                              onClick={() => handleConfirmarReserva(reserva)}
                              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                            >
                              <FaCheck className="mr-2" />
                              Confirmar
                            </button>
                            <button
                              onClick={() => handleRechazarReserva(reserva)}
                              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                            >
                              <FaTimes className="mr-2" />
                              Rechazar
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Estado de reservas confirmadas */}
                      {reserva.estado && reserva.estado.toLowerCase() !== 'pendiente' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="text-center p-3 rounded-lg bg-green-50 text-green-800">
                            <span className="font-semibold">
                              ✅ Confirmado por el usuario
                            </span>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Botón de cerrar */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowReservasModal(false)}
                className="bg-gray-300 text-gray-700 py-3 px-8 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar carro */}
      {showDeleteConfirmModal && carroToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
            {/* Botón de cerrar arriba a la derecha */}
            <button
              onClick={() => {
                setShowDeleteConfirmModal(false);
                setCarroToDelete(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors"
              aria-label="Cerrar"
            >
              &times;
            </button>
            
            <div className="text-center">
              {/* Header con gradiente rojo */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl -m-8 mb-8 p-8 text-white">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <FaTimes className="text-5xl text-white drop-shadow-lg" />
                </div>
                <h3 className="text-3xl font-bold mb-2">Confirmar Eliminación</h3>
                <p className="text-red-100 text-lg">Esta acción no se puede deshacer</p>
              </div>
              
                            {/* Información del carro */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-6 text-xl flex items-center justify-center">
                  <FaCar className="mr-3 text-blue-600" />
                  Detalles del Vehículo
                </h4>
                
                {/* Información principal en orden lógico */}
                <div className="space-y-4">
                  {/* Placa - Información más importante */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700 text-lg">🚗 Placa del Vehículo</span>
                      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full font-mono font-bold text-xl shadow-md">
                        {carroToDelete.placa || carroToDelete.Placa || 'N/A'}
                      </span>
                    </div>
              </div>
              
                  {/* Información del conductor */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700 text-lg">👤 Conductor Responsable</span>
                      <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-4 py-2 rounded-full font-semibold text-lg border border-purple-300">
                        {carroToDelete.conductor || carroToDelete.Conductor || 'N/A'}
                      </span>
                </div>
              </div>
              
                  {/* Destino del viaje */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700 text-lg">📍 Destino del Viaje</span>
                      <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-4 py-2 rounded-full font-semibold text-lg border border-green-300">
                        {carroToDelete.destino || carroToDelete.Destino || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Fecha y hora */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-700">📅 Fecha:</span>
                        <span className="text-gray-900 font-semibold bg-gray-100 px-3 py-1 rounded-lg">
                          {carroToDelete.fecha || carroToDelete.Fecha || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-700">🕐 Hora:</span>
                        <span className="text-gray-900 font-semibold bg-gray-100 px-3 py-1 rounded-lg">
                          {carroToDelete.horasalida || carroToDelete.Horasalida || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Estado actual */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700 text-lg">🔧 Estado Actual</span>
                      <span className={`px-4 py-2 rounded-full font-bold text-lg shadow-md ${
                        (carroToDelete.id_estados || carroToDelete.Estado) == 1 
                          ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                          : (carroToDelete.id_estados || carroToDelete.Estado) == 2
                          ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300'
                          : (carroToDelete.id_estados || carroToDelete.Estado) == 3
                          ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300'
                          : (carroToDelete.id_estados || carroToDelete.Estado) == 4
                          ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                      }`}>
                        {(() => {
                          const estadoId = carroToDelete.id_estados || carroToDelete.Estado;
                          const nombreEstado = getEstadoNombre(estadoId);
                          return nombreEstado;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mensaje de advertencia */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-8 text-left">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-lg">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h5 className="text-red-800 font-bold text-lg mb-1">¡Atención!</h5>
                    <p className="text-red-700">
                      Al eliminar este vehículo, también se eliminarán <strong>todas las reservas asociadas</strong> y 
                      se perderá toda la información relacionada de forma permanente.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setCarroToDelete(null);
                  }}
                  disabled={isDeletingCarro}
                  className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 px-8 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  ❌ Cancelar
                </button>
                <button
                  onClick={handleDeleteCarro}
                  disabled={isDeletingCarro}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-8 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {isDeletingCarro ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      🗑️ Eliminar Definitivamente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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

export default Conductor;
