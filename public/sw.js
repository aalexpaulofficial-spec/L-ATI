/* ============================================================
   LIGHTNING ATI — Service Worker
   Caches the app shell so the UI works fully offline.
   API calls (/api/*) always go to the network.
   ============================================================ */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `lightning-ati-${CACHE_VERSION}`;

/* Resources to pre-cache on install */
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/assets/brand/jc-lightning-ati-bw.png',
  '/assets/brand/emblem.webp',
  '/assets/brand/emblem-180.png',
  '/assets/brand/og-card.jpg',
];

/* ── Install: pre-cache shell ────────────────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: purge old caches ─────────────────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: cache-first for static, network-first for API ── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* Always bypass the SW for API routes */
  if (url.pathname.startsWith('/api/')) return;

  /* Skip non-GET requests */
  if (request.method !== 'GET') return;

  /* Navigation requests: serve cached shell, fall back to network */
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/').then(
        (cached) =>
          cached ||
          fetch(request).catch(
            () => new Response('Offline — open the app while connected first.', { status: 503 })
          )
      )
    );
    return;
  }

  /* Static assets: cache-first, cache on miss */
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (
            response.ok &&
            request.method === 'GET' &&
            !url.pathname.startsWith('/api/')
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          /* Return a transparent 1×1 PNG for failed image requests */
          if (request.destination === 'image') {
            return new Response(
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
              { headers: { 'Content-Type': 'image/png' } }
            );
          }
        });
    })
  );
});
