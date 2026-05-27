import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaStar, FaRegStar, FaRoad, FaArrowLeft, FaCommentAlt,
} from 'react-icons/fa';

import PageBg        from '../components/ui/PageBg';
import InnerNavbar   from '../components/layout/InnerNavbar';
import Footer        from '../components/layout/Footer';
import LoadingScreen from '../components/ui/LoadingScreen';
import SectionCard   from '../components/ui/SectionCard';
import UserAvatar    from '../components/ui/UserAvatar';
import { getConductorPerfilApi } from '../services/api';

// ── Fila de estrellas ────────────────────────────────────────────────────────
const StarRow = ({ value, size = 'text-sm' }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) =>
      n <= Math.round(value ?? 0)
        ? <FaStar    key={n} className={`${size} text-amber-400`} />
        : <FaRegStar key={n} className={`${size} text-gray-300`}  />
    )}
  </span>
);

// ── Barra de proporción de estrellas ─────────────────────────────────────────
const StarBar = ({ label, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-14 text-gray-500 text-right shrink-0">{label} ★</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-gray-400 shrink-0">{count}</span>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const PerfilConductor = () => {
  const { conductorId } = useParams();
  const navigate        = useNavigate();

  const [userData,   setUserData]   = useState(null);
  const [perfil,     setPerfil]     = useState(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [notFound,   setNotFound]   = useState(false);

  useEffect(() => {
    // Leer usuario autenticado (si lo hay)
    try {
      const stored = localStorage.getItem('userData');
      if (stored) setUserData(JSON.parse(stored));
    } catch {}

    if (!conductorId) { setNotFound(true); setIsLoading(false); return; }

    getConductorPerfilApi(conductorId)
      .then(res => {
        if (res?.data) setPerfil(res.data);
        else           setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [conductorId]);

  if (isLoading) return <LoadingScreen message="Cargando perfil del conductor..." />;

  if (notFound) return (
    <PageBg centered>
      <div className="text-center text-white space-y-4">
        <p className="text-lg font-semibold">No se encontró el conductor</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors text-sm"
        >
          Volver
        </button>
      </div>
    </PageBg>
  );

  // ── Calcular distribución de estrellas ───────────────────────────────────
  const resenas  = perfil.resenas ?? [];
  const distrib  = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: resenas.filter(r => Math.round(r.calificacion) === star).length,
  }));
  const totalCal = perfil.total_calificaciones ?? 0;
  const promedio = perfil.promedio_estrellas   ?? null;

  return (
    <PageBg>
      <InnerNavbar title="Perfil del conductor" />

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in-up">

        {/* ── Botón volver ─────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
        >
          <FaArrowLeft className="text-xs" />
          Volver
        </button>

        {/* ── Tarjeta principal ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-blue-700 to-violet-600" />

          {/* Foto + nombre */}
          <div className="px-6 pb-6 -mt-12">
            <div className="flex items-end gap-4 mb-4">
              <UserAvatar
                userData={{ fotoperfil: perfil.fotoperfil, name: perfil.nombre }}
                size="xl"
                className="ring-4 ring-white shadow-lg w-24 h-24 text-3xl"
              />
              <div className="pb-1">
                <h1 className="text-xl font-extrabold text-gray-900 leading-tight">{perfil.nombre}</h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                  Conductor verificado
                </span>
              </div>
            </div>

            {/* Stats rápidas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-extrabold text-blue-700">{perfil.total_viajes}</p>
                <p className="text-xs text-blue-500 font-medium mt-0.5">
                  {perfil.total_viajes === 1 ? 'Viaje completado' : 'Viajes completados'}
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-extrabold text-amber-600">
                  {promedio != null ? Number(promedio).toFixed(1) : '—'}
                </p>
                <p className="text-xs text-amber-500 font-medium mt-0.5">Promedio de estrellas</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Calificaciones ───────────────────────────────────────────────── */}
        <SectionCard title="Calificaciones" icon={<FaStar className="text-xs text-amber-400" />} accent="orange">
          {totalCal === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">
              Este conductor aún no tiene calificaciones.
            </p>
          ) : (
            <div className="flex gap-6 items-start">
              {/* Número grande */}
              <div className="flex flex-col items-center shrink-0">
                <p className="text-5xl font-extrabold text-gray-900 leading-none">
                  {Number(promedio).toFixed(1)}
                </p>
                <StarRow value={promedio} size="text-base" />
                <p className="text-xs text-gray-400 mt-1">{totalCal} {totalCal === 1 ? 'reseña' : 'reseñas'}</p>
              </div>

              {/* Barras */}
              <div className="flex-1 space-y-2 pt-1">
                {distrib.map(({ star, count }) => (
                  <StarBar key={star} label={star} count={count} total={totalCal} />
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── Reseñas recientes ─────────────────────────────────────────────── */}
        <SectionCard
          title="Reseñas recientes"
          icon={<FaCommentAlt className="text-xs" />}
          accent="violet"
        >
          {resenas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">
              Aún no hay comentarios escritos.
            </p>
          ) : (
            <div className="space-y-4">
              {resenas.map((r, i) => (
                <div key={i} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <StarRow value={r.calificacion} size="text-sm" />
                    <span className="text-[11px] text-gray-400">{r.fecha}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{r.comentario}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Volver abajo */}
        <div className="pb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <FaArrowLeft className="text-xs" /> Volver al viaje
          </button>
        </div>

      </div>
      <Footer />
    </PageBg>
  );
};

export default PerfilConductor;
