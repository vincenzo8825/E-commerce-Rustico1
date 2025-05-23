import React from 'react';

/**
 * Utilities per la gestione delle immagini nel frontend
 */

/**
 * Verifica se un'immagine ha un URL valido
 * @param {string} imageUrl - URL dell'immagine
 * @returns {boolean} - True se l'URL è valido
 */
export const isValidImageUrl = (imageUrl) => {
  return imageUrl && 
         typeof imageUrl === 'string' && 
         imageUrl.trim() !== '' && 
         imageUrl !== 'null' && 
         imageUrl !== 'undefined';
};

/**
 * Restituisce un URL dell'immagine valido o null
 * @param {string} imageUrl - URL dell'immagine
 * @returns {string|null} - URL valido o null
 */
export const getSafeImageUrl = (imageUrl) => {
  return isValidImageUrl(imageUrl) ? imageUrl : null;
};

/**
 * Restituisce l'URL della prima immagine valida da un array di immagini
 * @param {Array} images - Array di oggetti immagine
 * @returns {string|null} - URL della prima immagine valida o null
 */
export const getFirstValidImageUrl = (images) => {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }
  
  for (const image of images) {
    const url = image?.url || image?.src || image;
    if (isValidImageUrl(url)) {
      return url;
    }
  }
  
  return null;
};

/**
 * Restituisce un URL di placeholder per le immagini mancanti
 * @returns {string} - URL del placeholder
 */
export const getPlaceholderImageUrl = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNTAgOTBDMTQxLjE2IDkwIDEzNCA5Ny4xNiAxMzQgMTA2QzEzNCAxMTQuODQgMTQxLjE2IDEyMiAxNTAgMTIyQzE1OC44NCAxMjIgMTY2IDExNC44NCAxNjYgMTA2QzE2NiA5Ny4xNiAxNTguODQgOTAgMTUwIDkwWiIgZmlsbD0iI0NDQ0NDQyIvPgo8cGF0aCBkPSJNMTg2IDIxMEgxMTRDMTA5LjU4IDIxMCAxMDYgMjA2LjQyIDEwNiAyMDJWMTgyQzEwNiAxNzcuNTggMTA5LjU4IDE3NCAxMTQgMTc0SDE4NkMxOTAuNDIgMTc0IDE5NCAxNzcuNTggMTk0IDE4MlYyMDJDMTk0IDIwNi40MiAxOTAuNDIgMjEwIDE4NiAyMTBaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjwvc3ZnPgo=';
};

/**
 * Props per il componente SafeImage
 */
export const SafeImageProps = {
  src: null,
  alt: '',
  className: '',
  onError: null,
  fallback: null
};

/**
 * Componente per la visualizzazione sicura delle immagini
 */
export const SafeImage = ({ 
  src, 
  alt = '', 
  className = '', 
  onError = null, 
  fallback = null,
  ...props 
}) => {
  const safeUrl = getSafeImageUrl(src);
  
  if (!safeUrl) {
    if (fallback) {
      return fallback;
    }
    return (
      <div className={`safe-image-placeholder ${className}`} style={{ position: 'relative' }} {...props}>
        <svg width="100%" height="100%" viewBox="0 0 300 300" fill="none">
          <rect width="300" height="300" fill="#F5F5F5"/>
          <path d="M150 90C141.16 90 134 97.16 134 106C134 114.84 141.16 122 150 122C158.84 122 166 114.84 166 106C166 97.16 158.84 90 150 90Z" fill="#CCCCCC"/>
          <path d="M186 210H114C109.58 210 106 206.42 106 202V182C106 177.58 109.58 174 114 174H186C190.42 174 194 177.58 194 182V202C194 206.42 190.42 210 186 210Z" fill="#CCCCCC"/>
        </svg>
        <span style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#999',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          {alt || 'Immagine non disponibile'}
        </span>
      </div>
    );
  }
  
  return (
    <img 
      src={safeUrl} 
      alt={alt} 
      className={className}
      onError={onError}
      {...props}
    />
  );
}; 