import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { LoadingSpinner, ErrorDisplay } from '../../components/common/LoadingStates';
import './OrderConfirmation.scss';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data.order || response.data);
      setError('');
    } catch (err) {
      console.error('Errore nel caricamento dell\'ordine:', err);
      setError('Ordine non trovato o accesso non autorizzato');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { label: 'In attesa', class: 'order-confirmation__badge--warning' },
      'processing': { label: 'In elaborazione', class: 'order-confirmation__badge--info' },
      'shipped': { label: 'Spedito', class: 'order-confirmation__badge--primary' },
      'delivered': { label: 'Consegnato', class: 'order-confirmation__badge--success' },
      'cancelled': { label: 'Annullato', class: 'order-confirmation__badge--danger' },
      'refunded': { label: 'Rimborsato', class: 'order-confirmation__badge--secondary' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'order-confirmation__badge--default' };
    
    return (
      <span className={`order-confirmation__badge ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      'carta': 'Carta di Credito',
      'paypal': 'PayPal',
      'bonifico': 'Bonifico Bancario',
      'contrassegno': 'Contrassegno'
    };
    return methods[method] || method;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleDownloadInvoice = () => {
    // Implementa download fattura
    console.log('Download fattura per ordine:', order.order_number);
    // TODO: Implementare chiamata API per download fattura
  };

  const handleTrackOrder = () => {
    // Implementa tracking ordine
    if (order.tracking_number) {
      window.open(`https://track.example.com/${order.tracking_number}`, '_blank');
    }
  };

  const handleShareOrder = () => {
    // Implementa condivisione ordine
    if (navigator.share) {
      navigator.share({
        title: `Ordine ${order.order_number} - Sapori di Calabria`,
        text: `Ho appena ordinato dei prodotti calabresi autentici!`,
        url: window.location.href
      });
    } else {
      // Fallback per browser che non supportano Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiato negli appunti!');
    }
  };

  if (loading) {
    return (
      <div className="order-confirmation">
        <div className="order-confirmation__container">
          <LoadingSpinner size="large" message="Caricamento dettagli ordine..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-confirmation">
        <div className="order-confirmation__container">
          <ErrorDisplay 
            title="Ordine non trovato"
            message={error}
            onRetry={fetchOrder}
            onGoBack={() => navigate('/dashboard/orders')}
            goBackText="Torna ai tuoi ordini"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      <div className="order-confirmation__container">
        {/* Header Success */}
        <div className="order-confirmation__header">
          <div className="order-confirmation__success-icon">✅</div>
          <h1 className="order-confirmation__title">Ordine Confermato!</h1>
          <p className="order-confirmation__subtitle">
            Grazie per il tuo acquisto, <strong>{user?.name || 'Cliente'}</strong>!
          </p>
          <p className="order-confirmation__description">
            Il tuo ordine <strong>#{order?.order_number}</strong> è stato ricevuto e sarà processato a breve.
          </p>
        </div>

        {/* Content Grid */}
        <div className="order-confirmation__content">
          {/* Colonna Sinistra - Dettagli Ordine */}
          <div className="order-confirmation__main">
            {/* Stato e Info Ordine */}
            <div className="order-confirmation__card">
              <div className="order-confirmation__card-header">
                <h2>Informazioni Ordine</h2>
                {getStatusBadge(order?.status)}
              </div>
              <div className="order-confirmation__card-body">
                <div className="order-confirmation__info-grid">
                  <div className="order-confirmation__info-item">
                    <span className="order-confirmation__info-label">📅 Data Ordine</span>
                    <span className="order-confirmation__info-value">
                      {formatDate(order?.created_at)}
                    </span>
                  </div>
                  <div className="order-confirmation__info-item">
                    <span className="order-confirmation__info-label">💳 Metodo di Pagamento</span>
                    <span className="order-confirmation__info-value">
                      {getPaymentMethodText(order?.payment_method)}
                      {order?.is_paid && <span className="order-confirmation__badge order-confirmation__badge--success">Pagato</span>}
                    </span>
                  </div>
                  {order?.tracking_number && (
                    <div className="order-confirmation__info-item">
                      <span className="order-confirmation__info-label">📦 Codice Tracking</span>
                      <span className="order-confirmation__info-value">
                        {order.tracking_number}
                        <button 
                          onClick={handleTrackOrder}
                          className="order-confirmation__track-btn"
                        >
                          Traccia spedizione
                        </button>
                      </span>
                    </div>
                  )}
                  <div className="order-confirmation__info-item">
                    <span className="order-confirmation__info-label">🏠 Indirizzo di Spedizione</span>
                    <span className="order-confirmation__info-value">
                      {order?.shipping_address}<br />
                      {order?.shipping_city}, {order?.shipping_postal_code}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prodotti Ordinati */}
            <div className="order-confirmation__card">
              <div className="order-confirmation__card-header">
                <h2>Prodotti Ordinati</h2>
              </div>
              <div className="order-confirmation__card-body">
                <div className="order-confirmation__products">
                  {order?.items?.map((item, index) => (
                    <div key={index} className="order-confirmation__product">
                      <div className="order-confirmation__product-image">
                        {item.product?.image_url ? (
                          <img src={item.product.image_url} alt={item.product.name} />
                        ) : (
                          <div className="order-confirmation__product-placeholder">📦</div>
                        )}
                      </div>
                      <div className="order-confirmation__product-info">
                        <h3 className="order-confirmation__product-name">
                          {item.product?.name || item.name}
                        </h3>
                        <p className="order-confirmation__product-details">
                          Quantità: {item.quantity} • Prezzo: {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="order-confirmation__product-total">
                        {formatCurrency(item.quantity * item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Riepilogo e Azioni */}
          <div className="order-confirmation__sidebar">
            {/* Riepilogo Totali */}
            <div className="order-confirmation__card">
              <div className="order-confirmation__card-header">
                <h2>Riepilogo Ordine</h2>
              </div>
              <div className="order-confirmation__card-body">
                <div className="order-confirmation__totals">
                  <div className="order-confirmation__total-row">
                    <span>Subtotale:</span>
                    <span>{formatCurrency(order?.subtotal || 0)}</span>
                  </div>
                  <div className="order-confirmation__total-row">
                    <span>Spedizione:</span>
                    <span>{formatCurrency(order?.shipping_cost || 0)}</span>
                  </div>
                  {order?.tax_amount > 0 && (
                    <div className="order-confirmation__total-row">
                      <span>IVA:</span>
                      <span>{formatCurrency(order.tax_amount)}</span>
                    </div>
                  )}
                  {order?.discount_amount > 0 && (
                    <div className="order-confirmation__total-row order-confirmation__total-row--discount">
                      <span>Sconto:</span>
                      <span>-{formatCurrency(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="order-confirmation__total-row order-confirmation__total-row--final">
                    <span>Totale:</span>
                    <span>{formatCurrency(order?.total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Azioni */}
            <div className="order-confirmation__card">
              <div className="order-confirmation__card-header">
                <h2>Azioni</h2>
              </div>
              <div className="order-confirmation__card-body">
                <div className="order-confirmation__actions">
                  <button 
                    onClick={handleDownloadInvoice}
                    className="order-confirmation__action-btn order-confirmation__action-btn--primary"
                  >
                    📄 Scarica Fattura
                  </button>
                  
                  <button 
                    onClick={handleShareOrder}
                    className="order-confirmation__action-btn order-confirmation__action-btn--secondary"
                  >
                    📤 Condividi Ordine
                  </button>
                  
                  <Link 
                    to="/dashboard/orders"
                    className="order-confirmation__action-btn order-confirmation__action-btn--secondary"
                  >
                    📋 I miei Ordini
                  </Link>
                  
                  <Link 
                    to="/products"
                    className="order-confirmation__action-btn order-confirmation__action-btn--outline"
                  >
                    🛒 Continua lo Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Newsletter Suggestion */}
            <div className="order-confirmation__card order-confirmation__card--highlight">
              <div className="order-confirmation__card-body">
                <h3>🌶️ Resta aggiornato!</h3>
                <p>Iscriviti alla nostra newsletter per ricevere offerte esclusive sui sapori autentici della Calabria.</p>
                <Link 
                  to="/newsletter"
                  className="order-confirmation__action-btn order-confirmation__action-btn--primary order-confirmation__action-btn--small"
                >
                  Iscriviti alla Newsletter
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con info di supporto */}
        <div className="order-confirmation__footer">
          <div className="order-confirmation__support">
            <h3>Hai bisogno di aiuto?</h3>
            <p>Il nostro team di supporto è qui per aiutarti con qualsiasi domanda sul tuo ordine.</p>
            <div className="order-confirmation__support-actions">
              <Link to="/support/create" className="order-confirmation__support-btn">
                💬 Contatta il Supporto
              </Link>
              <a href="mailto:info@saporidicabria.it" className="order-confirmation__support-btn">
                ✉️ Invia Email
              </a>
              <a href="tel:+39084812345" className="order-confirmation__support-btn">
                📞 Chiama ora
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 