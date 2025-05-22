import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import './Checkout.scss';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [discountValid, setDiscountValid] = useState(false);

  // Stato per i dati di spedizione
  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_surname: '',
    shipping_address: '',
    shipping_city: '',
    shipping_postal_code: '',
    shipping_phone: '',
    payment_method: 'carta',
    notes: '',
    card_number: '',
    card_holder: '',
    card_expiry: '',
    card_cvv: '',
  });

  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart();
      // Precompila i dati dell'utente se disponibili
      fetchUserData();
    } else {
      navigate('/login?redirect=/checkout');
    }
  }, [navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data.cart);
      setError(null);
      
      // Se il carrello è vuoto, reindirizza alla pagina del carrello
      if (!response.data.cart.items || response.data.cart.items.length === 0) {
        navigate('/cart');
      }
    } catch (err) {
      console.error('Errore nel caricamento del carrello:', err);
      setError('Impossibile caricare il carrello. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user/profile');
      const user = response.data.user;
      
      // Precompila i dati dell'utente
      setFormData(prev => ({
        ...prev,
        shipping_name: user.name || '',
        shipping_surname: user.surname || '',
        shipping_address: user.address || '',
        shipping_city: user.city || '',
        shipping_postal_code: user.postal_code || '',
        shipping_phone: user.phone || '',
      }));
    } catch (err) {
      console.error('Errore nel caricamento dei dati utente:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountMessage('Inserisci un codice sconto valido');
      return;
    }
    
    try {
      const response = await api.post('/checkout/verify-discount', {
        code: discountCode
      });
      
      setDiscountValid(true);
      setDiscountMessage('Codice sconto applicato con successo!');
      // Aggiorna il carrello con lo sconto applicato
      fetchCart();
    } catch (err) {
      console.error('Errore nell\'applicazione del codice sconto:', err);
      setDiscountValid(false);
      setDiscountMessage(err.response?.data?.message || 'Codice sconto non valido');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await api.post('/checkout', formData);
      
      setOrderComplete(true);
      setOrderNumber(response.data.order_number);
      
      // Se il pagamento è con carta, procedi con il pagamento
      if (formData.payment_method === 'carta') {
        const paymentResponse = await api.post('/checkout/payment', {
          order_id: response.data.order.id,
          payment_method: formData.payment_method,
          card_number: formData.card_number,
          card_holder: formData.card_holder,
          card_expiry: formData.card_expiry,
          card_cvv: formData.card_cvv,
        });
      }
    } catch (err) {
      console.error('Errore durante il checkout:', err);
      setError(err.response?.data?.message || 'Si è verificato un errore durante il completamento dell\'ordine.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !cart) {
    return (
      <div className="checkout">
        <div className="checkout__container">
          <h1 className="checkout__title">Checkout</h1>
          <div className="checkout__loading">Caricamento...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout">
        <div className="checkout__container">
          <h1 className="checkout__title">Checkout</h1>
          <div className="checkout__error">
            <p>{error}</p>
            <button className="checkout__button" onClick={fetchCart}>
              Riprova
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="checkout">
        <div className="checkout__container">
          <div className="checkout__success">
            <h1 className="checkout__success-title">Ordine Completato!</h1>
            <div className="checkout__success-icon">✓</div>
            <p className="checkout__success-message">
              Grazie per il tuo acquisto! Il tuo ordine è stato completato con successo.
            </p>
            <p className="checkout__success-order-number">
              Numero ordine: <strong>{orderNumber}</strong>
            </p>
            <p className="checkout__success-info">
              Riceverai a breve un'email di conferma con i dettagli del tuo ordine.
            </p>
            <div className="checkout__success-actions">
              <Link to="/dashboard/orders" className="checkout__success-button">
                Visualizza i tuoi ordini
              </Link>
              <Link to="/" className="checkout__success-link">
                Torna alla home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="checkout__container">
        <h1 className="checkout__title">Completa il tuo ordine</h1>
        
        <div className="checkout__content">
          <div className="checkout__form-container">
            <form onSubmit={handleSubmit} className="checkout__form">
              <div className="checkout__section">
                <h2 className="checkout__section-title">Dati di Spedizione</h2>
                
                <div className="checkout__form-row">
                  <div className="checkout__form-group">
                    <label className="checkout__label">Nome *</label>
                    <input
                      type="text"
                      name="shipping_name"
                      value={formData.shipping_name}
                      onChange={handleInputChange}
                      className="checkout__input"
                      required
                    />
                  </div>
                  
                  <div className="checkout__form-group">
                    <label className="checkout__label">Cognome *</label>
                    <input
                      type="text"
                      name="shipping_surname"
                      value={formData.shipping_surname}
                      onChange={handleInputChange}
                      className="checkout__input"
                      required
                    />
                  </div>
                </div>
                
                <div className="checkout__form-group">
                  <label className="checkout__label">Indirizzo *</label>
                  <input
                    type="text"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    className="checkout__input"
                    required
                  />
                </div>
                
                <div className="checkout__form-row">
                  <div className="checkout__form-group">
                    <label className="checkout__label">Città *</label>
                    <input
                      type="text"
                      name="shipping_city"
                      value={formData.shipping_city}
                      onChange={handleInputChange}
                      className="checkout__input"
                      required
                    />
                  </div>
                  
                  <div className="checkout__form-group">
                    <label className="checkout__label">CAP *</label>
                    <input
                      type="text"
                      name="shipping_postal_code"
                      value={formData.shipping_postal_code}
                      onChange={handleInputChange}
                      className="checkout__input"
                      required
                    />
                  </div>
                </div>
                
                <div className="checkout__form-group">
                  <label className="checkout__label">Telefono *</label>
                  <input
                    type="tel"
                    name="shipping_phone"
                    value={formData.shipping_phone}
                    onChange={handleInputChange}
                    className="checkout__input"
                    required
                  />
                </div>
                
                <div className="checkout__form-group">
                  <label className="checkout__label">Note (opzionale)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="checkout__textarea"
                    placeholder="Istruzioni speciali per la consegna o note aggiuntive"
                  ></textarea>
                </div>
              </div>
              
              <div className="checkout__section">
                <h2 className="checkout__section-title">Metodo di Pagamento</h2>
                
                <div className="checkout__payment-methods">
                  <div className="checkout__payment-method">
                    <input
                      type="radio"
                      id="carta"
                      name="payment_method"
                      value="carta"
                      checked={formData.payment_method === 'carta'}
                      onChange={handleInputChange}
                      className="checkout__radio"
                    />
                    <label htmlFor="carta" className="checkout__payment-label">
                      Carta di Credito/Debito
                    </label>
                  </div>
                  
                  <div className="checkout__payment-method">
                    <input
                      type="radio"
                      id="paypal"
                      name="payment_method"
                      value="paypal"
                      checked={formData.payment_method === 'paypal'}
                      onChange={handleInputChange}
                      className="checkout__radio"
                    />
                    <label htmlFor="paypal" className="checkout__payment-label">
                      PayPal
                    </label>
                  </div>
                  
                  <div className="checkout__payment-method">
                    <input
                      type="radio"
                      id="bonifico"
                      name="payment_method"
                      value="bonifico"
                      checked={formData.payment_method === 'bonifico'}
                      onChange={handleInputChange}
                      className="checkout__radio"
                    />
                    <label htmlFor="bonifico" className="checkout__payment-label">
                      Bonifico Bancario
                    </label>
                  </div>
                </div>
                
                {formData.payment_method === 'carta' && (
                  <div className="checkout__card-details">
                    <div className="checkout__form-group">
                      <label className="checkout__label">Numero Carta *</label>
                      <input
                        type="text"
                        name="card_number"
                        value={formData.card_number}
                        onChange={handleInputChange}
                        className="checkout__input"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    
                    <div className="checkout__form-group">
                      <label className="checkout__label">Intestatario Carta *</label>
                      <input
                        type="text"
                        name="card_holder"
                        value={formData.card_holder}
                        onChange={handleInputChange}
                        className="checkout__input"
                        placeholder="Mario Rossi"
                        required
                      />
                    </div>
                    
                    <div className="checkout__form-row">
                      <div className="checkout__form-group">
                        <label className="checkout__label">Scadenza *</label>
                        <input
                          type="text"
                          name="card_expiry"
                          value={formData.card_expiry}
                          onChange={handleInputChange}
                          className="checkout__input"
                          placeholder="MM/AA"
                          required
                        />
                      </div>
                      
                      <div className="checkout__form-group">
                        <label className="checkout__label">CVV *</label>
                        <input
                          type="text"
                          name="card_cvv"
                          value={formData.card_cvv}
                          onChange={handleInputChange}
                          className="checkout__input"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {formData.payment_method === 'bonifico' && (
                  <div className="checkout__bank-details">
                    <p className="checkout__bank-info">
                      Effettua il bonifico alle seguenti coordinate bancarie:
                    </p>
                    <div className="checkout__bank-account">
                      <p><strong>Intestatario:</strong> Sapori di Calabria S.r.l.</p>
                      <p><strong>IBAN:</strong> IT12A0123456789000000123456</p>
                      <p><strong>Causale:</strong> Ordine [inserire numero ordine]</p>
                    </div>
                    <p className="checkout__bank-note">
                      L'ordine verrà elaborato dopo la ricezione del pagamento.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="checkout__actions">
                <Link to="/cart" className="checkout__back-link">
                  Torna al Carrello
                </Link>
                <button 
                  type="submit" 
                  className="checkout__submit-button"
                  disabled={loading}
                >
                  {loading ? 'Elaborazione in corso...' : 'Completa l\'Ordine'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="checkout__summary">
            <h2 className="checkout__summary-title">Riepilogo Ordine</h2>
            
            <div className="checkout__items">
              {cart && cart.items && cart.items.map(item => (
                <div key={item.id} className="checkout__item">
                  <div className="checkout__item-image-container">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img 
                        src={item.product.images[0].url} 
                        alt={item.product.name} 
                        className="checkout__item-image"
                      />
                    ) : (
                      <div className="checkout__item-no-image">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="checkout__item-details">
                    <div className="checkout__item-name">{item.product.name}</div>
                    <div className="checkout__item-quantity">Quantità: {item.quantity}</div>
                    <div className="checkout__item-price">€{parseFloat(item.price).toFixed(2)}</div>
                  </div>
                  <div className="checkout__item-total">
                    €{(item.quantity * parseFloat(item.price)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="checkout__discount">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Codice sconto"
                className="checkout__discount-input"
              />
              <button 
                onClick={applyDiscountCode} 
                className="checkout__discount-button"
              >
                Applica
              </button>
              {discountMessage && (
                <div className={`checkout__discount-message ${discountValid ? 'checkout__discount-message--valid' : 'checkout__discount-message--invalid'}`}>
                  {discountMessage}
                </div>
              )}
            </div>
            
            <div className="checkout__totals">
              <div className="checkout__total-row">
                <span className="checkout__total-label">Subtotale:</span>
                <span className="checkout__total-value">
                  €{cart ? parseFloat(cart.total).toFixed(2) : '0.00'}
                </span>
              </div>
              
              {cart && cart.discount_amount > 0 && (
                <div className="checkout__total-row checkout__total-row--discount">
                  <span className="checkout__total-label">Sconto:</span>
                  <span className="checkout__total-value">
                    -€{parseFloat(cart.discount_amount).toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="checkout__total-row">
                <span className="checkout__total-label">Spedizione:</span>
                <span className="checkout__total-value">€7.90</span>
              </div>
              
              <div className="checkout__total-row">
                <span className="checkout__total-label">IVA (22%):</span>
                <span className="checkout__total-value">
                  €{cart ? parseFloat(cart.total * 0.22).toFixed(2) : '0.00'}
                </span>
              </div>
              
              <div className="checkout__total-row checkout__total-row--final">
                <span className="checkout__total-label">Totale:</span>
                <span className="checkout__total-value checkout__total-value--final">
                  €{cart ? parseFloat(cart.total + 7.90 + (cart.total * 0.22) - (cart.discount_amount || 0)).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 