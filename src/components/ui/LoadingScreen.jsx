import React from 'react';
import { FaCar } from 'react-icons/fa';

const LoadingScreen = ({ message = 'Cargando...' }) => (
  <div className="mcz-loading-screen">
    {/* Spinner doble anillo */}
    <div className="mcz-loading-spinner-wrap">
      <div className="mcz-loading-ring" />
      <div className="mcz-loading-ring-2" />
      <div className="mcz-loading-car"><FaCar /></div>
    </div>

    {/* Brand */}
    <p className="mcz-loading-brand">
      Me<em>caza</em>
    </p>

    {/* Mensaje */}
    <p className="mcz-loading-msg">{message}</p>

    {/* Dots */}
    <div className="mcz-loading-dots">
      <div className="mcz-loading-dot" />
      <div className="mcz-loading-dot" />
      <div className="mcz-loading-dot" />
    </div>
  </div>
);

export default LoadingScreen;
