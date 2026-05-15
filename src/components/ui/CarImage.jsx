import React, { useState, useEffect } from 'react';
import { FaCar } from 'react-icons/fa';

const CarImage = ({
  imageUrl,
  conductorName = 'conductor',
  className        = 'w-full h-32 object-cover rounded-lg mb-4 shadow-md',
  fallbackClassName = 'w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center shadow-md',
  fallbackIconSize  = 'text-4xl',
}) => {
  const [imageError,  setImageError]  = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading,   setIsLoading]   = useState(true);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setIsLoading(true);
  }, [imageUrl]);

  const hasValidUrl    = Boolean(imageUrl?.trim());
  const shouldShowImg  = hasValidUrl && !imageError;
  const shouldShowFall = !hasValidUrl || imageError;

  return (
    <>
      {shouldShowImg && (
        <img
          src={imageUrl}
          alt={`Carro de ${conductorName}`}
          className={className}
          onLoad={() => { setImageLoaded(true); setIsLoading(false); }}
          onError={() => { setImageError(true);  setIsLoading(false); }}
          style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
        />
      )}

      {shouldShowFall && (
        <div className={fallbackClassName}>
          <FaCar className={`text-blue-600 ${fallbackIconSize}`} />
        </div>
      )}

      {shouldShowImg && isLoading && !imageLoaded && !imageError && (
        <div className={fallbackClassName}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}
    </>
  );
};

export default CarImage;
