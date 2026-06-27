// Service worker mínimo: cachea el caparazón para que cargue en conexiones malas.
// Estrategia: network-first para la API (datos frescos), cache-first para estáticos.
// Sube el número de versión (esv-vN) para forzar refresco tras un despliegue.
const CACHE = 'esv-v2';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;            // nunca cachear POST
  if (url.pathname.startsWith('/api/')) return;       // datos: red primero, sin caché
  if (url.pathname.startsWith('/admin')) return;      // panel de moderación: siempre fresco
  if (url.pathname.startsWith('/uploads/')) {
    // fotos: cache-first (son inmutables)
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(e.request); if (hit) return hit;
      const res = await fetch(e.request); if (res.ok) c.put(e.request, res.clone()); return res;
    }));
    return;
  }
  // caparazón: cache-first con respaldo a red
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok && url.origin === location.origin) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
    return res;
  }).catch(() => caches.match('/index.html'))));
});
