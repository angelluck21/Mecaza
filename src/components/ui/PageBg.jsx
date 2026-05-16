import React from 'react';

/**
 * Fondo degradado azul-violeta con esferas decorativas.
 * Úsalo como wrapper de página.
 *
 * Props:
 *   children  – contenido
 *   className – clases extra para el contenedor interno
 *   centered  – centra el contenido (útil para formularios de auth)
 */
const PageBg = ({ children, className = '', centered = false }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-violet-900 relative overflow-hidden flex flex-col">
    {/* Decoración */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-700/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10  rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-900/5 rounded-full blur-3xl" />
    </div>

    <div className={`relative z-10 flex-1 ${centered ? 'flex items-center justify-center' : ''} ${className}`}>
      {children}
    </div>
  </div>
);

export default PageBg;
