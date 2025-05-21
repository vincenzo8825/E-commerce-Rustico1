import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import NotificationList from './NotificationList';
import './NotificationCenter.scss';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchNotifications();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento delle notifiche:', err);
      setError('Impossibile caricare le notifiche');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      
      // Aggiorna lo stato locale
      setNotifications(notifications.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read_at: new Date().toISOString() } 
          : notif
      ));
      
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error('Errore nel marcare la notifica come letta:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      
      // Aggiorna lo stato locale
      const now = new Date().toISOString();
      setNotifications(notifications.map(notif => 
        !notif.read_at 
          ? { ...notif, read_at: now } 
          : notif
      ));
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Errore nel marcare tutte le notifiche come lette:', err);
    }
  };

  if (!isAuthenticated()) {
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
              to="/dashboard/notifications" 
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