import React, { useState, useEffect, useRef } from 'react';
import './LazyImage.scss';

const LazyImage = ({ src, alt, className, placeholderSrc, errorSrc, fallback }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const imgRef = useRef(null);
  
  // Placeholder predefinito se non fornito
  const defaultPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjcwIiB5PSIxMDAiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2FyaWNhbWVudG8uLi48L3RleHQ+PC9zdmc+';
  // Immagine di errore predefinita se non fornita
  const defaultErrorImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbW1hZ2luZSBub24gZGlzcG9uaWJpbGU8L3RleHQ+PC9zdmc+';
  
  // Controlla se src è valido
  const isValidSrc = src && typeof src === 'string' && src.trim() !== '';
  
  useEffect(() => {
    // Reset stati quando cambia src
    setIsLoaded(false);
    setIsError(false);
    
    if (!isValidSrc) {
      // Nessuna immagine valida, mostra errore
      setIsError(true);
      setImageSrc('');
      return;
    }

    // Inizializza con il placeholder
    setImageSrc(placeholderSrc || defaultPlaceholder);
    
    // Configura IntersectionObserver per caricamento lazy
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        // Elemento visibile nel viewport, carica l'immagine reale
        loadImage();
        // Smetti di osservare dopo il caricamento
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
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
  }, [src, isValidSrc]);
  
  const loadImage = () => {
    if (!isValidSrc) {
      setIsError(true);
      setImageSrc('');
      return;
    }

    // Crea una nuova istanza di immagine per precaricare
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      setIsError(false);
    };
    
    img.onerror = () => {
      setIsError(true);
      setImageSrc(errorSrc || defaultErrorImage);
    };
  };

  // Se c'è un fallback personalizzato e non abbiamo un src valido, usalo
  if (!isValidSrc && fallback) {
    return fallback;
  }
  
  return (
    <div className={`lazy-image ${isLoaded ? 'lazy-image--loaded' : ''} ${isError ? 'lazy-image--error' : ''}`}>
      {/* Renderizza img solo se abbiamo un src valido O se siamo in stato di errore con errorSrc */}
      {(isValidSrc && imageSrc && imageSrc.trim() !== '') || (isError && imageSrc && imageSrc.trim() !== '') ? (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt || 'Immagine prodotto'}
          className={className}
          loading="lazy" // Fallback per browser che supportano l'attributo loading
        />
      ) : (
        <div className="lazy-image__placeholder">
          <span>Immagine non disponibile</span>
        </div>
      )}
      {!isLoaded && !isError && isValidSrc && imageSrc && imageSrc.trim() !== '' && (
        <div className="lazy-image__skeleton"></div>
      )}
    </div>
  );
};

export default LazyImage;