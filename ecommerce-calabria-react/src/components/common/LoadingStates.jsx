import React from 'react';
import './LoadingStates.scss';

// =====================================
// LOADING COMPONENTS
// =====================================

export const LoadingSpinner = ({ size = 'medium', message = 'Caricamento...', className = '' }) => {
  const sizeClass = `loading-spinner--${size}`;
  
  return (
    <div className={`loading-spinner ${sizeClass} ${className}`}>
      <div className="loading-spinner__icon">
        <i className="fas fa-spinner fa-spin"></i>
      </div>
      {message && <p className="loading-spinner__message">{message}</p>}
    </div>
  );
};

export const LoadingDots = ({ message = 'Caricamento', className = '' }) => (
  <div className={`loading-dots ${className}`}>
    <span className="loading-dots__message">{message}</span>
    <div className="loading-dots__container">
      <div className="loading-dots__dot"></div>
      <div className="loading-dots__dot"></div>
      <div className="loading-dots__dot"></div>
    </div>
  </div>
);

export const LoadingProgress = ({ 
  progress = 0, 
  message = 'Caricamento in corso...', 
  className = '' 
}) => (
  <div className={`loading-progress ${className}`}>
    <p className="loading-progress__message">{message}</p>
    <div className="loading-progress__bar">
      <div 
        className="loading-progress__fill" 
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      ></div>
    </div>
    <span className="loading-progress__percentage">{Math.round(progress)}%</span>
  </div>
);

// =====================================
// SKELETON LOADERS
// =====================================

export const SkeletonCard = ({ className = '' }) => (
  <div className={`skeleton-card ${className}`}>
    <div className="skeleton-card__image skeleton-shimmer"></div>
    <div className="skeleton-card__content">
      <div className="skeleton-card__title skeleton-shimmer"></div>
      <div className="skeleton-card__subtitle skeleton-shimmer"></div>
      <div className="skeleton-card__price skeleton-shimmer"></div>
    </div>
  </div>
);

