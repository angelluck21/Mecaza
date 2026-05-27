import React, { useState, useRef, useEffect } from 'react';
import { FaSignOutAlt, FaCar, FaBell, FaTicketAlt, FaFileInvoice, FaChevronDown } from 'react-icons/fa';
import { UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants';
import UserAvatar from './UserAvatar';
import { logoutApi } from '../../services/api';

/* ── Estilos inline con tokens del sistema ───────────────────── */
const S = {
  wrap:      { position: 'relative' },
  trigger: (open) => ({
    display:        'flex',
    alignItems:     'center',
    gap:            '0.6rem',
    padding:        '0.4rem 0.75rem 0.4rem 0.45rem',
    borderRadius:   '10px',
    border:         `1px solid ${open ? 'rgba(255,190,0,0.4)' : 'rgba(255,255,255,0.07)'}`,
    background:     open ? 'rgba(255,190,0,0.06)' : '#141D30',
    cursor:         'pointer',
    transition:     'all 0.2s',
    fontFamily:     "'DM Sans', sans-serif",
  }),
  triggerName: {
    fontFamily:   "'Syne', sans-serif",
    fontSize:     '0.82rem',
    fontWeight:   700,
    color:        '#EEF0FA',
    maxWidth:     '120px',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  },
  chevron: (open) => ({
    width:      '12px',
    height:     '12px',
    color:      '#6B728F',
    transition: 'transform 0.25s',
    transform:  open ? 'rotate(180deg)' : 'rotate(0deg)',
    flexShrink: 0,
  }),
  dropdown: {
    position:     'absolute',
    right:        0,
    top:          'calc(100% + 8px)',
    width:        '220px',
    background:   '#0E1422',
    border:       '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    overflow:     'hidden',
    boxShadow:    '0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,190,0,0.05)',
    zIndex:       99999,
    animation:    'scaleIn 0.25s cubic-bezier(.22,1,.36,1) both',
  },
  dropHeader: {
    padding:       '1rem',
    background:    'linear-gradient(160deg, #0B0F1C 0%, #141D30 100%)',
    borderBottom:  '1px solid rgba(255,255,255,0.07)',
    display:       'flex',
    alignItems:    'center',
    gap:           '0.7rem',
  },
  headerInfo: { minWidth: 0 },
  headerName: {
    fontFamily:   "'Syne', sans-serif",
    fontSize:     '0.85rem',
    fontWeight:   700,
    color:        '#EEF0FA',
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
  },
  rolBadge: {
    display:       'inline-block',
    fontSize:      '0.58rem',
    fontWeight:    700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color:         '#FFBE00',
    background:    'rgba(255,190,0,0.1)',
    border:        '1px solid rgba(255,190,0,0.2)',
    padding:       '0.12rem 0.5rem',
    borderRadius:  '4px',
    marginTop:     '0.25rem',
  },
  menuSection: { padding: '0.4rem 0' },
  divider: {
    borderTop: '1px solid rgba(255,255,255,0.07)',
    padding:   '0.4rem 0',
  },
  menuItem: {
    display:     'flex',
    alignItems:  'center',
    gap:         '0.65rem',
    width:       '100%',
    padding:     '0.55rem 1rem',
    background:  'none',
    border:      'none',
    cursor:      'pointer',
    fontSize:    '0.82rem',
    fontFamily:  "'DM Sans', sans-serif",
    fontWeight:  500,
    color:       '#6B728F',
    transition:  'color 0.15s, background 0.15s',
    textAlign:   'left',
  },
  logoutItem: {
    display:     'flex',
    alignItems:  'center',
    gap:         '0.65rem',
    width:       '100%',
    padding:     '0.55rem 1rem',
    background:  'none',
    border:      'none',
    cursor:      'pointer',
    fontSize:    '0.82rem',
    fontFamily:  "'DM Sans', sans-serif",
    fontWeight:  500,
    color:       '#ef4444',
    transition:  'color 0.15s, background 0.15s',
    textAlign:   'left',
  },
};

/* Hover state vía onMouse handlers */
const MenuItem = ({ icon, children, onClick, danger = false }) => {
  const [hovered, setHovered] = useState(false);
  const base = danger ? S.logoutItem : S.menuItem;
  return (
    <button
      onClick={onClick}
      style={{
        ...base,
        background: hovered ? (danger ? 'rgba(239,68,68,0.06)' : 'rgba(255,190,0,0.04)') : 'none',
        color:      hovered ? (danger ? '#ef4444' : '#FFBE00') : base.color,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: '0.85rem', flexShrink: 0, opacity: hovered ? 1 : 0.5 }}>{icon}</span>
      {children}
    </button>
  );
};

const UserMenu = ({ userData }) => {
  const [open, setOpen] = useState(false);
  const menuRef         = useRef(null);
  const navigate        = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (path) => { setOpen(false); navigate(path); };

  const handleLogout = async () => {
    try { await logoutApi(); } catch { /* continuar aunque falle */ }
    localStorage.removeItem('userData');
    localStorage.removeItem('id_users');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    go('/login');
  };

  const rol         = userData?.rol;
  const isConductor = rol === ROLES.CONDUCTOR;
  const isAdmin     = rol === ROLES.ADMIN || rol === 'administrador';
  const isUsuario   = !isConductor && !isAdmin;
  const nombre      = userData?.Nombre || userData?.nombre || userData?.name || 'Usuario';

  return (
    <div style={S.wrap} ref={menuRef}>
      {/* Trigger */}
      <button style={S.trigger(open)} onClick={() => setOpen(p => !p)}>
        <UserAvatar userData={userData} size="sm" />
        <span style={S.triggerName}>{nombre}</span>
        <FaChevronDown style={S.chevron(open)} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={S.dropdown}>

          {/* Header */}
          <div style={S.dropHeader}>
            <UserAvatar userData={userData} size="md" />
            <div style={S.headerInfo}>
              <p style={S.headerName}>{nombre}</p>
              <span style={S.rolBadge}>{userData?.rol || 'usuario'}</span>
            </div>
          </div>

          {/* Links */}
          <div style={S.menuSection}>
            <MenuItem icon={<UserCircleIcon style={{ width: 15, height: 15 }} />} onClick={() => go('/ver-perfil')}>
              Ver perfil
            </MenuItem>

            {isUsuario && (
              <>
                <MenuItem icon={<FaTicketAlt />}   onClick={() => go('/mis-reservas')}>Mis Reservas</MenuItem>
                <MenuItem icon={<FaFileInvoice />}  onClick={() => go('/mis-facturas')}>Mis Facturas</MenuItem>
              </>
            )}

            {isConductor && (
              <MenuItem icon={<FaCar />} onClick={() => go('/conductor')}>Mi Panel</MenuItem>
            )}

            {isAdmin && (
              <MenuItem icon={<FaCar />} onClick={() => go('/indexAdmin')}>Mi Panel</MenuItem>
            )}

            {!isAdmin && (
              <MenuItem icon={<FaBell />} onClick={() => go('/notificaciones')}>Notificaciones</MenuItem>
            )}

            <MenuItem icon={<Cog6ToothIcon style={{ width: 15, height: 15 }} />} onClick={() => go('/ajustes-perfil')}>
              Ajustes
            </MenuItem>
          </div>

          {/* Logout */}
          <div style={S.divider}>
            <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout} danger>
              Cerrar sesión
            </MenuItem>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
