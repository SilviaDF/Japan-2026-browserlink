/* Japan Travel Companion v72: versioned application-shell cache.
 * Site/PWA uses the current deployment scope; no Firebase/API responses are cached.
 */
const JAPAN_SHELL_CACHE = 'japan2026-v74-explore-shell';
const JAPAN_STATIC_CACHE = 'japan2026-v74-explore-static';
const JAPAN_SHELL_FILES = ['./index.html', './manifest.webmanifest'];
const JAPAN_CDN_HOSTS = new Set([
  'cdn.tailwindcss.com', 'unpkg.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com',
  'fonts.gstatic.com', 'www.gstatic.com'
]);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const shell = await caches.open(JAPAN_SHELL_CACHE);
    // Manifest can be unavailable when opening a standalone test deployment.
    await Promise.allSettled(JAPAN_SHELL_FILES.map(async path => {
      const result = await fetch(new Request(path, {cache: 'reload'}));
      if (result.ok) await shell.put(path, result.clone());
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  // Do not delete older/other app caches: the site may share an origin with
  // other GitHub Pages projects, and a previous app may hold offline content.
  event.waitUntil(self.clients.claim());
});

async function cacheWithNetworkFirst(request, fallbackPath) {
  const shell = await caches.open(JAPAN_SHELL_CACHE);
  try {
    const result = await fetch(request);
    if (result.ok) await shell.put(request, result.clone());
    return result;
  } catch (error) {
    return (await shell.match(request)) || (await shell.match(fallbackPath)) ||
      Response.error();
  }
}
async function cacheStatic(request) {
  const cache = await caches.open(JAPAN_STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') {
    try { await cache.put(request, response.clone()); } catch (_) { /* no quota */ }
  }
  return response;
}
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate' || /\/index\.html$/.test(url.pathname)) {
      event.respondWith(cacheWithNetworkFirst(request, './index.html'));
      return;
    }
    // Icons and manifest are small app resources.
    if (/\.(png|webp|svg|ico|webmanifest|css|js)$/.test(url.pathname)) {
      event.respondWith(cacheStatic(request));
    }
    return;
  }
  // Only cache fixed frontend dependencies; never cache Firestore, API traffic,
  // user photographs, map tiles, geocoding, or Google Maps responses.
  if (JAPAN_CDN_HOSTS.has(url.hostname)) {
    event.respondWith(cacheStatic(request));
  }
});
