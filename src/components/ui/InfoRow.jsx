import React from 'react';

/**
 * Fila de información label + valor para vistas de perfil/detalles.
 *
 * Props:
 *   label   – etiqueta descriptiva
 *   value   – valor a mostrar
 *   icon    – ícono opcional a la izquierda
 *   badge   – si true, muestra el valor como badge de color
 *   color   – color del badge (default 'violet')
 */
const InfoRow = ({ label, value, icon, badge = false, color = 'violet' }) => {
  const badgeColors = {
    violet: 'bg-violet-100 text-violet-700',
    green:  'bg-green-100  text-green-700',
    blue:   'bg-blue-100   text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
    red:    'bg-red-100    text-red-700',
  };

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      {icon && (
        <span className="mt-0.5 text-violet-400 shrink-0">{icon}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        {badge ? (
          <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeColors[color] ?? badgeColors.violet}`}>
            {value || '—'}
          </span>
        ) : (
          <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{value || '—'}</p>
        )}
      </div>
    </div>
  );
};

export default InfoRow;
