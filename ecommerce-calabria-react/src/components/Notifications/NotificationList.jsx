import React from 'react';
import { Link } from 'react-router-dom';
import './NotificationList.scss';

const NotificationList = ({ notifications, onMarkAsRead }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // differenza in secondi
    
    if (diff < 60) {
      return 'Adesso';
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} ${minutes === 1 ? 'minuto' : 'minuti'} fa`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} ${hours === 1 ? 'ora' : 'ore'} fa`;
    } else if (diff < 604800) {
      const days = Math.floor(diff / 86400);
      return `${days} ${days === 1 ? 'giorno' : 'giorni'} fa`;
    } else {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('it-IT', options);
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

  const getNotificationLink = (notification) => {
    const { type, data } = notification;
    
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

  return (
    <div className="notification-list">
      {notifications.map(notification => {
        const isUnread = !notification.read_at;
        const notificationLink = getNotificationLink(notification);
        
        return (
          <div 
            key={notification.id} 
            className={`notification-item ${isUnread ? 'notification-item--unread' : ''}`}
          >
            <Link 
              to={notificationLink}
              className="notification-item__content"
              onClick={() => isUnread && onMarkAsRead(notification.id)}
            >
              <div className="notification-item__icon">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="notification-item__details">
                <div className="notification-item__message">
                  {notification.data.message}
                </div>
                <div className="notification-item__time">
                  {formatTime(notification.created_at)}
                </div>
              </div>
            </Link>
            
            {isUnread && (
              <button 
                className="notification-item__mark-read"
                onClick={() => onMarkAsRead(notification.id)}
                title="Segna come letta"
              >
                ✓
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NotificationList; 