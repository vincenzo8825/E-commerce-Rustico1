import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Notifications.scss';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteOldDays, setDeleteOldDays] = useState(30);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error('Errore nel caricamento delle notifiche:', err);
      setError('Impossibile caricare le notifiche. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
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
    } catch (err) {
      console.error('Errore nel marcare tutte le notifiche come lette:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      
      // Aggiorna lo stato locale
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (err) {
      console.error('Errore nell\'eliminazione della notifica:', err);
    }
  };

  const deleteOldNotifications = async () => {
    try {
      const response = await api.delete(`/notifications/old?days=${deleteOldDays}`);
      
      // Aggiorna lo stato locale dopo aver eliminato le notifiche vecchie
      await fetchNotifications();
      
      alert(`${response.data.count} notifiche vecchie eliminate con successo.`);
    } catch (err) {
      console.error('Errore nell\'eliminazione delle notifiche vecchie:', err);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'App\\Notifications\\OrderConfirmed':
        return '✅';
      case 'App\\Notifications\\OrderStatusChanged':
        return '🔄';
      default:
        return '📢';
    }
  };

  const getNotificationLink = (notification) => {
    const { type, data } = notification;
    
    if (type.includes('Order')) {
      return `/dashboard/orders/${data.order_id}`;
    }
    
    return '#';
  };
  
  const renderNotification = (notification) => {
    const isUnread = !notification.read_at;
    const notificationDate = formatDate(notification.created_at);
    const readDate = notification.read_at ? formatDate(notification.read_at) : null;
    
    return (
      <div 
        key={notification.id} 
        className={`notification ${isUnread ? 'notification--unread' : ''}`}
      >
        <div className="notification__icon">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="notification__content">
          <div className="notification__header">
            <span className="notification__date">{notificationDate}</span>
            {readDate && (
              <span className="notification__read-date">
                Letta il {readDate}
              </span>
            )}
          </div>
          
          <div className="notification__message">
            {notification.data.message}
          </div>
          
          <div className="notification__actions">
            <a 
              href={getNotificationLink(notification)} 
              className="notification__link" 
              onClick={(e) => {
                if (isUnread) {
                  markAsRead(notification.id);
                }
              }}
            >
              Visualizza dettagli
            </a>
            
            {isUnread && (
              <button 
                className="notification__action notification__action--read"
                onClick={() => markAsRead(notification.id)}
              >
                Segna come letta
              </button>
            )}
            
            <button 
              className="notification__action notification__action--delete"
              onClick={() => deleteNotification(notification.id)}
            >
              Elimina
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="notifications-page">
      <div className="notifications-page__header">
        <h1 className="notifications-page__title">Le mie notifiche</h1>
        
        <div className="notifications-page__actions">
          {unreadCount > 0 && (
            <button 
              className="notifications-page__action" 
              onClick={markAllAsRead}
            >
              Segna tutte come lette ({unreadCount})
            </button>
          )}
          
          <div className="notifications-page__delete-old">
            <input
              type="number"
              min="1"
              value={deleteOldDays}
              onChange={(e) => setDeleteOldDays(e.target.value)}
              className="notifications-page__days-input"
            />
            <button 
              className="notifications-page__action"
              onClick={deleteOldNotifications}
            >
              Elimina notifiche vecchie
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="notifications-page__loading">
          Caricamento notifiche...
        </div>
      ) : error ? (
        <div className="notifications-page__error">
          <p>{error}</p>
          <button 
            className="notifications-page__action"
            onClick={fetchNotifications}
          >
            Riprova
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="notifications-page__empty">
          Non hai notifiche da visualizzare.
        </div>
      ) : (
        <div className="notifications-page__list">
          {notifications.map(renderNotification)}
        </div>
      )}
    </div>
  );
};

export default Notifications; 