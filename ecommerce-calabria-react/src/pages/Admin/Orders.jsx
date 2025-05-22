import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    sort: '-created_at'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Costruisce i parametri di query
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);
      params.append('sort', filters.sort);
      params.append('page', currentPage);
      
      const response = await api.get(`/admin/orders?${params.toString()}`);
      setOrders(response.data.orders.data || []);
      setTotalPages(response.data.orders.last_page || 1);
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento degli ordini:', err);
      setError('Impossibile caricare gli ordini. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset alla prima pagina quando cambia un filtro
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Formatta data in formato italiano
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  // Formatta prezzo con 2 decimali
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  // Restituisce classe CSS in base allo stato dell'ordine
  const getOrderStatusClass = (status) => {
    switch (status) {
      case 'completato': return 'admin__status-badge--success';
      case 'spedito': return 'admin__status-badge--info';
      case 'in_elaborazione': return 'admin__status-badge--warning';
      case 'annullato': return 'admin__status-badge--danger';
      default: return '';
    }
  };

  // Traduce lo stato dell'ordine in italiano
  const translateOrderStatus = (status) => {
    switch (status) {
      case 'completato': return 'Completato';
      case 'spedito': return 'Spedito';
      case 'in_elaborazione': return 'In lavorazione';
      case 'annullato': return 'Annullato';
      default: return status;
    }
  };

  if (loading && !orders.length) {
    return (
      <div className="admin__loading-spinner">
        Caricamento ordini...
      </div>
    );
  }

  return (
    <>
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Filtri</h2>
        </div>
        <div className="admin__card-body">
          <form onSubmit={handleSearch} className="admin__filters">
            <div className="admin__filters-row">
              <div className="admin__form-group">
                <label htmlFor="search" className="admin__form-group-label">Cerca</label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  className="admin__form-group-input"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="ID ordine o cliente"
                />
              </div>
              
              <div className="admin__form-group">
                <label htmlFor="status" className="admin__form-group-label">Stato</label>
                <select
                  id="status"
                  name="status"
                  className="admin__form-group-select"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Tutti gli stati</option>
                  <option value="in_elaborazione">In lavorazione</option>
                  <option value="spedito">Spediti</option>
                  <option value="completato">Completati</option>
                  <option value="annullato">Annullati</option>
                </select>
              </div>
              
              <div className="admin__form-group">
                <label htmlFor="dateFrom" className="admin__form-group-label">Data da</label>
                <input
                  type="date"
                  id="dateFrom"
                  name="dateFrom"
                  className="admin__form-group-input"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div className="admin__form-group">
                <label htmlFor="dateTo" className="admin__form-group-label">Data a</label>
                <input
                  type="date"
                  id="dateTo"
                  name="dateTo"
                  className="admin__form-group-input"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div className="admin__form-group">
                <label htmlFor="sort" className="admin__form-group-label">Ordina per</label>
                <select
                  id="sort"
                  name="sort"
                  className="admin__form-group-select"
                  value={filters.sort}
                  onChange={handleFilterChange}
                >
                  <option value="-created_at">Data (più recenti)</option>
                  <option value="created_at">Data (meno recenti)</option>
                  <option value="-total">Importo (decrescente)</option>
                  <option value="total">Importo (crescente)</option>
                </select>
              </div>
              
              <div className="admin__form-group admin__form-group--submit">
                <button type="submit" className="admin__button admin__button--primary">
                  Filtra
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Ordini ({orders.length} visualizzati)</h2>
        </div>
        
        <div className="admin__card-body">
          {error ? (
            <div className="admin__error">
              <p>{error}</p>
              <button
                className="admin__button admin__button--primary"
                onClick={fetchOrders}
              >
                Riprova
              </button>
            </div>
          ) : (
            <>
              {orders.length === 0 ? (
                <p>Nessun ordine trovato con i filtri selezionati.</p>
              ) : (
                <>
                  <div className="admin__table-container">
                    <table className="admin__table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Cliente</th>
                          <th>Data</th>
                          <th>Totale</th>
                          <th>Stato</th>
                          <th>Prodotti</th>
                          <th>Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.user ? `${order.user.name} ${order.user.surname}` : 'Cliente eliminato'}</td>
                            <td>{formatDate(order.created_at)}</td>
                            <td>€ {formatPrice(order.total_amount || order.total)}</td>
                            <td>
                              <span className={`admin__status-badge ${getOrderStatusClass(order.status)}`}>
                                {translateOrderStatus(order.status)}
                              </span>
                            </td>
                            <td>{order.items_count || 0} prodotti</td>
                            <td>
                              <div className="admin__table-actions">
                                <Link
                                  to={`/admin/orders/${order.id}`}
                                  className="admin__button admin__button--secondary"
                                >
                                  Dettagli
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Paginazione */}
                  {totalPages > 1 && (
                    <div className="admin__pagination">
                      <button
                        className="admin__pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Precedente
                      </button>
                      
                      <div className="admin__pagination-pages">
                        Pagina {currentPage} di {totalPages}
                      </div>
                      
                      <button
                        className="admin__pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Successiva
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders; 