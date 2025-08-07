// Configuración de autorización para conductores
export const CONDUCTOR_AUTH_CONFIG = {
  // Lista de correos autorizados para acceder al panel de conductor
  correosAutorizados: [
    'conductor1@mecaza.com',
    'conductor2@mecaza.com', 
    'conductor3@mecaza.com',
    'admin@mecaza.com',
    'juan.perez@mecaza.com',
    'maria.garcia@mecaza.com',
    'carlos.rodriguez@mecaza.com',
    'pedro.lopez@mecaza.com',
    'ana.martinez@mecaza.com',
    'luis.gonzalez@mecaza.com'
  ],

  // Función para verificar si un usuario está autorizado
  isConductorAutorizado: (user) => {
    if (!user || !user.Correo) {
      return false;
    }
    
    // Los administradores siempre tienen acceso
    if (user.rol === 'admin') {
      return true;
    }
    
    // Los conductores deben estar en la lista de correos autorizados
    if (user.rol === 'conductor') {
      return CONDUCTOR_AUTH_CONFIG.correosAutorizados.includes(user.Correo);
    }
    
    return false;
  },

  // Función para obtener la lista de correos autorizados (para mostrar en desarrollo)
  getCorreosAutorizados: () => {
    return CONDUCTOR_AUTH_CONFIG.correosAutorizados;
  },

  // Mensaje de error personalizado
  getMensajeError: (correo) => {
    return `El correo ${correo} no está autorizado para acceder al panel de conductor. Contacta al administrador para solicitar acceso.`;
  }
};

export default CONDUCTOR_AUTH_CONFIG; 