import React, { useState, useEffect } from 'react';
import './CookieBanner.scss';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Sempre attivi
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
    } else {
      const preferences = JSON.parse(cookieConsent);
      setCookiePreferences(preferences);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    setCookiePreferences(allAccepted);
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
    loadAnalytics();
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    setCookiePreferences(necessaryOnly);
    localStorage.setItem('cookieConsent', JSON.stringify(necessaryOnly));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(cookiePreferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
    
    if (cookiePreferences.analytics) {
      loadAnalytics();
    }
  };

  const loadAnalytics = () => {
    // Carica Google Analytics o altri script di tracciamento
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  };

  const handlePreferenceChange = (type) => {
    if (type === 'necessary') return; // Non può essere disabilitato
    
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="cookie-banner">
        <div className="cookie-banner__content">
          <div className="cookie-banner__text">
            <h3>🍪 Utilizziamo i Cookie</h3>
            <p>
              Utilizziamo cookie e tecnologie simili per migliorare la tua esperienza di navigazione, 
              personalizzare contenuti e annunci, fornire funzionalità social e analizzare il nostro traffico. 
              Condividiamo anche informazioni sull'utilizzo del nostro sito con i nostri partner di social media, 
              pubblicità e analisi.
            </p>
          </div>
          
          <div className="cookie-banner__actions">
            <button 
              className="cookie-banner__btn cookie-banner__btn--secondary"
              onClick={acceptNecessary}
            >
              Solo Necessari
            </button>
            <button 
              className="cookie-banner__btn cookie-banner__btn--settings"
              onClick={() => setShowSettings(true)}
            >
              Personalizza
            </button>
            <button 
              className="cookie-banner__btn cookie-banner__btn--primary"
              onClick={acceptAll}
            >
              Accetta Tutti
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="cookie-settings-modal">
          <div className="cookie-settings-modal__overlay" onClick={() => setShowSettings(false)}></div>
          <div className="cookie-settings-modal__content">
            <div className="cookie-settings-modal__header">
              <h2>Impostazioni Cookie</h2>
              <button 
                className="cookie-settings-modal__close"
                onClick={() => setShowSettings(false)}
              >
                ×
              </button>
            </div>
            
            <div className="cookie-settings-modal__body">
              <p className="cookie-settings-modal__description">
                Puoi scegliere quali cookie accettare. I cookie necessari sono sempre attivi 
                per garantire il corretto funzionamento del sito.
              </p>
              
              <div className="cookie-category">
                <div className="cookie-category__header">
                  <h3>Cookie Necessari</h3>
                  <div className="cookie-toggle cookie-toggle--disabled">
                    <input 
                      type="checkbox" 
                      checked={true} 
                      disabled 
                      id="necessary"
                    />
                    <label htmlFor="necessary"></label>
                  </div>
                </div>
                <p>
                  Questi cookie sono essenziali per il funzionamento del sito web e non possono essere disabilitati. 
                  Includono cookie per la sessione, il carrello e la sicurezza.
                </p>
              </div>

              <div className="cookie-category">
                <div className="cookie-category__header">
                  <h3>Cookie Analitici</h3>
                  <div className="cookie-toggle">
                    <input 
                      type="checkbox" 
                      checked={cookiePreferences.analytics}
                      onChange={() => handlePreferenceChange('analytics')}
                      id="analytics"
                    />
                    <label htmlFor="analytics"></label>
                  </div>
                </div>
                <p>
                  Questi cookie ci aiutano a capire come i visitatori interagiscono con il sito web 
                  raccogliendo e riportando informazioni in forma anonima.
                </p>
              </div>

              <div className="cookie-category">
                <div className="cookie-category__header">
                  <h3>Cookie di Marketing</h3>
                  <div className="cookie-toggle">
                    <input 
                      type="checkbox" 
                      checked={cookiePreferences.marketing}
                      onChange={() => handlePreferenceChange('marketing')}
                      id="marketing"
                    />
                    <label htmlFor="marketing"></label>
                  </div>
                </div>
                <p>
                  Questi cookie vengono utilizzati per tracciare i visitatori sui siti web 
                  per mostrare annunci pertinenti e coinvolgenti.
                </p>
              </div>

              <div className="cookie-category">
                <div className="cookie-category__header">
                  <h3>Cookie Funzionali</h3>
                  <div className="cookie-toggle">
                    <input 
                      type="checkbox" 
                      checked={cookiePreferences.functional}
                      onChange={() => handlePreferenceChange('functional')}
                      id="functional"
                    />
                    <label htmlFor="functional"></label>
                  </div>
                </div>
                <p>
                  Questi cookie abilitano funzionalità avanzate e personalizzazione, 
                  come video e chat dal vivo.
                </p>
              </div>
            </div>
            
            <div className="cookie-settings-modal__footer">
              <button 
                className="cookie-banner__btn cookie-banner__btn--secondary"
                onClick={() => setShowSettings(false)}
              >
                Annulla
              </button>
              <button 
                className="cookie-banner__btn cookie-banner__btn--primary"
                onClick={savePreferences}
              >
                Salva Preferenze
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieBanner; 