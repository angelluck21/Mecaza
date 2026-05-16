import React from 'react';
import { FaCar } from 'react-icons/fa';

const LoadingScreen = ({ message = 'Cargando...' }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900 flex flex-col items-center justify-center relative overflow-hidden">

    {/* Decoración */}
    <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-700/15 rounded-full blur-3xl" />
    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

    <div className="relative flex flex-col items-center gap-5 animate-fade-in">
      {/* Ícono animado */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-violet-500/30 border-t-violet-400 animate-spin" />
        <div className="absolute inset-3 rounded-full bg-white/10 flex items-center justify-center">
          <FaCar className="text-white text-2xl animate-float" />
        </div>
      </div>

      {/* Nombre */}
      <p className="text-2xl font-extrabold bg-gradient-to-r from-blue-300 to-violet-300 bg-clip-text text-transparent">
        Mecaza
      </p>

      {/* Mensaje */}
      <p className="text-blue-200 text-sm">{message}</p>

      {/* Puntos animados */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default LoadingScreen;
