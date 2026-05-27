/**
 * Navbar unificado — funciona en todas las vistas.
 *
 * Modo MAIN  (sin `title`):  logo · barra de búsqueda · filtros flotantes · acciones usuario
 * Modo INNER (con `title`):  ← Volver · logo · título · acciones usuario
 *
 * userData se lee automáticamente de localStorage.
 *
 * filterConfig (opcional, solo modo MAIN):
 *   { open, onToggle, activeCount, hasActive, onClear, content }
 */

import React, { useState, useEffect } from 'react';
import { FaCar, FaFilter, FaTimes } from 'react-icons/fa';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import UserMenu         from '../ui/UserMenu';
import NotificationBell from '../ui/NotificationBell';

const Navbar = ({
  /* Modo main */
  searchTerm   = '',
  onSearch     = null,
  filterConfig = null,   // { open, onToggle, activeCount, hasActive, onClear, content }
  /* Modo inner */
  title   = '',
  backTo  = null,
  actions = null,
}) => {
  const [userData, setUserData] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const parse = () => {
      const stored = localStorage.getItem('userData');
      if (!stored) { setUserData(null); return; }
      try { setUserData(JSON.parse(stored)); } catch { setUserData(null); }
    };
    parse();
    window.addEventListener('storage', parse);
    return () => window.removeEventListener('storage', parse);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isInner  = !!title;
  const hasSearch = !isInner && !!onSearch;
  const hasFilter = hasSearch && !!filterConfig;

  const homeHref = (() => {
    const rol = userData?.rol;
    if (rol === 'conductor')                        return '/conductor';
    if (rol === 'admin' || rol === 'administrador') return '/indexAdmin';
    if (userData)                                   return '/indexLogin';
    return '/';
  })();

  const handleBack = () => backTo ? navigate(backTo) : navigate(-1);

  return (
    <>
      <nav className={`nav-home ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">

          {/* ── IZQUIERDA ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {isInner && (
              <>
                <BackBtn onClick={handleBack} />
                <span style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />
              </>
            )}
            <a href={homeHref} className="nav-logo">
              <div className="nav-logo-icon"><FaCar /></div>
              <span className="nav-logo-name">Mecaza</span>
            </a>
          </div>

          {/* ── CENTRO ── */}
          {hasSearch ? (
            <div className={`nav-search-wrap ${filterConfig?.open ? 'filter-open' : ''}`}>
              <MagnifyingGlassIcon className="nav-search-icon" />
              <input
                type="text"
                placeholder="Buscar conductor, destino, placa…"
                value={searchTerm}
                onChange={e => onSearch(e.target.value)}
                className="nav-search"
              />
              {hasFilter && (
                <button
                  type="button"
                  className={`nav-filter-trigger ${filterConfig.hasActive ? 'active' : ''}`}
                  onClick={filterConfig.onToggle}
                >
                  <FaFilter style={{ fontSize: '0.65rem' }} />
                  Filtros
                  {filterConfig.activeCount > 0 && (
                    <span className="nav-filter-count">{filterConfig.activeCount}</span>
                  )}
                </button>
              )}
            </div>
          ) : isInner && title ? (
            <p style={{
              fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 700,
              color: 'rgba(238,240,250,0.7)', letterSpacing: '-0.01em',
              flex: 1, textAlign: 'center',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              padding: '0 1rem',
            }}>
              {title}
            </p>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {/* ── DERECHA (desktop) ── */}
          <div className="nav-actions">
            {actions}
            {userData ? (
              <>
                <NotificationBell />
                <UserMenu userData={userData} />
              </>
            ) : (
              <>
                <a href="/login"     className="nav-btn-ghost">Iniciar sesión</a>
                <a href="/registrar" className="nav-btn-amber">Registrarse →</a>
              </>
            )}
          </div>

          {/* Toggle móvil */}
          <button className="nav-mobile-toggle" onClick={() => setMenuOpen(p => !p)} aria-label="Menú">
            {menuOpen ? <XMarkIcon /> : <Bars3Icon />}
          </button>
        </div>

        {/* ── MENÚ MÓVIL ── */}
        {menuOpen && (
          <div className="nav-mobile-menu">
            {hasSearch && (
              <div className="nav-mobile-search">
                <MagnifyingGlassIcon />
                <input
                  type="text"
                  placeholder="Buscar conductor, destino…"
                  value={searchTerm}
                  onChange={e => onSearch(e.target.value)}
                />
              </div>
            )}
            {isInner && (
              <button className="nav-mobile-link" onClick={handleBack}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ArrowLeftIcon style={{ width: 14, height: 14 }} /> Volver
              </button>
            )}
            {userData ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.75rem' }}>
                <span style={{ fontSize: '0.84rem', color: 'var(--fog)', fontFamily: "'DM Sans', sans-serif" }}>
                  {userData?.Nombre || userData?.nombre || 'Usuario'}
                </span>
                <NotificationBell />
              </div>
            ) : (
              <>
                <a href="/"          className="nav-mobile-link">Inicio</a>
                <a href="/login"     className="nav-mobile-link">Iniciar sesión</a>
                <a href="/registrar" className="nav-mobile-link amber">Registrarse</a>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── DROPDOWN DE FILTROS (fuera del nav para no quedar atrapado) ── */}
      {hasFilter && filterConfig.open && (
        <>
          {/* Backdrop */}
          <div className="nav-filter-backdrop" onClick={filterConfig.onToggle} />

          {/* Panel flotante */}
          <div className="nav-filter-dropdown">
            <div className="nav-filter-head">
              <span className="nav-filter-head-title">Filtros de búsqueda</span>
              {filterConfig.hasActive && (
                <button className="nav-filter-clear-all" onClick={filterConfig.onClear}>
                  <FaTimes style={{ fontSize: '0.6rem' }} /> Limpiar todo
                </button>
              )}
            </div>
            {filterConfig.content}
          </div>
        </>
      )}
    </>
  );
};

/* ── Botón volver ─────────────────────────────────────────────── */
const BackBtn = ({ onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 500,
        color: hovered ? 'var(--amber)' : 'var(--fog)',
        padding: '0.35rem 0.5rem', borderRadius: '6px',
        transition: 'color 0.2s', flexShrink: 0,
      }}
    >
      <ArrowLeftIcon style={{ width: 14, height: 14, transform: hovered ? 'translateX(-2px)' : 'none', transition: 'transform 0.2s' }} />
      <span style={{ display: 'none' }}>Volver</span>
    </button>
  );
};

export default Navbar;
