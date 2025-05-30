import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isAdmin as checkIsAdmin } from '../../utils/auth';
import api from '../../utils/api';
import NotificationCenter from '../../components/Notifications/NotificationCenter';
import './Admin.scss';

// Importa i componenti Admin
import Overview from './Overview';
import Products from './Products';
import ProductForm from './ProductForm';
import Categories from './Categories';
import Orders from './Orders';
import OrderDetail from './OrderDetail';
import Users from './Users';
import UserDetail from './UserDetail';
import SupportTickets from './SupportTickets';
import TicketDetail from './TicketDetail';
import Discounts from './Discounts';
import DiscountForm from './DiscountForm';
import Inventory from './Inventory';
import Notifications from './Notifications';
import Settings from './Settings';
import AdminReviews from './Reviews';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    // Verifica se l'utente è autenticato e ha permessi admin
    const checkAdmin = async () => {
      setLoading(true);
      
      // Verifica innanzitutto il localStorage tramite la funzione isAdmin
      const isAdminFromStorage = checkIsAdmin();
      
      if (!isAuthenticated()) {
        // Reindirizza al login se non autenticato
        navigate('/login', { state: { from: location, message: 'Accedi per continuare' } });
        return;
      }
      
      try {
        // Prova prima con l'endpoint check-status
        const response = await api.get('/admin/check-status');
        
        if (response.data.isAdmin) {
          setIsAdmin(true);
          
          // Ottieni informazioni utente
          try {
            const userResponse = await api.get('/user/profile');
            setUserInfo(userResponse.data.user);
          } catch (profileError) {
            console.error('Errore nel caricamento del profilo:', profileError);
            // Prova con un altro endpoint
            try {
              const userResponse = await api.get('/auth/user');
              setUserInfo(userResponse.data);
            } catch (authError) {
              console.error('Errore nel caricamento dei dati utente:', authError);
              // Continua comunque, ci basiamo sui dati memorizzati
            }
          }
        } else {
          throw new Error('Utente non ha permessi admin');
        }
      } catch (error) {
        console.error('Errore nel controllo permessi admin:', error);
        
        // Prova con un endpoint alternativo
        try {
          const _statsResponse = await api.get('/admin/dashboard/statistics');
          // console.log("Risposta statistiche dashboard:", statsResponse.data);
          // Se riceve una risposta, l'utente è admin
          setIsAdmin(true);
          
          // Usa dati utente minimi
          setUserInfo({
            name: "Admin",
            surname: "Utente",
          });
        } catch (statsError) {
          console.error('Errore nel controllo via statistiche:', statsError);
          
          // Se abbiamo già verificato che è admin tramite localStorage, continua
          if (isAdminFromStorage) {
            // console.log("Errore API ma utente ha permessi admin in localStorage, continua...");
            setIsAdmin(true);
            // Usa dati utente minimi per continuare
            setUserInfo({
              name: "Admin",
              surname: "Utente",
            });
          } else {
            // Reindirizza alla home se non è admin
            navigate('/', { 
              state: { 
                message: 'Non hai i permessi necessari per accedere all\'area amministrativa.' 
              } 
            });
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [navigate, location]);
  
  useEffect(() => {
    // Imposta la sezione attiva in base al percorso
    const path = location.pathname.split('/')[2] || 'overview';
    setActiveSection(path);
  }, [location]);
  
  const toggleSidebar = () => {
    setCollapsedSidebar(!collapsedSidebar);
  };
  
  if (loading) {
    return (
      <div className="admin__loading">
        <div className="admin__loading-spinner">Caricamento...</div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // L'useEffect gestirà il redirect
  }
  
  const getUserInitials = () => {
    if (!userInfo || !userInfo.name) return 'A';
    
    const nameParts = `${userInfo.name} ${userInfo.surname || ''}`.trim().split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    
    return nameParts[0][0].toUpperCase();
  };
  
  return (
    <div className="admin">
      {/* Sidebar */}
      <aside className={`admin__sidebar ${collapsedSidebar ? 'admin__sidebar--collapsed' : ''}`}>
        <div className="admin__sidebar-header">
          <h2>{!collapsedSidebar && 'Sapori di Calabria'}</h2>
          <button 
            className="admin__toggle-btn" 
            onClick={toggleSidebar}
          >
            {collapsedSidebar ? '→' : '←'}
          </button>
        </div>
        
        <nav className="admin__nav">
          {/* Sezione Profilo Admin */}
          {!collapsedSidebar && userInfo && (
            <div className="admin__nav-section admin__nav-section--profile">
              <div className="admin__nav-section-title">Profilo Admin</div>
              <div className="admin__profile-card">
                <div className="admin__profile-avatar">
                  {getUserInitials()}
                </div>
                <div className="admin__profile-info">
                  <div className="admin__profile-name">
                    {userInfo.name} {userInfo.surname}
                  </div>
                  <div className="admin__profile-email">
                    {userInfo.email}
                  </div>
                  <div className="admin__profile-role">
                    Amministratore
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="admin__nav-section">
            {!collapsedSidebar && <div className="admin__nav-section-title">Principale</div>}
            
            <Link 
              to="/admin" 
              className={`admin__nav-item ${activeSection === 'overview' ? 'admin__nav-item--active' : ''}`}
            >
              <span className="admin__nav-item-icon">📊</span>
              <span className="admin__nav-item-text">Dashboard</span>
            </Link>
          </div>
          
          <div className="admin__nav-section">
            {!collapsedSidebar && <div className="admin__nav-section-title">Catalogo</div>}
            
            <Link 
              to="/admin/products" 
              className={`admin__nav-item ${activeSection === 'products' ? 'admin__nav-item--active' : ''}`}
            >
              <span className="admin__nav-item-icon">📦</span>
              <span className="admin__nav-item-text">Prodotti</span>
            </Link>
            
            <Link 
              to="/admin/inventory" 
              className={`admin__nav-item ${activeSection === 'inventory' ? 'admin__nav-item--active' : ''}`}
            >
              <span className="admin__nav-item-icon">🧮</span>
              <span className="admin__nav-item-text">Magazzino</span>
            </Link>
            
            <Link 
              to="/admin/categories" 
              className={`admin__nav-item ${activeSection === 'categories' ? 'admin__nav-item--active' : ''}`}
            >
              <span className="admin__nav-item-icon">🗂️</span>
              <span className="admin__nav-item-text">Categorie</span>
            </Link>
            
            <Link 
              to="/admin/discounts" 
              className={`admin__nav-item ${activeSection === 'discounts' ? 'admin__nav-item--active' : ''}`}
            >
              <span className="admin__nav-item-icon">🏷️</span>
              <span className="admin__nav-item-text">Codici Sconto</span>
            </Link>
          </div>
          
          <div className="admin__nav-section">
            {!collapsedSidebar && <div className="admin__nav-section-title">Vendite</div>}
            
            <Link 
              to="/admin/orders" 
              className={`admin__nav-item ${activeSection === 'orders' ? 'admin__nav-item--active' : ''}`}
            >
              <span className="admin__nav-item-icon">🛒</span>
              <span className="admin__nav-item-text">Ordini</span>
            </Link>
          </div>
          
          <div className="admin__nav-section">
            {!collapsedSidebar && <div className="admin__nav-section-title">Utenti</div>}
            
            <Link 
              to="/admin/users" 
              className={`admin__nav-item ${activeSection === 'users' ? 'admin__nav-item--active' : ''}`}
            >
              <span className="admin__nav-item-icon">👥</span>
              <span className="admin__nav-item-text">Gestione Utenti</span>
            </Link>
          </div>
          
          <div className="admin__nav-section">
            {!collapsedSidebar && <div className="admin__nav-section-title">Supporto</div>}
            
            <Link 
              to="/admin/tickets" 
              className={`admin__nav-item ${activeSection === 'tickets' ? 'admin__nav-item--active' : ''}`}
            >
              <span className="admin__nav-item-icon">🔧</span>
              <span className="admin__nav-item-text">Ticket Supporto</span>
            </Link>
            
            <Link 
              to="/admin/reviews" 
              className={`admin__nav-item ${activeSection === 'reviews' ? 'admin__nav-item--active' : ''}`}
            >
              <span className="admin__nav-item-icon">⭐</span>
              <span className="admin__nav-item-text">Recensioni</span>
            </Link>
            
            <Link 
              to="/admin/notifications" 
              className={`admin__nav-item ${activeSection === 'notifications' ? 'admin__nav-item--active' : ''}`}
            >
              <span className="admin__nav-item-icon">🔔</span>
              <span className="admin__nav-item-text">Notifiche</span>
            </Link>
          </div>
          
          <div className="admin__nav-section">
            {!collapsedSidebar && <div className="admin__nav-section-title">Configurazione</div>}
            
            <Link 
              to="/admin/settings" 
              className={`admin__nav-item ${activeSection === 'settings' ? 'admin__nav-item--active' : ''}`}
            >
              <span className="admin__nav-item-icon">⚙️</span>
              <span className="admin__nav-item-text">Impostazioni</span>
            </Link>
          </div>
          
          <div className="admin__nav-section">
            {!collapsedSidebar && <div className="admin__nav-section-title">Collegamenti</div>}
            
            <Link 
              to="/" 
              className="admin__nav-item"
            >
              <span className="admin__nav-item-icon">🏠</span>
              <span className="admin__nav-item-text">Torna al Negozio</span>
            </Link>
          </div>
        </nav>
      </aside>
      
      {/* Contenuto principale */}
      <main className="admin__main">
        <header className="admin__header">
          <h1 className="admin__title">
            {activeSection === 'overview' && 'Dashboard'}
            {activeSection === 'products' && 'Gestione Prodotti'}
            {activeSection === 'inventory' && 'Gestione Magazzino'}
            {activeSection === 'categories' && 'Gestione Categorie'}
            {activeSection === 'orders' && 'Gestione Ordini'}
            {activeSection === 'users' && 'Gestione Utenti'}
            {activeSection === 'discounts' && 'Codici Sconto'}
            {activeSection === 'tickets' && 'Ticket Supporto'}
            {activeSection === 'reviews' && 'Gestione Recensioni'}
            {activeSection === 'notifications' && 'Notifiche'}
            {activeSection === 'settings' && 'Impostazioni Sistema'}
          </h1>
          
          <div className="admin__user-menu">
            <div className="admin__notifications">
              <NotificationCenter />
            </div>
            {userInfo && (
              <>
                <span className="admin__user-menu-name">
                  {userInfo.name} {userInfo.surname}
                </span>
                <div className="admin__user-menu-avatar">
                  {getUserInitials()}
                </div>
              </>
            )}
          </div>
        </header>
        
        <div className="admin__content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductForm />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/tickets" element={<SupportTickets />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/discounts" element={<Discounts />} />
            <Route path="/discounts/new" element={<DiscountForm />} />
            <Route path="/discounts/:id" element={<DiscountForm />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reviews" element={<AdminReviews />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 