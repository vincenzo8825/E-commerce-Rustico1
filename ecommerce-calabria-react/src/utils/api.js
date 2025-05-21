import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
  timeout: 10000,
});

// Interceptor per gestire errori di autenticazione e risposte
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Gestione errori 401 (non autorizzato)
      if (error.response.status === 401) {
        // Rimuovi il token dalla localStorage
        localStorage.removeItem('token');
        // Rimuovi l'header Authorization
        delete api.defaults.headers.common['Authorization'];
        
        // Reindirizza alla pagina di login se non già lì
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Log per debug
      console.error('Errore API:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
        method: error.config.method
      });
    } else if (error.request) {
      // La richiesta è stata fatta ma non è stata ricevuta alcuna risposta
      console.error('Nessuna risposta ricevuta:', error.request);
    } else {
      // Qualcosa è andato storto nella configurazione della richiesta
      console.error('Errore nella configurazione della richiesta:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Imposta l'header di autorizzazione se c'è un token nel localStorage
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Function to test backend connection
export const testConnection = async () => {
  try {
    console.log('Tentativo di connessione al backend...');
    console.log('URL di base configurato:', api.defaults.baseURL);
    
    // Usa l'istanza api configurata per chiamare l'endpoint di ping
    const response = await api.get('/ping');
    console.log('Risposta da API ping:', response.data);
    return response.data;
  } catch (error) {
    console.error('Errore durante il test di connessione:', error);
    
    if (error.response) {
      console.error('Dati risposta:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Nessuna risposta ricevuta:', error.request);
      console.error('URL richiesto:', error.config?.url);
      console.error('Metodo richiesto:', error.config?.method);
    } else {
      console.error('Errore di configurazione:', error.message);
    }
    
    throw error;
  }
};

export default api;