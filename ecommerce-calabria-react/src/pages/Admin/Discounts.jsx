import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sort: '-created_at'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDiscounts();
  }, [currentPage, filters]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      
      // Costruisce i parametri di query
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      params.append('sort', filters.sort);
      params.append('page', currentPage);
      
      const response = await api.get(`/admin/discounts?${params.toString()}`);
      setDiscounts(response.data.discounts.data || []);
      setTotalPages(response.data.discounts.last_page || 1);
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento dei codici sconto:', err);
      setError('Impossibile caricare i codici sconto. Riprova più tardi.');
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
    fetchDiscounts();
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleToggleActive = async (discountId, currentStatus) => {
    try {
      await api.put(`/admin/discounts/${discountId}/toggle`);
      
      // Aggiorna lo stato del codice sconto nella lista
      setDiscounts(discounts.map(discount => {
        if (discount.id === discountId) {
          return { ...discount, is_active: !currentStatus };
        }
        return discount;
      }));
      
    } catch (err) {
      console.error('Errore nella modifica dello stato del codice sconto:', err);
      alert('Errore nella modifica dello stato del codice sconto. Riprova più tardi.');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il codice sconto "${code}"?`)) return;
    
    try {
      await api.delete(`/admin/discounts/${id}`);
      setDiscounts(discounts.filter(discount => discount.id !== id));
      alert('Codice sconto eliminato con successo');
    } catch (err) {
      console.error('Errore nell\'eliminazione del codice sconto:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Errore: ${err.response.data.message}`);
      } else {
        alert('Errore nell\'eliminazione del codice sconto. Riprova più tardi.');
      }
    }
  };

  // Formatta data in formato italiano
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  if (loading && !discounts.length) {
    return (
      <div className="admin__loading-spinner">
        Caricamento codici sconto...
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
                  placeholder="Codice o descrizione"
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
                  <option value="active">Attivi</option>
                  <option value="inactive">Inattivi</option>
                  <option value="expired">Scaduti</option>
                </select>
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
                  <option value="-created_at">Data creazione (più recenti)</option>
                  <option value="created_at">Data creazione (meno recenti)</option>
                  <option value="-expires_at">Data scadenza (più recenti)</option>
                  <option value="expires_at">Data scadenza (meno recenti)</option>
                  <option value="-amount">Sconto (decrescente)</option>
                  <option value="amount">Sconto (crescente)</option>
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
          <h2 className="admin__card-title">Codici Sconto ({discounts.length} visualizzati)</h2>
          <Link to="/admin/discounts/new" className="admin__button admin__button--primary">
            Nuovo Codice Sconto
          </Link>
        </div>
        
        <div className="admin__card-body">
          {error ? (
            <div className="admin__error">
              <p>{error}</p>
              <button
                className="admin__button admin__button--primary"
                onClick={fetchDiscounts}
              >
                Riprova
              </button>
            </div>
          ) : (
            <>
              {discounts.length === 0 ? (
                <p>Nessun codice sconto trovato con i filtri selezionati.</p>
              ) : (
                <>
                  <div className="admin__table-container">
                    <table className="admin__table">
                      <thead>
                        <tr>
                          <th>Codice</th>
                          <th>Descrizione</th>
                          <th>Sconto</th>
                          <th>Utilizzi</th>
                          <th>Validità</th>
                          <th>Stato</th>
                          <th>Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discounts.map(discount => {
                          const isExpired = discount.expires_at && new Date(discount.expires_at) < new Date();
                          const isLimitReached = discount.max_uses > 0 && discount.uses >= discount.max_uses;
                          
                          return (
                            <tr key={discount.id}>
                              <td><code>{discount.code}</code></td>
                              <td>{discount.description || 'Nessuna descrizione'}</td>
                              <td>
                                {discount.type === 'percentage' 
                                  ? `${discount.amount}%` 
                                  : `€${parseFloat(discount.amount).toFixed(2)}`
                                }
                              </td>
                              <td>
                                {discount.uses} 
                                {discount.max_uses > 0 ? ` / ${discount.max_uses}` : ''}
                              </td>
                              <td>
                                {discount.starts_at && (
                                  <div>Dal: {formatDate(discount.starts_at)}</div>
                                )}
                                {discount.expires_at ? (
                                  <div className={isExpired ? 'admin__text-danger' : ''}>
                                    Al: {formatDate(discount.expires_at)}
                                  </div>
                                ) : (
                                  <div>Nessuna scadenza</div>
                                )}
                              </td>
                              <td>
                                {isExpired ? (
                                  <span className="admin__status-badge admin__status-badge--danger">Scaduto</span>
                                ) : isLimitReached ? (
                                  <span className="admin__status-badge admin__status-badge--warning">Limite raggiunto</span>
                                ) : discount.is_active ? (
                                  <span className="admin__status-badge admin__status-badge--success">Attivo</span>
                                ) : (
                                  <span className="admin__status-badge admin__status-badge--danger">Inattivo</span>
                                )}
                              </td>
                              <td>
                                <div className="admin__table-actions">
                                  <Link
                                    to={`/admin/discounts/${discount.id}`}
                                    className="admin__button admin__button--secondary"
                                  >
                                    Modifica
                                  </Link>
                                  
                                  <button
                                    onClick={() => handleToggleActive(discount.id, discount.is_active)}
                                    className={`admin__button ${discount.is_active ? 'admin__button--warning' : 'admin__button--success'}`}
                                    disabled={isExpired || isLimitReached}
                                  >
                                    {discount.is_active ? 'Disattiva' : 'Attiva'}
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDelete(discount.id, discount.code)}
                                    className="admin__button admin__button--danger"
                                  >
                                    Elimina
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
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

export default Discounts; 