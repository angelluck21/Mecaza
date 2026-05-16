import React from 'react';

/**
 * Tarjeta de sección interna dentro de una página.
 *
 * Props:
 *   title     – título de la sección
 *   icon      – ícono junto al título
 *   children  – contenido
 *   accent    – color del acento superior ('violet' | 'blue' | 'green' | 'red')
 *   className – clases extra
 */
const ACCENTS = {
  violet: 'from-violet-500 to-blue-500',
  blue:   'from-blue-500   to-cyan-400',
  green:  'from-green-500  to-emerald-400',
  red:    'from-red-500    to-pink-500',
  orange: 'from-orange-400 to-yellow-400',
};

const SectionCard = ({ title, icon, children, accent = 'violet', className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {/* Borde superior de color */}
    <div className={`h-0.5 bg-gradient-to-r ${ACCENTS[accent] ?? ACCENTS.violet}`} />

    {(title || icon) && (
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        {icon && <span className="text-violet-500">{icon}</span>}
        {title && <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>}
      </div>
    )}

    <div className="px-5 py-4">
      {children}
    </div>
  </div>
);

export default SectionCard;
