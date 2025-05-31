import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { LoadingSpinner, ErrorDisplay } from '../../components/common/LoadingStates';
import './Admin.scss';

const AdminUserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const [userResponse, ordersResponse] = await Promise.all([
        api.get(`/admin/users/${id}`),
        api.get(`/admin/users/${id}/orders`)
      ]);
      
      if (userResponse.data.success) {
        setUser(userResponse.data.data);
      }
      
      if (ordersResponse.data.success) {
        setOrders(ordersResponse.data.data);
      }
    } catch {
      setError('Errore nel caricamento dei dettagli utente');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await api.put(`/admin/users/${id}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        setUser({ ...user, status: newStatus });
        alert('Status utente aggiornato con successo!');
      }
    } catch {
      alert('Errore nell\'aggiornamento dello status utente');
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Caricamento dettagli utente..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchUserDetail} />;
  }

  if (!user) {
    return <ErrorDisplay message="Utente non trovato" />;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header__content">
          <div className="admin-breadcrumb">
            <Link to="/admin/users" className="admin-breadcrumb__link">
              Utenti
            </Link>
            <span className="admin-breadcrumb__separator">/</span>
            <span className="admin-breadcrumb__current">
              {user.name}
            </span>
          </div>
          <h1 className="admin-title">Dettagli Utente</h1>
          <p className="admin-subtitle">
            Gestisci le informazioni e la cronologia dell'utente
          </p>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'profile' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profilo
          </button>
          <button
            className={`admin-tab ${activeTab === 'orders' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Ordini ({orders.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'activity' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Attività
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="admin-card">
            <div className="admin-card__header">
              <h2>Informazioni Profilo</h2>
              <div className="admin-user-status">
                <select
                  value={user.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="admin-select admin-select--sm"
                >
                  <option value="active">Attivo</option>
                  <option value="inactive">Inattivo</option>
                  <option value="suspended">Sospeso</option>
                </select>
              </div>
            </div>
            <div className="admin-card__content">
              <div className="admin-user-profile">
                <div className="admin-user-avatar">
                  <img
                    src={user.avatar || '/images/default-avatar.png'}
                    alt={user.name}
                    className="admin-avatar"
                  />
                </div>
                <div className="admin-user-info">
                  <div className="admin-info-grid">
                    <div className="admin-info-item">
                      <label className="admin-info-label">Nome Completo</label>
                      <p className="admin-info-value">{user.name}</p>
                    </div>
                    <div className="admin-info-item">
                      <label className="admin-info-label">Email</label>
                      <p className="admin-info-value">{user.email}</p>
                    </div>
                    <div className="admin-info-item">
                      <label className="admin-info-label">Telefono</label>
                      <p className="admin-info-value">{user.phone || 'Non fornito'}</p>
                    </div>
                    <div className="admin-info-item">
                      <label className="admin-info-label">Data Registrazione</label>
                      <p className="admin-info-value">
                        {new Date(user.created_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div className="admin-info-item">
                      <label className="admin-info-label">Ultimo Accesso</label>
                      <p className="admin-info-value">
                        {user.last_login_at 
                          ? new Date(user.last_login_at).toLocaleDateString('it-IT')
                          : 'Mai'
                        }
                      </p>
                    </div>
                    <div className="admin-info-item">
                      <label className="admin-info-label">Totale Ordini</label>
                      <p className="admin-info-value">{user.total_orders || 0}</p>
                    </div>
                    <div className="admin-info-item">
                      <label className="admin-info-label">Totale Speso</label>
                      <p className="admin-info-value">€{user.total_spent || '0.00'}</p>
                    </div>
                    <div className="admin-info-item">
                      <label className="admin-info-label">Status Account</label>
                      <p className={`admin-info-value admin-status admin-status--${user.status}`}>
                        {user.status === 'active' ? 'Attivo' : 
                         user.status === 'inactive' ? 'Inattivo' : 'Sospeso'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="admin-card">
            <div className="admin-card__header">
              <h2>Cronologia Ordini</h2>
            </div>
            <div className="admin-card__content">
              {orders.length === 0 ? (
                <p className="admin-empty-state">Nessun ordine trovato per questo utente.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID Ordine</th>
                        <th>Data</th>
                        <th>Totale</th>
                        <th>Status</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{new Date(order.created_at).toLocaleDateString('it-IT')}</td>
                          <td>€{order.total}</td>
                          <td>
                            <span className={`admin-status admin-status--${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <Link
                              to={`/admin/orders/${order.id}`}
                              className="admin-button admin-button--sm admin-button--outline"
                            >
                              Visualizza
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="admin-card">
            <div className="admin-card__header">
              <h2>Registro Attività</h2>
            </div>
            <div className="admin-card__content">
              <p className="admin-empty-state">
                Funzionalità del registro attività in fase di sviluppo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetail; 