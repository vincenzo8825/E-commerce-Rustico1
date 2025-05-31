import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast/Toast';
import api from '../../utils/api';
import './ShippingCalculator.scss';

const ShippingCalculator = ({ 
  cartTotal = 0, 
  cartItems = [], 
  onShippingSelected,
  selectedShipping = null,
  className = ''
}) => {
  const [shippingData, setShippingData] = useState({
    postal_code: '',
    city: '',
    province: '',
    country: 'IT'
  });
  const [shippingOptions, setShippingOptions] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState(null);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState(null);
  const { addToast } = useToast();

  // Paesi supportati
  const supportedCountries = {
    'IT': 'Italia',
    'FR': 'Francia',
    'DE': 'Germania',
    'ES': 'Spagna',
    'AT': 'Austria',
    'BE': 'Belgio',
    'NL': 'Paesi Bassi',
    'CH': 'Svizzera',
    'UK': 'Regno Unito',
    'US': 'Stati Uniti'
  };

  // Calcola spedizioni quando cambiano i dati
  useEffect(() => {
    if (shippingData.postal_code && shippingData.country && cartTotal > 0) {
      const timeoutId = setTimeout(() => {
        calculateShipping();
      }, 800);

      return () => clearTimeout(timeoutId);
    }
  }, [shippingData, cartTotal]);

  // Verifica disponibilità quando cambia paese/CAP
  useEffect(() => {
    if (shippingData.postal_code && shippingData.country) {
      checkAvailability();
    }
  }, [shippingData.postal_code, shippingData.country]);

  // Calcola opzioni di spedizione
  const calculateShipping = async () => {
    if (!shippingData.postal_code || !shippingData.country || cartTotal <= 0) {
      return;
    }

    setIsCalculating(true);

    try {
      const cartWeight = calculateCartWeight(cartItems);
      
      const response = await api.post('/shipping/calculate', {
        ...shippingData,
        cart_total: cartTotal,
        cart_weight: cartWeight,
        cart_items: cartItems
      });

      if (response.data.success) {
        setShippingOptions(response.data.shipping_options || []);
        setFreeShippingThreshold(response.data.free_shipping_threshold || 0);
        
        // Auto-seleziona il metodo più economico se non c'è selezione
        if (!selectedShipping && response.data.shipping_options.length > 0) {
          const cheapest = response.data.shipping_options[0];
          onShippingSelected?.(cheapest);
        }
      } else {
        addToast('Errore nel calcolo delle spedizioni', 'error');
      }
    } catch (error) {
      console.error('Errore calcolo spedizioni:', error);
      addToast('Errore nel calcolo delle spedizioni', 'error');
      setShippingOptions([]);
    } finally {
      setIsCalculating(false);
    }
  };

  // Verifica disponibilità spedizione
  const checkAvailability = async () => {
    if (!shippingData.postal_code || !shippingData.country) {
      return;
    }

    try {
      const response = await api.post('/shipping/check-availability', {
        postal_code: shippingData.postal_code,
        country: shippingData.country
      });

      if (response.data.success) {
        setAvailabilityInfo(response.data);
      }
    } catch (error) {
      console.error('Errore verifica disponibilità:', error);
    }
  };

  // Traccia spedizione
  const trackShipment = async () => {
    if (!trackingNumber.trim()) {
      addToast('Inserisci un numero di tracking', 'warning');
      return;
    }

    try {
      const response = await api.post('/shipping/track', {
        tracking_number: trackingNumber.trim()
      });

      if (response.data.success) {
        setTrackingInfo(response.data.tracking_info);
        addToast('Informazioni di tracking aggiornate', 'success');
      }
    } catch (error) {
      console.error('Errore tracking:', error);
      addToast('Numero di tracking non trovato', 'error');
      setTrackingInfo(null);
    }
  };

  // Calcola peso carrello
  const calculateCartWeight = (items) => {
    return items.reduce((total, item) => {
      const weight = item.weight || 0.5; // Peso di default 500g
      const quantity = item.quantity || 1;
      return total + (weight * quantity);
    }, 0);
  };

  // Gestisce selezione metodo di spedizione
  const handleShippingSelect = (option) => {
    onShippingSelected?.(option);
  };

  // Gestisce cambio dati spedizione
  const handleShippingDataChange = (field, value) => {
    setShippingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calcola risparmio per spedizione gratuita
  const calculateFreeShippingSavings = () => {
    if (!freeShippingThreshold || cartTotal >= freeShippingThreshold) {
      return 0;
    }
    return freeShippingThreshold - cartTotal;
  };

  const freeShippingSavings = calculateFreeShippingSavings();

  return (
    <div className={`shipping-calculator ${className}`}>
      {/* Form dati spedizione */}
      <div className="shipping-calculator__form">
        <h3 className="shipping-calculator__title">
          <i className="fas fa-shipping-fast"></i>
          Opzioni di Spedizione
        </h3>

        <div className="shipping-calculator__inputs">
          <div className="shipping-calculator__row">
            <div className="shipping-calculator__field">
              <label>Paese *</label>
              <select
                value={shippingData.country}
                onChange={(e) => handleShippingDataChange('country', e.target.value)}
                className="shipping-calculator__select"
              >
                {Object.entries(supportedCountries).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <div className="shipping-calculator__field">
              <label>CAP *</label>
              <input
                type="text"
                value={shippingData.postal_code}
                onChange={(e) => handleShippingDataChange('postal_code', e.target.value)}
                placeholder="87100"
                className="shipping-calculator__input"
                maxLength="10"
              />
            </div>
          </div>

          <div className="shipping-calculator__row">
            <div className="shipping-calculator__field">
              <label>Città</label>
              <input
                type="text"
                value={shippingData.city}
                onChange={(e) => handleShippingDataChange('city', e.target.value)}
                placeholder="Cosenza"
                className="shipping-calculator__input"
              />
            </div>

            <div className="shipping-calculator__field">
              <label>Provincia</label>
              <input
                type="text"
                value={shippingData.province}
                onChange={(e) => handleShippingDataChange('province', e.target.value)}
                placeholder="CS"
                className="shipping-calculator__input"
                maxLength="2"
              />
            </div>
          </div>
        </div>

        {/* Informazioni disponibilità */}
        {availabilityInfo && (
          <div className={`shipping-calculator__availability ${availabilityInfo.available ? 'available' : 'unavailable'}`}>
            <i className={`fas ${availabilityInfo.available ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
            <span>
              {availabilityInfo.available 
                ? 'Spedizione disponibile per questa destinazione'
                : 'Spedizione non disponibile per questa destinazione'
              }
            </span>
          </div>
        )}

        {/* Alert spedizione gratuita */}
        {freeShippingSavings > 0 && (
          <div className="shipping-calculator__free-shipping-alert">
            <i className="fas fa-gift"></i>
            <span>
              Aggiungi €{freeShippingSavings.toFixed(2)} per la spedizione gratuita!
            </span>
          </div>
        )}
      </div>

      {/* Opzioni di spedizione */}
      {isCalculating ? (
        <div className="shipping-calculator__loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Calcolando opzioni di spedizione...</span>
        </div>
      ) : shippingOptions.length > 0 ? (
        <div className="shipping-calculator__options">
          <h4>Metodi di Spedizione Disponibili</h4>
          
          {shippingOptions.map((option) => (
            <div
              key={option.id}
              className={`shipping-calculator__option ${selectedShipping?.id === option.id ? 'selected' : ''}`}
              onClick={() => handleShippingSelect(option)}
            >
              <div className="shipping-calculator__option-header">
                <div className="shipping-calculator__option-info">
                  <div className="shipping-calculator__option-name">
                    {option.name}
                    {option.is_express && <span className="express-badge">Express</span>}
                    {option.is_free && <span className="free-badge">Gratuita</span>}
                  </div>
                  <div className="shipping-calculator__option-description">
                    {option.description}
                  </div>
                </div>
                <div className="shipping-calculator__option-cost">
                  {option.is_free ? (
                    <span className="free-cost">Gratuita</span>
                  ) : (
                    <span className="cost">€{option.cost.toFixed(2)}</span>
                  )}
                  {option.original_cost > option.cost && (
                    <span className="original-cost">€{option.original_cost.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div className="shipping-calculator__option-details">
                <div className="shipping-calculator__option-delivery">
                  <i className="fas fa-clock"></i>
                  <span>
                    Consegna: {option.estimated_delivery?.formatted || 
                    `${option.delivery_time}${option.delivery_time_max ? `-${option.delivery_time_max}` : ''} giorni`}
                  </span>
                </div>

                <div className="shipping-calculator__option-features">
                  {option.tracking_available && (
                    <span className="feature">
                      <i className="fas fa-search-location"></i>
                      Tracking
                    </span>
                  )}
                  {option.insurance_included && (
                    <span className="feature">
                      <i className="fas fa-shield-alt"></i>
                      Assicurazione
                    </span>
                  )}
                </div>
              </div>

              {selectedShipping?.id === option.id && (
                <div className="shipping-calculator__option-selected">
                  <i className="fas fa-check"></i>
                  <span>Selezionato</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : cartTotal > 0 && shippingData.postal_code && (
        <div className="shipping-calculator__no-options">
          <i className="fas fa-exclamation-circle"></i>
          <span>Nessuna opzione di spedizione disponibile per questa destinazione</span>
        </div>
      )}

      {/* Tracking spedizione */}
      <div className="shipping-calculator__tracking">
        <h4>Traccia la tua Spedizione</h4>
        <div className="shipping-calculator__tracking-form">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Inserisci numero di tracking"
            className="shipping-calculator__input"
          />
          <button
            onClick={trackShipment}
            className="shipping-calculator__track-btn"
          >
            <i className="fas fa-search"></i>
            Traccia
          </button>
        </div>

        {trackingInfo && (
          <div className="shipping-calculator__tracking-info">
            <div className="shipping-calculator__tracking-header">
              <strong>Tracking: {trackingInfo.tracking_number}</strong>
              <span className={`status ${trackingInfo.status}`}>
                {trackingInfo.status_description}
              </span>
            </div>
            
            <div className="shipping-calculator__tracking-delivery">
              <i className="fas fa-calendar-alt"></i>
              <span>Consegna stimata: {new Date(trackingInfo.estimated_delivery).toLocaleDateString('it-IT')}</span>
            </div>

            <div className="shipping-calculator__tracking-events">
              <h5>Cronologia Spedizione</h5>
              {trackingInfo.events.map((event, index) => (
                <div key={index} className="shipping-calculator__tracking-event">
                  <div className="event-date">
                    {new Date(event.date).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="event-location">{event.location}</div>
                  <div className="event-description">{event.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingCalculator; 