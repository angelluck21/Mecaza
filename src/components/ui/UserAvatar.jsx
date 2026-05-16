import React from 'react';

const GRADIENT = 'bg-gradient-to-br from-blue-600 to-violet-600';

const SIZE = {
  xs:  'w-6 h-6 text-[10px]',
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-14 h-14 text-lg',
  xl:  'w-20 h-20 text-2xl',
};

const UserAvatar = ({ userData, size = 'md', className = '' }) => {
  const foto   = userData?.fotoperfil || userData?.fotoPerfil || userData?.Fotoperfil || null;
  const nombre = userData?.Nombre || userData?.nombre || userData?.name || '?';
  const inicial = nombre.charAt(0).toUpperCase();
  const sizeClass = SIZE[size] ?? SIZE.md;

  if (foto) {
    return (
      <img
        src={foto}
        alt={nombre}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${GRADIENT} rounded-full flex items-center justify-center text-white font-bold shrink-0 select-none ${className}`}
    >
      {inicial}
    </div>
  );
};

export default UserAvatar;
