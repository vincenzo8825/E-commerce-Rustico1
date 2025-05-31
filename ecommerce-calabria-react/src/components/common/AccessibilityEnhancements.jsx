import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import './AccessibilityEnhancements.scss';

// Context per gestione annunci accessibilità
const AccessibilityContext = createContext();

export const useA11yAnnouncements = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useA11yAnnouncements must be used within AccessibilityProvider');
  }
  return context;
};

// Provider per gestione accessibilità globale
export const AccessibilityProvider = ({ children }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Rileva preferenze utente
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    setIsHighContrast(highContrastQuery.matches);
    setReducedMotion(reducedMotionQuery.matches);

    // Ascolta cambiamenti
    const handleHighContrastChange = (e) => setIsHighContrast(e.matches);
    const handleReducedMotionChange = (e) => setReducedMotion(e.matches);

    highContrastQuery.addEventListener('change', handleHighContrastChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  // Funzione per annunci screen reader
  const announce = (message, priority = 'polite') => {
    const id = Date.now() + Math.random();
    const announcement = { id, message, priority };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Rimuovi dopo 5 secondi
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 5000);
  };

  const value = {
    announce,
    isHighContrast,
    reducedMotion,
    announcements
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <AccessibilityRegions announcements={announcements} />
    </AccessibilityContext.Provider>
  );
};

// Componente per regioni aria-live
const AccessibilityRegions = ({ announcements }) => (
  <div className="a11y-regions">
    {/* Regione per annunci polite */}
    <div
      id="a11y-announcer-polite"
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
    >
      {announcements
        .filter(a => a.priority === 'polite')
        .map(a => (
          <div key={a.id}>{a.message}</div>
        ))
      }
    </div>

    {/* Regione per annunci assertive */}
    <div
      id="a11y-announcer-assertive"
      className="sr-only"
      aria-live="assertive"
      aria-atomic="true"
    >
      {announcements
        .filter(a => a.priority === 'assertive')
        .map(a => (
          <div key={a.id}>{a.message}</div>
        ))
      }
    </div>
  </div>
);

// Skip Links Navigation
export const SkipNavigation = () => (
  <nav className="skip-navigation" aria-label="Link di navigazione rapida">
    <a href="#main-content" className="skip-link">
      Salta al contenuto principale
    </a>
    <a href="#main-navigation" className="skip-link">
      Salta alla navigazione principale
    </a>
    <a href="#search" className="skip-link">
      Salta alla ricerca
    </a>
    <a href="#footer" className="skip-link">
      Salta al footer
    </a>
  </nav>
);

