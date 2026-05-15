// Configuración de autorización para conductores
export const CONDUCTOR_AUTH_CONFIG = {
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
    'luis.gonzalez@mecaza.com',
  ],

  isConductorAutorizado: (user) => {
    if (!user?.Correo) return false;
    if (user.rol === 'admin') return true;
    if (user.rol === 'conductor') return CONDUCTOR_AUTH_CONFIG.correosAutorizados.includes(user.Correo);
    return false;
  },

  getMensajeError: (correo) =>
    `El correo ${correo} no está autorizado para acceder al panel de conductor.`,
};

export default CONDUCTOR_AUTH_CONFIG;
