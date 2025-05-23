import api from './api';

// Verifica se l'utente è autenticato
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Verifica se l'utente è admin
export const isAdmin = () => {
  try {
    // Prima controlla se l'utente è autenticato
    if (!isAuthenticated()) return false;
    
    // Poi verifica nel localStorage
    const authData = JSON.parse(localStorage.getItem('auth_data') || '{}');
    return authData.isAdmin === true;
  } catch (error) {
    console.error('Errore nel controllo stato admin:', error);
    return false;
  }
};

// Imposta il token di autenticazione
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    // Imposta il token nell'header delle richieste API
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Scatena un evento personalizzato per notificare il cambiamento
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { authenticated: true } 
    }));
  }
};

// Rimuove il token di autenticazione
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('auth_data');
  // Rimuove il token dall'header delle richieste API
  delete api.defaults.headers.common['Authorization'];
  
  // Scatena un evento personalizzato per notificare il cambiamento
  window.dispatchEvent(new CustomEvent('authStateChanged', { 
    detail: { authenticated: false } 
  }));
};

// Inizializza l'autenticazione al caricamento dell'app
export const initAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Imposta il token nell'header delle richieste API
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return true;
  }
  return false;
};

// Ottiene il token di autenticazione
export const getToken = () => {
  return localStorage.getItem('token');
};

// Esegue il logout
export const logout = async () => {
  try {
    // Invia richiesta di logout al server
    if (isAuthenticated()) {
      await api.post('/logout');
    }
  } catch (error) {
    console.error('Errore durante il logout:', error);
  } finally {
    // Rimuove il token anche in caso di errore
    removeToken();
  }
};

// Verifica email
export const resendVerificationEmail = async (email) => {
  try {
    await api.post('/email/verification-notification', { email });
    return { success: true, message: 'Email di verifica inviata con successo.' };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Errore nell\'invio dell\'email di verifica.' 
    };
  }
}; 