import React, { useState } from 'react';
import { useToast } from '../Toast/Toast';
import api from '../../utils/api';
import './NewsletterSubscription.scss';

const NewsletterSubscription = ({ 
  inline = false, 
  showPreferences = true,
  title = "Iscriviti alla Newsletter",
  description = "Ricevi le ultime novità sui prodotti calabresi, offerte esclusive e ricette tradizionali."
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    preferences: {
      new_products: true,
      offers: true,
      recipes: true,
      events: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { addToast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (preference) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: !prev.preferences[preference]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      addToast('Inserisci un indirizzo email valido', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/newsletter/subscribe', {
        email: formData.email.trim(),
        name: formData.name.trim() || null,
        preferences: formData.preferences,
        source: 'website'
      });

      addToast(response.data.message, 'success', 5000);
      setIsSubscribed(true);
      
      // Reset form
      setFormData({
        email: '',
        name: '',
        preferences: {
          new_products: true,
          offers: true,
          recipes: true,
          events: false
        }
      });

    } catch (error) {
      console.error('Errore iscrizione newsletter:', error);
      const message = error.response?.data?.message || 'Errore durante l\'iscrizione alla newsletter';
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`newsletter ${inline ? 'newsletter--inline' : ''}`}>
        <div className="newsletter__success">
          <div className="newsletter__success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h3>Iscrizione Completata!</h3>
          <p>Grazie per esserti iscritto alla nostra newsletter. Controlla la tua email per confermare l'iscrizione.</p>
          <button 
            className="newsletter__reset-btn"
            onClick={() => setIsSubscribed(false)}
          >
            Iscrivere un'altra email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`newsletter ${inline ? 'newsletter--inline' : ''}`}>
      <div className="newsletter__header">
        <h3 className="newsletter__title">
          <i className="fas fa-envelope"></i>
          {title}
        </h3>
        <p className="newsletter__description">
          {description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="newsletter__form">
        <div className="newsletter__form-group">
          <label htmlFor="newsletter-email">Email*</label>
          <input
            type="email"
            id="newsletter-email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tuo@email.com"
            required
            disabled={isLoading}
            className="newsletter__input newsletter__input--email"
          />
        </div>

        <div className="newsletter__form-group">
          <label htmlFor="newsletter-name">Nome (opzionale)</label>
          <input
            type="text"
            id="newsletter-name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Il tuo nome"
            disabled={isLoading}
            className="newsletter__input"
          />
        </div>

        {showPreferences && (
          <div className="newsletter__preferences">
            <h4>Che cosa ti interessa ricevere?</h4>
            <div className="newsletter__preferences-grid">
              <label className="newsletter__preference">
                <input
                  type="checkbox"
                  checked={formData.preferences.new_products}
                  onChange={() => handlePreferenceChange('new_products')}
                  disabled={isLoading}
                />
                <span className="newsletter__preference-label">
                  <i className="fas fa-shopping-bag"></i>
                  Nuovi Prodotti
                </span>
              </label>

              <label className="newsletter__preference">
                <input
                  type="checkbox"
                  checked={formData.preferences.offers}
                  onChange={() => handlePreferenceChange('offers')}
                  disabled={isLoading}
                />
                <span className="newsletter__preference-label">
                  <i className="fas fa-tags"></i>
                  Offerte e Sconti
                </span>
              </label>

              <label className="newsletter__preference">
                <input
                  type="checkbox"
                  checked={formData.preferences.recipes}
                  onChange={() => handlePreferenceChange('recipes')}
                  disabled={isLoading}
                />
                <span className="newsletter__preference-label">
                  <i className="fas fa-utensils"></i>
                  Ricette Tradizionali
                </span>
              </label>

              <label className="newsletter__preference">
                <input
                  type="checkbox"
                  checked={formData.preferences.events}
                  onChange={() => handlePreferenceChange('events')}
                  disabled={isLoading}
                />
                <span className="newsletter__preference-label">
                  <i className="fas fa-calendar-alt"></i>
                  Eventi e Sagre
                </span>
              </label>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading || !formData.email}
          className="newsletter__submit-btn"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Iscrizione in corso...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane"></i>
              Iscriviti Gratis
            </>
          )}
        </button>

        <p className="newsletter__privacy">
          <i className="fas fa-shield-alt"></i>
          I tuoi dati sono al sicuro. Puoi disiscriverti in qualsiasi momento.
          <br />
          Leggi la nostra <a href="/privacy-policy">Privacy Policy</a>
        </p>
      </form>
    </div>
  );
};

export default NewsletterSubscription; 