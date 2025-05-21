import React, { useState, useEffect, useRef } from 'react';
import './LazyImage.scss';

const LazyImage = ({ src, alt, className, placeholderSrc, errorSrc }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholderSrc || '');
  const imgRef = useRef(null);
  
  // Placeholder predefinito se non fornito
  const defaultPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==';
  // Immagine di errore predefinita se non fornita
  const defaultErrorImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZjBmMCIvPjx0ZXh0IHg9IjQwIiB5PSIxMDAiIGZpbGw9IiNmZjAwMDAiPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD48L3N2Zz4=';
  
  useEffect(() => {
    // Quando il componente si monta, inizializza con il placeholder
    if (!imageSrc) {
      setImageSrc(placeholderSrc || defaultPlaceholder);
    }
    
    // Configura IntersectionObserver per caricamento lazy
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        // Elemento visibile nel viewport, carica l'immagine reale
        loadImage();
        // Smetti di osservare dopo il caricamento
        observer.unobserve(imgRef.current);
      }
    }, {
      rootMargin: '100px', // Precarica quando entro 100px dal viewport
      threshold: 0.1 // Carica quando almeno il 10% dell'immagine è visibile
    });
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);
  
  const loadImage = () => {
    // Crea una nuova istanza di immagine per precaricare
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setIsError(true);
      setImageSrc(errorSrc || defaultErrorImage);
    };
  };
  
  return (
    <div className={`lazy-image ${isLoaded ? 'lazy-image--loaded' : ''} ${isError ? 'lazy-image--error' : ''}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt || 'Immagine prodotto'}
        className={className}
        loading="lazy" // Fallback per browser che supportano l'attributo loading
      />
      {!isLoaded && !isError && (
        <div className="lazy-image__skeleton"></div>
      )}
    </div>
  );
};

export default LazyImage; 