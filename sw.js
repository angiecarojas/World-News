const cacheName = 'news-M4U-static';
const staticAssets = [
  './',
  './app.js',
  './styles.css',
  './fallback.json',
  './images/fetch-dog.jpg'
];

//almacenar todo en caché en la primera ejecución
self.addEventListener('install', async function () {
  const cache = await caches.open(cacheName);
  cache.addAll(staticAssets);
  self.skipWaiting();
});

// Espera a que se active el SW
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});



//obtener datos de la memoria caché o de la red: esto permite ver el chache antes de descargar cualquier cosa de la Web
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});


async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);
}

async function networkFirst(request) {
  const dynamicCache = await caches.open('news-dynamic');
  try {
    const networkResponse = await fetch(request);
    dynamicCache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (err) {
    //Si no hay conexión y activos almacenados en caché
    const cachedResponse = await dynamicCache.match(request);
    return cachedResponse || await caches.match('./fallback.json');
  }
}

// Push click
self.addEventListener('notificationclick', function(event) {
  console.log('Notification click Received.', event);
  //Al hacer clic en cerrar la notificación y abrir una nueva ventana en el navegador
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://www.media4u.pl')
  );
});
