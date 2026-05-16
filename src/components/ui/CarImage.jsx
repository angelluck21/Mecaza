import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [imageUrl]);

  const hasValidUrl = Boolean(imageUrl?.trim());

  if (!hasValidUrl || imageError) {
    return (
      <div className={fallbackClassName}>
        <FaCar className={`text-blue-600 ${fallbackIconSize}`} />
      </div>
    );
  }

  return (
    <img
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
