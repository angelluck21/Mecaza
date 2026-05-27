import React, { useState, useEffect, useRef } from 'react';
import { FaCar } from 'react-icons/fa';

const CarImage = ({
  imageUrl,
  conductorName    = 'conductor',
  className        = 'w-full h-full object-cover',
  fallbackClassName = 'w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center',
  fallbackIconSize  = 'text-4xl',
}) => {
  const [imageError,  setImageError]  = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    // Si la imagen ya estaba en cache, onLoad pudo haber disparado antes del efecto
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, [imageUrl]);

  const hasValidUrl = Boolean(imageUrl?.trim());

  if (!hasValidUrl || imageError) {
    return (
      <div className={fallbackClassName}>
        <FaCar className={fallbackIconSize} style={{ color: 'inherit' }} />
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageUrl}
      alt={`Carro de ${conductorName}`}
      className={className}
      onLoad={() => setImageLoaded(true)}
      onError={() => setImageError(true)}
      style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
    />
  );
};

export default CarImage;
