import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../App';
import NotificationList from './NotificationList';
import './NotificationCenter.scss';

const NotificationCenter = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Determina se siamo nella dashboard admin
  const isAdminArea = location.pathname.startsWith('/admin');
  const notificationsLink = isAdminArea ? '/admin/notifications' : '/dashboard/notifications';

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      
      // Aggiorna le notifiche ogni 30 secondi
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/notifications');
      
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      if (import.meta.env.DEV && err.config?.url?.includes('/notifications')) {
        // In sviluppo, mostra warning invece di errore per notifiche
        console.warn('Errore notifiche (normale se API non configurata):', err.response?.status);
        return;
      }
      setError('Errore nel caricamento delle notifiche');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    // Aggiorna le notifiche quando l'utente apre il dropdown
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/user/notifications/${notificationId}/read`);
      await fetchNotifications();
    } catch (error) {
      console.error('Errore nel segnare come letta:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/user/notifications/read-all');
      await fetchNotifications();
    } catch (error) {
      console.error('Errore nel segnare tutte come lette:', error);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="notification-center">
      <button 
        className="notification-center__toggle" 
        onClick={toggleNotifications}
      >
        <span className="notification-center__icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-center__badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-center__dropdown">
          <div className="notification-center__header">
            <h3 className="notification-center__title">Notifiche</h3>
            {unreadCount > 0 && (
              <button 
                className="notification-center__mark-all" 
                onClick={markAllAsRead}
              >
                Segna tutte come lette
              </button>
            )}
          </div>

          {loading ? (
            <div className="notification-center__loading">
              Caricamento notifiche...
            </div>
          ) : error ? (
            <div className="notification-center__error">
              {error}
              <button 
                className="notification-center__retry" 
                onClick={fetchNotifications}
              >
                Riprova
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-center__empty">
              Nessuna notifica disponibile
            </div>
          ) : (
            <NotificationList 
              notifications={notifications} 
              onMarkAsRead={markAsRead} 
            />
          )}
          
          <div className="notification-center__footer">
            <Link 
              to={notificationsLink} 
              className="notification-center__view-all"
              onClick={() => setIsOpen(false)}
            >
              Visualizza tutte le notifiche
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 