import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import SalesChart from '../../components/Charts/SalesChart';

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
      // Imposta valori di default iniziali in caso di errore
      setStats({
        total_revenue: 0,
        revenue_this_month: 0,
        orders_this_month: 0,
        new_users: 0,
        open_tickets: 0,
        top_products: [],
        sales_by_category: [],
        sales_chart: []
      });
      
      // Carica tutti i dati necessari
      await Promise.all([
        fetchStatistics(),
        fetchRecentOrders(),
        fetchSupportTickets()
      ]);
      
      // Imposta la sorgente dati come server
      setDataSource('server');
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      setError('Si è verificato un errore durante il caricamento dei dati. Riprova più tardi.');
      setDataSource('error');
      
      // Carica dati di esempio in caso di errore per evitare UI vuota
      setStats({
        total_revenue: 12580.75,
        revenue_this_month: 2450.99,
        orders_this_month: 42,
        new_users: 18,
        open_tickets: 5,
        top_products: [
          { id: 1, name: 'Prodotto demo 1', price: 19.99, total_sold: 25 },
          { id: 2, name: 'Prodotto demo 2', price: 29.99, total_sold: 18 }
        ],
        sales_by_category: [],
        sales_chart: []
      });
      
      // Imposta anche dati di esempio per ordini e ticket
      setRecentOrders([
        { 
          id: 1, 
          order_number: 'ORD-2023-001',
          user: { name: 'Mario', surname: 'Rossi' },
          created_at: new Date().toISOString(),
          total: 129.99,
          status: 'in_elaborazione'
        }
      ]);
      
      setSupportTickets([
        {
          id: 1,
          user: { name: 'Luigi', surname: 'Verdi' },
          subject: 'Richiesta informazioni',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      // Usa il nuovo endpoint per le statistiche
      const response = await api.get('/admin/dashboard/statistics');
      const statsData = response.data;
      
      // Verifica che i dati siano disponibili e imposta valori di default se necessario
      const processedStats = {
        total_revenue: statsData.total_revenue || 0,
        revenue_this_month: statsData.revenue_this_month || 0,
        orders_this_month: statsData.orders_this_month || 0,
        new_users: statsData.new_users || 0,
        open_tickets: statsData.open_tickets || 0,
        top_products: statsData.top_products || [],
        sales_by_category: statsData.sales_by_category || [],
        sales_chart: statsData.sales_chart || []
      };
      
      setStats(processedStats);
      
      // Imposta i prodotti più venduti
      setTopProducts(statsData.top_products || []);
      
      return processedStats;
    } catch (error) {
      console.error('Errore nel caricamento delle statistiche:', error);
      throw error;
    }
  };

  const fetchRecentOrders = async () => {
    try {
      // Usa il nuovo endpoint per gli ordini
      const response = await api.get('/admin/dashboard/orders?per_page=5');
      const ordersData = response.data.data || [];
      setRecentOrders(ordersData);
      return ordersData;
    } catch (error) {
      console.error('Errore nel caricamento degli ordini recenti:', error);
      throw error;
    }
  };

  const fetchSupportTickets = async () => {
    try {
      // Usa il nuovo endpoint per i ticket di supporto
      const response = await api.get('/admin/dashboard/support-tickets?status=open&per_page=5');
      const ticketsData = response.data.data || [];
      setSupportTickets(ticketsData);
      return ticketsData;
    } catch (error) {
      console.error('Errore nel caricamento dei ticket di supporto:', error);
      throw error;
    }
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
      case 'completato': return 'admin__status-badge--success';
      case 'spedito': return 'admin__status-badge--info';
      case 'in_elaborazione': return 'admin__status-badge--warning';
      case 'annullato': return 'admin__status-badge--danger';
      default: return '';
    }
  };

  // Traduce lo stato dell'ordine in italiano
  const translateOrderStatus = (status) => {
    switch (status) {
      case 'completato': return 'Completato';
      case 'spedito': return 'Spedito';
      case 'in_elaborazione': return 'In lavorazione';
      case 'annullato': return 'Annullato';
      default: return status;
    }
  };

  if (loading) {
    return <div className="admin__loading">Caricamento statistiche...</div>;
  }

  if (error) {
    return (
      <div className="admin__error">
        <h3>Errore</h3>
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

  if (!stats) {
    return <div className="admin__error">Dati non disponibili</div>;
  }

  return (
    <div className="admin__overview">
      {dataSource !== 'server' && (
        <div className="admin__data-source-notice">
          <p>
            <strong>Nota:</strong> {dataSource === 'localStorage' 
              ? 'Visualizzando dati salvati in cache.' 
              : 'Visualizzando dati di esempio.'}
            <button 
              className="admin__button admin__button--small admin__button--text" 
              onClick={fetchAllData}
            >
              Ricarica
            </button>
          </p>
        </div>
      )}
      
      {/* Statistiche principali */}
      <div className="admin__stats-grid">
        <div className="admin__stat-card">
          <div className="admin__stat-card-icon admin__stat-card-icon--green">💰</div>
          <div className="admin__stat-card-content">
            <h3 className="admin__stat-card-title">Fatturato Totale</h3>
            <p className="admin__stat-card-value">€{formatPrice(stats.total_revenue || 0)}</p>
            <p className="admin__stat-card-description">Totale di tutti gli ordini completati</p>
          </div>
        </div>
        
        <div className="admin__stat-card">
          <div className="admin__stat-card-icon admin__stat-card-icon--blue">📊</div>
          <div className="admin__stat-card-content">
            <h3 className="admin__stat-card-title">Fatturato Mensile</h3>
            <p className="admin__stat-card-value">€{formatPrice(stats.revenue_this_month || 0)}</p>
            <p className="admin__stat-card-description">Ultimi 30 giorni</p>
          </div>
        </div>
        
        <div className="admin__stat-card">
          <div className="admin__stat-card-icon admin__stat-card-icon--orange">🛒</div>
          <div className="admin__stat-card-content">
            <h3 className="admin__stat-card-title">Ordini</h3>
            <p className="admin__stat-card-value">{stats.orders_this_month || 0}</p>
            <p className="admin__stat-card-description">Ultimi 30 giorni</p>
          </div>
        </div>
        
        <div className="admin__stat-card">
          <div className="admin__stat-card-icon admin__stat-card-icon--purple">👥</div>
          <div className="admin__stat-card-content">
            <h3 className="admin__stat-card-title">Nuovi Utenti</h3>
            <p className="admin__stat-card-value">{stats.new_users || 0}</p>
            <p className="admin__stat-card-description">Ultimi 30 giorni</p>
          </div>
        </div>
      </div>
      
      {/* Riga con 2 colonne */}
      <div className="admin__overview-row">
        {/* Ordini recenti */}
        <div className="admin__overview-card">
          <div className="admin__overview-card-header">
            <h3>Ordini Recenti</h3>
            <Link to="/admin/orders" className="admin__link">
              Vedi tutti
            </Link>
          </div>
          
          <div className="admin__table-responsive">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Importo</th>
                  <th>Stato</th>
                  <th>Azione</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.order_number || `#${order.id}`}</td>
                      <td>{order.user ? `${order.user.name} ${order.user.surname}` : 'Cliente'}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>€{formatPrice(order.total_amount || order.total)}</td>
                      <td>
                        <span className={`admin__status-badge ${getOrderStatusClass(order.status)}`}>
                          {translateOrderStatus(order.status)}
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/orders/${order.id}`} className="admin__button admin__button--small">
                          Dettagli
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="admin__empty-table">Nessun ordine recente</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Prodotti più venduti */}
        <div className="admin__overview-card">
          <div className="admin__overview-card-header">
            <h3>Prodotti Più Venduti</h3>
            <Link to="/admin/products" className="admin__link">
              Vedi tutti
            </Link>
          </div>
          
          <div className="admin__table-responsive">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>Prodotto</th>
                  <th>Prezzo</th>
                  <th>Vendite</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length > 0 ? (
                  topProducts.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>€{formatPrice(product.price)}</td>
                      <td>{product.total_sold}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="admin__empty-table">Nessun dato disponibile</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Riga con ticket supporto */}
      <div className="admin__overview-row">
        <div className="admin__overview-card admin__overview-card--full">
          <div className="admin__overview-card-header">
            <h3>Ticket di Supporto Aperti</h3>
            <Link to="/admin/support" className="admin__link">
              Vedi tutti
            </Link>
          </div>
          
          <div className="admin__table-responsive">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Oggetto</th>
                  <th>Data Creazione</th>
                  <th>Ultimo Aggiornamento</th>
                  <th>Azione</th>
                </tr>
              </thead>
              <tbody>
                {supportTickets.length > 0 ? (
                  supportTickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td>#{ticket.id}</td>
                      <td>{ticket.user ? `${ticket.user.name} ${ticket.user.surname}` : 'Cliente'}</td>
                      <td>{ticket.subject}</td>
                      <td>{formatDate(ticket.created_at)}</td>
                      <td>{formatDate(ticket.updated_at)}</td>
                      <td>
                        <Link to={`/admin/support/${ticket.id}`} className="admin__button admin__button--small">
                          Rispondi
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="admin__empty-table">Nessun ticket di supporto aperto</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Sezione grafici */}
      <div className="admin__overview-row">
        {/* Grafico vendite per categoria */}
        <div className="admin__overview-card">
          <div className="admin__overview-card-header">
            <h3>Vendite per Categoria</h3>
          </div>
          <SalesChart 
            data={stats.sales_by_category} 
            type="bar" 
            height={300}
          />
        </div>
        
        {/* Grafico torta categorie */}
        <div className="admin__overview-card">
          <div className="admin__overview-card-header">
            <h3>Distribuzione Vendite</h3>
          </div>
          <SalesChart 
            data={stats.sales_by_category} 
            type="pie" 
            height={300}
          />
        </div>
      </div>
      
      {/* Grafico andamento vendite */}
      {stats.sales_chart && stats.sales_chart.length > 0 && (
        <div className="admin__overview-row">
          <div className="admin__overview-card admin__overview-card--full">
            <div className="admin__overview-card-header">
              <h3>Andamento Vendite Ultimi 30 Giorni</h3>
            </div>
            <SalesChart 
              data={stats.sales_chart} 
              type="line" 
              height={350}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview; 