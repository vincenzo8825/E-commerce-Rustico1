import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import './NotificationsPage.scss';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
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
      setError(null);
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
        !notif.read_at ? { ...notif, read_at: now } : notif
      ));
    } catch (err) {
      console.error('Errore nel marcare tutte le notifiche come lette:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa notifica?')) {
      try {
        await api.delete(`/notifications/${notificationId}`);
        
        // Rimuovi la notifica dallo stato locale
        setNotifications(notifications.filter(notif => notif.id !== notificationId));
      } catch (err) {
        console.error('Errore nell\'eliminazione della notifica:', err);
      }
    }
  };

  const deleteAllRead = async () => {
    if (window.confirm('Sei sicuro di voler eliminare tutte le notifiche lette?')) {
      try {
        await api.delete('/notifications/read');
        
        // Rimuovi le notifiche lette dallo stato locale
        setNotifications(notifications.filter(notif => !notif.read_at));
      } catch (err) {
        console.error('Errore nell\'eliminazione delle notifiche lette:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(notif => !notif.read_at);
      case 'read':
        return notifications.filter(notif => notif.read_at);
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_confirmed':
        return '✅';
      case 'order_status_changed':
        return '🔄';
      case 'order_shipped':
        return '📦';
      case 'order_delivered':
        return '🏠';
      case 'review_published':
        return '⭐';
      case 'account_verified':
        return '🔐';
      case 'price_drop':
        return '💰';
      case 'product_back_in_stock':
        return '📋';
      default:
        return '📢';
    }
  };

  const getNotificationLink = (type, data) => {
    switch (type) {
      case 'order_confirmed':
      case 'order_status_changed':
      case 'order_shipped':
      case 'order_delivered':
        return `/dashboard/orders/${data.order_id}`;
      case 'review_published':
        return `/products/${data.product_slug}#reviews`;
      case 'price_drop':
      case 'product_back_in_stock':
        return `/products/${data.product_slug}`;
      default:
        return '#';
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const hasUnread = notifications.some(notif => !notif.read_at);
  const hasRead = notifications.some(notif => notif.read_at);

  if (!isAuthenticated()) {
    return (
      <div className="notifications-page">
        <div className="notifications-page__container">
          <div className="notifications-page__login-required">
            <h2>Accedi per visualizzare le tue notifiche</h2>
            <p>Devi effettuare l'accesso per poter visualizzare le tue notifiche.</p>
            <a href="/login?redirect=/dashboard/notifications" className="notifications-page__login-button">
              Accedi
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-page__container">
        <div className="notifications-page__header">
          <h1 className="notifications-page__title">Le Mie Notifiche</h1>
          
          <div className="notifications-page__actions">
            {hasUnread && (
              <button 
                className="notifications-page__action-button notifications-page__action-button--primary" 
                onClick={markAllAsRead}
              >
                Segna tutte come lette
              </button>
            )}
            
            {hasRead && (
              <button 
                className="notifications-page__action-button notifications-page__action-button--secondary" 
                onClick={deleteAllRead}
              >
                Elimina notifiche lette
              </button>
            )}
          </div>
        </div>
        
        <div className="notifications-page__tabs">
          <button 
            className={`notifications-page__tab ${activeTab === 'all' ? 'notifications-page__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tutte
          </button>
          <button 
            className={`notifications-page__tab ${activeTab === 'unread' ? 'notifications-page__tab--active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Non lette
          </button>
          <button 
            className={`notifications-page__tab ${activeTab === 'read' ? 'notifications-page__tab--active' : ''}`}
            onClick={() => setActiveTab('read')}
          >
            Lette
          </button>
        </div>
        
        {loading ? (
          <div className="notifications-page__loading">
            Caricamento notifiche...
          </div>
        ) : error ? (
          <div className="notifications-page__error">
            <p>{error}</p>
            <button 
              className="notifications-page__button"
              onClick={fetchNotifications}
            >
              Riprova
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-page__empty">
            <p>
              {activeTab === 'unread' 
                ? 'Non hai notifiche non lette.' 
                : activeTab === 'read'
                ? 'Non hai notifiche lette.'
                : 'Non hai notifiche.'}
            </p>
          </div>
        ) : (
          <div className="notifications-page__list">
            {filteredNotifications.map(notification => {
              const isUnread = !notification.read_at;
              const link = getNotificationLink(notification.type, notification.data);
              
              return (
                <div 
                  key={notification.id} 
                  className={`notification-card ${isUnread ? 'notification-card--unread' : ''}`}
                >
                  <div className="notification-card__icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-card__content">
                    <div className="notification-card__message">
                      {notification.data.message}
                    </div>
                    
                    <div className="notification-card__meta">
                      <div className="notification-card__time">
                        {formatDate(notification.created_at)}
                      </div>
                      
                      {!isUnread && (
                        <div className="notification-card__read-at">
                          Letta il: {formatDate(notification.read_at)}
                        </div>
                      )}
                    </div>
                    
                    <div className="notification-card__actions">
                      <a 
                        href={link} 
                        className="notification-card__action notification-card__action--view"
                        onClick={() => isUnread && markAsRead(notification.id)}
                      >
                        Visualizza
                      </a>
                      
                      {isUnread && (
                        <button 
                          className="notification-card__action notification-card__action--mark-read"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Segna come letta
                        </button>
                      )}
                      
                      <button 
                        className="notification-card__action notification-card__action--delete"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage; 