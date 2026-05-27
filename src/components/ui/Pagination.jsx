import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, lastPage, total, onPageChange, loading = false }) => {
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

  return (
    <div className="mcz-pagination">
      {total != null && (
        <p className="mcz-pagination-info">
          Página <strong>{currentPage}</strong> de <strong>{lastPage}</strong>
          {' · '}{total} viaje{total !== 1 ? 's' : ''}
        </p>
      )}

      <div className="mcz-pagination-row">
        {/* Anterior */}
        <button
          className="mcz-page-btn"
          onClick={() => go(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          <FaChevronLeft style={{ fontSize: '0.6rem' }} /> Ant.
        </button>

        {/* Páginas */}
        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`el-${i}`} className="mcz-page-ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`mcz-page-btn ${p === currentPage ? 'active' : ''}`}
              onClick={() => go(p)}
              disabled={loading}
            >
              {p}
            </button>
          )
        )}

        {/* Siguiente */}
        <button
          className="mcz-page-btn"
          onClick={() => go(currentPage + 1)}
          disabled={currentPage === lastPage || loading}
        >
          Sig. <FaChevronRight style={{ fontSize: '0.6rem' }} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
