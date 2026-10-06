// Plume : lecture hors connexion. On garde la coque de l'appli et les images ; les données (comptes, histoires) passent toujours par le réseau.
const V = 'plume-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then((c) => c.addAll(['/', '/manifest.webmanifest'])).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// La page demande de mettre en cache ses propres fichiers dès que le service est actif.
self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type !== 'warm' || !Array.isArray(d.urls)) return;
  e.waitUntil(caches.open(V).then((c) => Promise.all(d.urls.map((u) =>
    fetch(u).then((r) => { if (r.ok) c.put(u, r); }).catch(() => {})))));
});

const staleWhileRevalidate = (req) =>
  caches.open(V).then((c) => c.match(req).then((hit) => {
    const net = fetch(req).then((r) => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === self.location.origin) {
    if (u.pathname.startsWith('/api/')) return;              // jamais le coach IA
    if (r.mode === 'navigate') {                             // page : le réseau d'abord, sinon la copie
      e.respondWith(
        fetch(r).then((res) => { const cp = res.clone(); caches.open(V).then((c) => c.put('/', cp)); return res; })
          .catch(() => caches.match('/'))
      );
      return;
    }
    e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((res) => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); }
      return res;
    })));
    return;
  }
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com' || u.pathname.includes('/storage/v1/object/public/covers/')) {
    e.respondWith(staleWhileRevalidate(r));
  }
});
