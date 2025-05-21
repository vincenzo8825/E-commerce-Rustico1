import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import Profile from './Profile';
import Orders from './Orders';
import OrderDetail from './OrderDetail';
import Favorites from './Favorites';
import SupportTickets from './SupportTickets';
import CreateTicket from './CreateTicket';
import NotificationsPage from './NotificationsPage';
import './Dashboard.scss';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Reindirizza alla pagina di login se non autenticato
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: location } });
    }

    // Imposta il tab attivo in base al percorso
    const path = location.pathname.split('/')[2] || 'profile';
    setActiveTab(path);
  }, [location, navigate]);

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