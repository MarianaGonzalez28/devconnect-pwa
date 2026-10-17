// sw.js - Service Worker Completo con Precaché e Intercepción Fetch

const CACHE_NAME = 'mariana-devconnect-shell-v3';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/manifest.json',
    '/images/tulipan192.png',
    '/images/tulipan512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// FASE DE INSTALACIÓN (Precaché del App Shell)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Guardando recursos estáticos en la caché...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('SW: Todos los archivos fueron almacenados.');
                return self.skipWaiting();
            })
    );
});

// FASE DE ACTIVACIÓN (Toma de control y limpieza)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// FASE FETCH: Estrategia Cache First (Caché primero con respaldo en Red)
self.addEventListener('fetch', event => {
    // Ignora extensiones de Chrome para evitar errores raros
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request)
            .then(responseInCache => {
                // 1. Si está en caché, lo entrega desde el disco
                if (responseInCache) {
                    console.log('SW: Sirviendo desde Caché ->', event.request.url);
                    return responseInCache;
                }

                // 2. Si no está en caché, lo busca en internet
                console.log('SW: No está en caché. Buscando en Red ->', event.request.url);
                return fetch(event.request);
            })
            .catch(error => {
                console.error('SW: Error en fetch y recurso no disponible en caché:', error);
            })
    );
});