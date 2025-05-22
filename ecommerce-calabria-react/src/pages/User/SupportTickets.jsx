import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const SupportTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
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
    navigate('/user/support/new');
  };

  const toggleTicket = (ticketId) => {
    if (activeTicket === ticketId) {
      setActiveTicket(null);
    } else {
      setActiveTicket(ticketId);
    }
    setMessageText('');
  };

  const handleMessageChange = (e) => {
    setMessageText(e.target.value);
  };

  const handleSendMessage = async (ticketId) => {
    if (!messageText.trim()) return;
    
    setSendingMessage(true);
    try {
      const response = await api.post(`/user/support-tickets/${ticketId}/messages`, {
        message: messageText
      });
      
      // Aggiorna lo stato dei ticket localmente
      setTickets(tickets.map(ticket => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            support_messages: [...ticket.support_messages, response.data.support_message]
          };
        }
        return ticket;
      }));
      
      setMessageText('');
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      alert('Impossibile inviare il messaggio. Riprova più tardi.');
    } finally {
      setSendingMessage(false);
    }
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
              <div 
                className="dashboard__ticket-header"
                onClick={() => toggleTicket(ticket.id)}
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
                  <div className="dashboard__ticket-toggle">
                    {activeTicket === ticket.id ? '↑' : '↓'}
                  </div>
                </div>
              </div>
              
              {activeTicket === ticket.id && (
                <div className="dashboard__ticket-body">
                  <div className="dashboard__ticket-messages">
                    {ticket.support_messages.map(message => (
                      <div 
                        key={message.id} 
                        className={`dashboard__message ${message.is_from_admin ? 'dashboard__message--admin' : 'dashboard__message--user'}`}
                      >
                        <div className="dashboard__message-content">
                          {message.message}
                        </div>
                        <div className="dashboard__message-meta">
                          <span className="dashboard__message-author">
                            {message.is_from_admin ? 'Staff' : 'Tu'}
                          </span>
                          <span className="dashboard__message-date">
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {ticket.status !== 'closed' && (
                    <div className="dashboard__message-form">
                      <textarea
                        className="dashboard__message-input"
                        value={messageText}
                        onChange={handleMessageChange}
                        placeholder="Scrivi un messaggio..."
                        disabled={sendingMessage}
                      />
                      <button
                        className="dashboard__button"
                        onClick={() => handleSendMessage(ticket.id)}
                        disabled={sendingMessage || !messageText.trim()}
                      >
                        {sendingMessage ? 'Invio...' : 'Invia'}
                      </button>
                    </div>
                  )}
                  
                  {ticket.status === 'closed' && (
                    <div className="dashboard__ticket-closed-notice">
                      Questo ticket è stato chiuso. Se hai altre domande, apri un nuovo ticket.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportTickets; 