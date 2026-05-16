export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export const ENDPOINTS = {
  // Auth
  LOGIN:       `${API_BASE_URL}/login`,
  REGISTRAR:   `${API_BASE_URL}/registrar`,
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,

  // Carros
  LISTAR_CARROS: `${API_BASE_URL}/listarcarro`,
  CREAR_CARRO: `${API_BASE_URL}/crearcarro`,
  ELIMINAR_CARRO: (id) => `${API_BASE_URL}/eliminarcarro/${id}`,
  ACTUALIZAR_ESTADO_CARRO: (id) => `${API_BASE_URL}/actualizarestado/${id}`,

  // Reservas
  LISTAR_RESERVAS: `${API_BASE_URL}/listarreserva`,
  CREAR_RESERVA: `${API_BASE_URL}/crearreserva`,
  ELIMINAR_RESERVA: (id) => `${API_BASE_URL}/eliminarreserva/${id}`,
  ACTUALIZAR_RESERVA: (id) => `${API_BASE_URL}/actualizarreserva/${id}`,
  CONFIRMAR_RESERVA:  (id) => `${API_BASE_URL}/confirmarreserva/${id}`,

  // Estados
  LISTAR_ESTADOS: `${API_BASE_URL}/listarestados`,

  // Usuarios
  LISTAR_USUARIOS: `${API_BASE_URL}/listarusuarios`,
  VER_USUARIO: (id) => `${API_BASE_URL}/verusuario/${id}`,
  ACTUALIZAR_USUARIO: (id) => `${API_BASE_URL}/actualizarusuario/${id}`,
  ELIMINAR_USUARIO: (id) => `${API_BASE_URL}/eliminarusuario/${id}`,

  // Precios
  LISTAR_PRECIOS: `${API_BASE_URL}/listarprecios`,
  AGREGAR_PRECIO: `${API_BASE_URL}/agregarprecio`,

  // Estados (agregar)
  AGREGAR_ESTADO: `${API_BASE_URL}/agregarestados`,

  // Invitaciones conductor
  INVITAR_CONDUCTOR:    `${API_BASE_URL}/invitar-conductor`,
  VALIDAR_INVITACION:   (token) => `${API_BASE_URL}/validar-invitacion/${token}`,
  REGISTRAR_CONDUCTOR:  (token) => `${API_BASE_URL}/registrar-conductor/${token}`,
};
