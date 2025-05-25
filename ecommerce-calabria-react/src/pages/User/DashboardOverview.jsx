import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { UserOrdersChart, UserTopProductsChart } from '../../components/Charts/UserCharts';
import './DashboardOverview.scss';

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [customerStatus, setCustomerStatus] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [quickActions, setQuickActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Carica tutte le informazioni della dashboard
        const [statsRes, statusRes, actionsRes] = await Promise.all([
          api.get('/user/dashboard/stats'),
          api.get('/user/dashboard/customer-status'),
          api.get('/user/dashboard/quick-actions')
        ]);

        setStats(statsRes.data.data);
        setCustomerStatus(statusRes.data.data);
        setQuickActions(actionsRes.data.data);
        
        // Carica ultimo ordine se presente
        if (statsRes.data.data.total_orders > 0) {
          const lastOrderRes = await api.get('/user/orders?limit=1');
          setLastOrder(lastOrderRes.data.data?.[0] || null);
        }
      } catch {
        setError('Errore nel caricamento della dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0'; 
      case 'bronze': return '#CD7F32';
      default: return '#8B4513';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'gold': return '👑';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '⭐';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-overview loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-overview error">
        <div className="error-message">
          <h3>Errore nel caricamento</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      {/* Header con saluto personalizzato */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Ciao, {stats?.user_name || 'Cliente'}! 👋</h1>
          <p className="welcome-subtitle">
            Ecco un riepilogo della tua attività
          </p>
        </div>
        
        {/* Status Customer */}
        {customerStatus && (
          <div 
            className="customer-status"
            style={{ borderColor: getStatusColor(customerStatus.level) }}
          >
            <div className="status-icon">
              {getStatusIcon(customerStatus.level)}
            </div>
            <div className="status-info">
              <h3 style={{ color: getStatusColor(customerStatus.level) }}>
                Cliente {customerStatus.level}
              </h3>
              <p>{customerStatus.description}</p>
              {customerStatus.next_level && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${customerStatus.progress_percentage}%`,
                      backgroundColor: getStatusColor(customerStatus.level)
                    }}
                  ></div>
                  <span className="progress-text">
                    €{customerStatus.current_spent} / €{customerStatus.next_level_requirement}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Statistiche principali */}
      <div className="stats-grid">
        <div className="stat-card orders">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats?.total_orders || 0}</h3>
            <p>Ordini Totali</p>
            <span className="stat-change positive">
              +{stats?.orders_this_month || 0} questo mese
            </span>
          </div>
        </div>

        <div className="stat-card spending">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>€{stats?.total_spent?.toFixed(2) || '0.00'}</h3>
            <p>Spesa Totale</p>
            <span className="stat-change positive">
              €{stats?.spent_this_month?.toFixed(2) || '0.00'} questo mese
            </span>
          </div>
        </div>

        <div className="stat-card favorites">
          <div className="stat-icon">❤️</div>
          <div className="stat-content">
            <h3>{stats?.favorite_products || 0}</h3>
            <p>Prodotti Preferiti</p>
            <span className="stat-change">
              {stats?.recent_favorites || 0} aggiunti di recente
            </span>
          </div>
        </div>

        <div className="stat-card points">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{stats?.loyalty_points || 0}</h3>
            <p>Punti Fedeltà</p>
            <span className="stat-change positive">
              +{stats?.points_this_month || 0} questo mese
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="quick-actions">
          <h2>Azioni Rapide</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <Link 
                key={index} 
                to={action.url} 
                className={`action-card ${action.type}`}
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                </div>
                {action.badge && (
                  <span className="action-badge">{action.badge}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ultimo Ordine */}
      {lastOrder && (
        <div className="last-order">
          <h2>Ultimo Ordine</h2>
          <div className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h4>Ordine #{lastOrder.order_number}</h4>
                <p className="order-date">
                  {new Date(lastOrder.created_at).toLocaleDateString('it-IT')}
                </p>
              </div>
              <div className="order-status">
                <span className={`status-badge ${lastOrder.status}`}>
                  {lastOrder.status_label}
                </span>
              </div>
            </div>
            
            <div className="order-items">
              {lastOrder.order_items?.slice(0, 3).map((item, index) => (
                <div key={index} className="order-item">
                  <img 
                    src={item.product?.image_url || '/placeholder.jpg'} 
                    alt={item.product_name}
                    className="item-image"
                  />
                  <div className="item-details">
                    <span className="item-name">{item.product_name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                </div>
              ))}
              {lastOrder.order_items?.length > 3 && (
                <div className="more-items">
                  +{lastOrder.order_items.length - 3} altri prodotti
                </div>
              )}
            </div>
            
            <div className="order-footer">
              <div className="order-total">
                <strong>Totale: {lastOrder.formatted_total}</strong>
              </div>
              <div className="order-actions">
                <Link 
                  to={`/dashboard/orders/${lastOrder.id}`}
                  className="btn btn-primary"
                >
                  Dettagli
                </Link>
                {lastOrder.status === 'delivered' && (
                  <button className="btn btn-secondary">
                    Riordina
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sezione Grafici */}
      <div className="charts-section">
        <h2>Andamento Acquisti</h2>
        <div className="charts-grid">
          <div className="chart-container">
            <UserOrdersChart height={250} />
          </div>
          <div className="chart-container">
            <UserTopProductsChart height={250} />
          </div>
        </div>
      </div>

      {/* Tips e Suggerimenti */}
      <div className="tips-section">
        <h2>Suggerimenti per Te</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">💡</div>
            <div className="tip-content">
              <h4>Completa il tuo profilo</h4>
              <p>Aggiungi più informazioni per ricevere suggerimenti personalizzati</p>
            </div>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">🛒</div>
            <div className="tip-content">
              <h4>Carrello salvato</h4>
              <p>Hai prodotti nel carrello che ti aspettano!</p>
            </div>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">🎁</div>
            <div className="tip-content">
              <h4>Offerte speciali</h4>
              <p>Scopri le nostre offerte esclusive per clienti fedeli</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 