import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';

const TicketDetail = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user/support-tickets/${id}`);
      setTicket(response.data.ticket);
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento del ticket:', err);
      setError('Impossibile caricare i dettagli del ticket. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    setSendingMessage(true);
    try {
      const response = await api.post(`/user/support-tickets/${id}/messages`, {
        message: messageText
      });
      
      // Aggiorna il ticket con il nuovo messaggio
      setTicket({
        ...ticket,
        messages: [...ticket.messages, response.data.new_message]
      });
      
      setMessageText('');
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      alert('Impossibile inviare il messaggio. Riprova più tardi.');
    } finally {
      setSendingMessage(false);
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

  const translateStatus = (status) => {
    switch (status) {
      case 'open': return 'Aperto';
      case 'in_progress': return 'In Lavorazione';
      case 'closed': return 'Chiuso';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="dashboard__section">
        <div className="dashboard__loading">
          Caricamento ticket in corso...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard__section">
        <div className="dashboard__error">
          <p>{error}</p>
          <div className="dashboard__error-actions">
            <button
              className="dashboard__button"
              onClick={fetchTicketDetails}
            >
              Riprova
            </button>
            <Link
              to="/dashboard/support"
              className="dashboard__button dashboard__button--secondary"
            >
              Torna ai ticket
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="dashboard__section">
        <div className="dashboard__empty">
          <span className="dashboard__empty-icon">🔍</span>
          <h3 className="dashboard__empty-title">Ticket non trovato</h3>
          <p className="dashboard__empty-message">
            Il ticket richiesto non esiste o non hai i permessi per visualizzarlo.
          </p>
          <Link
            to="/dashboard/support"
            className="dashboard__empty-action"
          >
            Torna ai ticket
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard__section">
      <div className="dashboard__section-header">
        <h2 className="dashboard__section-title">
          Ticket #{ticket.id} - {ticket.subject}
        </h2>
        <Link
          to="/dashboard/support"
          className="dashboard__button dashboard__button--secondary"
        >
          Torna ai ticket
        </Link>
      </div>

      {/* Informazioni del ticket */}
      <div className="dashboard__card">
        <div className="dashboard__card-header">
          <h3 className="dashboard__card-title">Informazioni Ticket</h3>
        </div>
        <div className="dashboard__card-content">
          <div className="dashboard__ticket-meta">
            <div className="dashboard__ticket-meta-item">
              <span className="dashboard__ticket-meta-label">Stato:</span>
              <span className={`dashboard__ticket-status ${getStatusClass(ticket.status)}`}>
                {translateStatus(ticket.status)}
              </span>
            </div>
            <div className="dashboard__ticket-meta-item">
              <span className="dashboard__ticket-meta-label">Data creazione:</span>
              <span className="dashboard__ticket-meta-value">
                {formatDate(ticket.created_at)}
              </span>
            </div>
            <div className="dashboard__ticket-meta-item">
              <span className="dashboard__ticket-meta-label">Ultimo aggiornamento:</span>
              <span className="dashboard__ticket-meta-value">
                {formatDate(ticket.updated_at)}
              </span>
            </div>
            {ticket.order && (
              <div className="dashboard__ticket-meta-item">
                <span className="dashboard__ticket-meta-label">Ordine collegato:</span>
                <Link
                  to={`/dashboard/orders/${ticket.order.id}`}
                  className="dashboard__ticket-meta-link"
                >
                  #{ticket.order.order_number}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversazione */}
      <div className="dashboard__card">
        <div className="dashboard__card-header">
          <h3 className="dashboard__card-title">Conversazione</h3>
        </div>
        <div className="dashboard__card-content">
          <div className="dashboard__ticket-messages">
            {ticket.messages && ticket.messages.length > 0 ? (
              ticket.messages.map(message => (
                <div 
                  key={message.id} 
                  className={`dashboard__message ${message.is_from_admin ? 'dashboard__message--admin' : 'dashboard__message--user'}`}
                >
                  <div className="dashboard__message-header">
                    <span className="dashboard__message-author">
                      {message.is_from_admin ? '🛠️ Staff Supporto' : '👤 Tu'}
                    </span>
                    <span className="dashboard__message-date">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                  <div className="dashboard__message-content">
                    {message.message}
                  </div>
                </div>
              ))
            ) : (
              <p className="dashboard__empty-message">Nessun messaggio nel ticket.</p>
            )}
          </div>

          {/* Form per nuovo messaggio */}
          {ticket.status !== 'closed' && (
            <form onSubmit={handleSendMessage} className="dashboard__message-form">
              <div className="dashboard__form-group">
                <label htmlFor="message" className="dashboard__label">
                  Aggiungi una risposta
                </label>
                <textarea
                  id="message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Scrivi la tua risposta..."
                  className="dashboard__textarea"
                  rows="4"
                  required
                />
              </div>
              <button
                type="submit"
                className="dashboard__button"
                disabled={sendingMessage || !messageText.trim()}
              >
                {sendingMessage ? 'Invio in corso...' : 'Invia Risposta'}
              </button>
            </form>
          )}

          {ticket.status === 'closed' && (
            <div className="dashboard__info">
              <p>🔒 Questo ticket è stato chiuso. Non è possibile aggiungere nuovi messaggi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail; 