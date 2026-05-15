import React from 'react';

const LoadingScreen = ({ message = 'Cargando...' }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
    <div className="text-white text-xl">{message}</div>
  </div>
);

export default LoadingScreen;
