import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBell, FaCheck, FaTimes, FaMapMarkerAlt,
  FaCar, FaCalendarAlt, FaExternalLinkAlt,
} from 'react-icons/fa';

import PageBg            from '../../components/ui/PageBg';
import InnerNavbar       from '../../components/layout/InnerNavbar';
import LoadingScreen     from '../../components/ui/LoadingScreen';
import SectionCard       from '../../components/ui/SectionCard';
import ToastNotification from '../../components/ui/ToastNotification';
import { useToast }      from '../../hooks/useToast';
import { listarReservasApi, confirmarReservaApi } from '../../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const isLink = (t) => t && (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('www.'));

const openLink = (url) => {
  window.open(url.startsWith('www.') ? 'https://' + url : url, '_blank');
};

// ── Component ─────────────────────────────────────────────────────────────────

const ConductorNotificaciones = () => {
  const [userData,          setUserData]          = useState(null);
  const [isLoading,         setIsLoading]         = useState(true);
  const [reservasPendientes,setReservasPendientes] = useState([]);
  const [isLoadingReservas, setIsLoadingReservas] = useState(false);
  const [procesando,        setProcesando]        = useState(null);

  const { toast, showToast, hideToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { navigate('/login'); return; }
    try {
      const user = JSON.parse(stored);
      if (user.rol !== 'conductor' && user.rol !== 'admin') { navigate('/login'); return; }
      setUserData(user);
      fetchPendientes();
    } catch { navigate('/login'); }
    setIsLoading(false);
  }, [navigate]);

  const fetchPendientes = async () => {
    setIsLoadingReservas(true);
    try {
      const resp = await listarReservasApi();
      const all  = Array.isArray(resp) ? resp : (resp.data ?? []);
      setReservasPendientes(
        all.filter(r => !r.estado || r.estado.toLowerCase() === 'pendiente'),
      );
    } catch {
      showToast('Error al cargar las reservas.', 'error');
    } finally {
      setIsLoadingReservas(false);
    }
  };

  const cambiarEstado = async (reserva, nuevoEstado) => {
    const id = reserva.id_reservarviajes || reserva.id_reservarviaje || reserva.id || reserva.ID;
    setProcesando(id);
    try {
      await confirmarReservaApi(id, nuevoEstado);
      showToast(
        nuevoEstado === 'Confirmada' ? 'Reserva confirmada.' : 'Reserva rechazada.',
        nuevoEstado === 'Confirmada' ? 'success' : 'error',
      );
      await fetchPendientes();
    } catch {
      showToast('Error al actualizar la reserva.', 'error');
    } finally {
      setProcesando(null);
    }
  };

  if (isLoading) return <LoadingScreen message="Cargando..." />;

  return (
    <PageBg>
      <ToastNotification isVisible={toast.visible} message={toast.message} type={toast.type} onClose={hideToast} />
      <InnerNavbar userData={userData} title="Notificaciones" backTo="/conductor" />

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center text-white shadow">
              <FaBell />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Notificaciones</h1>
              <p className="text-blue-200 text-sm">
                {reservasPendientes.length} reserva{reservasPendientes.length !== 1 ? 's' : ''} pendiente{reservasPendientes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={fetchPendientes}
            disabled={isLoadingReservas}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl backdrop-blur-sm transition-all disabled:opacity-50"
          >
            {isLoadingReservas ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              '↻'
            )}
            Actualizar
          </button>
        </div>

        {/* Lista */}
        {isLoadingReservas ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
            <p className="text-blue-200 text-sm">Cargando reservas...</p>
          </div>
        ) : reservasPendientes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-scale-in">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Sin notificaciones</h3>
            <p className="text-gray-500 text-sm">No hay reservas pendientes por confirmar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservasPendientes.map((reserva, idx) => {
              const id = reserva.id_reservarviajes || reserva.id_reservarviaje || reserva.id || reserva.ID;
              const enProceso = procesando === id;

              return (
                <div
                  key={id ?? idx}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden animate-fade-in-up hover:shadow-lg transition-all"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Borde superior */}
                  <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500" />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
                          <FaBell className="text-yellow-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">Reserva #{id}</p>
                          <p className="text-xs text-gray-400">
                            {reserva.created_at
                              ? new Date(reserva.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
                              : 'Fecha no disponible'}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-yellow-50 text-yellow-700 border-yellow-200">
                        ⏳ Pendiente
                      </span>
                    </div>

                    {/* Info */}
                    <div className="grid sm:grid-cols-2 gap-3 mb-5">
                      {/* Ubicación */}
                      <div className="flex items-start gap-2 text-sm">
                        <FaMapMarkerAlt className="text-violet-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-0.5">Ubicación</p>
                          {isLink(reserva.ubicacion) ? (
                            <button
                              onClick={() => openLink(reserva.ubicacion)}
                              className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                            >
                              <FaExternalLinkAlt className="text-[10px]" />
                              Abrir enlace
                            </button>
                          ) : (
                            <p className="text-gray-700">{reserva.ubicacion || '—'}</p>
                          )}
                        </div>
                      </div>

                      {/* Asiento */}
                      <div className="flex items-start gap-2 text-sm">
                        <FaCar className="text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-0.5">Asiento</p>
                          <p className="text-gray-700">{reserva.asiento || '—'}</p>
                        </div>
                      </div>

                      {/* Nombre pasajero */}
                      {reserva.nombre && (
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-green-400 mt-0.5">👤</span>
                          <div>
                            <p className="text-xs text-gray-400 font-medium mb-0.5">Pasajero</p>
                            <p className="text-gray-700">{reserva.nombre}</p>
                          </div>
                        </div>
                      )}

                      {/* Fecha reserva */}
                      <div className="flex items-start gap-2 text-sm">
                        <FaCalendarAlt className="text-orange-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 font-medium mb-0.5">Fecha de reserva</p>
                          <p className="text-gray-700">
                            {reserva.created_at
                              ? new Date(reserva.created_at).toLocaleDateString('es-ES')
                              : '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => cambiarEstado(reserva, 'Confirmada')}
                        disabled={enProceso}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-green-200 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {enProceso ? (
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <FaCheck />
                        )}
                        Confirmar
                      </button>

                      <button
                        onClick={() => cambiarEstado(reserva, 'rechazada')}
                        disabled={enProceso}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {enProceso ? (
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <FaTimes />
                        )}
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageBg>
  );
};

export default ConductorNotificaciones;
