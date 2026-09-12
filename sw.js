// Grand Livre — service worker
// Caches the app shell so the app opens and works fully offline after the
// first visit, and opportunistically caches everything else it fetches
// (Google Fonts, the jsPDF library) so those keep working offline too.
//
// Updates are manual only: a newly installed worker parks itself in the
// "waiting" state and does nothing else until the app's own "Mettre à jour"
// button tells it (via postMessage) to skip waiting and take over. Nothing
// here ever activates a new version, refreshes cached content, or triggers
// a reload on its own.

const CACHE_NAME = "grand-livre-v14";

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
    })
    // No self.skipWaiting() here on purpose: the new worker installs and
    // then waits, inert, until the page explicitly asks it to take over.
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

// The only way a waiting worker is ever told to activate: the app's
// "Mettre à jour" button, never anything automatic.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

// Cache-first, and nothing refreshes silently in the background: once a
// file is cached it is served as-is, request after request, until the
// person explicitly updates the app. Only a resource that isn't cached yet
// (a font, the PDF library, the first time they're used) goes to the
// network — and if that fails, a page navigation falls back to the cached
// app shell rather than showing a browser or GitHub error page.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const isNavigation = event.request.mode === "navigate";

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          }
          // fetch() only REJECTS on a true network failure (offline, DNS,
          // connection refused). A server that still answers — e.g. GitHub
          // Pages returning its own branded 404 during a deploy or a brief
          // outage — resolves normally here with a non-200 status, so it
          // never reaches the .catch() below. Treat it the same as a
          // network failure for a page navigation: never hand that error
          // page to the browser.
          if (isNavigation) return caches.match("./index.html").then((shell) => shell || response);
          return response;
        })
        .catch(() => {
          if (isNavigation) return caches.match("./index.html").then((shell) => shell || Response.error());
          return Response.error();
        });
    })
  );
});
