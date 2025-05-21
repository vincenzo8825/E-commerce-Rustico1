import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/orders/${id}`);
      setOrder(response.data.order);
      setNewStatus(response.data.order.status);
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento dei dettagli dell\'ordine:', err);
      setError('Impossibile caricare i dettagli dell\'ordine. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    
    if (newStatus === order.status) {
      return; // Nessun cambiamento, ignora la richiesta
    }
    
    try {
      setSubmitting(true);
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      
      // Aggiorna l'ordine con lo stato modificato
      setOrder({
        ...order,
        status: newStatus,
        status_history: [
          ...order.status_history,
          {
            status: newStatus,
            date: new Date().toISOString(),
            user: { name: 'Admin' } // L'API aggiungerà i dati dell'utente reale
          }
        ]
      });
      
      alert('Stato dell\'ordine aggiornato con successo');
    } catch (err) {
      console.error('Errore nell\'aggiornamento dello stato dell\'ordine:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Errore: ${err.response.data.message}`);
      } else {
        alert('Errore nell\'aggiornamento dello stato dell\'ordine. Riprova più tardi.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    
    if (!note.trim()) {
      return; // Nessuna nota da aggiungere
    }
    
    try {
      setSubmitting(true);
      await api.post(`/admin/orders/${id}/notes`, { note });
      
      // Aggiorna l'ordine con la nuova nota
      setOrder({
        ...order,
        notes: [
          ...order.notes,
          {
            content: note,
            date: new Date().toISOString(),
            user: { name: 'Admin' } // L'API aggiungerà i dati dell'utente reale
          }
        ]
      });
      
      // Reset del form
      setNote('');
      
      alert('Nota aggiunta con successo');
    } catch (err) {
      console.error('Errore nell\'aggiunta della nota:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Errore: ${err.response.data.message}`);
      } else {
        alert('Errore nell\'aggiunta della nota. Riprova più tardi.');
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

  // Formatta prezzo con 2 decimali
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  // Traduce lo stato dell'ordine in italiano
  const translateOrderStatus = (status) => {
    switch (status) {
      case 'completed': return 'Completato';
      case 'processing': return 'In lavorazione';
      case 'pending': return 'In attesa';
      case 'cancelled': return 'Annullato';
      default: return status;
    }
  };

  // Restituisce classe CSS in base allo stato dell'ordine
  const getOrderStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'admin__status-badge--success';
      case 'processing': return 'admin__status-badge--info';
      case 'pending': return 'admin__status-badge--warning';
      case 'cancelled': return 'admin__status-badge--danger';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="admin__loading-spinner">
        Caricamento dettagli ordine...
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
            onClick={() => navigate('/admin/orders')}
          >
            Torna agli ordini
          </button>
          <button
            className="admin__button admin__button--primary"
            onClick={fetchOrderDetails}
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin__error">
        <p>Ordine non trovato.</p>
        <button
          className="admin__button admin__button--secondary"
          onClick={() => navigate('/admin/orders')}
        >
          Torna agli ordini
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Dettaglio Ordine #{order.id}</h2>
          <Link to="/admin/orders" className="admin__button admin__button--secondary">
            Torna agli ordini
          </Link>
        </div>
        <div className="admin__card-body">
          <div className="admin__order-summary">
            <div className="admin__order-info">
              <div className="admin__order-info-section">
                <h3 className="admin__order-info-title">Informazioni Ordine</h3>
                <div className="admin__order-info-group">
                  <label>Data Ordine:</label>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="admin__order-info-group">
                  <label>Stato:</label>
                  <span className={`admin__status-badge ${getOrderStatusClass(order.status)}`}>
                    {translateOrderStatus(order.status)}
                  </span>
                </div>
                <div className="admin__order-info-group">
                  <label>Totale:</label>
                  <span>€ {formatPrice(order.total)}</span>
                </div>
                {order.discount_code && (
                  <div className="admin__order-info-group">
                    <label>Codice Sconto:</label>
                    <span>{order.discount_code} ({order.discount_amount}% di sconto)</span>
                  </div>
                )}
              </div>

              <div className="admin__order-info-section">
                <h3 className="admin__order-info-title">Informazioni Cliente</h3>
                <div className="admin__order-info-group">
                  <label>Nome:</label>
                  <span>{order.user.name} {order.user.surname}</span>
                </div>
                <div className="admin__order-info-group">
                  <label>Email:</label>
                  <span>{order.user.email}</span>
                </div>
                <div className="admin__order-info-group">
                  <label>Telefono:</label>
                  <span>{order.user.phone || 'Non specificato'}</span>
                </div>
              </div>

              <div className="admin__order-info-section">
                <h3 className="admin__order-info-title">Indirizzo di Spedizione</h3>
                <div className="admin__order-info-group">
                  <label>Indirizzo:</label>
                  <span>{order.shipping_address.address}</span>
                </div>
                <div className="admin__order-info-group">
                  <label>Città:</label>
                  <span>{order.shipping_address.city}</span>
                </div>
                <div className="admin__order-info-group">
                  <label>CAP:</label>
                  <span>{order.shipping_address.postal_code}</span>
                </div>
                <div className="admin__order-info-group">
                  <label>Provincia:</label>
                  <span>{order.shipping_address.province}</span>
                </div>
              </div>
            </div>

            <div className="admin__order-actions">
              <form onSubmit={handleStatusChange} className="admin__order-action-form">
                <h3 className="admin__order-action-title">Aggiorna Stato</h3>
                <div className="admin__form-group">
                  <select
                    name="status"
                    className="admin__form-group-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="pending">In attesa</option>
                    <option value="processing">In lavorazione</option>
                    <option value="completed">Completato</option>
                    <option value="cancelled">Annullato</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="admin__button admin__button--primary"
                  disabled={submitting || newStatus === order.status}
                >
                  {submitting ? 'Aggiornamento...' : 'Aggiorna Stato'}
                </button>
              </form>

              <form onSubmit={handleAddNote} className="admin__order-action-form">
                <h3 className="admin__order-action-title">Aggiungi Nota</h3>
                <div className="admin__form-group">
                  <textarea
                    name="note"
                    className="admin__form-group-textarea"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Inserisci una nota per questo ordine..."
                    rows="3"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="admin__button admin__button--primary"
                  disabled={submitting || !note.trim()}
                >
                  {submitting ? 'Aggiunta...' : 'Aggiungi Nota'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Tabella Prodotti */}
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Prodotti nell'Ordine</h2>
        </div>
        <div className="admin__card-body">
          <div className="admin__table-container">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>Prodotto</th>
                  <th>Prezzo Unitario</th>
                  <th>Quantità</th>
                  <th>Totale</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="admin__product-name-cell">
                        {item.product.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="admin__product-mini-image"
                          />
                        )}
                        <span>{item.product.name}</span>
                      </div>
                    </td>
                    <td>€ {formatPrice(item.price)}</td>
                    <td>{item.quantity}</td>
                    <td>€ {formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="admin__order-summary-label">Subtotale</td>
                  <td>€ {formatPrice(order.subtotal)}</td>
                </tr>
                {order.discount_amount > 0 && (
                  <tr>
                    <td colSpan="3" className="admin__order-summary-label">Sconto</td>
                    <td>- € {formatPrice(order.discount_value)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan="3" className="admin__order-summary-label">IVA</td>
                  <td>€ {formatPrice(order.tax)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="admin__order-summary-label">Spedizione</td>
                  <td>€ {formatPrice(order.shipping_cost)}</td>
                </tr>
                <tr className="admin__order-total-row">
                  <td colSpan="3" className="admin__order-summary-label">Totale</td>
                  <td className="admin__order-total-value">€ {formatPrice(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Storico Stato */}
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Storico Stato</h2>
        </div>
        <div className="admin__card-body">
          {order.status_history && order.status_history.length > 0 ? (
            <ul className="admin__timeline">
              {order.status_history.map((entry, index) => (
                <li key={index} className="admin__timeline-item">
                  <div className="admin__timeline-badge">
                    <span className={`admin__status-badge ${getOrderStatusClass(entry.status)}`}>
                      {translateOrderStatus(entry.status)}
                    </span>
                  </div>
                  <div className="admin__timeline-content">
                    <p className="admin__timeline-date">{formatDate(entry.date)}</p>
                    <p className="admin__timeline-text">
                      {entry.user?.name || 'Sistema'} ha cambiato lo stato in <strong>{translateOrderStatus(entry.status)}</strong>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nessuna modifica di stato registrata.</p>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Note</h2>
        </div>
        <div className="admin__card-body">
          {order.notes && order.notes.length > 0 ? (
            <ul className="admin__notes-list">
              {order.notes.map((note, index) => (
                <li key={index} className="admin__note-item">
                  <div className="admin__note-header">
                    <span className="admin__note-author">{note.user?.name || 'Admin'}</span>
                    <span className="admin__note-date">{formatDate(note.date)}</span>
                  </div>
                  <div className="admin__note-content">
                    {note.content}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nessuna nota presente per questo ordine.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderDetail; 