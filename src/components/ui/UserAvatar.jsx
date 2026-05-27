import React from 'react';
import { getUserPhotoUrl } from '../../utils';

const GRADIENT = 'bg-gradient-to-br from-amber-500 to-yellow-400';

const SIZE = {
  xs:  'w-6 h-6 text-[10px]',
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-14 h-14 text-lg',
  xl:  'w-20 h-20 text-2xl',
};

const UserAvatar = ({ userData, size = 'md', className = '' }) => {
  const fotoRaw  = userData?.fotoperfil || userData?.fotoPerfil || userData?.Fotoperfil || null;
  const foto     = fotoRaw ? (getUserPhotoUrl(fotoRaw) || fotoRaw) : null;
  const nombre   = userData?.Nombre || userData?.nombre || userData?.name || '?';
  const inicial  = nombre.charAt(0).toUpperCase();
  const sizeClass = SIZE[size] ?? SIZE.md;

  if (foto) {
    return (
      <img
        src={foto}
        alt={nombre}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
        onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling?.style && (e.currentTarget.nextSibling.style.display = 'flex'); }}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${GRADIENT} rounded-full flex items-center justify-center font-bold shrink-0 select-none ${className}`}
      style={{ color: '#080B12' }}
    >
      {inicial}
    </div>
  );
};

export default UserAvatar;
