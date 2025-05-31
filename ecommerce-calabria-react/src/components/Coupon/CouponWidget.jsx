import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../Toast/Toast';
import api from '../../utils/api';
import './CouponWidget.scss';

const CouponWidget = ({ 
  cartTotal = 0, 
  cartItems = [], 
  onCouponApplied, 
  onCouponRemoved,
  appliedCoupon = null,
  className = ''
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);
  const { addToast } = useToast();

  // Carica coupons disponibili
  useEffect(() => {
    if (cartTotal > 0) {
      fetchAvailableCoupons();
    }
  }, [cartTotal]);

  // Reset validation quando cambia il codice
  useEffect(() => {
    if (validationResult && !couponCode) {
      setValidationResult(null);
    }
  }, [couponCode]);

  // Fetch coupons disponibili
  const fetchAvailableCoupons = async () => {
    try {
      const response = await api.get(`/coupons/available?cart_total=${cartTotal}`);
      if (response.data.success) {
        setAvailableCoupons(response.data.coupons || []);
      }
    } catch (error) {
      console.error('Errore nel caricamento coupons disponibili:', error);
    }
  };

  // Validazione coupon in tempo reale
  const validateCoupon = useCallback(async (code) => {
    if (!code || code.length < 3) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    
    try {
      const response = await api.post('/coupons/validate', {
        code: code.toUpperCase(),
        cart_total: cartTotal,
        products: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          category_id: item.category_id,
          quantity: item.quantity,
          price: item.price
        }))
      });

      setValidationResult(response.data);
    } catch (error) {
      console.error('Errore validazione coupon:', error);
      setValidationResult({
        valid: false,
        message: 'Errore durante la validazione del coupon'
      });
    } finally {
      setIsValidating(false);
    }
  }, [cartTotal, cartItems]);

  // Debounced validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (couponCode && !appliedCoupon) {
        validateCoupon(couponCode);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [couponCode, validateCoupon, appliedCoupon]);

  // Applica coupon
  const applyCoupon = async () => {
    if (!validationResult?.valid) {
      addToast('Codice coupon non valido', 'error');
      return;
    }

    try {
      setIsValidating(true);
      
      // Simula applicazione per ora (da integrare con checkout)
      const couponData = {
        code: couponCode.toUpperCase(),
        discount_amount: validationResult.discount_amount,
        description: validationResult.coupon?.description
      };

      onCouponApplied?.(couponData);
      
      addToast(
        `🎉 Coupon "${couponCode}" applicato! Risparmi €${validationResult.discount_amount.toFixed(2)}`,
        'success',
        4000
      );

      setCouponCode('');
      setValidationResult(null);
      setShowAvailableCoupons(false);
      
    } catch (error) {
      console.error('Errore applicazione coupon:', error);
      addToast('Errore durante l\'applicazione del coupon', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  // Rimuovi coupon applicato
  const removeCoupon = async () => {
    try {
      onCouponRemoved?.();
      addToast('Coupon rimosso', 'info');
    } catch (error) {
      console.error('Errore rimozione coupon:', error);
      addToast('Errore durante la rimozione del coupon', 'error');
    }
  };

  // Applica coupon suggerito
  const applySuggestedCoupon = (coupon) => {
    setCouponCode(coupon.code);
    setShowAvailableCoupons(false);
  };

  // Calcola risparmio potenziale
  const calculatePotentialSavings = () => {
    if (availableCoupons.length === 0) return 0;
    return Math.max(...availableCoupons.map(coupon => coupon.estimated_discount || 0));
  };

  const potentialSavings = calculatePotentialSavings();

  return (
    <div className={`coupon-widget ${className}`}>
      {/* Header con potenziali risparmi */}
      {potentialSavings > 0 && !appliedCoupon && (
        <div className="coupon-widget__header">
          <div className="coupon-widget__savings-badge">
            <i className="fas fa-tag"></i>
            <span>Puoi risparmiare fino a €{potentialSavings.toFixed(2)}!</span>
          </div>
        </div>
      )}

      {/* Coupon applicato */}
      {appliedCoupon && (
        <div className="coupon-widget__applied">
          <div className="coupon-widget__applied-info">
            <div className="coupon-widget__applied-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="coupon-widget__applied-details">
              <div className="coupon-widget__applied-code">
                Coupon: <strong>{appliedCoupon.code}</strong>
              </div>
              {appliedCoupon.description && (
                <div className="coupon-widget__applied-description">
                  {appliedCoupon.description}
                </div>
              )}
              <div className="coupon-widget__applied-savings">
                Risparmi: <span className="amount">€{appliedCoupon.discount_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            className="coupon-widget__remove-btn"
            aria-label="Rimuovi coupon"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Form inserimento coupon */}
      {!appliedCoupon && (
        <div className="coupon-widget__form">
          <div className="coupon-widget__input-container">
            <div className="coupon-widget__input-wrapper">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Inserisci codice coupon"
                className={`coupon-widget__input ${validationResult?.valid ? 'valid' : ''} ${validationResult?.valid === false ? 'invalid' : ''}`}
                maxLength={20}
              />
              
              {isValidating && (
                <div className="coupon-widget__loading">
                  <i className="fas fa-spinner fa-spin"></i>
                </div>
              )}
              
              {validationResult?.valid && (
                <div className="coupon-widget__valid-icon">
                  <i className="fas fa-check"></i>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={applyCoupon}
              disabled={!validationResult?.valid || isValidating}
              className="coupon-widget__apply-btn"
            >
              {isValidating ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                'Applica'
              )}
            </button>
          </div>

          {/* Messaggio di validazione */}
          {validationResult && (
            <div className={`coupon-widget__message ${validationResult.valid ? 'success' : 'error'}`}>
              <i className={`fas ${validationResult.valid ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
              <span>{validationResult.message}</span>
              {validationResult.valid && validationResult.discount_amount > 0 && (
                <span className="discount-preview">
                  {' '}(Sconto: €{validationResult.discount_amount.toFixed(2)})
                </span>
              )}
            </div>
          )}

          {/* Toggle coupons disponibili */}
          {availableCoupons.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
              className="coupon-widget__toggle-available"
            >
              <i className={`fas ${showAvailableCoupons ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              <span>Codici disponibili ({availableCoupons.length})</span>
            </button>
          )}

          {/* Lista coupons disponibili */}
          {showAvailableCoupons && availableCoupons.length > 0 && (
            <div className="coupon-widget__available">
              <div className="coupon-widget__available-header">
                <h4>Coupons disponibili per te</h4>
              </div>
              <div className="coupon-widget__available-list">
                {availableCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="coupon-widget__available-item"
                    onClick={() => applySuggestedCoupon(coupon)}
                  >
                    <div className="coupon-widget__available-code">
                      <i className="fas fa-ticket-alt"></i>
                      <strong>{coupon.code}</strong>
                    </div>
                    <div className="coupon-widget__available-description">
                      {coupon.description}
                    </div>
                    <div className="coupon-widget__available-details">
                      <span className="value">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `€${coupon.value}`}
                      </span>
                      {coupon.minimum_amount > 0 && (
                        <span className="minimum">
                          Min. €{coupon.minimum_amount.toFixed(2)}
                        </span>
                      )}
                      <span className="estimated-discount">
                        ~€{(coupon.estimated_discount || 0).toFixed(2)}
                      </span>
                    </div>
                    {coupon.expires_at && (
                      <div className="coupon-widget__available-expiry">
                        Scade: {new Date(coupon.expires_at).toLocaleDateString('it-IT')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Motivational message per carrelli vuoti */}
      {cartTotal === 0 && (
        <div className="coupon-widget__empty-cart">
          <i className="fas fa-shopping-cart"></i>
          <span>Aggiungi prodotti al carrello per vedere i coupon disponibili</span>
        </div>
      )}
    </div>
  );
};

export default CouponWidget; 