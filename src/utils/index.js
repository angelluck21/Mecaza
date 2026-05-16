import { ESTADOS_CARRO } from '../constants';

const API_STORAGE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://api-mecaza.geekcorplab.com/api').replace('/api', '');

/**
 * Construye la URL completa de la imagen de un carro.
 */
export const getCarImageUrl = (imagePath) => {
  if (!imagePath || imagePath.trim() === '') return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  if (imagePath.startsWith('/storage/')) return `${API_STORAGE_URL}${imagePath}`;
  if (!imagePath.includes('/')) return `${API_STORAGE_URL}/storage/carros/${imagePath}`;
  return `${API_STORAGE_URL}/storage/${imagePath}`;
};

/**
 * Devuelve el label y color de un estado de carro dado su ID.
 */
export const getEstadoInfo = (estadoId) => {
  const id = parseInt(estadoId);
  return ESTADOS_CARRO[id] || { label: 'Estado Desconocido', color: 'bg-gray-100 text-gray-800' };
};

/**
 * Formatea una fecha ISO/string al formato local es-ES.
 */
export const formatFecha = (fecha) => {
  if (!fecha) return 'No especificada';
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return fecha;
    // Evitar desfase de zona horaria mostrando la fecha original si hay diferencia
    if (date.getUTCDate() !== date.getDate()) return fecha;
    return date.toLocaleDateString('es-ES');
  } catch {
    return fecha;
  }
};

/**
 * Extrae el ID del usuario de la respuesta del servidor (varios formatos posibles).
 */
export const extractUserId = (data) =>
  data.id_users || data.id || data.ID || data.user_id || data.userId ||
  data.user?.id || data.user?.id_users || null;

/**
 * Extrae la información del usuario de la respuesta del servidor.
 */
export const buildUserData = (data, correo) => {
  const userId = extractUserId(data);
  return {
    id_users: userId,
    id: userId,
    ID: userId,
    user_id: userId,
    userId,
    Nombre:
      data.user?.Nombre || data.user?.nombre || data.user?.name ||
      data.Nombre || data.nombre || data.name ||
      correo.split('@')[0],
    Correo: correo,
    rol: data.user?.rol || data.rol || data.user?.Rol || data.Rol || 'usuario',
    Telefono: data.user?.tel || data.user?.Telefono || data.user?.telefono || data.tel || data.Telefono || data.telefono || '',
    fotoperfil: data.user?.fotoperfil || data.fotoperfil || null,
  };
};

/**
 * Obtiene los headers de autenticación.
 */
export const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

/**
 * Comprime una imagen usando canvas (máx 800x600, calidad 70%).
 */
export const compressImage = (file) =>
  new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;

      if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
      if (height > maxHeight) { width = (width * maxHeight) / height; height = maxHeight; }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })),
        'image/jpeg',
        0.7
      );
    };

    img.src = URL.createObjectURL(file);
  });
