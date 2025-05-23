import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    sort: '-created_at'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTickets();
  }, [currentPage, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      params.append('sort', filters.sort);
      params.append('page', currentPage);
      
      // Usa l'endpoint corretto disponibile nelle route
      const response = await api.get(`/admin/dashboard/support-tickets?${params.toString()}`);
      
      // Gestione più robusta della risposta API
      if (response && response.data) {
        // Se la risposta ha una struttura data.tickets.data (paginata)
        if (response.data.tickets && response.data.tickets.data) {
          setTickets(response.data.tickets.data);
          setTotalPages(response.data.tickets.last_page || 1);
        }
        // Se la risposta ha una struttura data.data (paginata)
        else if (response.data.data) {
          setTickets(response.data.data);
          setTotalPages(response.data.last_page || 1);
        }
        // Se la risposta è un array diretto
        else if (Array.isArray(response.data)) {
          setTickets(response.data);
          setTotalPages(1);
        }
        // Fallback: array vuoto
        else {
          setTickets([]);
          setTotalPages(1);
        }
      } else {
        setTickets([]);
        setTotalPages(1);
      }
      
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento dei ticket di supporto:', err);
      setError('Impossibile caricare i ticket di supporto. Riprova più tardi.');
      // In caso di errore, imposta array vuoto per evitare crash
      setTickets([]);
      setTotalPages(1);
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
    fetchTickets();
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.put(`/admin/dashboard/support-tickets/${ticketId}/status`, { status: newStatus });
      
      // Aggiorna lo stato del ticket nella lista
      setTickets(tickets.map(ticket => {
        if (ticket.id === ticketId) {
          return { ...ticket, status: newStatus };
        }
        return ticket;
      }));
      
    } catch (err) {
      console.error('Errore nell\'aggiornamento dello stato del ticket:', err);
      alert('Errore nell\'aggiornamento dello stato del ticket. Riprova più tardi.');
    }
  };

  // Formatta data in formato italiano
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  // Traduce lo stato del ticket in italiano
  const translateTicketStatus = (status) => {
    switch (status) {
      case 'open': return 'Aperto';
      case 'in_progress': return 'In Lavorazione';
      case 'closed': return 'Chiuso';
      default: return status;
    }
  };

  // Traduce la priorità del ticket in italiano
  const translateTicketPriority = (priority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Bassa';
      default: return priority;
    }
  };

  // Restituisce classe CSS in base allo stato del ticket
  const getTicketStatusClass = (status) => {
    switch (status) {
      case 'open': return 'admin__status-badge--warning';
      case 'in_progress': return 'admin__status-badge--info';
      case 'closed': return 'admin__status-badge--success';
      default: return '';
    }
  };

  // Restituisce classe CSS in base alla priorità del ticket
  const getTicketPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'admin__priority-badge--high';
      case 'medium': return 'admin__priority-badge--medium';
      case 'low': return 'admin__priority-badge--low';
      default: return '';
    }
  };

  if (loading && !tickets.length) {
    return (
      <div className="admin__loading-spinner">
        Caricamento ticket di supporto...
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
                  placeholder="ID ticket o cliente"
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
                  <option value="open">Aperti</option>
                  <option value="in_progress">In Lavorazione</option>
                  <option value="closed">Chiusi</option>
                </select>
              </div>
              
              <div className="admin__form-group">
                <label htmlFor="priority" className="admin__form-group-label">Priorità</label>
                <select
                  id="priority"
                  name="priority"
                  className="admin__form-group-select"
                  value={filters.priority}
                  onChange={handleFilterChange}
                >
                  <option value="">Tutte le priorità</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Bassa</option>
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
                  <option value="-created_at">Data (più recenti)</option>
                  <option value="created_at">Data (meno recenti)</option>
                  <option value="-priority">Priorità (decrescente)</option>
                  <option value="priority">Priorità (crescente)</option>
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
          <h2 className="admin__card-title">Ticket di Supporto ({tickets.length} visualizzati)</h2>
        </div>
        
        <div className="admin__card-body">
          {error ? (
            <div className="admin__error">
              <p>{error}</p>
              <button
                className="admin__button admin__button--primary"
                onClick={fetchTickets}
              >
                Riprova
              </button>
            </div>
          ) : (
            <>
              {tickets.length === 0 ? (
                <p>Nessun ticket trovato con i filtri selezionati.</p>
              ) : (
                <>
                  <div className="admin__table-container">
                    <table className="admin__table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Cliente</th>
                          <th>Oggetto</th>
                          <th>Data</th>
                          <th>Stato</th>
                          <th>Priorità</th>
                          <th>Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map(ticket => (
                          <tr key={ticket.id}>
                            <td>#{ticket.id}</td>
                            <td>{ticket.user ? `${ticket.user.name} ${ticket.user.surname}` : 'Cliente eliminato'}</td>
                            <td>{ticket.subject}</td>
                            <td>{formatDate(ticket.created_at)}</td>
                            <td>
                              <span className={`admin__status-badge ${getTicketStatusClass(ticket.status)}`}>
                                {translateTicketStatus(ticket.status)}
                              </span>
                            </td>
                            <td>
                              <span className={`admin__priority-badge ${getTicketPriorityClass(ticket.priority)}`}>
                                {translateTicketPriority(ticket.priority)}
                              </span>
                            </td>
                            <td>
                              <div className="admin__table-actions">
                                <Link
                                  to={`/admin/support/${ticket.id}`}
                                  className="admin__button admin__button--secondary"
                                >
                                  Visualizza
                                </Link>
                                
                                {ticket.status !== 'closed' && (
                                  <button
                                    onClick={() => handleStatusChange(ticket.id, ticket.status === 'open' ? 'in_progress' : 'closed')}
                                    className={`admin__button ${ticket.status === 'open' ? 'admin__button--info' : 'admin__button--success'}`}
                                  >
                                    {ticket.status === 'open' ? 'Prendi in carico' : 'Chiudi ticket'}
                                  </button>
                                )}
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

export default SupportTickets; 