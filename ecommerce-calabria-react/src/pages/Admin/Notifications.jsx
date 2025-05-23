import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import './Admin.scss';

const Notifications = () => {
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
      setError('Impossibile caricare le notifiche');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
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
      const now = new Date().toISOString();
      setNotifications(notifications.map(notif => 
        !notif.read_at ? { ...notif, read_at: now } : notif
      ));
    } catch (err) {
      console.error('Errore nel marcare tutte le notifiche come lette:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (err) {
      console.error('Errore nell\'eliminazione della notifica:', err);
    }
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

  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_confirmed':
      case 'App\\Notifications\\OrderConfirmed':
        return '✅';
      case 'order_status_changed':
      case 'App\\Notifications\\OrderStatusChanged':
        return '🔄';
      case 'order_shipped':
        return '📦';
      case 'order_delivered':
        return '🏠';
      case 'App\\Notifications\\SupportTicketCreated':
        return '🎫';
      case 'App\\Notifications\\SupportTicketReply':
        return '💬';
      case 'App\\Notifications\\SupportTicketUserReply':
        return '💬';
      default:
        return '📢';
    }
  };

  const getNotificationLink = (notification) => {
    const { type, data } = notification;
    
    switch (type) {
      case 'order_confirmed':
      case 'order_status_changed':
      case 'App\\Notifications\\OrderConfirmed':
      case 'App\\Notifications\\OrderStatusChanged':
        return `/admin/orders/${data.order_id}`;
      case 'App\\Notifications\\SupportTicketCreated':
      case 'App\\Notifications\\SupportTicketReply':
      case 'App\\Notifications\\SupportTicketUserReply':
        return `/admin/support/${data.ticket_id}`;
      default:
        return '#';
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const hasUnread = notifications.some(notif => !notif.read_at);

  if (loading) {
    return (
      <div className="admin__card">
        <div className="admin__card-body">
          <div className="admin__loading-text">Caricamento notifiche...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin__card">
        <div className="admin__card-body">
          <div className="admin__error">
            <p>{error}</p>
            <button 
              className="admin__button"
              onClick={fetchNotifications}
            >
              Riprova
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin__card">
        <div className="admin__card-header">
          <h2 className="admin__card-title">Le Mie Notifiche</h2>
          <div className="admin__card-actions">
            {hasUnread && (
              <button 
                className="admin__button admin__button--primary" 
                onClick={markAllAsRead}
              >
                Segna tutte come lette
              </button>
            )}
          </div>
        </div>
        
        <div className="admin__tabs">
          <button 
            className={`admin__tab ${activeTab === 'all' ? 'admin__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tutte ({notifications.length})
          </button>
          <button 
            className={`admin__tab ${activeTab === 'unread' ? 'admin__tab--active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Non lette ({notifications.filter(n => !n.read_at).length})
          </button>
          <button 
            className={`admin__tab ${activeTab === 'read' ? 'admin__tab--active' : ''}`}
            onClick={() => setActiveTab('read')}
          >
            Lette ({notifications.filter(n => n.read_at).length})
          </button>
        </div>
        
        <div className="admin__card-body">
          {filteredNotifications.length === 0 ? (
            <div className="admin__empty">
              <p>
                {activeTab === 'unread' 
                  ? 'Non hai notifiche non lette.' 
                  : activeTab === 'read'
                  ? 'Non hai notifiche lette.'
                  : 'Non hai notifiche.'}
              </p>
            </div>
          ) : (
            <div className="admin__notifications-list">
              {filteredNotifications.map(notification => {
                const isUnread = !notification.read_at;
                const link = getNotificationLink(notification);
                
                return (
                  <div 
                    key={notification.id} 
                    className={`admin__notification ${isUnread ? 'admin__notification--unread' : ''}`}
                  >
                    <div className="admin__notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="admin__notification-content">
                      <div className="admin__notification-message">
                        {notification.data.message}
                      </div>
                      <div className="admin__notification-meta">
                        <span className="admin__notification-date">
                          {formatDate(notification.created_at)}
                        </span>
                        {notification.read_at && (
                          <span className="admin__notification-read">
                            Letta il {formatDate(notification.read_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="admin__notification-actions">
                      {link !== '#' && (
                        <Link 
                          to={link}
                          className="admin__notification-action"
                          onClick={() => isUnread && markAsRead(notification.id)}
                        >
                          Visualizza
                        </Link>
                      )}
                      
                      {isUnread && (
                        <button 
                          className="admin__notification-action"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Segna come letta
                        </button>
                      )}
                      
                      <button 
                        className="admin__notification-action admin__notification-action--delete"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 