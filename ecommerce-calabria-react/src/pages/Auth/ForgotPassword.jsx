import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.scss';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Qui andrebbe la chiamata API per reset password
      setTimeout(() => {
        setMessage('Se l\'email esiste nel nostro sistema, riceverai le istruzioni per il reset della password.');
        setIsLoading(false);
      }, 1000);
    } catch {
      setMessage('Errore durante l\'invio. Riprova più tardi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Recupera Password</h1>
          <p>Inserisci la tua email per ricevere le istruzioni di reset</p>
        </div>

        {message && (
          <div className={`auth-message ${message.includes('Errore') ? 'auth-message--error' : 'auth-message--success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="La tua email"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Invio in corso...' : 'Invia Istruzioni'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Torna al Login</Link>
          <Link to="/register">Non hai un account? Registrati</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 