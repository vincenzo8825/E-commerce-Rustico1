const CACHE_NAME = 'sapori-calabria-v1';
const RUNTIME_CACHE = 'runtime-cache';

// Risorse da precaricare
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/css/main.chunk.css',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/media/logo.png',
  '/offline.html'
];

// Installazione del service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Precaching assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Attivazione del service worker
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  
  // Rimuovi cache vecchie
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Strategia di caching per le richieste
self.addEventListener('fetch', event => {
  // Solo GET richieste
  if (event.request.method !== 'GET') return;
  
  // Ignora le richieste API 
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Cache hit - ritorna la risorsa dalla cache
        return cachedResponse;
      }

      // Cache miss - recupera la risorsa dalla rete
      return caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(event.request).then(response => {
          // Salva una copia della risposta in cache
          if (response.status === 200) {
            const responseToCache = response.clone();
            cache.put(event.request, responseToCache);
          }
          return response;
        }).catch(error => {
          // Se la richiesta fallisce (es. offline)
          console.log('Fetch fallito; ritorno pagina offline', error);
          
          // Per le richieste HTML, restituisci la pagina offline
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
          
          // Per le immagini, restituisci un'immagine placeholder
          if (event.request.headers.get('accept').includes('image')) {
            return caches.match('/images/offline-image.png');
          }
          
          // Per altre risorse, restituisci una risposta vuota
          return new Response('', { status: 408, statusText: 'Offline' });
        });
      });
    })
  );
});

// Gestione dei messaggi 
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 