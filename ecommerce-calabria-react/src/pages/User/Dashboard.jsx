import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import Profile from './Profile';
import Orders from './Orders';
import OrderDetail from './OrderDetail';
import Favorites from './Favorites';
import SupportTickets from './SupportTickets';
import CreateTicket from './CreateTicket';
import TicketDetail from './TicketDetail';
import NotificationsPage from './NotificationsPage';
import UserReviews from './UserReviews';
import EditReview from './EditReview';
import './Dashboard.scss';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Aspetta che il loading sia completato prima di reindirizzare
    if (!loading && !isLoggedIn) {
      navigate('/login', { state: { from: location } });
    }

    // Imposta il tab attivo in base al percorso
    const path = location.pathname.split('/')[2] || 'profile';
    setActiveTab(path);
  }, [location, navigate, isLoggedIn, loading]);

  // Mostra loading mentre verifica l'autenticazione
  if (loading) {
    return (
      <div className="dashboard__loading">
        <div className="dashboard__loading-spinner">Caricamento...</div>
      </div>
    );
  }

  // Non renderizza nulla se non autenticato (il redirect è gestito nell'useEffect)
  if (!isLoggedIn) {
    return null;
  }

  const renderContent = () => (
    <Routes>
      <Route path="/" element={<Profile />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:id" element={<OrderDetail />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/support" element={<SupportTickets />} />
      <Route path="/support/new" element={<CreateTicket />} />
      <Route path="/support/ticket/:id" element={<TicketDetail />} />
      <Route path="/reviews" element={<UserReviews />} />
      <Route path="/reviews/:reviewId/edit" element={<EditReview />} />
    </Routes>
  );

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <aside className="dashboard__sidebar">
          <h2 className="dashboard__sidebar-title">Il mio account</h2>
          
          <nav className="dashboard__sidebar-nav">
            <Link 
              to="/dashboard/profile" 
              className={`dashboard__sidebar-link ${activeTab === 'profile' ? 'dashboard__sidebar-link--active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="dashboard__sidebar-icon">👤</span>
              Profilo
            </Link>
            
            <Link 
              to="/dashboard/orders" 
              className={`dashboard__sidebar-link ${activeTab === 'orders' ? 'dashboard__sidebar-link--active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <span className="dashboard__sidebar-icon">🛒</span>
              I miei ordini
            </Link>
            
            <Link 
              to="/dashboard/favorites" 
              className={`dashboard__sidebar-link ${activeTab === 'favorites' ? 'dashboard__sidebar-link--active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <span className="dashboard__sidebar-icon">❤️</span>
              Preferiti
            </Link>
            
            <Link 
              to="/dashboard/notifications" 
              className={`dashboard__sidebar-link ${activeTab === 'notifications' ? 'dashboard__sidebar-link--active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <span className="dashboard__sidebar-icon">🔔</span>
              Notifiche
            </Link>
            
            <Link 
              to="/dashboard/support" 
              className={`dashboard__sidebar-link ${activeTab === 'support' ? 'dashboard__sidebar-link--active' : ''}`}
              onClick={() => setActiveTab('support')}
            >
              <span className="dashboard__sidebar-icon">🔧</span>
              Supporto
            </Link>
            
            <Link 
              to="/dashboard/reviews" 
              className={`dashboard__sidebar-link ${activeTab === 'reviews' ? 'dashboard__sidebar-link--active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <span className="dashboard__sidebar-icon">👍</span>
              Recensioni
            </Link>
          </nav>
        </aside>
        
        <main className="dashboard__content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 