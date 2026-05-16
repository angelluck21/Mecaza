import React from 'react';

/**
 * Tarjeta de estadística para dashboards.
 *
 * Props:
 *   icon    – nodo React
 *   label   – texto descriptivo
 *   value   – número o string a mostrar
 *   color   – 'violet' | 'blue' | 'green' | 'orange'
 *   loading – muestra skeleton si true
 */
const COLORS = {
  violet: { bg: 'bg-violet-50', icon: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-100' },
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-500',   text: 'text-blue-600',   border: 'border-blue-100'   },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-500',  text: 'text-green-600',  border: 'border-green-100'  },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-100' },
};

const StatCard = ({ icon, label, value, color = 'violet', loading = false }) => {
  const c = COLORS[color] ?? COLORS.violet;

  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
      <div className={`${c.icon} w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shrink-0 shadow-sm`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">{label}</p>
        {loading ? (
          <div className="mt-1.5 h-7 w-16 bg-gray-200 animate-pulse rounded-lg" />
        ) : (
          <p className={`text-2xl font-extrabold ${c.text} mt-0.5`}>{value ?? '—'}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
