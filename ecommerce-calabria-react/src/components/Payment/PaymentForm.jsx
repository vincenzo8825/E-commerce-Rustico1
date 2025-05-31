import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../utils/api';
import './PaymentForm.scss';

const PaymentForm = ({ orderData, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Crea payment intent sul backend
      const { data } = await api.post('/checkout/create-payment-intent', {
        order_data: orderData,
        amount: Math.round(parseFloat(orderData.total || 0) * 100), // Converti in centesimi
        currency: 'eur'
      });

      const { client_secret } = data;

      // Conferma il pagamento con Stripe
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${orderData.shipping_name} ${orderData.shipping_surname}`,
            email: orderData.email,
            phone: orderData.shipping_phone,
            address: {
              line1: orderData.shipping_address,
              city: orderData.shipping_city,
              postal_code: orderData.shipping_postal_code,
              country: 'IT'
            }
          }
        }
      });

      if (result.error) {
        setPaymentError(result.error.message);
        onError(result.error.message);
      } else {
        // Pagamento riuscito
        onSuccess(result.paymentIntent);
      }
    } catch (error) {
      console.error('Errore durante il pagamento:', error);
      const errorMessage = error.response?.data?.message || 'Errore durante il pagamento';
      setPaymentError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#2d3748',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        '::placeholder': {
          color: '#a0aec0',
        },
      },
      invalid: {
        color: '#e53e3e',
        iconColor: '#e53e3e',
      },
      complete: {
        color: '#38a169',
        iconColor: '#38a169',
      },
    },
    hidePostalCode: true, // Usiamo già il CAP nei dati di spedizione
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-form__header">
        <h3>Dati Carta di Credito</h3>
        <p>Inserisci i dati della tua carta per completare l'acquisto in sicurezza</p>
      </div>

      {/* Metodi di pagamento accettati */}
      <div className="payment-form__methods">
        <div className="payment-form__methods-item">
          <div className="payment-form__methods-item-icon">💳</div>
          Visa
        </div>
        <div className="payment-form__methods-item">
          <div className="payment-form__methods-item-icon">💳</div>
          Mastercard
        </div>
        <div className="payment-form__methods-item">
          <div className="payment-form__methods-item-icon">💳</div>
          American Express
        </div>
        <div className="payment-form__methods-item">
          <div className="payment-form__methods-item-icon">💳</div>
          Maestro
        </div>
      </div>

      <div className="payment-form__card-element">
        <CardElement options={cardElementOptions} />
      </div>

      {paymentError && (
        <div className="payment-form__error">
          {paymentError}
        </div>
      )}

      <div className="payment-form__total">
        <strong>Totale da pagare: €{parseFloat(orderData.total || 0).toFixed(2)}</strong>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`payment-form__button ${isProcessing ? 'payment-form__button--processing' : ''}`}
      >
        {isProcessing ? 'Elaborazione in corso...' : `Completa il pagamento di €${parseFloat(orderData.total || 0).toFixed(2)}`}
      </button>

      <div className="payment-form__security">
        <p>🔒 Pagamento sicuro gestito da Stripe - I tuoi dati sono protetti con crittografia SSL</p>
      </div>

      {/* Trust indicators */}
      <div className="payment-form__trust">
        <div className="payment-form__trust-item">
          <span className="payment-form__trust-item-icon">🔒</span>
          SSL 256-bit
        </div>
        <div className="payment-form__trust-item">
          <span className="payment-form__trust-item-icon">✅</span>
          PCI Compliant
        </div>
        <div className="payment-form__trust-item">
          <span className="payment-form__trust-item-icon">🛡️</span>
          Protezione acquisti
        </div>
      </div>
    </form>
  );
};

export default PaymentForm; 