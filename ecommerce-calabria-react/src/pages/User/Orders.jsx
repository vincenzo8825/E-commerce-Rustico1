import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/orders');
      setOrders(response.data.orders);
    } catch (error) {
      setError('Impossibile caricare gli ordini. Riprova più tardi.');
      console.error('Errore nel caricamento degli ordini:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
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

  if (loading) {
    return (
      <div className="dashboard__loading">
        Caricamento ordini in corso...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard__error-container">
        <p className="dashboard__error">{error}</p>
        <button
          className="dashboard__button"
          onClick={fetchOrders}
        >
          Riprova
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="dashboard__empty">
        <div className="dashboard__empty-icon">📦</div>
        <h2>Nessun ordine trovato</h2>
        <p>Non hai ancora effettuato ordini.</p>
        <Link to="/products" className="dashboard__button">
          Inizia a fare acquisti
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="dashboard__section-title">I miei ordini</h1>
      
      <div className="dashboard__orders">
        <div className="dashboard__orders-header">
          <div className="dashboard__orders-header-item">Ordine #</div>
          <div className="dashboard__orders-header-item">Data</div>
          <div className="dashboard__orders-header-item">Stato</div>
          <div className="dashboard__orders-header-item">Totale</div>
          <div className="dashboard__orders-header-item">Azioni</div>
        </div>
        
        {orders.map((order) => (
          <div key={order.id} className="dashboard__order-item">
            <div className="dashboard__order-number">#{order.id}</div>
            <div className="dashboard__order-date">{formatDate(order.created_at)}</div>
            <div className="dashboard__order-status">
              <span className={`dashboard__status ${getStatusClass(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <div className="dashboard__order-total">€ {parseFloat(order.total || order.total_price || 0).toFixed(2)}</div>
            <div className="dashboard__order-actions">
              <Link to={`/dashboard/orders/${order.id}`} className="dashboard__order-link">
                Dettagli
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders; 