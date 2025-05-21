import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../App';
import './Auth.scss';

const Register = () => {
  const navigate = useNavigate();
  const { setAuthState } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Uso api configurato invece di axios diretto
      const response = await api.post('/register', formData);
      
      // Se riceviamo un token, l'utente è stato creato con successo
      if (response.data.access_token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.access_token);
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        
        // Aggiorna lo stato di autenticazione globale
        setAuthState({
          isLoggedIn: true,
          isAdmin: response.data.user.is_admin || false,
          user: response.data.user,
          emailVerified: false, // Email non verificata per nuovo utente
          loading: false,
        });
        
        // Mostra messaggio di successo e richiesta di verifica
        setSuccess(response.data.message);
        setVerificationNeeded(true);
      } else {
        setSuccess(response.data.message);
      }
      
      // Resetta form
      setFormData({
        name: '',
        surname: '',
        email: '',
        password: '',
        password_confirmation: '',
      });
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          // Format validation errors
          const errorMessages = Object.values(err.response.data.errors)
            .flat()
            .join(', ');
          setError(errorMessages);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Si è verificato un errore durante la registrazione.');
        }
      } else {
        setError('Errore di connessione al server. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      await api.post('/email/verification-notification', {
        email: formData.email
      });
      alert('Email di verifica inviata. Controlla la tua casella di posta.');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Errore nell\'invio dell\'email di verifica. Riprova più tardi.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__container">
        <h1 className="auth__title">Registrazione</h1>
        <p className="auth__subtitle">Crea il tuo account per accedere a tutti i nostri prodotti</p>
        
        {error && (
          <div className="auth__alert auth__alert--error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="auth__alert auth__alert--success">
            {success}
            <p>Controlla la tua email per completare la registrazione.</p>
            
            {verificationNeeded && (
              <button 
                className="auth__resend-btn"
                onClick={handleResendVerification}
                disabled={loading}
              >
                Invia nuovamente l'email di verifica
              </button>
            )}
            
            <button 
              className="auth__login-btn"
              onClick={() => navigate('/login')}
            >
              Vai alla pagina di login
            </button>
          </div>
        )}
        
        {!success && (
          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="auth__form-group">
              <label htmlFor="name" className="auth__label">Nome*</label>
              <input
                type="text"
                id="name"
                name="name"
                className="auth__input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="auth__form-group">
              <label htmlFor="surname" className="auth__label">Cognome*</label>
              <input
                type="text"
                id="surname"
                name="surname"
                className="auth__input"
                value={formData.surname}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="auth__form-group">
              <label htmlFor="email" className="auth__label">Email*</label>
              <input
                type="email"
                id="email"
                name="email"
                className="auth__input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="auth__form-group">
              <label htmlFor="password" className="auth__label">Password*</label>
              <input
                type="password"
                id="password"
                name="password"
                className="auth__input"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
            
            <div className="auth__form-group">
              <label htmlFor="password_confirmation" className="auth__label">Conferma Password*</label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                className="auth__input"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
            
            <button
              type="submit"
              className="auth__button"
              disabled={loading}
            >
              {loading ? 'Registrazione in corso...' : 'Registrati'}
            </button>
          </form>
        )}
        
        <p className="auth__redirect">
          Hai già un account? <Link to="/login" className="auth__link">Accedi</Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 