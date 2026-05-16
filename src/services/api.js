import axios from 'axios';
import { ENDPOINTS } from '../constants/api';
import { getAuthHeaders } from '../utils';

const authHeaders = () => ({ headers: getAuthHeaders() });

// ── Auth ─────────────────────────────────────────────────────────────────────

export const loginApi = (correo, contrasena) =>
  axios.post(ENDPOINTS.LOGIN, { Correo: correo, Contrasena: contrasena }, authHeaders());

export const registrarApi = (data) =>
  axios.post(ENDPOINTS.REGISTRAR, data, authHeaders());

export const googleAuthApi = (credential) =>
  axios.post(ENDPOINTS.GOOGLE_AUTH, { credential });

// ── Carros ───────────────────────────────────────────────────────────────────

export const listarCarrosApi = () =>
  fetch(ENDPOINTS.LISTAR_CARROS).then((r) => r.json());

export const crearCarroApi = (formData) =>
  axios.post(ENDPOINTS.CREAR_CARRO, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      Accept: 'application/json',
    },
  });

export const eliminarCarroApi = (id) =>
  axios.delete(ENDPOINTS.ELIMINAR_CARRO(id), authHeaders());

export const actualizarEstadoCarroApi = (id, estadoId) =>
  axios.put(ENDPOINTS.ACTUALIZAR_ESTADO_CARRO(id), { id_estados: estadoId }, authHeaders());

// ── Reservas ─────────────────────────────────────────────────────────────────

export const listarReservasApi = () =>
  fetch(ENDPOINTS.LISTAR_RESERVAS).then((r) => r.json());

export const listarReservasAuthApi = () =>
  axios.get(ENDPOINTS.LISTAR_RESERVAS, authHeaders());

export const crearReservaApi = (data) =>
  axios.post(ENDPOINTS.CREAR_RESERVA, data, authHeaders());

export const eliminarReservaApi = (id) =>
  axios.delete(ENDPOINTS.ELIMINAR_RESERVA(id), authHeaders());

export const actualizarReservaApi = (id, data) =>
  axios.put(ENDPOINTS.ACTUALIZAR_RESERVA(id), data, authHeaders());

export const confirmarReservaApi = (id, estado) =>
  axios.put(ENDPOINTS.CONFIRMAR_RESERVA(id), { estado }, authHeaders());

// ── Estados ──────────────────────────────────────────────────────────────────

export const listarEstadosApi = () =>
  axios.get(ENDPOINTS.LISTAR_ESTADOS, authHeaders());

// ── Usuarios ─────────────────────────────────────────────────────────────────

export const listarUsuariosApi = () =>
  axios.get(ENDPOINTS.LISTAR_USUARIOS, authHeaders());

export const verUsuarioApi = (id) =>
  axios.get(ENDPOINTS.VER_USUARIO(id), authHeaders());

export const actualizarUsuarioApi = (id, data) =>
  axios.put(ENDPOINTS.ACTUALIZAR_USUARIO(id), data, authHeaders());

export const actualizarUsuarioConFotoApi = (id, formData) =>
  axios.post(ENDPOINTS.ACTUALIZAR_USUARIO(id), formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      Accept: 'application/json',
    },
  });

export const eliminarUsuarioApi = (id) =>
  axios.delete(ENDPOINTS.ELIMINAR_USUARIO(id), authHeaders());

// ── Invitaciones conductor ───────────────────────────────────────────────────

export const invitarConductorApi = (email) =>
  axios.post(ENDPOINTS.INVITAR_CONDUCTOR, { email }, authHeaders());

export const validarInvitacionApi = (token) =>
  axios.get(ENDPOINTS.VALIDAR_INVITACION(token));

export const registrarConductorApi = (token, data) =>
  axios.post(ENDPOINTS.REGISTRAR_CONDUCTOR(token), data);

// ── Precios ──────────────────────────────────────────────────────────────────

export const listarPreciosApi = () =>
  axios.get(ENDPOINTS.LISTAR_PRECIOS, authHeaders());

export const agregarPrecioApi = (data) =>
  axios.post(ENDPOINTS.AGREGAR_PRECIO, data, authHeaders());

// ── Estados ──────────────────────────────────────────────────────────────────

export const agregarEstadoApi = (data) =>
  axios.post(ENDPOINTS.AGREGAR_ESTADO, data, authHeaders());
