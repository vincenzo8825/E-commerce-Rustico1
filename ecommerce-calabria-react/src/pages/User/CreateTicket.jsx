import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user edits a field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.subject.trim()) {
      errors.subject = 'L\'oggetto del ticket è obbligatorio';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'La descrizione del problema è obbligatoria';
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
      setLoading(true);
      setError(null);
      
      await api.post('/user/support-tickets', formData);
      
      // Redirect to ticket list with success message
      navigate('/user/support', {
        state: { message: 'Ticket inviato con successo! Ti risponderemo al più presto.' }
      });
    } catch (err) {
      console.error('Errore nella creazione del ticket:', err);
      
      if (err.response?.data?.errors) {
        // Handle validation errors from server
        const serverErrors = {};
        Object.entries(err.response.data.errors).forEach(([key, messages]) => {
          serverErrors[key] = messages[0];
        });
        setValidationErrors(serverErrors);
      } else {
        setError(err.response?.data?.message || 'Si è verificato un errore durante l\'invio del ticket. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard__section">
      <div className="dashboard__section-header">
        <h2 className="dashboard__section-title">Nuovo Ticket di Supporto</h2>
        <Link to="/user/support" className="dashboard__back-link">
          Torna ai ticket
        </Link>
      </div>
      
      <div className="dashboard__card">
        {error && (
          <div className="dashboard__alert dashboard__alert--error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="dashboard__form">
          <div className="dashboard__form-group">
            <label htmlFor="subject" className="dashboard__form-label">Oggetto *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              className={`dashboard__form-input ${validationErrors.subject ? 'dashboard__form-input--error' : ''}`}
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Es. Problema con il mio ordine #123"
              disabled={loading}
            />
            {validationErrors.subject && (
              <div className="dashboard__form-error">{validationErrors.subject}</div>
            )}
          </div>
          
          <div className="dashboard__form-group">
            <label htmlFor="priority" className="dashboard__form-label">Priorità</label>
            <select
              id="priority"
              name="priority"
              className="dashboard__form-select"
              value={formData.priority}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="low">Bassa</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
          
          <div className="dashboard__form-group">
            <label htmlFor="description" className="dashboard__form-label">Descrizione del problema *</label>
            <textarea
              id="description"
              name="description"
              className={`dashboard__form-textarea ${validationErrors.description ? 'dashboard__form-textarea--error' : ''}`}
              value={formData.description}
              onChange={handleInputChange}
              rows="6"
              placeholder="Descrivi dettagliatamente il problema riscontrato..."
              disabled={loading}
            ></textarea>
            {validationErrors.description && (
              <div className="dashboard__form-error">{validationErrors.description}</div>
            )}
          </div>
          
          <div className="dashboard__form-actions">
            <Link to="/user/support" className="dashboard__button dashboard__button--secondary">
              Annulla
            </Link>
            <button
              type="submit"
              className="dashboard__button dashboard__button--primary"
              disabled={loading}
            >
              {loading ? 'Invio in corso...' : 'Invia Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket; 