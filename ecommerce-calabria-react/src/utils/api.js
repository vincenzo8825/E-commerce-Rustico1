import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Istanza API separata per le chiamate di test senza autenticazione
export const testApi = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/test',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
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
      
      // Log solo per errori importanti (non per notifiche)
      const isNotificationError = error.config?.url?.includes('/notifications');
      const isDevelopment = import.meta.env.DEV;
      
      if (!isNotificationError || isDevelopment) {
        console.warn('Errore API:', {
          status: error.response.status,
          data: error.response.data,
          url: error.config.url,
          method: error.config.method
        });
      }
    } else if (error.request) {
      // La richiesta è stata fatta ma non è stata ricevuta alcuna risposta
      if (import.meta.env.DEV) {
        console.warn('Nessuna risposta ricevuta:', error.request);
      }
    } else {
      // Qualcosa è andato storto nella configurazione della richiesta
      if (import.meta.env.DEV) {
        console.warn('Errore nella configurazione della richiesta:', error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

// Configurazione per intercettare ogni richiesta e aggiungere il token
api.interceptors.request.use(
  config => {
    // Controlla se il token esiste nel localStorage
    const token = localStorage.getItem('token');
    
    // Se esiste, aggiungi l'header di autorizzazione
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
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
    // Log ridotti solo per debug importante
    if (import.meta.env.DEV) {
      console.log('Tentativo di connessione al backend...');
      console.log('URL di base configurato:', api.defaults.baseURL);
    }
    
    // Usa l'istanza api configurata per chiamare l'endpoint di ping
    const response = await api.get('/ping');
    
    if (import.meta.env.DEV) {
      console.log('Risposta da API ping:', response.data);
    }
    
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

// Funzioni helper per usare le API di test durante lo sviluppo
export const fetchTestAdminData = async () => {
  try {
    // Statistiche dashboard
    const statsResponse = await testApi.get('/admin/dashboard/statistics');
    // Utenti
    const usersResponse = await testApi.get('/admin/dashboard/users');
    // Ordini
    const ordersResponse = await testApi.get('/admin/dashboard/orders');
    // Tickets
    const ticketsResponse = await testApi.get('/admin/dashboard/support-tickets');
    
    return {
      statistics: statsResponse.data,
      users: usersResponse.data,
      orders: ordersResponse.data,
      tickets: ticketsResponse.data
    };
  } catch (error) {
    console.error('Errore nel caricamento dei dati di test:', error);
    throw error;
  }
};

export default api;