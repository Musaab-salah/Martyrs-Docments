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

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
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
