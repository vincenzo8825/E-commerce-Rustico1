import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

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

  const getStatusClass = (status) => {
    switch (status) {
      case 'completato':
        return 'dashboard__status--completed';
      case 'in elaborazione':
        return 'dashboard__status--processing';
      case 'spedito':
        return 'dashboard__status--shipped';
      case 'annullato':
        return 'dashboard__status--cancelled';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completato':
        return 'Completato';
      case 'in elaborazione':
        return 'In elaborazione';
      case 'spedito':
        return 'Spedito';
      case 'annullato':
        return 'Annullato';
      default:
        return status;
    }
  };

  const handleGoBack = () => {
    navigate('/user/orders');
  };

  const handleCreateTicket = () => {
    navigate('/user/support/new', { state: { orderId: id } });
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
              {getStatusText(order.status)}
            </span>
          </div>
          <div className="dashboard__order-meta-item">
            <span className="dashboard__label">Totale:</span>
            <span className="dashboard__order-total">€ {order.total_price.toFixed(2)}</span>
          </div>
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
          
          {order.order_items.map((item) => (
            <div key={item.id} className="dashboard__order-item-row">
              <div className="dashboard__order-items-product">
                <div className="dashboard__order-item-image">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name} />
                  ) : (
                    <div className="dashboard__order-item-placeholder">No image</div>
                  )}
                </div>
                <div className="dashboard__order-item-details">
                  <h3 className="dashboard__order-item-name">{item.product.name}</h3>
                  <p className="dashboard__order-item-sku">SKU: {item.product.sku}</p>
                </div>
              </div>
              <div className="dashboard__order-items-price">
                € {parseFloat(item.price).toFixed(2)}
              </div>
              <div className="dashboard__order-items-quantity">
                {item.quantity}
              </div>
              <div className="dashboard__order-items-subtotal">
                € {(parseFloat(item.price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="dashboard__order-summary">
        <div className="dashboard__order-summary-row">
          <span>Subtotale:</span>
          <span>€ {order.subtotal.toFixed(2)}</span>
        </div>
        <div className="dashboard__order-summary-row">
          <span>Spese di spedizione:</span>
          <span>€ {order.shipping_cost.toFixed(2)}</span>
        </div>
        {order.discount_amount > 0 && (
          <div className="dashboard__order-summary-row dashboard__order-discount">
            <span>Sconto:</span>
            <span>- € {order.discount_amount.toFixed(2)}</span>
          </div>
        )}
        <div className="dashboard__order-summary-row dashboard__order-total-row">
          <span>Totale ordine:</span>
          <span>€ {order.total_price.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="dashboard__section">
        <h2 className="dashboard__section-title">Informazioni di spedizione</h2>
        <div className="dashboard__shipping-info">
          <p>
            <strong>{order.shipping_name} {order.shipping_surname}</strong><br />
            {order.shipping_address}<br />
            {order.shipping_postal_code} {order.shipping_city}<br />
            {order.shipping_phone}
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