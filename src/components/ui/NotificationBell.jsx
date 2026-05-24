import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaBell, FaCheck } from 'react-icons/fa';
import {
  misNotificacionesApi,
  contadorNoLeidasApi,
  marcarLeidaApi,
  marcarTodasLeidasApi,
} from '../../services/api';

const TIPO_DOT = {
  info:    'bg-blue-400',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error:   'bg-red-500',
};

const formatFecha = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

const NotificationBell = () => {
  const [noLeidas, setNoLeidas] = useState(0);
  const [notifs,   setNotifs]   = useState([]);
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchContador = useCallback(async () => {
    try {
      const { data } = await contadorNoLeidasApi();
      setNoLeidas(data.no_leidas ?? 0);
    } catch { /* silencioso — falla si no hay sesión activa */ }
  }, []);

  // Fetch unread count on mount and every 30 s
  useEffect(() => {
    fetchContador();
    const id = setInterval(fetchContador, 30_000);
    return () => clearInterval(id);
  }, [fetchContador]);

  const handleToggle = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (!willOpen) return;

    setLoading(true);
    try {
      const { data } = await misNotificacionesApi(1);
      setNotifs(Array.isArray(data.data) ? data.data : []);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  };

  const handleMarcarLeida = async (id) => {
    try {
      await marcarLeidaApi(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch { /* silencioso */ }
  };

  const handleMarcarTodas = async () => {
    try {
      await marcarTodasLeidasApi();
      setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch { /* silencioso */ }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full text-gray-500 hover:text-violet-700 hover:bg-violet-50 transition-all"
        title="Notificaciones"
      >
        <FaBell className="text-lg" />
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 pointer-events-none">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-violet-100/60 border border-gray-100 overflow-hidden z-[99999] animate-scale-in">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-violet-50 border-b border-gray-100">
            <p className="text-sm font-bold text-blue-900">
              Notificaciones
              {noLeidas > 0 && (
                <span className="ml-2 text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">{noLeidas}</span>
              )}
            </p>
            {noLeidas > 0 && (
              <button
                onClick={handleMarcarTodas}
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-semibold transition-colors"
              >
                <FaCheck className="text-[9px]" /> Marcar todas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
              </div>
            ) : notifs.length === 0 ? (
              <div className="py-10 text-center">
                <FaBell className="text-gray-200 text-3xl mx-auto mb-2" />
                <p className="text-sm text-gray-400">Sin notificaciones</p>
              </div>
            ) : (
              notifs.map(n => (
                <button
                  key={n.id}
                  onClick={() => !n.leida && handleMarcarLeida(n.id)}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 focus:outline-none ${!n.leida ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        !n.leida ? (TIPO_DOT[n.tipo] ?? 'bg-blue-400') : 'bg-gray-200'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold leading-tight ${!n.leida ? 'text-gray-900' : 'text-gray-500'}`}>
                        {n.titulo}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed mt-0.5 line-clamp-2">
                        {n.mensaje}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatFecha(n.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