export const SkeletonList = ({ items = 3, className = '' }) => (
  <div className={`skeleton-list ${className}`}>
    {Array.from({ length: items }, (_, index) => (
      <div key={index} className="skeleton-list__item">
        <div className="skeleton-list__avatar skeleton-shimmer"></div>
        <div className="skeleton-list__content">
          <div className="skeleton-list__line skeleton-list__line--title skeleton-shimmer"></div>
          <div className="skeleton-list__line skeleton-list__line--subtitle skeleton-shimmer"></div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`skeleton-table ${className}`}>
    <div className="skeleton-table__header">
      {Array.from({ length: columns }, (_, index) => (
        <div key={index} className="skeleton-table__header-cell skeleton-shimmer"></div>
      ))}
    </div>
    <div className="skeleton-table__body">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table__row">
          {Array.from({ length: columns }, (_, colIndex) => (
            <div key={colIndex} className="skeleton-table__cell skeleton-shimmer"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// =====================================
// ERROR COMPONENTS
// =====================================

export const ErrorDisplay = ({ 
  title = 'Qualcosa è andato storto',
  message = 'Si è verificato un errore imprevisto.',
  onRetry = null,
  onGoBack = null,
  retryText = 'Riprova',
  goBackText = 'Torna indietro',
  className = '',
  type = 'error' // 'error', 'warning', 'network'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'network': return 'fas fa-wifi';
      case 'warning': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-exclamation-circle';
    }
  };

  const getTypeClass = () => `error-display--${type}`;

  return (
    <div className={`error-display ${getTypeClass()} ${className}`}>
      <div className="error-display__icon">
        <i className={getIcon()}></i>
      </div>
      <div className="error-display__content">
        <h3 className="error-display__title">{title}</h3>
        <p className="error-display__message">{message}</p>
        <div className="error-display__actions">
          {onRetry && (
            <button 
              className="error-display__button error-display__button--primary"
              onClick={onRetry}
            >
              <i className="fas fa-redo"></i>
              {retryText}
            </button>
          )}
          {onGoBack && (
            <button 
              className="error-display__button error-display__button--secondary"
              onClick={onGoBack}
            >
              <i className="fas fa-arrow-left"></i>
              {goBackText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const NetworkError = ({ onRetry, className = '' }) => (
  <ErrorDisplay
    type="network"
    title="Problemi di connessione"
    message="Verifica la tua connessione internet e riprova."
    onRetry={onRetry}
    className={className}
  />
);

// =====================================
// EMPTY STATE COMPONENTS
// =====================================

export const EmptyState = ({ 
  icon = 'fas fa-inbox',
  title = 'Nessun elemento trovato',
  message = 'Non ci sono elementi da visualizzare.',
  action = null,
  actionText = 'Aggiungi elemento',
  className = ''
}) => (
  <div className={`empty-state ${className}`}>
    <div className="empty-state__icon">
      <i className={icon}></i>
    </div>
    <div className="empty-state__content">
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {action && (
        <button 
          className="empty-state__action"
          onClick={action}
        >
          {actionText}
        </button>
      )}
    </div>
  </div>
);

// =====================================
// SPECIALIZED EMPTY STATES
// =====================================

export const EmptyCart = ({ onContinueShopping, className = '' }) => (
  <EmptyState
    icon="fas fa-shopping-cart"
    title="Il tuo carrello è vuoto"
    message="Aggiungi alcuni prodotti per iniziare i tuoi acquisti."
    action={onContinueShopping}
    actionText="Continua gli acquisti"
    className={className}
  />
);

export const EmptyFavorites = ({ onBrowseProducts, className = '' }) => (
  <EmptyState
    icon="fas fa-heart"
    title="Nessun prodotto nei preferiti"
    message="Salva i tuoi prodotti preferiti per trovarli facilmente in seguito."
    action={onBrowseProducts}
    actionText="Esplora prodotti"
    className={className}
  />
);

export const EmptyOrders = ({ onStartShopping, className = '' }) => (
  <EmptyState
    icon="fas fa-receipt"
    title="Nessun ordine effettuato"
    message="Quando effettuerai il tuo primo ordine, apparirà qui."
    action={onStartShopping}
    actionText="Inizia a fare acquisti"
    className={className}
  />
);

export const EmptyReviews = ({ onWriteReview, className = '' }) => (
  <EmptyState
    icon="fas fa-star"
    title="Nessuna recensione scritta"
    message="Condividi la tua esperienza scrivendo recensioni sui prodotti acquistati."
    action={onWriteReview}
    actionText="Scrivi una recensione"
    className={className}
  />
);

export const EmptySearch = ({ 
  searchTerm = '', 
  onClearSearch, 
  onBrowseCategories, 
  className = '' 
}) => (
  <div className={`empty-search ${className}`}>
    <div className="empty-search__icon">
      <i className="fas fa-search"></i>
    </div>
    <div className="empty-search__content">
      <h3 className="empty-search__title">
        Nessun risultato per "{searchTerm}"
      </h3>
      <p className="empty-search__message">
        Prova con parole diverse o esplora le nostre categorie.
      </p>
      <div className="empty-search__actions">
        {onClearSearch && (
          <button 
            className="empty-search__button empty-search__button--secondary"
            onClick={onClearSearch}
          >
            <i className="fas fa-times"></i>
            Cancella ricerca
          </button>
        )}
        {onBrowseCategories && (
          <button 
            className="empty-search__button empty-search__button--primary"
            onClick={onBrowseCategories}
          >
            <i className="fas fa-th-large"></i>
            Esplora categorie
          </button>
        )}
      </div>
    </div>
  </div>
);

// =====================================
// LOADING WRAPPER COMPONENT
// =====================================

export const LoadingWrapper = ({ 
  loading, 
  error, 
  empty, 
  children,
  loadingComponent = <LoadingSpinner />,
  errorComponent = null,
  emptyComponent = <EmptyState />,
  onRetry = null,
  className = ''
}) => {
  if (loading) {
    return <div className={className}>{loadingComponent}</div>;
  }

  if (error) {
    return (
      <div className={className}>
        {errorComponent || <ErrorDisplay message={error} onRetry={onRetry} />}
      </div>
    );
  }

  if (empty) {
    return <div className={className}>{emptyComponent}</div>;
  }

  return children;
};

export default {
  LoadingSpinner,
  LoadingDots,
  LoadingProgress,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  ErrorDisplay,
  NetworkError,
  EmptyState,
  EmptyCart,
  EmptyFavorites,
  EmptyOrders,
  EmptyReviews,
  EmptySearch,
  LoadingWrapper
}; 