// Focus Management Hook
export const useFocusManagement = () => {
  const lastFocusedElement = useRef(null);

  const saveFocus = () => {
    lastFocusedElement.current = document.activeElement;
  };

  const restoreFocus = () => {
    if (lastFocusedElement.current && lastFocusedElement.current.focus) {
      lastFocusedElement.current.focus();
    }
  };

  const trapFocus = (container) => {
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus primo elemento
    if (firstElement) firstElement.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  return { saveFocus, restoreFocus, trapFocus };
};

// Componente per gestione heading hierarchy
export const HeadingLevel = ({ level = 2, children, className = '', ...props }) => {
  const Tag = `h${Math.min(6, Math.max(1, level))}`;
  
  return (
    <Tag className={`heading heading--level-${level} ${className}`} {...props}>
      {children}
    </Tag>
  );
};

// Componente per landmark regions
export const LandmarkRegion = ({ 
  type = 'section', 
  label, 
  children, 
  className = '',
  ...props 
}) => {
  const validTypes = ['main', 'nav', 'aside', 'header', 'footer', 'section'];
  const Tag = validTypes.includes(type) ? type : 'section';
  
  const regionProps = {
    className: `landmark landmark--${type} ${className}`,
    ...props
  };

  if (label) {
    regionProps['aria-label'] = label;
  }

  if (type === 'main') {
    regionProps.id = 'main-content';
  }

  return <Tag {...regionProps}>{children}</Tag>;
};

// Componente per link esterni con indicatori
export const ExternalLink = ({ 
  href, 
  children, 
  className = '', 
  newTab = true,
  ...props 
}) => {
  const isExternal = href && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'));
  
  if (!isExternal) {
    return <a href={href} className={className} {...props}>{children}</a>;
  }

  return (
    <a
      href={href}
      className={`external-link ${className}`}
      target={newTab ? '_blank' : '_self'}
      rel={newTab ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
      <span className="sr-only">
        {href.startsWith('mailto:') && ' (indirizzo email)'}
        {href.startsWith('tel:') && ' (numero di telefono)'}
        {href.startsWith('http') && newTab && ' (si apre in una nuova finestra)'}
      </span>
      {href.startsWith('http') && (
        <i className="fas fa-external-link-alt external-link__icon" aria-hidden="true"></i>
      )}
    </a>
  );
};

// Componente per descrizioni accessibili
export const AccessibleDescription = ({ 
  id, 
  children, 
  className = '' 
}) => (
  <div
    id={id}
    className={`accessible-description ${className}`}
    role="note"
    aria-label="Informazioni aggiuntive"
  >
    {children}
  </div>
);

// Hook per gestione errori form accessibili
export const useAccessibleForm = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { announce } = useA11yAnnouncements();

  const setFieldError = (fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const clearFieldError = (fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const setFieldTouched = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const validateAndAnnounce = (fieldName, value, validator) => {
    const error = validator(value);
    
    if (error) {
      setFieldError(fieldName, error);
      if (touched[fieldName]) {
        announce(`Errore nel campo ${fieldName}: ${error}`, 'assertive');
      }
    } else {
      clearFieldError(fieldName);
    }
    
    return !error;
  };

  const getFieldProps = (fieldName) => ({
    'aria-invalid': errors[fieldName] ? 'true' : 'false',
    'aria-describedby': errors[fieldName] ? `${fieldName}-error` : undefined,
    onBlur: () => setFieldTouched(fieldName)
  });

  const getErrorProps = (fieldName) => ({
    id: `${fieldName}-error`,
    role: 'alert',
    'aria-live': 'polite'
  });

  return {
    errors,
    touched,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    validateAndAnnounce,
    getFieldProps,
    getErrorProps
  };
};

// Componente per controlli audio/video accessibili
export const AccessibleMediaControls = ({ 
  mediaRef, 
  type = 'video',
  showCaptions = true 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const togglePlay = () => {
    if (!mediaRef.current) return;

    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;

    mediaRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="accessible-media-controls" role="toolbar" aria-label="Controlli media">
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? `Pausa ${type}` : `Riproduci ${type}`}
        className="media-control-btn"
      >
        <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} aria-hidden="true"></i>
        <span className="sr-only">
          {isPlaying ? 'Pausa' : 'Riproduci'}
        </span>
      </button>

      <button
        onClick={toggleMute}
        aria-label={isMuted ? 'Attiva audio' : 'Disattiva audio'}
        className="media-control-btn"
      >
        <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`} aria-hidden="true"></i>
        <span className="sr-only">
          {isMuted ? 'Attiva audio' : 'Disattiva audio'}
        </span>
      </button>

      {showCaptions && (
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          aria-label="Mostra/nascondi trascrizione"
          aria-expanded={showTranscript}
          className="media-control-btn"
        >
          <i className="fas fa-closed-captioning" aria-hidden="true"></i>
          <span className="sr-only">Trascrizione</span>
        </button>
      )}
    </div>
  );
};

// Componente per notifiche accessibili
export const AccessibleNotification = ({ 
  type = 'info', 
  message, 
  onClose, 
  autoClose = true,
  className = '' 
}) => {
  const { announce } = useA11yAnnouncements();

  useEffect(() => {
    if (message) {
      const priority = type === 'error' ? 'assertive' : 'polite';
      announce(message, priority);
    }
  }, [message, type, announce]);

  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      default: return 'fa-info-circle';
    }
  };

  return (
    <div
      className={`accessible-notification accessible-notification--${type} ${className}`}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="accessible-notification__content">
        <i className={`fas ${getIcon()}`} aria-hidden="true"></i>
        <span className="accessible-notification__message">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Chiudi notifica"
          className="accessible-notification__close"
        >
          <i className="fas fa-times" aria-hidden="true"></i>
        </button>
      )}
    </div>
  );
};

export default {
  AccessibilityProvider,
  SkipNavigation,
  LandmarkRegion,
  HeadingLevel,
  ExternalLink,
  AccessibleDescription,
  AccessibleMediaControls,
  AccessibleNotification,
  useA11yAnnouncements,
  useFocusManagement,
  useAccessibleForm
}; 