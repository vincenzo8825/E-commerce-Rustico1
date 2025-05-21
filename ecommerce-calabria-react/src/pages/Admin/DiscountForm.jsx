import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const DiscountForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    amount: '',
    description: '',
    min_order_amount: '',
    max_uses: '',
    starts_at: '',
    expires_at: '',
    is_active: true
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      fetchDiscountDetails();
    }
  }, [id]);

  const fetchDiscountDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/discounts/${id}`);
      
      // Formatta le date per input type="date"
      const discount = response.data.discount;
      if (discount.starts_at) {
        discount.starts_at = formatDateForInput(discount.starts_at);
      }
      if (discount.expires_at) {
        discount.expires_at = formatDateForInput(discount.expires_at);
      }
      
      setFormData(discount);
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento del codice sconto:', err);
      setError('Impossibile caricare i dettagli del codice sconto. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Pulisci l'errore di validazione quando l'utente modifica il campo
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.code.trim()) {
      errors.code = 'Il codice è obbligatorio';
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code)) {
      errors.code = 'Il codice può contenere solo lettere maiuscole, numeri, trattini e underscore';
    }
    
    if (!formData.amount) {
      errors.amount = 'Il valore dello sconto è obbligatorio';
    } else if (formData.type === 'percentage' && (formData.amount <= 0 || formData.amount > 100)) {
      errors.amount = 'Per sconti in percentuale, il valore deve essere compreso tra 1 e 100';
    } else if (formData.type === 'fixed' && formData.amount <= 0) {
      errors.amount = 'Per sconti fissi, il valore deve essere maggiore di 0';
    }
    
    if (formData.min_order_amount && formData.min_order_amount <= 0) {
      errors.min_order_amount = 'L\'importo minimo d\'ordine deve essere maggiore di 0';
    }
    
    if (formData.max_uses && formData.max_uses <= 0) {
      errors.max_uses = 'Il numero massimo di utilizzi deve essere maggiore di 0';
    }
    
    if (formData.starts_at && formData.expires_at && new Date(formData.starts_at) >= new Date(formData.expires_at)) {
      errors.expires_at = 'La data di scadenza deve essere successiva alla data di inizio';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepara i dati per l'invio
      const dataToSend = { ...formData };
      if (!dataToSend.min_order_amount) delete dataToSend.min_order_amount;
      if (!dataToSend.max_uses) delete dataToSend.max_uses;
      if (!dataToSend.starts_at) delete dataToSend.starts_at;
      if (!dataToSend.expires_at) delete dataToSend.expires_at;
      
      if (isEditMode) {
        await api.put(`/admin/discounts/${id}`, dataToSend);
      } else {
        await api.post('/admin/discounts', dataToSend);
      }
      
      navigate('/admin/discounts', { 
        state: { 
          message: `Codice sconto ${isEditMode ? 'modificato' : 'creato'} con successo` 
        } 
      });
    } catch (err) {
      console.error(`Errore nel ${isEditMode ? 'aggiornamento' : 'salvataggio'} del codice sconto:`, err);
      
      if (err.response && err.response.data && err.response.data.errors) {
        // Gestisci gli errori di validazione dal server
        const serverErrors = {};
        Object.entries(err.response.data.errors).forEach(([key, messages]) => {
          serverErrors[key] = messages[0];
        });
        setValidationErrors(serverErrors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(`Errore nel ${isEditMode ? 'aggiornamento' : 'salvataggio'} del codice sconto. Riprova più tardi.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin__loading-spinner">
        Caricamento dati codice sconto...
      </div>
    );
  }

  return (
    <div className="admin__card">
      <div className="admin__card-header">
        <h2 className="admin__card-title">
          {isEditMode ? `Modifica Codice Sconto: ${formData.code}` : 'Nuovo Codice Sconto'}
        </h2>
        <Link to="/admin/discounts" className="admin__button admin__button--secondary">
          Torna ai codici sconto
        </Link>
      </div>
      <div className="admin__card-body">
        {error && (
          <div className="admin__error">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="admin__form">
          <div className="admin__form-row">
            <div className="admin__form-group">
              <label htmlFor="code" className="admin__form-group-label">Codice *</label>
              <input
                type="text"
                id="code"
                name="code"
                className={`admin__form-group-input ${validationErrors.code ? 'admin__form-group-input--error' : ''}`}
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Es. ESTATE2023"
                required
                disabled={isEditMode} // Non permettere la modifica del codice in modalità edit
              />
              {validationErrors.code && (
                <div className="admin__form-group-error">{validationErrors.code}</div>
              )}
              <small className="admin__form-group-help">
                Inserisci un codice univoco usando solo lettere maiuscole, numeri, trattini e underscore
              </small>
            </div>
            
            <div className="admin__form-group">
              <label htmlFor="description" className="admin__form-group-label">Descrizione</label>
              <input
                type="text"
                id="description"
                name="description"
                className="admin__form-group-input"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Es. Sconto estivo 2023"
              />
              <small className="admin__form-group-help">
                Descrizione dello sconto (visibile solo nell'amministrazione)
              </small>
            </div>
          </div>
          
          <div className="admin__form-row">
            <div className="admin__form-group">
              <label htmlFor="type" className="admin__form-group-label">Tipo di Sconto *</label>
              <select
                id="type"
                name="type"
                className="admin__form-group-select"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="percentage">Percentuale (%)</option>
                <option value="fixed">Importo fisso (€)</option>
              </select>
            </div>
            
            <div className="admin__form-group">
              <label htmlFor="amount" className="admin__form-group-label">Valore Sconto *</label>
              <div className="admin__form-group-input-with-icon">
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className={`admin__form-group-input ${validationErrors.amount ? 'admin__form-group-input--error' : ''}`}
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0"
                  step={formData.type === 'percentage' ? '1' : '0.01'}
                  required
                />
                <span className="admin__form-group-input-icon">
                  {formData.type === 'percentage' ? '%' : '€'}
                </span>
              </div>
              {validationErrors.amount && (
                <div className="admin__form-group-error">{validationErrors.amount}</div>
              )}
            </div>
            
            <div className="admin__form-group">
              <label htmlFor="min_order_amount" className="admin__form-group-label">Importo Minimo Ordine</label>
              <div className="admin__form-group-input-with-icon">
                <input
                  type="number"
                  id="min_order_amount"
                  name="min_order_amount"
                  className={`admin__form-group-input ${validationErrors.min_order_amount ? 'admin__form-group-input--error' : ''}`}
                  value={formData.min_order_amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
                <span className="admin__form-group-input-icon">€</span>
              </div>
              {validationErrors.min_order_amount && (
                <div className="admin__form-group-error">{validationErrors.min_order_amount}</div>
              )}
              <small className="admin__form-group-help">
                Importo minimo dell'ordine per applicare lo sconto (lascia vuoto per nessun minimo)
              </small>
            </div>
          </div>
          
          <div className="admin__form-row">
            <div className="admin__form-group">
              <label htmlFor="max_uses" className="admin__form-group-label">Utilizzi Massimi</label>
              <input
                type="number"
                id="max_uses"
                name="max_uses"
                className={`admin__form-group-input ${validationErrors.max_uses ? 'admin__form-group-input--error' : ''}`}
                value={formData.max_uses}
                onChange={handleInputChange}
                min="0"
              />
              {validationErrors.max_uses && (
                <div className="admin__form-group-error">{validationErrors.max_uses}</div>
              )}
              <small className="admin__form-group-help">
                Numero massimo di utilizzi del codice (lascia vuoto per utilizzi illimitati)
              </small>
            </div>
            
            <div className="admin__form-group">
              <label htmlFor="starts_at" className="admin__form-group-label">Data Inizio</label>
              <input
                type="date"
                id="starts_at"
                name="starts_at"
                className="admin__form-group-input"
                value={formData.starts_at}
                onChange={handleInputChange}
              />
              <small className="admin__form-group-help">
                Data da cui il codice sarà utilizzabile (lascia vuoto per attivarlo subito)
              </small>
            </div>
            
            <div className="admin__form-group">
              <label htmlFor="expires_at" className="admin__form-group-label">Data Scadenza</label>
              <input
                type="date"
                id="expires_at"
                name="expires_at"
                className={`admin__form-group-input ${validationErrors.expires_at ? 'admin__form-group-input--error' : ''}`}
                value={formData.expires_at}
                onChange={handleInputChange}
              />
              {validationErrors.expires_at && (
                <div className="admin__form-group-error">{validationErrors.expires_at}</div>
              )}
              <small className="admin__form-group-help">
                Data di scadenza del codice (lascia vuoto per nessuna scadenza)
              </small>
            </div>
          </div>
          
          <div className="admin__form-group">
            <div className="admin__form-group-checkbox">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
              <label htmlFor="is_active">Codice attivo</label>
            </div>
          </div>
          
          <div className="admin__form-actions">
            <Link to="/admin/discounts" className="admin__button admin__button--secondary">
              Annulla
            </Link>
            <button
              type="submit"
              className="admin__button admin__button--primary"
              disabled={submitting}
            >
              {submitting ? 'Salvataggio in corso...' : isEditMode ? 'Aggiorna Codice Sconto' : 'Crea Codice Sconto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountForm; 