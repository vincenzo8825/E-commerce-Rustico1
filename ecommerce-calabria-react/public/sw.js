// Service Worker per Rustico Calabria PWA
// Cache strategy ottimizzata per e-commerce

const CACHE_NAME = 'rustico-calabria-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';
const IMAGE_CACHE = 'images-v1.0.0';
const API_CACHE = 'api-v1.0.0';

// Risorse da cachare immediatamente (App Shell)
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/images/logo.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/offline.html'
];

// Pattern API da cachare
const API_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/reviews/
];

// Pattern immagini da cachare
const IMAGE_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\/images\//,
  /\/uploads\//
];

// ================================
// SERVICE WORKER LIFECYCLE
// ================================

// Install Event - Cache risorse statiche
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

// Activate Event - Cleanup vecchie cache
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// ================================
// FETCH STRATEGY
// ================================

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Strategia basata sul tipo di risorsa
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (isAPIRequest(request)) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
  } else if (isNavigationRequest(request)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// ================================
// CACHE STRATEGIES
// ================================

// Cache First - Per risorse statiche
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first error:', error);
    return getOfflineFallback(request);
  }
}

// Network First - Per contenuto dinamico
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return getOfflineFallback(request);
  }
}

// Stale While Revalidate - Per API dinamiche
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      console.log('[SW] Network request failed:', error);
      return cachedResponse;
    });

  return cachedResponse || fetchPromise;
}

// ================================
// HELPER FUNCTIONS
// ================================

function isStaticAsset(request) {
  return request.url.includes('/static/') ||
         request.url.includes('.js') ||
         request.url.includes('.css') ||
         request.url.includes('manifest.json');
}

function isImageRequest(request) {
  return IMAGE_PATTERNS.some(pattern => pattern.test(request.url));
}

function isAPIRequest(request) {
  return API_PATTERNS.some(pattern => pattern.test(request.url));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && 
          request.headers.get('accept').includes('text/html'));
}

async function getOfflineFallback(request) {
  if (isNavigationRequest(request)) {
    const offlineHtml = await caches.match('/offline.html');
    return offlineHtml || new Response('Offline', { status: 503 });
  }
  
  if (isImageRequest(request)) {
    const placeholderImage = await caches.match('/images/offline-placeholder.png');
    return placeholderImage || new Response('Image offline', { status: 503 });
  }
  
  return new Response('Offline', { status: 503 });
}

// ================================
// BACKGROUND SYNC
// ================================

// Gestione background sync per carrello e ordini offline
self.addEventListener('sync', event => {
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData());
  }
  
  if (event.tag === 'order-sync') {
    event.waitUntil(syncOrderData());
  }
  
  if (event.tag === 'favorites-sync') {
    event.waitUntil(syncFavoritesData());
  }
});

async function syncCartData() {
  try {
    console.log('[SW] Syncing cart data...');
    // Recupera dati carrello da IndexedDB
    const cartData = await getFromIndexedDB('cart');
    if (cartData && cartData.length > 0) {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartData })
      });
      
      if (response.ok) {
        await clearFromIndexedDB('cart');
        console.log('[SW] Cart data synced successfully');
      }
    }
  } catch (error) {
    console.error('[SW] Cart sync failed:', error);
  }
}

async function syncOrderData() {
  try {
    console.log('[SW] Syncing order data...');
    const orderData = await getFromIndexedDB('pending-orders');
    if (orderData && orderData.length > 0) {
      for (const order of orderData) {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          await removeFromIndexedDB('pending-orders', order.id);
        }
      }
      console.log('[SW] Order data synced successfully');
    }
  } catch (error) {
    console.error('[SW] Order sync failed:', error);
  }
}

async function syncFavoritesData() {
  try {
    console.log('[SW] Syncing favorites data...');
    const favoritesData = await getFromIndexedDB('favorites');
    if (favoritesData && favoritesData.length > 0) {
      const response = await fetch('/api/favorites/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites: favoritesData })
      });
      
      if (response.ok) {
        await clearFromIndexedDB('favorites');
        console.log('[SW] Favorites synced successfully');
      }
    }
  } catch (error) {
    console.error('[SW] Favorites sync failed:', error);
  }
}

// ================================
// INDEXEDDB HELPERS
// ================================

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RusticoCalabria', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('cart')) {
        db.createObjectStore('cart', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pending-orders')) {
        db.createObjectStore('pending-orders', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('favorites')) {
        db.createObjectStore('favorites', { keyPath: 'id' });
      }
    };
  });
}

async function getFromIndexedDB(storeName) {
  const db = await openIndexedDB();
  const transaction = db.transaction([storeName], 'readonly');
  const store = transaction.objectStore(storeName);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function clearFromIndexedDB(storeName) {
  const db = await openIndexedDB();
  const transaction = db.transaction([storeName], 'readwrite');
  const store = transaction.objectStore(storeName);
  
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removeFromIndexedDB(storeName, id) {
  const db = await openIndexedDB();
  const transaction = db.transaction([storeName], 'readwrite');
  const store = transaction.objectStore(storeName);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// ================================
// PUSH NOTIFICATIONS
// ================================

self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/badge-72x72.png',
    image: data.image,
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'Visualizza',
        icon: '/images/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Chiudi',
        icon: '/images/icons/action-close.png'
      }
    ],
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestione click notifiche
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

console.log('[SW] Service Worker loaded successfully'); 