import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaTimes, FaFileInvoice } from 'react-icons/fa';
import { calificarReservaApi, listarReservasApi } from '../services/api';

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1 justify-center">
    {[1, 2, 3, 4, 5].map((n) => (
      <button key={n} type="button" onClick={() => onChange(n)}
        className="focus:outline-none transition-transform active:scale-90">
        <FaStar className={`text-3xl transition-colors ${n <= value ? 'text-yellow-400' : 'text-gray-200'}`} />
      </button>
    ))}
  </div>
);

const DISMISSED_KEY = 'ratingDismissed';

const GlobalRatingCheck = () => {
  const [show,       setShow]       = useState(false);
  const [reserva,    setReserva]    = useState(null);
  const [stars,      setStars]      = useState(0);
  const [comentario, setComentario] = useState('');
  const [saving,     setSaving]     = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const stored = localStorage.getItem('userData');
      if (!stored) return;
      try {
        const user   = JSON.parse(stored);
        const userId = user?.id || user?.id_users || user?.ID;
        if (!userId) return;

        const resp = await listarReservasApi();
        const all  = Array.isArray(resp) ? resp : (resp?.data ?? []);

        const dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');

        const pending = all.find(r => {
          const rid = r.id_reservarviajes || r.id;
          return (
            (r.id_users || r.id_user || r.user_id) == userId &&
            r.estado?.toLowerCase() === 'completada' &&
            r.calificacion == null &&
            !dismissed.includes(rid)
          );
        });

        if (pending) {
          setReserva(pending);
          setStars(0);
          setComentario('');
          setShow(true);
        }
      } catch { /* silencioso */ }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const dismiss = () => {
    if (reserva) {
      const rid = reserva.id_reservarviajes || reserva.id;
      const prev = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...prev, rid]));
    }
    setShow(false);
  };

  const handleSave = async () => {
    if (stars === 0) return;
    const id = reserva?.id_reservarviajes || reserva?.id;
    setSaving(true);
    try {
      await calificarReservaApi(id, stars, comentario.trim() || null);
      // Eliminar de dismissidos si estaba
      const prev     = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
      const filtered = prev.filter(d => d !== id);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(filtered));
      setShow(false);
    } catch { /* silencioso */ }
    finally { setSaving(false); }
  };

  if (!show || !reserva) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,10,40,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">¿Cómo estuvo el viaje?</h3>
            <p className="text-yellow-100 text-xs mt-0.5">Tu opinión ayuda a mejorar Mecaza</p>
          </div>
          <button onClick={dismiss} className="p-1 hover:bg-white/20 rounded-lg transition-all">
            <FaTimes className="text-white" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">Toca las estrellas para calificar</p>
            <StarRating value={stars} onChange={setStars} />
            {stars > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'][stars]}
              </p>
            )}
          </div>
          <textarea
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            placeholder="(Opcional) Cuéntanos más sobre tu experiencia..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            rows="3"
          />
          <div className="flex gap-3">
            <button onClick={dismiss} disabled={saving}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all">
              Omitir
            </button>
            <button onClick={handleSave} disabled={saving || stars === 0}
              className="flex-1 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Enviar'}
            </button>
          </div>
          <button
            onClick={() => { dismiss(); navigate('/mis-facturas'); }}
            className="w-full flex items-center justify-center gap-2 text-xs text-violet-600 hover:text-violet-800 transition-colors"
          >
            <FaFileInvoice /> Ver mi factura del viaje
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalRatingCheck;
