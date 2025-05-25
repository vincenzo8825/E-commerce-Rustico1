import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { SafeImage } from '../../utils/imageUtils.jsx';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/user/orders/${id}`);
      setOrder(response.data.order);
    } catch (error) {
      setError('Impossibile caricare i dettagli dell\'ordine. Riprova più tardi.');
      console.error('Errore nel caricamento dei dettagli dell\'ordine:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  const getOrderStatusSteps = () => {
    if (!order || !order.status) {
      return [];
    }
    
    const steps = [
      { key: 'ordinato', label: 'Ordine Ricevuto', icon: '📋' },
      { key: 'in_elaborazione', label: 'In Elaborazione', icon: '⚙️' },
      { key: 'spedito', label: 'Spedito', icon: '📦' },
      { key: 'in_transito', label: 'In Transito', icon: '🚛' },
      { key: 'consegnato', label: 'Consegnato', icon: '✅' }
    ];

    const statusIndex = {
      'ordinato': 0,
      'in_elaborazione': 1, 
      'spedito': 2,
      'in_transito': 3,
      'consegnato': 4,
      'completato': 4
    };

    const currentIndex = statusIndex[order.status] || 0;

    return steps.map((step, index) => ({
      ...step,
      isCompleted: index <= currentIndex,
      isCurrent: index === currentIndex
    }));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completato':
      case 'consegnato':
        return 'dashboard__status--completed';
      case 'spedito':
      case 'in_transito':
        return 'dashboard__status--shipped';
      case 'in_elaborazione':
        return 'dashboard__status--processing';
      case 'annullato':
        return 'dashboard__status--cancelled';
      default:
        return 'dashboard__status--pending';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'completato': return 'Completato';
      case 'consegnato': return 'Consegnato';
      case 'spedito': return 'Spedito';
      case 'in_transito': return 'In Transito';
      case 'in_elaborazione': return 'In Elaborazione';
      case 'annullato': return 'Annullato';
      default: return status;
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard/orders');
  };

  const handleCreateTicket = () => {
    navigate('/dashboard/support/new', { state: { orderId: id } });
  };

  if (loading) {
    return (
      <div className="dashboard__loading">
        Caricamento dettagli ordine in corso...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard__error-container">
        <p className="dashboard__error">{error}</p>
        <button
          className="dashboard__button"
          onClick={fetchOrderDetails}
        >
          Riprova
        </button>
        <button
          className="dashboard__button dashboard__button--secondary"
          onClick={handleGoBack}
        >
          Torna agli ordini
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="dashboard__empty">
        <div className="dashboard__empty-icon">🔍</div>
        <h2>Ordine non trovato</h2>
        <p>L'ordine richiesto non è stato trovato.</p>
        <button
          className="dashboard__button"
          onClick={handleGoBack}
        >
          Torna agli ordini
        </button>
      </div>
    );
  }

  // Controlli di sicurezza per i dati dell'ordine
  if (!order.order_items || !Array.isArray(order.order_items)) {
    return (
      <div className="dashboard__loading">
        Caricamento dettagli ordine in corso...
      </div>
    );
  }

  const orderSteps = getOrderStatusSteps();

  return (
    <div>
      <div className="dashboard__header">
        <button
          className="dashboard__back-button"
          onClick={handleGoBack}
        >
          ← Torna agli ordini
        </button>
        <h1 className="dashboard__section-title">Dettagli Ordine #{order.id}</h1>
      </div>
      
      <div className="dashboard__section">
        <div className="dashboard__order-meta">
          <div className="dashboard__order-meta-item">
            <span className="dashboard__label">Data ordine:</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
          <div className="dashboard__order-meta-item">
            <span className="dashboard__label">Stato:</span>
            <span className={`dashboard__status ${getStatusClass(order.status)}`}>
              {translateStatus(order.status)}
            </span>
          </div>
          <div className="dashboard__order-meta-item">
            <span className="dashboard__label">Totale:</span>
            <span className="dashboard__order-total">€ {parseFloat(order.total_price || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard__section">
        <h2 className="dashboard__section-title">Tracking dello stato ordine</h2>
        <div className="order-tracking">
          {orderSteps && orderSteps.length > 0 ? (
            orderSteps.map((step, index) => (
              <div 
                key={step.key} 
                className={`order-tracking__step ${step.isCompleted ? 'order-tracking__step--completed' : ''} ${step.isCurrent ? 'order-tracking__step--current' : ''}`}
              >
                <div className="order-tracking__icon">
                  {step.icon}
                </div>
                <div className="order-tracking__content">
                  <div className="order-tracking__label">{step.label}</div>
                  {step.isCurrent && (
                    <div className="order-tracking__current-indicator">
                      Stato attuale
                    </div>
                  )}
                </div>
                {index < orderSteps.length - 1 && (
                  <div className={`order-tracking__line ${step.isCompleted ? 'order-tracking__line--completed' : ''}`}></div>
                )}
              </div>
            ))
          ) : (
            <div className="dashboard__loading">
              Caricamento tracking ordine...
            </div>
          )}
        </div>
      </div>
      
      <div className="dashboard__section">
        <h2 className="dashboard__section-title">Articoli ordinati</h2>
        <div className="dashboard__order-items">
          <div className="dashboard__order-items-header">
            <div className="dashboard__order-items-header-item dashboard__order-items-product">Prodotto</div>
            <div className="dashboard__order-items-header-item dashboard__order-items-price">Prezzo</div>
            <div className="dashboard__order-items-header-item dashboard__order-items-quantity">Quantità</div>
            <div className="dashboard__order-items-header-item dashboard__order-items-subtotal">Subtotale</div>
          </div>
          
          {order.order_items && order.order_items.length > 0 ? (
            order.order_items.map((item) => (
              <div key={item.id} className="dashboard__order-item-row">
                <div className="dashboard__order-items-product">
                  <div className="dashboard__order-item-image">
                    {item.product?.image ? (
                      <SafeImage src={item.product.image} alt={item.product.name} />
                    ) : (
                      <div className="dashboard__order-item-placeholder">No image</div>
                    )}
                  </div>
                  <div className="dashboard__order-item-details">
                    <h3 className="dashboard__order-item-name">{item.product?.name || 'Prodotto non disponibile'}</h3>
                    <p className="dashboard__order-item-sku">SKU: {item.product?.sku || 'N/A'}</p>
                  </div>
                </div>
                <div className="dashboard__order-items-price">
                  € {parseFloat(item.price || 0).toFixed(2)}
                </div>
                <div className="dashboard__order-items-quantity">
                  {item.quantity || 0}
                </div>
                <div className="dashboard__order-items-subtotal">
                  € {(parseFloat(item.price || 0) * (item.quantity || 0)).toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="dashboard__empty">
              <p>Nessun articolo trovato per questo ordine.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="dashboard__order-summary">
        <div className="dashboard__order-summary-row">
          <span>Subtotale:</span>
          <span>€ {parseFloat(order.subtotal || 0).toFixed(2)}</span>
        </div>
        <div className="dashboard__order-summary-row">
          <span>Spese di spedizione:</span>
          <span>€ {parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
        </div>
        {(order.discount_amount && order.discount_amount > 0) && (
          <div className="dashboard__order-summary-row dashboard__order-discount">
            <span>Sconto:</span>
            <span>- € {parseFloat(order.discount_amount).toFixed(2)}</span>
          </div>
        )}
        <div className="dashboard__order-summary-row dashboard__order-total-row">
          <span>Totale ordine:</span>
          <span>€ {parseFloat(order.total_price || 0).toFixed(2)}</span>
        </div>
      </div>
      
      <div className="dashboard__section">
        <h2 className="dashboard__section-title">Informazioni di spedizione</h2>
        <div className="dashboard__shipping-info">
          <p>
            <strong>{order.shipping_name || ''} {order.shipping_surname || ''}</strong><br />
            {order.shipping_address || 'Indirizzo non disponibile'}<br />
            {order.shipping_postal_code || ''} {order.shipping_city || ''}<br />
            {order.shipping_phone || 'Telefono non disponibile'}
          </p>
        </div>
      </div>
      
      <div className="dashboard__actions">
        <button
          className="dashboard__button"
          onClick={handleCreateTicket}
        >
          Hai bisogno di aiuto? Contatta l'assistenza
        </button>
      </div>
    </div>
  );
};

export default OrderDetail; 