import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Flag per tracciare lo stato dei dati
  const [dataSource, setDataSource] = useState('server');

  useEffect(() => {
    // Carica tutti i dati
    fetchAllData();
  }, []);

  // Funzione centralizzata per caricare tutti i dati
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Primo verifica che siamo autenticati come admin
      const adminCheck = await api.get('/admin/check-status');
      
      if (!adminCheck.data.isAdmin) {
        throw new Error('Non hai permessi di amministratore');
      }
      
      // Carica tutti i dati necessari
      await Promise.all([
        fetchStatistics(),
        fetchRecentOrders(),
        fetchTopProducts(),
        fetchSupportTickets()
      ]);
      
      // Imposta la sorgente dati come server
      setDataSource('server');
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      setError('Si è verificato un errore durante il caricamento dei dati. Riprova più tardi.');
      
      // Tenta di recuperare dati dal localStorage
      if (!tryLoadFromLocalStorage()) {
        setDataSource('error');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Tenta di caricare i dati dal localStorage
  const tryLoadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('admin_dashboard_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Verifica che ci siano almeno le statistiche
        if (parsedData.statistics) {
          setStats(parsedData.statistics);
          setRecentOrders(parsedData.recentOrders || []);
          setTopProducts(parsedData.topProducts || []);
          setSupportTickets(parsedData.supportTickets || []);
          setDataSource('localStorage');
          return true;
        }
      }
      
      // Se non ci sono dati nel localStorage, usiamo dati demo
      setMockData();
      setDataSource('demo');
      return true;
    } catch (e) {
      console.error('Errore nel recupero dati da localStorage:', e);
      // In caso di errore, usa dati demo
      setMockData();
      setDataSource('demo');
      return true;
    }
  };

  // Salva i dati in localStorage per uso futuro
  const saveToLocalStorage = (dataType, data) => {
    try {
      // Recupera dati esistenti o inizializza un nuovo oggetto
      let adminData = {};
      const savedData = localStorage.getItem('admin_dashboard_data');
      
      if (savedData) {
        adminData = JSON.parse(savedData);
      }
      
      // Aggiorna solo il tipo di dati specificato
      adminData[dataType] = data;
      adminData.timestamp = Date.now();
      
      // Salva tutto in localStorage
      localStorage.setItem('admin_dashboard_data', JSON.stringify(adminData));
    } catch (e) {
      console.error('Errore nel salvataggio in localStorage:', e);
    }
  };

  const fetchStatistics = async () => {
    const response = await api.get('/admin/statistics');
    const statsData = response.data.statistics;
    setStats(statsData);
    saveToLocalStorage('statistics', statsData);
    return statsData;
  };

  const fetchRecentOrders = async () => {
    const response = await api.get('/admin/orders?limit=5&sort=-created_at');
    const ordersData = response.data.orders.data || [];
    setRecentOrders(ordersData);
    saveToLocalStorage('recentOrders', ordersData);
    return ordersData;
  };

  const fetchTopProducts = async () => {
    const response = await api.get('/admin/statistics/products?limit=5');
    const productsData = response.data.products || [];
    setTopProducts(productsData);
    saveToLocalStorage('topProducts', productsData);
    return productsData;
  };

  const fetchSupportTickets = async () => {
    const response = await api.get('/admin/support-tickets?status=open&limit=5');
    const ticketsData = response.data.tickets || [];
    setSupportTickets(ticketsData);
    saveToLocalStorage('supportTickets', ticketsData);
    return ticketsData;
  };

  // Formatta data in formato italiano
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  // Formatta prezzo con 2 decimali
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  // Restituisce classe CSS in base allo stato dell'ordine
  const getOrderStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'admin__status-badge--success';
      case 'processing': return 'admin__status-badge--info';
      case 'pending': return 'admin__status-badge--warning';
      case 'cancelled': return 'admin__status-badge--danger';
      default: return '';
    }
  };

  // Traduce lo stato dell'ordine in italiano
  const translateOrderStatus = (status) => {
    switch (status) {
      case 'completed': return 'Completato';
      case 'processing': return 'In lavorazione';
      case 'pending': return 'In attesa';
      case 'cancelled': return 'Annullato';
      default: return status;
    }
  };

  // Imposta dati mock di esempio quando le API falliscono
  const setMockData = () => {
    // Statistiche demo
    setStats({
      orders: {
        total: 28, 
        revenue: 4250.75, 
        average_value: 151.81
      },
      products: {
        total: 32, 
        out_of_stock: 4
      },
      users: {
        total: 76, 
        new_month: 12
      }
    });
    
    // Ordini recenti demo
    setRecentOrders([
      {
        id: 1001,
        order_number: 'ORD-2023-1001',
        created_at: '2023-10-15T08:30:00',
        total: 156.80,
        status: 'pending',
        customer_name: 'Mario Rossi'
      },
      {
        id: 1002,
        order_number: 'ORD-2023-1002',
        created_at: '2023-10-14T14:45:00',
        total: 89.90,
        status: 'processing',
        customer_name: 'Giulia Bianchi'
      },
      {
        id: 1003,
        order_number: 'ORD-2023-1003',
        created_at: '2023-10-13T17:20:00',
        total: 215.50,
        status: 'completed',
        customer_name: 'Luca Verdi'
      },
      {
        id: 1004,
        order_number: 'ORD-2023-1004',
        created_at: '2023-10-12T09:15:00',
        total: 64.30,
        status: 'completed',
        customer_name: 'Sofia Neri'
      },
      {
        id: 1005,
        order_number: 'ORD-2023-1005',
        created_at: '2023-10-11T11:40:00',
        total: 132.75,
        status: 'cancelled',
        customer_name: 'Alessandro Marrone'
      }
    ]);
    
    // Prodotti più venduti demo
    setTopProducts([
      {
        id: 101,
        name: 'Nduja di Spilinga',
        price: 12.50,
        total_sold: 48,
        stock: 15,
        category: { name: 'Salumi' }
      },
      {
        id: 102,
        name: 'Olio Extra Vergine d\'Oliva Biologico',
        price: 18.90,
        total_sold: 42,
        stock: 28,
        category: { name: 'Oli' }
      },
      {
        id: 103,
        name: 'Cipolla Rossa di Tropea IGP',
        price: 4.75,
        total_sold: 36,
        stock: 42,
        category: { name: 'Ortaggi' }
      },
      {
        id: 104,
        name: 'Pecorino Crotonese DOP',
        price: 8.90,
        total_sold: 31,
        stock: 18,
        category: { name: 'Formaggi' }
      },
      {
        id: 105,
        name: 'Liquirizia di Calabria',
        price: 6.50,
        total_sold: 29,
        stock: 25,
        category: { name: 'Dolci' }
      }
    ]);
    
    // Ticket di supporto demo
    setSupportTickets([
      {
        id: 201,
        subject: 'Problema con il pagamento',
        status: 'open',
        created_at: '2023-10-14T10:20:00',
        user: { name: 'Roberto Ferretti' }
      },
      {
        id: 202,
        subject: 'Ordine non ricevuto',
        status: 'open',
        created_at: '2023-10-13T14:35:00',
        user: { name: 'Chiara Esposito' }
      },
      {
        id: 203,
        subject: 'Richiesta rimborso',
        status: 'open',
        created_at: '2023-10-12T09:50:00',
        user: { name: 'Francesco Romano' }
      },
      {
        id: 204,
        subject: 'Prodotto danneggiato',
        status: 'open',
        created_at: '2023-10-11T16:15:00',
        user: { name: 'Laura Martini' }
      }
    ]);
  };

  if (loading) {
    return (
      <div className="admin__loading-spinner">
        Caricamento statistiche...
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="admin__error">
        <p>{error}</p>
        <button 
          className="admin__button admin__button--primary"
          onClick={fetchAllData}
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <>
      {dataSource === 'localStorage' && (
        <div className="admin__alert admin__alert--warning" style={{marginBottom: '20px', padding: '10px 15px', borderRadius: '4px', backgroundColor: '#fff3cd', color: '#856404'}}>
          <strong>Nota:</strong> Visualizzazione dati dalla cache locale. Aggiorna la pagina per ottenere dati in tempo reale.
          <button 
            className="admin__button admin__button--sm admin__button--warning" 
            style={{marginLeft: '10px'}}
            onClick={fetchAllData}
          >
            Aggiorna
          </button>
        </div>
      )}
      
      {dataSource === 'demo' && (
        <div className="admin__alert admin__alert--info" style={{marginBottom: '20px', padding: '10px 15px', borderRadius: '4px', backgroundColor: '#d1ecf1', color: '#0c5460'}}>
          <strong>Nota:</strong> Visualizzazione dati dimostrativi. Questi dati sono di esempio e non riflettono lo stato reale del sistema.
          <button 
            className="admin__button admin__button--sm admin__button--info" 
            style={{marginLeft: '10px'}}
            onClick={fetchAllData}
          >
            Riprova connessione
          </button>
        </div>
      )}
    
      <div className="admin__stats-grid">
        {/* Statistiche Ordini */}
        <div className="admin__stat-card">
          <div className="admin__stat-card-icon">🛒</div>
          <div className="admin__stat-card-label">Ordini Totali</div>
          <div className="admin__stat-card-value">{stats.orders.total}</div>
          <Link to="/admin/orders" className="admin__stat-card-link">Visualizza dettagli</Link>
        </div>
        
        <div className="admin__stat-card">
          <div className="admin__stat-card-icon">💶</div>
          <div className="admin__stat-card-label">Fatturato</div>
          <div className="admin__stat-card-value">€ {stats.orders.revenue.toFixed(2)}</div>
          <p className="admin__stat-card-secondary">
            Media: € {stats.orders.average_value.toFixed(2)} per ordine
          </p>
        </div>
        
        {/* Statistiche Prodotti */}
        <div className="admin__stat-card">
          <div className="admin__stat-card-icon">📦</div>
          <div className="admin__stat-card-label">Prodotti</div>
          <div className="admin__stat-card-value">{stats.products.total}</div>
          <Link to="/admin/products" className="admin__stat-card-link">Gestisci catalogo</Link>
        </div>
        
        <div className="admin__stat-card">
          <div className="admin__stat-card-icon">⚠️</div>
          <div className="admin__stat-card-label">Prodotti Esauriti</div>
          <div className="admin__stat-card-value">{stats.products.out_of_stock}</div>
          <Link to="/admin/products?stock=low" className="admin__stat-card-link">Verifica magazzino</Link>
        </div>
        
        {/* Statistiche Utenti */}
        <div className="admin__stat-card">
          <div className="admin__stat-card-icon">👥</div>
          <div className="admin__stat-card-label">Utenti Registrati</div>
          <div className="admin__stat-card-value">{stats.users.total}</div>
          <p className="admin__stat-card-secondary">
            Nuovi (30gg): {stats.users.new_month}
          </p>
        </div>
      </div>
      
      {/* Sezione Ordini Recenti */}
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Ultimi Ordini</h2>
          <Link to="/admin/orders" className="admin__button admin__button--secondary">
            Vedi tutti
          </Link>
        </div>
        <div className="admin__card-body">
          {recentOrders.length > 0 ? (
            <div className="admin__table-container">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Totale</th>
                    <th>Stato</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.user.name} {order.user.surname}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>€ {formatPrice(order.total)}</td>
                      <td>
                        <span className={`admin__status-badge ${getOrderStatusClass(order.status)}`}>
                          {translateOrderStatus(order.status)}
                        </span>
                      </td>
                      <td>
                        <Link 
                          to={`/admin/orders/${order.id}`}
                          className="admin__button admin__button--secondary"
                        >
                          Dettagli
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Nessun ordine recente da visualizzare.</p>
          )}
        </div>
      </div>
      
      {/* Sezione Prodotti più venduti */}
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Prodotti più venduti</h2>
          <Link to="/admin/statistics/products" className="admin__button admin__button--secondary">
            Statistiche complete
          </Link>
        </div>
        <div className="admin__card-body">
          {topProducts.length > 0 ? (
            <div className="admin__table-container">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Prodotto</th>
                    <th>Categoria</th>
                    <th>Prezzo</th>
                    <th>Vendite</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="admin__product-name-cell">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="admin__product-mini-image" 
                            />
                          )}
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td>{product.category.name}</td>
                      <td>€ {formatPrice(product.price)}</td>
                      <td>{product.total_sold}</td>
                      <td>
                        <span className={`admin__stock-badge ${
                          product.stock <= 0 ? 'admin__stock-badge--out' :
                          product.stock < 10 ? 'admin__stock-badge--low' :
                          'admin__stock-badge--in'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Nessun dato sulle vendite disponibile.</p>
          )}
        </div>
      </div>
      
      {/* Sezione Ticket Supporto */}
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Ticket Supporto Aperti</h2>
          <Link to="/admin/support" className="admin__button admin__button--secondary">
            Gestisci ticket
          </Link>
        </div>
        <div className="admin__card-body">
          {supportTickets.length > 0 ? (
            <div className="admin__table-container">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Oggetto</th>
                    <th>Data</th>
                    <th>Priorità</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {supportTickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td>#{ticket.id}</td>
                      <td>{ticket.user.name} {ticket.user.surname}</td>
                      <td>{ticket.subject}</td>
                      <td>{formatDate(ticket.created_at)}</td>
                      <td>
                        <span className={`admin__priority-badge admin__priority-badge--${ticket.priority}`}>
                          {ticket.priority === 'high' ? 'Alta' : 
                           ticket.priority === 'medium' ? 'Media' : 'Bassa'}
                        </span>
                      </td>
                      <td>
                        <Link 
                          to={`/admin/support/${ticket.id}`}
                          className="admin__button admin__button--secondary"
                        >
                          Rispondi
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Nessun ticket di supporto aperto.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Overview; 