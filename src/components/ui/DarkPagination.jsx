import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const T = {
  surface2:    '#141D30',
  border:      'rgba(255,255,255,0.07)',
  amber:       '#FFBE00',
  fog:         '#6B728F',
  muted:       '#3A4060',
  void:        '#080B12',
};

/**
 * DarkPagination — botones de paginación con inline styles.
 * No depende de ningún archivo CSS externo.
 *
 * Props:
 *   currentPage  {number}   — página actual (1-based)
 *   lastPage     {number}   — última página disponible
 *   onPageChange {function} — callback(page: number)
 *   loading      {boolean}  — deshabilita interacción mientras carga
 *   total        {number}   — (opcional) total de registros para mostrar info
 *   label        {string}   — (opcional) etiqueta plural: "reservas", "facturas", etc.
 */
const DarkPagination = ({ currentPage, lastPage, onPageChange, loading = false, total, label = 'registros' }) => {
  if (!lastPage || lastPage <= 1) return null;

  const getPages = () => {
    if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('…');
    const start = Math.max(2, currentPage - 1);
    const end   = Math.min(lastPage - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < lastPage - 2) pages.push('…');
    pages.push(lastPage);
    return pages;
  };

  const go = (p) => {
    if (!loading && p !== currentPage && p >= 1 && p <= lastPage) onPageChange(p);
  };

  const btnStyle = (active, disabled) => ({
    height: 34, minWidth: 34, padding: '0 10px',
    borderRadius: 8,
    border: `1px solid ${active ? T.amber : T.border}`,
    background: active ? T.amber : T.surface2,
    color: active ? T.void : disabled ? T.muted : T.fog,
    fontFamily: 'Syne, sans-serif', fontSize: '0.78rem', fontWeight: 700,
    cursor: disabled ? 'not-allowed' : active ? 'default' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    opacity: disabled ? 0.35 : 1,
    boxShadow: active ? '0 0 12px rgba(255,190,0,0.25)' : 'none',
    transition: 'all 0.18s',
    flexShrink: 0,
  });

  const hoverOn  = (e, isActive) => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(255,190,0,0.35)'; e.currentTarget.style.color = T.amber; } };
  const hoverOff = (e, isActive) => { if (!isActive) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.fog; } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 24 }}>
      {total != null && (
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: T.fog }}>
          Página <strong style={{ color: T.amber }}>{currentPage}</strong> de <strong style={{ color: T.amber }}>{lastPage}</strong>
          {' · '}<strong style={{ color: T.amber }}>{total}</strong> {label}
        </p>
      )}
      {total == null && (
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', color: T.fog }}>
          Página <strong style={{ color: T.amber }}>{currentPage}</strong> de <strong style={{ color: T.amber }}>{lastPage}</strong>
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Anterior */}
        <button
          onClick={() => go(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          style={btnStyle(false, currentPage === 1 || loading)}
          onMouseEnter={e => hoverOn(e, false)}
          onMouseLeave={e => hoverOff(e, false)}
        >
          <FaChevronLeft style={{ fontSize: '0.55rem' }} /> Ant.
        </button>

        {/* Páginas */}
        {getPages().map((p, i) =>
          p === '…'
            ? <span key={`el-${i}`} style={{ color: T.muted, fontSize: '0.85rem', padding: '0 4px', userSelect: 'none' }}>…</span>
            : (
              <button
                key={p}
                onClick={() => go(p)}
                disabled={loading}
                style={btnStyle(p === currentPage, false)}
                onMouseEnter={e => hoverOn(e, p === currentPage)}
                onMouseLeave={e => hoverOff(e, p === currentPage)}
              >
                {p}
              </button>
            )
        )}

        {/* Siguiente */}
        <button
          onClick={() => go(currentPage + 1)}
          disabled={currentPage === lastPage || loading}
          style={btnStyle(false, currentPage === lastPage || loading)}
          onMouseEnter={e => hoverOn(e, false)}
          onMouseLeave={e => hoverOff(e, false)}
        >
          Sig. <FaChevronRight style={{ fontSize: '0.55rem' }} />
        </button>
      </div>
    </div>
  );
};

export default DarkPagination;
