export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export const ENDPOINTS = {
  API_BASE: API_BASE_URL,

  // Auth
  LOGIN:       `${API_BASE_URL}/login`,
  REGISTRAR:   `${API_BASE_URL}/registrar`,
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,

  // Carros
  LISTAR_CARROS:       `${API_BASE_URL}/listarcarro`,
  LISTAR_CARROS_ADMIN: `${API_BASE_URL}/listarcarros-admin`,
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
  LISTAR_ESTADOS:  `${API_BASE_URL}/listarestados`,
  AGREGAR_ESTADO:  `${API_BASE_URL}/agregarestados`,
  ELIMINAR_ESTADO: (id) => `${API_BASE_URL}/eliminarestados/${id}`,

  // Usuarios
  LISTAR_USUARIOS: `${API_BASE_URL}/listarusuarios`,
  VER_USUARIO: (id) => `${API_BASE_URL}/verusuario/${id}`,
  ACTUALIZAR_USUARIO: (id) => `${API_BASE_URL}/actualizarusuario/${id}`,
  ELIMINAR_USUARIO: (id) => `${API_BASE_URL}/eliminarusuario/${id}`,

  // Precios
  LISTAR_PRECIOS:    `${API_BASE_URL}/listarprecios`,
  AGREGAR_PRECIO:    `${API_BASE_URL}/agregarprecio`,
  ELIMINAR_PRECIO:   (id) => `${API_BASE_URL}/eliminarprecio/${id}`,
  ACTUALIZAR_PRECIO: (id) => `${API_BASE_URL}/actualizarprecio/${id}`,

  // Invitaciones conductor
  INVITAR_CONDUCTOR:   `${API_BASE_URL}/invitar-conductor`,
  VALIDAR_INVITACION:  (token) => `${API_BASE_URL}/validar-invitacion/${token}`,
  REGISTRAR_CONDUCTOR: (token) => `${API_BASE_URL}/registrar-conductor/${token}`,

  // Motivos de cancelación
  GUARDAR_MOTIVO_CANCELACION: `${API_BASE_URL}/guardarMotivoCancelacion`,
  OBTENER_MOTIVO_CANCELACION: (id) => `${API_BASE_URL}/motivosCancelacion/${id}`,
  LISTAR_MOTIVOS: `${API_BASE_URL}/listarMotivos`,

  // Viaje
  INICIAR_VIAJE:       (id) => `${API_BASE_URL}/iniciarviajenotify/${id}`,
  TERMINAR_VIAJE:      (id) => `${API_BASE_URL}/terminarviaje/${id}`,
  ASIGNAR_VIAJE:       (id) => `${API_BASE_URL}/asignarviaje/${id}`,
  MIS_CARROS:          `${API_BASE_URL}/mis-carros`,
  HISTORIAL_CONDUCTOR: `${API_BASE_URL}/historial-conductor`,
  COMPLETAR_RESERVA:  (id) => `${API_BASE_URL}/completarreserva/${id}`,
  CALIFICAR_RESERVA:   (id) => `${API_BASE_URL}/calificarreserva/${id}`,
  CONDUCTOR_PERFIL:    (id) => `${API_BASE_URL}/conductor-perfil/${id}`,

  // Facturas
  GENERAR_FACTURA:  (id) => `${API_BASE_URL}/generarFactura/${id}`,
  OBTENER_FACTURA:  (id) => `${API_BASE_URL}/facturaReserva/${id}`,
  MIS_FACTURAS:     `${API_BASE_URL}/misFacturas`,
  LISTAR_FACTURAS:  `${API_BASE_URL}/listarFacturas`,
  DESCARGAR_FACTURA:       (id) => `${API_BASE_URL}/descargarFactura/${id}`,
  DESCARGAR_TODAS_FACTURAS: `${API_BASE_URL}/descargarTodasFacturas`,
};
