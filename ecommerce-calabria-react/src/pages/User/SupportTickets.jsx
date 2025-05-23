import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';

const SupportTickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const message = location.state?.successMessage;
    if (message) {
      setSuccessMessage(message);
      // Auto-nasconde il messaggio dopo 5 secondi
      setTimeout(() => setSuccessMessage(''), 5000);
      // Pulisce lo stato dalla location
      window.history.replaceState({}, document.title);
    }
    
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/support-tickets');
      setTickets(response.data.tickets);
    } catch (error) {
      setError('Impossibile caricare i ticket di supporto. Riprova più tardi.');
      console.error('Errore nel caricamento dei ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  const handleCreateTicket = () => {
    navigate('/dashboard/support/new');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'open':
        return 'dashboard__ticket-status--open';
      case 'in_progress':
        return 'dashboard__ticket-status--processing';
      case 'closed':
        return 'dashboard__ticket-status--closed';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="dashboard__loading">
        Caricamento ticket in corso...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard__error-container">
        <p className="dashboard__error">{error}</p>
        <button
          className="dashboard__button"
          onClick={fetchTickets}
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard__header">
        <h1 className="dashboard__section-title">Assistenza Clienti</h1>
        <button
          className="dashboard__button"
          onClick={handleCreateTicket}
        >
          Nuovo Ticket
        </button>
      </div>
      
      {successMessage && (
        <div className="dashboard__alert dashboard__alert--success">
          {successMessage}
        </div>
      )}
      
      {tickets.length === 0 ? (
        <div className="dashboard__empty">
          <div className="dashboard__empty-icon">📝</div>
          <h2>Nessun ticket di supporto</h2>
          <p>Non hai ancora creato richieste di assistenza.</p>
          <button
            className="dashboard__button"
            onClick={handleCreateTicket}
          >
            Crea il tuo primo ticket
          </button>
        </div>
      ) : (
        <div className="dashboard__tickets">
          {tickets.map(ticket => (
            <div key={ticket.id} className="dashboard__ticket">
              <Link 
                to={`/dashboard/support/ticket/${ticket.id}`}
                className="dashboard__ticket-header"
              >
                <div className="dashboard__ticket-info">
                  <div className="dashboard__ticket-subject">
                    {ticket.subject}
                  </div>
                  <div className="dashboard__ticket-date">
                    Creato il {formatDate(ticket.created_at)}
                  </div>
                </div>
                
                <div className="dashboard__ticket-meta">
                  <div className={`dashboard__ticket-status ${getStatusClass(ticket.status)}`}>
                    {ticket.status}
                  </div>
                  <div className="dashboard__ticket-arrow">
                    →
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportTickets; 