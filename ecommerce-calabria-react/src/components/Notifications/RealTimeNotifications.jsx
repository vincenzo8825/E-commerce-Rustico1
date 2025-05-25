import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../utils/api';

const RealTimeNotifications = ({ 
  onNewNotification, 
  children, 
  enableBrowserNotifications = true,
  pollInterval = 15000, // 15 secondi default
  fastPollInterval = 5000 // 5 secondi per modalità veloce
}) => {
  const [isPolling, setIsPolling] = useState(false);
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [notificationCount, setNotificationCount] = useState(0);
  const [isFastMode, setIsFastMode] = useState(false);
  
  const intervalRef = useRef(null);
  const isWindowFocused = useRef(true);
  const hasPermission = useRef(false);

  // Richiedi permessi per notifiche browser
  useEffect(() => {
    if (enableBrowserNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          hasPermission.current = permission === 'granted';
        });
      } else {
        hasPermission.current = Notification.permission === 'granted';
      }
    }
  }, [enableBrowserNotifications]);

  // Gestisce focus/blur della finestra per ottimizzare polling
  useEffect(() => {
    const handleFocus = () => {
      isWindowFocused.current = true;
      setIsFastMode(false); // Disattiva modalità veloce quando la finestra è in focus
    };

    const handleBlur = () => {
      isWindowFocused.current = false;
      setIsFastMode(true); // Attiva modalità veloce quando la finestra non è in focus
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Mostra notifica browser
  const showBrowserNotification = useCallback((notification) => {
    if (!enableBrowserNotifications || !hasPermission.current || isWindowFocused.current) {
      return;
    }

    const title = notification.title || 'Nuova Notifica';
    const options = {
      body: notification.message || notification.data?.message || '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `notification-${notification.id}`,
      requireInteraction: notification.type === 'critical'
    };

    const browserNotification = new Notification(title, options);

    // Auto-chiudi dopo 5 secondi se non è critica
    if (notification.type !== 'critical') {
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }

    // Gestisce click su notifica
    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
      
      // Callback personalizzato se fornito
      if (onNewNotification) {
        onNewNotification(notification);
      }
    };
  }, [enableBrowserNotifications, onNewNotification]);

  // Controlla nuove notifiche
  const checkForNewNotifications = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      
      const response = await api.get('/user/notifications', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.data.success) {
        const notifications = response.data.data || [];
        
        setConnectionStatus('connected');
        setNotificationCount(prev => prev + notifications.length);

        // Processa ogni nuova notifica
        notifications.forEach(notification => {
          // Mostra notifica browser per eventi critici
          if (notification.type === 'critical' || notification.priority === 'high') {
            showBrowserNotification(notification);
          }

          // Callback personalizzato
          if (onNewNotification) {
            onNewNotification(notification);
          }

          // Aggiorna ultimo ID
          if (!lastNotificationId || notification.id > lastNotificationId) {
            setLastNotificationId(notification.id);
          }
        });

        // Attiva modalità veloce se ci sono notifiche critiche
        const hasCritical = notifications.some(n => n.type === 'critical');
        if (hasCritical && !isWindowFocused.current) {
          setIsFastMode(true);
        }
      }
    } catch (error) {
      console.error('Errore nel controllo notifiche:', error);
      setConnectionStatus('error');
      
      // Riprova con modalità veloce in caso di errore
      if (!isFastMode) {
        setIsFastMode(true);
      }
    }
  }, [lastNotificationId, onNewNotification, showBrowserNotification, isFastMode]);

  // Avvia/ferma polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const currentInterval = isFastMode ? fastPollInterval : pollInterval;
    
    intervalRef.current = setInterval(() => {
      checkForNewNotifications();
    }, currentInterval);

    setIsPolling(true);
  }, [checkForNewNotifications, isFastMode, fastPollInterval, pollInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Gestisce cambiamenti modalità polling
  useEffect(() => {
    if (isPolling) {
      stopPolling();
      startPolling();
    }
  }, [isFastMode, isPolling, startPolling, stopPolling]);

  // Avvia polling al mount
  useEffect(() => {
    startPolling();
    
    // Controllo iniziale immediato
    checkForNewNotifications();

    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, checkForNewNotifications]);

  // Metodi pubblici esposti tramite render prop
  const methods = {
    startPolling,
    stopPolling,
    checkNow: checkForNewNotifications,
    resetCounter: () => setNotificationCount(0),
    setFastMode: setIsFastMode,
    isPolling,
    connectionStatus,
    notificationCount,
    isFastMode
  };

  // Render prop pattern
  if (typeof children === 'function') {
    return children(methods);
  }

  // Indicatore di stato di default
  return (
    <div className="real-time-notifications">
      <div className={`connection-indicator ${connectionStatus}`}>
        <span className={`status-dot ${connectionStatus}`}></span>
        <span className="status-text">
          {connectionStatus === 'connected' && 'Connesso'}
          {connectionStatus === 'connecting' && 'Connessione...'}
          {connectionStatus === 'error' && 'Errore connessione'}
          {connectionStatus === 'disconnected' && 'Disconnesso'}
        </span>
        {isFastMode && <span className="fast-mode-indicator">⚡</span>}
      </div>
      
      {notificationCount > 0 && (
        <div className="notification-counter">
          {notificationCount} nuove notifiche
        </div>
      )}
      
      <div className="polling-controls">
        <button 
          onClick={isPolling ? stopPolling : startPolling}
          className={`polling-toggle ${isPolling ? 'active' : ''}`}
        >
          {isPolling ? 'Ferma' : 'Avvia'} Notifiche
        </button>
        <button 
          onClick={checkForNewNotifications}
          className="check-now-btn"
          disabled={connectionStatus === 'connecting'}
        >
          Controlla Ora
        </button>
      </div>
    </div>
  );
};

// Hook personalizzato per notifiche real-time
export const useRealTimeNotifications = (options = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNewNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    handleNewNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    // Componente RealTimeNotifications preconfigurato
    NotificationProvider: ({ children }) => (
      <RealTimeNotifications
        onNewNotification={handleNewNotification}
        {...options}
      >
        {children}
      </RealTimeNotifications>
    )
  };
};

export default RealTimeNotifications; 