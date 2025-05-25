import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Notifications.scss';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteOldDays, setDeleteOldDays] = useState(30);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/notifications');
      
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.error('Errore nel caricamento delle notifiche:', error);
      setError('Errore nel caricamento delle notifiche');
    } finally {
      setLoading(false);
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

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/user/notifications/${notificationId}`);
      await fetchNotifications();
    } catch (error) {
      console.error('Errore nell\'eliminare la notifica:', error);
    }
  };

  const deleteOldNotifications = async () => {
    try {
      const response = await api.delete(`/user/notifications/old?days=${deleteOldDays}`);
      if (response.data.success) {
        alert(`${response.data.deleted_count} notifiche vecchie eliminate`);
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Errore nell\'eliminare le notifiche vecchie:', error);
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
      case 'order_confirmed':
      case 'App\\Notifications\\OrderConfirmed':
        return '✅';
      case 'order_status_changed':
      case 'App\\Notifications\\OrderStatusChanged':
        return '🔄';
      case 'new_order':
        return '📦';
      case 'low_stock':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getNotificationLink = (notification) => {
    const { type, data } = notification;
    
    if (!data) return '#';
    
    if (type.includes('Order') || type === 'order_confirmed' || type === 'order_status_changed') {
      return `/dashboard/orders/${data.order_id}`;
    }
    
    if (data.action_url) {
      return data.action_url;
    }
    
    return '#';
  };
  
  const renderNotification = (notification) => {
    const isUnread = !notification.read_at;
    const notificationDate = formatDate(notification.created_at);
    const readDate = notification.read_at ? formatDate(notification.read_at) : null;
    
    const message = notification.data?.message || notification.message || 'Notifica senza messaggio';
    
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
            {message}
          </div>
          
          <div className="notification__actions">
            <a 
              href={getNotificationLink(notification)} 
              className="notification__link" 
              onClick={() => {
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