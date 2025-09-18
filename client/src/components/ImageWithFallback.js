import React, { useState } from 'react';

const ImageWithFallback = ({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc = "/default.png",
  onError,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = (event) => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);

      // Suppress 404 error in console for missing images
      event.preventDefault();

      if (onError) {
        onError();
      }
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback;
