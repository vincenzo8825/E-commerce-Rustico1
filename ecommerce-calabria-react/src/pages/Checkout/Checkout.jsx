import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import api from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import stripePromise from '../../utils/stripe';
import PaymentForm from '../../components/Payment/PaymentForm';
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
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Stato per i dati di spedizione (rimuovo i campi carta)
  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_surname: '',
    shipping_address: '',
    shipping_city: '',
    shipping_postal_code: '',
    shipping_phone: '',
    payment_method: 'carta',
    notes: '',
    email: ''
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
        email: user.email || ''
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
      await api.post('/checkout/verify-discount', {
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
    
    // Validazione form
    if (!formData.shipping_name || !formData.shipping_surname || !formData.shipping_address || 
        !formData.shipping_city || !formData.shipping_postal_code || !formData.shipping_phone) {
      setError('Tutti i campi di spedizione sono obbligatori');
      return;
    }

    if (formData.payment_method === 'carta') {
      // Mostra il form di pagamento Stripe
      setShowPaymentForm(true);
    } else {
      // Gestisci altri metodi di pagamento (contrassegno, bonifico, etc.)
      await processOrder();
    }
  };

  const processOrder = async () => {
    try {
      setLoading(true);
      const response = await api.post('/checkout', formData);
      
      setOrderComplete(true);
      setOrderNumber(response.data.order_number);
    } catch (err) {
      console.error('Errore durante il checkout:', err);
      setError(err.response?.data?.message || 'Si è verificato un errore durante il completamento dell\'ordine.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      setLoading(true);
      
      // Crea l'ordine con i dati di pagamento
      const response = await api.post('/checkout/complete', {
        ...formData,
        payment_intent_id: paymentIntent.id,
        payment_status: 'paid'
      });
      
      setOrderComplete(true);
      setOrderNumber(response.data.order_number);
      setShowPaymentForm(false);
    } catch (err) {
      console.error('Errore nel completamento dell\'ordine:', err);
      setError(err.response?.data?.message || 'Errore nel completamento dell\'ordine');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    setShowPaymentForm(false);
  };

  // Resto del codice per loading, error e orderComplete rimane uguale...
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
            <button className="checkout__button" onClick={() => {
              setError(null);
              setShowPaymentForm(false);
              fetchCart();
            }}>
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

  // Se il form di pagamento è mostrato, renderizza solo quello
  if (showPaymentForm) {
    const orderData = {
      ...formData,
      total: parseFloat(cart?.total || 0)
    };

    return (
      <div className="checkout">
        <div className="checkout__container">
          <h1 className="checkout__title">Pagamento</h1>
          
          <div className="checkout__payment-container">
            <button 
              className="checkout__back-button"
              onClick={() => setShowPaymentForm(false)}
            >
              ← Torna ai dati di spedizione
            </button>
            
            <Elements stripe={stripePromise}>
              <PaymentForm 
                orderData={orderData}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
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
                  <label className="checkout__label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="checkout__input"
                    required
                  />
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
                      💳 Carta di Credito/Debito (Stripe)
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
                      🏦 Bonifico Bancario
                    </label>
                  </div>

                  <div className="checkout__payment-method">
                    <input
                      type="radio"
                      id="contrassegno"
                      name="payment_method"
                      value="contrassegno"
                      checked={formData.payment_method === 'contrassegno'}
                      onChange={handleInputChange}
                      className="checkout__radio"
                    />
                    <label htmlFor="contrassegno" className="checkout__payment-label">
                      📦 Contrassegno
                    </label>
                  </div>
                </div>
              </div>

              <div className="checkout__form-actions">
                <Link to="/cart" className="checkout__button checkout__button--secondary">
                  Torna al carrello
                </Link>
                <button
                  type="submit"
                  className="checkout__button checkout__button--primary"
                  disabled={loading}
                >
                  {loading ? 'Elaborazione...' : 'Procedi al pagamento'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="checkout__summary">
            <div className="checkout__summary-card">
              <h3 className="checkout__summary-title">Riepilogo Ordine</h3>
              
              {cart && cart.items && (
                <div className="checkout__items">
                  {cart.items.map((item) => (
                    <div key={item.id} className="checkout__item">
                      <div className="checkout__item-info">
                        <h4>{item.product.name}</h4>
                        <p>Quantità: {item.quantity}</p>
                      </div>
                      <div className="checkout__item-price">
                        €{(parseFloat(item.price || 0) * parseInt(item.quantity || 0)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {cart && (
                <div className="checkout__totals">
                  <div className="checkout__total-row">
                    <span>Subtotale:</span>
                    <span>€{parseFloat(cart.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="checkout__total-row">
                    <span>Spedizione:</span>
                    <span>€{parseFloat(cart.shipping || 0).toFixed(2)}</span>
                  </div>
                  {(cart.discount && parseFloat(cart.discount) > 0) && (
                    <div className="checkout__total-row checkout__total-row--discount">
                      <span>Sconto:</span>
                      <span>-€{parseFloat(cart.discount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="checkout__total-row checkout__total-row--final">
                    <span>Totale:</span>
                    <span>€{parseFloat(cart.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Codice sconto */}
              <div className="checkout__discount">
                <h4>Codice Sconto</h4>
                <div className="checkout__discount-form">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Inserisci codice sconto"
                    className="checkout__discount-input"
                  />
                  <button 
                    type="button"
                    onClick={applyDiscountCode}
                    className="checkout__discount-button"
                  >
                    Applica
                  </button>
                </div>
                {discountMessage && (
                  <p className={`checkout__discount-message ${discountValid ? 'checkout__discount-message--success' : 'checkout__discount-message--error'}`}>
                    {discountMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 