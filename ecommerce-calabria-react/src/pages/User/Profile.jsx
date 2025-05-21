import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    surname: '',
    email: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  const fetchUserProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await api.get('/user/profile');
      setProfileData(response.data.user);
    } catch (error) {
      setProfileError('Impossibile caricare i dati del profilo. Riprova più tardi.');
      console.error('Errore nel caricamento del profilo:', error);
    } finally {
      setProfileLoading(false);
    }
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileError(null);
    setProfileSuccess(null);
    
    try {
      const response = await api.post('/user/profile', profileData);
      setProfileSuccess(response.data.message);
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors)
            .flat()
            .join(', ');
          setProfileError(errorMessages);
        } else if (error.response.data.message) {
          setProfileError(error.response.data.message);
        } else {
          setProfileError('Si è verificato un errore durante l\'aggiornamento del profilo.');
        }
      } else {
        setProfileError('Errore di connessione al server. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    
    try {
      const response = await api.post('/user/password', passwordData);
      setPasswordSuccess(response.data.message);
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors)
            .flat()
            .join(', ');
          setPasswordError(errorMessages);
        } else if (error.response.data.message) {
          setPasswordError(error.response.data.message);
        } else {
          setPasswordError('Si è verificato un errore durante l\'aggiornamento della password.');
        }
      } else {
        setPasswordError('Errore di connessione al server. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (profileLoading) {
    return (
      <div className="dashboard__loading">
        Caricamento dati in corso...
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="dashboard__section-title">Il mio profilo</h1>
      
      <div className="dashboard__section">
        <h2 className="dashboard__section-title">Informazioni personali</h2>
        
        {profileError && (
          <div className="dashboard__error">{profileError}</div>
        )}
        
        {profileSuccess && (
          <div className="dashboard__success">{profileSuccess}</div>
        )}
        
        <form className="dashboard__form" onSubmit={handleProfileSubmit}>
          <div className="dashboard__form-row">
            <div className="dashboard__form-group">
              <label htmlFor="name" className="dashboard__label">Nome*</label>
              <input
                type="text"
                id="name"
                name="name"
                className="dashboard__input"
                value={profileData.name}
                onChange={handleProfileChange}
                required
              />
            </div>
            
            <div className="dashboard__form-group">
              <label htmlFor="surname" className="dashboard__label">Cognome*</label>
              <input
                type="text"
                id="surname"
                name="surname"
                className="dashboard__input"
                value={profileData.surname}
                onChange={handleProfileChange}
                required
              />
            </div>
          </div>
          
          <div className="dashboard__form-group">
            <label htmlFor="email" className="dashboard__label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="dashboard__input"
              value={profileData.email}
              disabled
            />
            <small>L'email non può essere modificata</small>
          </div>
          
          <div className="dashboard__form-group">
            <label htmlFor="address" className="dashboard__label">Indirizzo</label>
            <input
              type="text"
              id="address"
              name="address"
              className="dashboard__input"
              value={profileData.address || ''}
              onChange={handleProfileChange}
            />
          </div>
          
          <div className="dashboard__form-row">
            <div className="dashboard__form-group">
              <label htmlFor="city" className="dashboard__label">Città</label>
              <input
                type="text"
                id="city"
                name="city"
                className="dashboard__input"
                value={profileData.city || ''}
                onChange={handleProfileChange}
              />
            </div>
            
            <div className="dashboard__form-group">
              <label htmlFor="postal_code" className="dashboard__label">CAP</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                className="dashboard__input"
                value={profileData.postal_code || ''}
                onChange={handleProfileChange}
              />
            </div>
          </div>
          
          <div className="dashboard__form-group">
            <label htmlFor="phone" className="dashboard__label">Telefono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="dashboard__input"
              value={profileData.phone || ''}
              onChange={handleProfileChange}
            />
          </div>
          
          <button
            type="submit"
            className="dashboard__button"
            disabled={loading}
          >
            {loading ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
        </form>
      </div>
      
      <div className="dashboard__section">
        <h2 className="dashboard__section-title">Cambia password</h2>
        
        {passwordError && (
          <div className="dashboard__error">{passwordError}</div>
        )}
        
        {passwordSuccess && (
          <div className="dashboard__success">{passwordSuccess}</div>
        )}
        
        <form className="dashboard__form" onSubmit={handlePasswordSubmit}>
          <div className="dashboard__form-group">
            <label htmlFor="current_password" className="dashboard__label">Password attuale*</label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              className="dashboard__input"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <div className="dashboard__form-row">
            <div className="dashboard__form-group">
              <label htmlFor="password" className="dashboard__label">Nuova password*</label>
              <input
                type="password"
                id="password"
                name="password"
                className="dashboard__input"
                value={passwordData.password}
                onChange={handlePasswordChange}
                required
                minLength={8}
              />
            </div>
            
            <div className="dashboard__form-group">
              <label htmlFor="password_confirmation" className="dashboard__label">Conferma nuova password*</label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                className="dashboard__input"
                value={passwordData.password_confirmation}
                onChange={handlePasswordChange}
                required
                minLength={8}
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="dashboard__button"
            disabled={loading}
          >
            {loading ? 'Aggiornamento...' : 'Aggiorna password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile; 