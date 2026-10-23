// Service worker del Calendario de comidas.
// Su alcance es solo la carpeta donde está este archivo (el repositorio de la app).
const CACHE = 'calendario-comidas-v3';
const ARCHIVOS = ['./', 'index.html', 'manifest.json', 'iconos/icon-192.png', 'iconos/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('calendario-comidas-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(new URL('./', self.location).pathname)) return;
  e.respondWith(
    fetch(req)
      .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('index.html')))
  );
});
