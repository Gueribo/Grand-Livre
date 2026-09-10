// Grand Livre — service worker
// Caches the app shell so the app opens and works fully offline after the
// first visit, and opportunistically caches everything else it fetches
// (Google Fonts, the jsPDF library) so those keep working offline too.

const CACHE_NAME = "grand-livre-v12";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // cache.addAll() is all-or-nothing: if a single resource fails to
      // fetch during install (a flaky connection, say), the WHOLE app shell
      // — index.html included — silently ends up uncached, so there is
      // nothing to fall back to later when offline. Cache each resource
      // independently instead, so one failure can't sink the rest.
      return Promise.all(
        APP_SHELL.map((url) =>
          fetch(url)
            .then((response) => { if (response && response.status === 200) return cache.put(url, response); })
            .catch(() => {})
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate: answer instantly from cache when possible, and
// refresh the cache in the background whenever the network is reachable.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const isNavigation = event.request.mode === "navigate";

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          // Offline, or GitHub Pages unreachable: an exact cache hit for
          // this request wins if we have one, but for a page navigation
          // (e.g. the pull-to-refresh gesture) that misses, fall back to
          // the cached app shell itself — otherwise the browser is left to
          // show its own or GitHub's error page instead of the app.
          if (cached) return cached;
          if (isNavigation) return caches.match("./index.html").then((shell) => shell || Response.error());
          return Response.error();
        });
      return cached || network;
    })
  );
});
