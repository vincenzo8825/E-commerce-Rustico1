import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { LoadingSpinner, ErrorDisplay } from '../../components/common/LoadingStates';
import './Admin.scss';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.current_page, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await api.get('/admin/users', { params });
      
      if (response.data.success) {
        setUsers(response.data.data.data);
        setPagination({
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          total: response.data.data.total,
          per_page: response.data.data.per_page
        });
      }
    } catch {
      setError('Errore nel caricamento degli utenti');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      fetchUsers();
    } catch {
      alert('Errore nell\'aggiornamento dello stato');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'Attivo', class: 'admin-badge--success' },
      inactive: { label: 'Inattivo', class: 'admin-badge--warning' },
      suspended: { label: 'Sospeso', class: 'admin-badge--danger' }
    };
    
    const statusInfo = statusMap[status] || { label: status, class: 'admin-badge--default' };
    
    return (
      <span className={`admin-badge ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading && users.length === 0) {
    return <LoadingSpinner size="large" message="Caricamento utenti..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchUsers} />;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header__content">
          <h1 className="admin-title">Gestione Utenti</h1>
          <p className="admin-subtitle">
            Gestisci gli utenti registrati sulla piattaforma
          </p>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-filters">
          <div className="admin-filters__group">
            <input
              type="text"
              placeholder="Cerca per nome, email..."
              value={searchTerm}
              onChange={handleSearch}
              className="admin-input"
            />
            
            <select
              value={statusFilter}
              onChange={handleFilterChange}
              className="admin-select"
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Attivi</option>
              <option value="inactive">Inattivi</option>
              <option value="suspended">Sospesi</option>
            </select>
          </div>
          
          <div className="admin-stats">
            <span className="admin-stat">
              Totale: {pagination.total} utenti
            </span>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Stato</th>
                <th>Email Verificata</th>
                <th>Admin</th>
                <th>Registrato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>
                    <div className="admin-user-info">
                      <strong>{user.name} {user.surname}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{getStatusBadge(user.status || 'active')}</td>
                  <td>
                    {user.email_verified_at ? (
                      <span className="admin-badge admin-badge--success">✓</span>
                    ) : (
                      <span className="admin-badge admin-badge--warning">✗</span>
                    )}
                  </td>
                  <td>
                    {user.is_admin ? (
                      <span className="admin-badge admin-badge--info">Admin</span>
                    ) : (
                      <span className="admin-badge admin-badge--default">Utente</span>
                    )}
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <div className="admin-actions">
                      <Link 
                        to={`/admin/users/${user.id}`}
                        className="admin-button admin-button--small admin-button--primary"
                      >
                        Dettagli
                      </Link>
                      
                      <select
                        value={user.status || 'active'}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className="admin-select admin-select--small"
                      >
                        <option value="active">Attivo</option>
                        <option value="inactive">Inattivo</option>
                        <option value="suspended">Sospeso</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.last_page > 1 && (
          <div className="admin-pagination">
            <button
              onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
              disabled={pagination.current_page === 1}
              className="admin-button admin-button--secondary"
            >
              Precedente
            </button>
            
            <span className="admin-pagination__info">
              Pagina {pagination.current_page} di {pagination.last_page}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
              disabled={pagination.current_page === pagination.last_page}
              className="admin-button admin-button--secondary"
            >
              Successiva
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers; 