import React, { useState, useEffect } from 'react';
import { FaCar } from 'react-icons/fa';

const CarImage = ({ 
  imageUrl, 
  conductorName = 'conductor', 
  className = "w-full h-32 object-cover rounded-lg mb-4 shadow-md",
  fallbackClassName = "w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center shadow-md",
  fallbackIconSize = "text-4xl"
}) => {
  // Debug logging
  console.log('🔍 CarImage props:', { imageUrl, conductorName, className, fallbackClassName, fallbackIconSize });
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset states when imageUrl changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setIsLoading(true);
  }, [imageUrl]);

  // Determinar qué mostrar
  const hasValidImageUrl = imageUrl && imageUrl.trim() !== '';
  const shouldShowImage = hasValidImageUrl && !imageError;
  const shouldShowFallback = !hasValidImageUrl || imageError;
  
  // Debug logging
  console.log('🔍 CarImage state:', { 
    hasValidImageUrl, 
    shouldShowImage, 
    shouldShowFallback, 
    imageError, 
    imageLoaded, 
    isLoading 
  });

  const handleImageLoad = () => {
    setImageLoaded(true);
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <>
      {/* Mostrar imagen si existe URL válida y no hay error */}
      {shouldShowImage && (
        <img 
          src={imageUrl} 
          alt={`Carro de ${conductorName}`}
          className={className}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ 
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}
      
      {/* Mostrar fallback solo cuando no hay imagen válida o hay error */}
      {shouldShowFallback && (
        <div className={fallbackClassName}>
          <FaCar className={`text-blue-600 ${fallbackIconSize}`} />
        </div>
      )}
      
      {/* Mostrar loading solo cuando hay imagen válida y está cargando */}
      {shouldShowImage && isLoading && !imageLoaded && !imageError && (
        <div className={fallbackClassName}>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default CarImage;
