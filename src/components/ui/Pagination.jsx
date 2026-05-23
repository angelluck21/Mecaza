import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, lastPage, total, onPageChange, loading = false, className = '' }) => {
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
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {total != null && (
        <p className="text-xs text-gray-400">
          Página {currentPage} de {lastPage} · {total} registros
        </p>
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={() => go(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <FaChevronLeft className="text-[10px]" /> Anterior
        </button>

        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`el-${i}`} className="px-1.5 text-gray-400 text-sm select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => go(p)}
              disabled={loading}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                p === currentPage
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-violet-50 hover:text-violet-700'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => go(currentPage + 1)}
          disabled={currentPage === lastPage || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Siguiente <FaChevronRight className="text-[10px]" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
