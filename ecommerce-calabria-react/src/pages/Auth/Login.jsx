import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../App';
import './Auth.scss';

const Login = () => {
  const navigate = useNavigate();
  const { setAuthState } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState(false);

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
    setVerificationError(false);
    
    try {
      // Uso api configurato invece di axios diretto
      const response = await api.post('/login', formData);
      console.log("Risposta login completa:", response.data); // Log per debug
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.access_token);
      
      // Set auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      
      // Log informazioni utente per debug
      console.log("Dati utente:", response.data.user);
      console.log("È admin:", response.data.user.is_admin);
      console.log("Email verificata:", response.data.user.email_verified);
      
      // Verifica se l'email è verificata (controlla in tutti i possibili posti dove potrebbe essere)
      const isEmailVerified = 
        response.data.email_verified === true || 
        response.data.user.email_verified === true ||
        (response.data.user && response.data.user.email_verified_at !== null);
      
      console.log("Email verificata (dopo controlli):", isEmailVerified);
      
      // Aggiorna lo stato di autenticazione globale
      setAuthState({
        isLoggedIn: true,
        isAdmin: response.data.user.is_admin,
        user: response.data.user,
        emailVerified: isEmailVerified,
        loading: false,
      });
      
      console.log("Stato autenticazione aggiornato:", {
        isLoggedIn: true,
        isAdmin: response.data.user.is_admin,
        user: response.data.user,
        emailVerified: isEmailVerified
      });
      
      // Salva anche i dati in localStorage come backup
      localStorage.setItem('auth_data', JSON.stringify({
        isAdmin: response.data.user.is_admin,
        emailVerified: isEmailVerified
      }));
      
      // Verifica se l'utente è admin e gestisce il reindirizzamento
      if (response.data.user.is_admin === true) {
        console.log("Utente admin, reindirizzamento a /admin");
        // Forza reindirizzamento alla dashboard admin
        setTimeout(() => {
          navigate('/admin');
        }, 100);
        return; // Esce dalla funzione per evitare altri reindirizzamenti
      }
      
      // Gestisce utenti non admin
      if (!isEmailVerified) {
        console.log("Email non verificata, mostra messaggio di errore");
        setVerificationError(true);
      } else {
        console.log("Email verificata, reindirizzamento a home");
        navigate('/');
      }
    } catch (err) {
      console.error("Errore login:", err);
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
          setError('Credenziali non valide. Riprova.');
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
        <h1 className="auth__title">Accedi</h1>
        <p className="auth__subtitle">Inserisci le tue credenziali per accedere</p>
        
        {error && (
          <div className="auth__alert auth__alert--error">
            {error}
          </div>
        )}
        
        {verificationError && (
          <div className="auth__alert auth__alert--warning">
            Devi verificare la tua email prima di accedere a tutte le funzionalità.
            <button 
              className="auth__resend-btn"
              onClick={handleResendVerification}
              disabled={loading}
            >
              Invia nuovamente l'email di verifica
            </button>
          </div>
        )}
        
        <form className="auth__form" onSubmit={handleSubmit}>
          <div className="auth__form-group">
            <label htmlFor="email" className="auth__label">Email</label>
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
            <label htmlFor="password" className="auth__label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="auth__input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="auth__form-options">
            <Link to="/forgot-password" className="auth__forgot-link">
              Password dimenticata?
            </Link>
          </div>
          
          <button
            type="submit"
            className="auth__button"
            disabled={loading}
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
        
        <p className="auth__redirect">
          Non hai un account? <Link to="/register" className="auth__link">Registrati</Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 