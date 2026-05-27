import axios from 'axios';
import { ENDPOINTS, API_BASE_URL } from '../constants/api';

// Web base URL for the CSRF cookie endpoint (without /api)
const WEB_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// Axios instance — credentials sent automatically so the browser includes
// the HttpOnly session cookie on every request.
const apiClient = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const clearSession = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('id_users');
  // Remove legacy token keys left over from the old Bearer-token flow
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
};

// Inject XSRF-TOKEN on every mutating request so 419 never happens after a
// page refresh (the cookie survives but the in-memory header does not).
apiClient.interceptors.request.use((config) => {
  const raw = (document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/) ?? [])[1];
  if (raw) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(raw);
  }
  return config;
});

// Auto-logout: if any authenticated request returns 401, clear state and
// redirect to login so the user is never silently stuck.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

// Fetches the CSRF cookie and manually injects the token as a default header.
// Relying on axios's automatic cookie→header translation breaks when the page
// and API are on different ports (e.g. :5173 vs :8000), because the XSRF-TOKEN
// cookie set by :8000 may not be visible in document.cookie from :5173.
const getCsrfCookie = async () => {
  await axios.get(`${WEB_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
  const raw = (document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/) ?? [])[1];
  if (raw) {
    apiClient.defaults.headers.common['X-XSRF-TOKEN'] = decodeURIComponent(raw);
  }
};

// ── Auth ─────────────────────────────────────────────────────────────────────

export const loginApi = async (correo, contrasena) => {
  await getCsrfCookie();
  return apiClient.post(ENDPOINTS.LOGIN, { Correo: correo, Contrasena: contrasena });
};

export const logoutApi = () =>
  apiClient.post(ENDPOINTS.LOGOUT);

export const registrarApi = (data) =>
  apiClient.post(ENDPOINTS.REGISTRAR, data);

export const googleAuthApi = async (credential) => {
  await getCsrfCookie();
  return apiClient.post(ENDPOINTS.GOOGLE_AUTH, { credential });
};

// ── Carros ───────────────────────────────────────────────────────────────────

export const listarCarrosApi = (params = {}) => {
  const url = new URL(ENDPOINTS.LISTAR_CARROS);
  Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') url.searchParams.set(k, String(v)); });
  return fetch(url.toString()).then(r => r.json());
};

export const listarCarrosAdminApi = (page = 1) =>
  apiClient.get(`${ENDPOINTS.LISTAR_CARROS_ADMIN}?page=${page}`);

export const crearCarroApi = (formData) =>
  apiClient.post(ENDPOINTS.CREAR_CARRO, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const eliminarCarroApi = (id) =>
  apiClient.delete(ENDPOINTS.ELIMINAR_CARRO(id));

export const actualizarEstadoCarroApi = (id, estadoId) =>
  apiClient.put(ENDPOINTS.ACTUALIZAR_ESTADO_CARRO(id), { id_estados: estadoId });

// ── Reservas ─────────────────────────────────────────────────────────────────

export const listarReservasApi = (page = 1) =>
  fetch(`${ENDPOINTS.LISTAR_RESERVAS}?page=${page}`).then(r => r.json());

export const listarReservasAuthApi = (page = 1) =>
  apiClient.get(`${ENDPOINTS.LISTAR_RESERVAS}?page=${page}`);

export const misReservasApi = (page = 1) =>
  apiClient.get(`${ENDPOINTS.MIS_RESERVAS}?page=${page}`);

export const misReservasUsuarioApi = () =>
  apiClient.get(ENDPOINTS.MIS_RESERVAS_USUARIO);

export const historialUsuarioApi = (page = 1) =>
  apiClient.get(`${ENDPOINTS.HISTORIAL_USUARIO}?page=${page}`);

export const crearReservaApi = (data) =>
  apiClient.post(ENDPOINTS.CREAR_RESERVA, data);

export const eliminarReservaApi = (id) =>
  apiClient.delete(ENDPOINTS.ELIMINAR_RESERVA(id));

export const actualizarReservaApi = (id, data) =>
  apiClient.put(ENDPOINTS.ACTUALIZAR_RESERVA(id), data);

export const confirmarReservaApi = (id, estado, motivo = null) =>
  apiClient.put(ENDPOINTS.CONFIRMAR_RESERVA(id), { estado, ...(motivo ? { motivo } : {}) });

export const historialConductorApi = (page = 1) =>
  apiClient.get(`${ENDPOINTS.HISTORIAL_CONDUCTOR}?page=${page}`);

export const iniciarViajeApi = (id) =>
  apiClient.post(ENDPOINTS.INICIAR_VIAJE(id));

export const terminarViajeApi = (id) =>
  apiClient.post(ENDPOINTS.TERMINAR_VIAJE(id));

export const asignarViajeApi = (id, data) =>
  apiClient.put(ENDPOINTS.ASIGNAR_VIAJE(id), data);

export const misCarrosApi = () =>
  apiClient.get(ENDPOINTS.MIS_CARROS);

export const completarReservaApi = (id) =>
  apiClient.put(ENDPOINTS.COMPLETAR_RESERVA(id));

export const calificarReservaApi = (id, calificacion, comentario) =>
  apiClient.put(ENDPOINTS.CALIFICAR_RESERVA(id), { calificacion, comentario });

export const calificarPasajeroApi = (id, calificacion, comentario) =>
  apiClient.put(ENDPOINTS.CALIFICAR_PASAJERO(id), {
    calificacion_conductor: calificacion,
    comentario_conductor:   comentario || null,
  });

// ── Usuarios ─────────────────────────────────────────────────────────────────

export const listarUsuariosApi = (page = 1) =>
  apiClient.get(`${ENDPOINTS.LISTAR_USUARIOS}?page=${page}`);

export const verUsuarioApi = (id) =>
  apiClient.get(ENDPOINTS.VER_USUARIO(id));

export const actualizarUsuarioApi = (id, data) =>
  apiClient.put(ENDPOINTS.ACTUALIZAR_USUARIO(id), data);

export const actualizarUsuarioConFotoApi = (id, formData) =>
  apiClient.post(ENDPOINTS.ACTUALIZAR_USUARIO(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const eliminarUsuarioApi = (id) =>
  apiClient.delete(ENDPOINTS.ELIMINAR_USUARIO(id));

// ── Invitaciones conductor ───────────────────────────────────────────────────

export const invitarConductorApi = (email) =>
  apiClient.post(ENDPOINTS.INVITAR_CONDUCTOR, { email });

export const validarInvitacionApi = (token) =>
  axios.get(ENDPOINTS.VALIDAR_INVITACION(token));

export const registrarConductorApi = (token, data) =>
  axios.post(ENDPOINTS.REGISTRAR_CONDUCTOR(token), data);

// ── Precios ──────────────────────────────────────────────────────────────────

export const listarPreciosApi = (page = null) =>
  apiClient.get(page != null ? `${ENDPOINTS.LISTAR_PRECIOS}?page=${page}` : ENDPOINTS.LISTAR_PRECIOS);

export const agregarPrecioApi = (data) =>
  apiClient.post(ENDPOINTS.AGREGAR_PRECIO, data);

export const eliminarPrecioApi = (id) =>
  apiClient.delete(ENDPOINTS.ELIMINAR_PRECIO(id));

export const actualizarPrecioApi = (id, data) =>
  apiClient.put(ENDPOINTS.ACTUALIZAR_PRECIO(id), data);

// ── Motivos de cancelación ───────────────────────────────────────────────────

export const guardarMotivoCancelacionApi = (id_reservarviajes, motivo, tipo) =>
  apiClient.post(ENDPOINTS.GUARDAR_MOTIVO_CANCELACION, { id_reservarviajes, motivo, tipo });

export const obtenerMotivoCancelacionApi = (id_reservarviajes) =>
  apiClient.get(ENDPOINTS.OBTENER_MOTIVO_CANCELACION(id_reservarviajes));

export const listarMotivosApi = () =>
  apiClient.get(ENDPOINTS.LISTAR_MOTIVOS);

// ── Facturas ─────────────────────────────────────────────────────────────────

export const generarFacturaApi = (id_reservarviajes) =>
  apiClient.post(ENDPOINTS.GENERAR_FACTURA(id_reservarviajes));

export const obtenerFacturaApi = (id_reservarviajes) =>
  apiClient.get(ENDPOINTS.OBTENER_FACTURA(id_reservarviajes));

export const obtenerMisFacturasApi = () =>
  apiClient.get(ENDPOINTS.MIS_FACTURAS);

export const listarFacturasApi = (page = 1) =>
  apiClient.get(`${ENDPOINTS.LISTAR_FACTURAS}?page=${page}`);

export const descargarFacturaApi = (id) =>
  apiClient.get(ENDPOINTS.DESCARGAR_FACTURA(id), { responseType: 'blob' });

export const descargarTodasFacturasApi = () =>
  apiClient.get(ENDPOINTS.DESCARGAR_TODAS_FACTURAS, { responseType: 'blob' });

// ── Notificaciones in-app ─────────────────────────────────────────────────────

export const misNotificacionesApi = (page = 1) =>
  apiClient.get(`${ENDPOINTS.NOTIFICACIONES}?page=${page}`);

export const contadorNoLeidasApi = () =>
  apiClient.get(ENDPOINTS.CONTADOR_NOTIFICACIONES);

export const marcarLeidaApi = (id) =>
  apiClient.put(ENDPOINTS.MARCAR_NOTIFICACION_LEIDA(id));

export const marcarTodasLeidasApi = () =>
  apiClient.put(ENDPOINTS.MARCAR_TODAS_LEIDAS);

export const eliminarTodasNotificacionesApi = () =>
  apiClient.delete(ENDPOINTS.ELIMINAR_TODAS_NOTIFICACIONES);

// ── Perfil conductor (público) ───────────────────────────────────────────────

export const getConductorPerfilApi = (idUsers) =>
  fetch(ENDPOINTS.CONDUCTOR_PERFIL(idUsers)).then(r => r.json());

export const getUsuarioPerfilApi = (idUsers) =>
  fetch(ENDPOINTS.USUARIO_PERFIL(idUsers)).then(r => r.json());

// ── GDPR ─────────────────────────────────────────────────────────────────────

export const exportarMisDatosApi = () =>
  apiClient.get(ENDPOINTS.EXPORTAR_MIS_DATOS);
