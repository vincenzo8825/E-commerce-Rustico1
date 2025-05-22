import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/dashboard/support-tickets/${id}`);
      setTicket(response.data.ticket);
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento dei dettagli del ticket:', err);
      setError('Impossibile caricare i dettagli del ticket. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return; // Nessun messaggio da inviare
    }
    
    try {
      setSubmitting(true);
      await api.post(`/admin/dashboard/support-tickets/${id}/messages`, { message });
      
      // Aggiorna il ticket con il nuovo messaggio
      setTicket({
        ...ticket,
        messages: [
          ...ticket.messages,
          {
            content: message,
            created_at: new Date().toISOString(),
            user: { name: 'Admin', is_admin: true } // L'API aggiungerà i dati dell'utente reale
          }
        ]
      });
      
      // Reset del form
      setMessage('');
      
    } catch (err) {
      console.error('Errore nell\'invio del messaggio:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Errore: ${err.response.data.message}`);
      } else {
        alert('Errore nell\'invio del messaggio. Riprova più tardi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setSubmitting(true);
      await api.put(`/admin/dashboard/support-tickets/${id}/status`, { status: newStatus });
      
      // Aggiorna lo stato del ticket
      setTicket({
        ...ticket,
        status: newStatus
      });
      
    } catch (err) {
      console.error('Errore nell\'aggiornamento dello stato del ticket:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Errore: ${err.response.data.message}`);
      } else {
        alert('Errore nell\'aggiornamento dello stato del ticket. Riprova più tardi.');
      }
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="admin__loading-spinner">
        Caricamento dettagli ticket...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin__error">
        <p>{error}</p>
        <div className="admin__error-actions">
          <button
            className="admin__button admin__button--secondary"
            onClick={() => navigate('/admin/support')}
          >
            Torna ai ticket
          </button>
          <button
            className="admin__button admin__button--primary"
            onClick={fetchTicketDetails}
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="admin__error">
        <p>Ticket non trovato.</p>
        <button
          className="admin__button admin__button--secondary"
          onClick={() => navigate('/admin/support')}
        >
          Torna ai ticket
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Ticket #{ticket.id} - {ticket.subject}</h2>
          <Link to="/admin/support" className="admin__button admin__button--secondary">
            Torna ai ticket
          </Link>
        </div>
        <div className="admin__card-body">
          <div className="admin__ticket-info">
            <div className="admin__ticket-info-header">
              <div className="admin__ticket-meta">
                <div className="admin__ticket-meta-item">
                  <span className="admin__ticket-meta-label">Cliente:</span>
                  <span className="admin__ticket-meta-value">{ticket.user ? `${ticket.user.name} ${ticket.user.surname}` : 'Cliente eliminato'}</span>
                </div>
                
                <div className="admin__ticket-meta-item">
                  <span className="admin__ticket-meta-label">Email:</span>
                  <span className="admin__ticket-meta-value">{ticket.user ? ticket.user.email : '-'}</span>
                </div>
                
                <div className="admin__ticket-meta-item">
                  <span className="admin__ticket-meta-label">Data apertura:</span>
                  <span className="admin__ticket-meta-value">{formatDate(ticket.created_at)}</span>
                </div>
              </div>
              
              <div className="admin__ticket-status-controls">
                <div className="admin__ticket-status">
                  <span className="admin__ticket-meta-label">Stato:</span>
                  <span className={`admin__status-badge ${getTicketStatusClass(ticket.status)}`}>
                    {translateTicketStatus(ticket.status)}
                  </span>
                </div>
                
                <div className="admin__ticket-priority">
                  <span className="admin__ticket-meta-label">Priorità:</span>
                  <span className={`admin__priority-badge ${getTicketPriorityClass(ticket.priority)}`}>
                    {translateTicketPriority(ticket.priority)}
                  </span>
                </div>
                
                {ticket.status !== 'closed' && (
                  <div className="admin__ticket-actions">
                    {ticket.status === 'open' && (
                      <button
                        onClick={() => handleStatusChange('in_progress')}
                        className="admin__button admin__button--info"
                        disabled={submitting}
                      >
                        Prendi in carico
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusChange('closed')}
                      className="admin__button admin__button--success"
                      disabled={submitting}
                    >
                      Chiudi ticket
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="admin__ticket-message-container">
              <h3 className="admin__ticket-message-title">Descrizione problema</h3>
              <div className="admin__ticket-message admin__ticket-initial-message">
                <p>{ticket.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cronologia messaggi */}
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Messaggi</h2>
        </div>
        <div className="admin__card-body">
          <div className="admin__ticket-messages">
            {ticket.messages && ticket.messages.length > 0 ? (
              ticket.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`admin__ticket-message ${msg.user?.is_admin ? 'admin__ticket-message--admin' : 'admin__ticket-message--user'}`}
                >
                  <div className="admin__ticket-message-header">
                    <span className="admin__ticket-message-author">
                      {msg.user?.is_admin ? `${msg.user.name} (Staff)` : msg.user?.name || 'Cliente'}
                    </span>
                    <span className="admin__ticket-message-date">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <div className="admin__ticket-message-content">
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>Nessuna risposta a questo ticket.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Form risposta */}
      {ticket.status !== 'closed' && (
        <div className="admin__card">
          <div className="admin__card-header">
            <h2 className="admin__card-title">Rispondi al cliente</h2>
          </div>
          <div className="admin__card-body">
            <form onSubmit={handleSubmit} className="admin__ticket-reply-form">
              <div className="admin__form-group">
                <textarea
                  className="admin__form-group-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Scrivi la tua risposta..."
                  rows="5"
                  required
                />
              </div>
              <div className="admin__form-actions">
                <button
                  type="submit"
                  className="admin__button admin__button--primary"
                  disabled={submitting || !message.trim()}
                >
                  {submitting ? 'Invio in corso...' : 'Invia risposta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketDetail; 