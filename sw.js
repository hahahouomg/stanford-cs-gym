const PREFIX = 'stanford-cs-gym-';
const CACHE = `${PREFIX}v5`;
const CORE = [
  './', './index.html', './assets/styles.css', './assets/app.js',
  './assets/hub.js', './assets/labs.js', './assets/linear-lab.js',
  './data/catalog.js', './data/knowledge.js',
  './assets/vendor/three/three.module.min.js', './assets/vendor/three/three.core.min.js',
  './assets/vendor/three/OrbitControls.js',
  './data/curriculum.js', './assets/icon.svg', './assets/apple-touch-icon.png',
  './assets/icon-192.png', './assets/icon-512.png', './manifest.webmanifest',
  './assets/vendor/mathlive/mathlive.min.js',
  './assets/vendor/mathlive/mathlive-fonts.css',
  ...[
    'AMS-Regular', 'Caligraphic-Bold', 'Caligraphic-Regular', 'Fraktur-Bold',
    'Fraktur-Regular', 'Main-Bold', 'Main-BoldItalic', 'Main-Italic', 'Main-Regular',
    'Math-BoldItalic', 'Math-Italic', 'SansSerif-Bold', 'SansSerif-Italic',
    'SansSerif-Regular', 'Script-Regular', 'Size1-Regular', 'Size2-Regular',
    'Size3-Regular', 'Size4-Regular', 'Typewriter-Regular'
  ].map(name => `./assets/vendor/mathlive/fonts/KaTeX_${name}.woff2`)
];
const CORE_URLS = new Set(CORE.map(path => new URL(path, self.location.href).href));

self.addEventListener('install', event => {
  // All-or-nothing: the new worker cannot activate with missing scripts or fonts.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(
    CORE.map(path => new Request(new URL(path, self.location.href), {cache:'reload'}))
  )));
  // Updates wait for an explicit refresh, preserving the open page's asset version.
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'GET_VERSION') event.ports[0]?.postMessage({version:CACHE});
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (event.request.mode !== 'navigate' && !CORE_URLS.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Cache-first keeps HTML, modules and the pinned library from the same release.
    const cached = event.request.mode === 'navigate'
      ? await cache.match(new URL('./index.html', self.location.href))
      : await cache.match(event.request);
    return cached || fetch(event.request);
  })());
});
