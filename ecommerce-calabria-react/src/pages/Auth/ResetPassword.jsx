import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './Auth.scss';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Le password non coincidono');
      return;
    }

    if (password.length < 8) {
      setMessage('La password deve essere di almeno 8 caratteri');
      return;
    }

    setIsLoading(true);
    
    try {
      // Qui andrebbe la chiamata API per reset password
      setTimeout(() => {
        setMessage('Password aggiornata con successo!');
        setIsLoading(false);
        setTimeout(() => navigate('/login'), 2000);
      }, 1000);
    } catch {
      setMessage('Errore durante l\'aggiornamento. Riprova più tardi.');
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Link non valido</h1>
            <p>Il link per il reset della password non è valido o è scaduto.</p>
          </div>
          <div className="auth-links">
            <Link to="/forgot-password">Richiedi nuovo link</Link>
            <Link to="/login">Torna al Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Nuova Password</h1>
          <p>Inserisci la tua nuova password</p>
        </div>

        {message && (
          <div className={`auth-message ${message.includes('Errore') || message.includes('coincidono') || message.includes('almeno') ? 'auth-message--error' : 'auth-message--success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Nuova Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Almeno 8 caratteri"
              minLength="8"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Conferma Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Ripeti la password"
              minLength="8"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Aggiornamento...' : 'Aggiorna Password'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Torna al Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 