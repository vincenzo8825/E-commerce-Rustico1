/**
 * Utility per test e debug delle API
 */
import api from './api';

/**
 * Testa il login con credenziali admin di default
 */
export const testAdminLogin = async () => {
  try {
    const response = await api.post('/auth/login', {
      email: 'admin@calabria.it',
      password: 'password'
    });
    console.log('✅ Login admin funzionante:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Errore login admin:', error);
    throw error;
  }
};

/**
 * Testa le API della dashboard admin
 */
export const testAdminDashboard = async () => {
  try {
    const stats = await api.get('/admin/dashboard/statistics');
    console.log('✅ Statistiche admin caricate:', stats.data);
    
    const orders = await api.get('/admin/dashboard/orders?per_page=5');
    console.log('✅ Ordini admin caricati:', orders.data);
    
    const tickets = await api.get('/admin/dashboard/support-tickets?per_page=5');
    console.log('✅ Ticket supporto caricati:', tickets.data);
    
    return {
      stats: stats.data,
      orders: orders.data,
      tickets: tickets.data
    };
  } catch (error) {
    console.error('❌ Errore API dashboard admin:', error);
    throw error;
  }
};

/**
 * Testa la connessione base alle API
 */
export const testApiConnection = async () => {
  try {
    const response = await api.get('/ping');
    console.log('✅ Connessione API funzionante:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Errore connessione API:', error);
    throw error;
  }
};

/**
 * Funzione di debug completa
 */
export const debugComplete = async () => {
  console.log('🔍 Inizio test completo delle API...');
  
  try {
    // 1. Test connessione
    await testApiConnection();
    
    // 2. Test login (senza salvare il token per non interferire)
    const originalToken = localStorage.getItem('auth_token');
    await testAdminLogin();
    
    // 3. Test dashboard (il token è stato salvato dal login)
    await testAdminDashboard();
    
    // 4. Ripristina token originale se esisteva
    if (originalToken) {
      localStorage.setItem('auth_token', originalToken);
    }
    
    console.log('✅ Tutti i test completati con successo!');
    return true;
  } catch (error) {
    console.error('❌ Test falliti:', error);
    return false;
  }
};

// Funzione per il debug in console del browser
if (typeof window !== 'undefined') {
  window.debugEcommerce = {
    testApiConnection,
    testAdminLogin, 
    testAdminDashboard,
    debugComplete
  };
} 