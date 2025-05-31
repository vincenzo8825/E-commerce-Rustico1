import React from 'react';

// Service Worker Registration per Rustico Calabria
// Gestisce registrazione, aggiornamenti e comunicazione con SW

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(import.meta.env.VITE_PUBLIC_URL || '/', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.VITE_PUBLIC_URL || ''}/sw.js`;

      if (isLocalhost) {
        // In localhost, controlla se SW esiste
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            '[SW] App servita da service worker in cache. ' +
            'Per maggiori informazioni: https://bit.ly/CRA-PWA'
          );
        });
      } else {
        // In produzione, registra semplicemente
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      console.log('[SW] Service worker registrato con successo:', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Nuovo contenuto disponibile, mostra notifica
              console.log('[SW] Nuovo contenuto disponibile, verrà utilizzato al prossimo caricamento.');
              
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
              
              // Mostra notifica di aggiornamento
              showUpdateNotification();
            } else {
              // Contenuto pre-cachato per uso offline
              console.log('[SW] Contenuto cached per uso offline.');
              
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('[SW] Errore durante registrazione service worker:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('[SW] Nessuna connessione internet. App in modalità offline.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
        console.log('[SW] Service worker deregistrato');
      })
      .catch(error => {
        console.error('[SW] Errore durante deregistrazione:', error);
      });
  }
}

// Utilità per comunicare con il service worker
export class ServiceWorkerMessenger {
  static async clearCache() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      return new Promise((resolve, reject) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve();
          } else {
            reject(new Error('Failed to clear cache'));
          }
        };
        
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
        
        // Timeout dopo 5 secondi
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
    }
    throw new Error('Service Worker not available');
  }
  
  static preloadRoute(url) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PRELOAD_ROUTE',
        url: url
      });
    }
  }
  
  static async getOfflineStatus() {
    return !navigator.onLine;
  }
}

// Mostra notifica per aggiornamento app
function showUpdateNotification() {
  // Verifica se è supportata l'API Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Rustico Calabria - Aggiornamento disponibile', {
      body: 'Una nuova versione dell\'app è disponibile. Ricarica la pagina per applicare gli aggiornamenti.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'app-update',
      requireInteraction: true,
      actions: [
        { action: 'update', title: 'Aggiorna ora' },
        { action: 'later', title: 'Più tardi' }
      ]
    });
  } else {
    // Fallback con banner in-app
    showInAppUpdateBanner();
  }
}

function showInAppUpdateBanner() {
  // Rimuovi banner esistente se presente
  const existingBanner = document.getElementById('update-banner');
  if (existingBanner) {
    existingBanner.remove();
  }
  
  // Crea nuovo banner
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.innerHTML = `
    <div style="
      position: fixed; 
      top: 0; 
      left: 0; 
      right: 0; 
      background: #D32F2F; 
      color: white; 
      padding: 12px; 
      text-align: center; 
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <span>🔄 Nuova versione disponibile!</span>
      <button onclick="window.location.reload()" style="
        background: white; 
        color: #D32F2F; 
        border: none; 
        padding: 6px 12px; 
        margin-left: 12px; 
        border-radius: 4px; 
        cursor: pointer;
        font-weight: bold;
      ">
        Aggiorna ora
      </button>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: transparent; 
        color: white; 
        border: 1px solid white; 
        padding: 6px 12px; 
        margin-left: 8px; 
        border-radius: 4px; 
        cursor: pointer;
      ">
        Più tardi
      </button>
    </div>
  `;
  
  document.body.appendChild(banner);
  
  // Auto-rimuovi dopo 30 secondi
  setTimeout(() => {
    if (document.getElementById('update-banner')) {
      banner.remove();
    }
  }, 30000);
}

// Hook React per service worker
export function useServiceWorker() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [isUpdateAvailable, setIsUpdateAvailable] = React.useState(false);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Registra service worker
    register({
      onUpdate: () => setIsUpdateAvailable(true),
      onSuccess: () => console.log('[SW] App ready per uso offline')
    });
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const clearCache = async () => {
    try {
      await ServiceWorkerMessenger.clearCache();
      console.log('[SW] Cache pulita con successo');
    } catch (error) {
      console.error('[SW] Errore pulizia cache:', error);
    }
  };
  
  const preloadRoute = (url) => {
    ServiceWorkerMessenger.preloadRoute(url);
  };
  
  const updateApp = () => {
    window.location.reload();
  };
  
  return {
    isOnline,
    isUpdateAvailable,
    clearCache,
    preloadRoute,
    updateApp
  };
}

// Performance monitoring
export function trackPerformance() {
  if ('performance' in window && 'PerformanceObserver' in window) {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log in console per debugging (in produzione invia a analytics)
        console.log(`[Performance] ${entry.name}:`, entry.value);
      }
    });
    
    // Osserva metriche importanti
    observer.observe({ entryTypes: ['measure', 'navigation'] });
    
    // Largest Contentful Paint
    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('[Performance] LCP:', entry.startTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {
      // Browser non supporta LCP
    }
    
    // First Input Delay
    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('[Performance] FID:', entry.processingStart - entry.startTime);
        }
      }).observe({ entryTypes: ['first-input'] });
    } catch {
      // Browser non supporta FID
    }
  }
}

// Richiedi permessi notifiche
export async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    console.log('[SW] Permesso notifiche:', permission);
    return permission === 'granted';
  }
  return Notification.permission === 'granted';
} 