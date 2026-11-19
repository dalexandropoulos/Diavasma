/* Diavasma Service Worker - Offline Shell & Font Caching */
const CACHE_NAME = "diavasma-shell-v4";
const FONT_CACHE = "reading-room-fonts-v1";

const PRECACHE_URLS = [
  "./",
  "./Diavasma.html",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "./pdf.min.js",
  "./pdf.worker.min.js"
];

// Install: precache app shell
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("[SW] Precache partial error (ignored):", err);
      });
    })
  );
});

// Activate: clean up outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME && k !== FONT_CACHE) {
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: smart caching strategy
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests
  if (req.method !== "GET") return;

  // Bypass cache for external scraping proxies & dynamic APIs
  if (
    url.hostname.includes("jina.ai") ||
    url.hostname.includes("allorigins") ||
    url.hostname.includes("corsproxy") ||
    url.hostname.includes("codetabs") ||
    url.hostname.includes("cors.lol")
  ) {
    return;
  }

  // Google Fonts caching (Stale-While-Revalidate / Cache-First)
  if (url.origin.includes("fonts.googleapis.com") || url.origin.includes("fonts.gstatic.com")) {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch (_) {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // App Shell & Local Resources: Cache-First with Network Fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // Asynchronously update cache in background
        fetch(req).then((netRes) => {
          if (netRes && netRes.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, netRes));
          }
        }).catch(() => { });
        return cached;
      }

      return fetch(req).then((netRes) => {
        if (!netRes || !netRes.ok || netRes.type !== "basic") {
          return netRes;
        }
        const cloned = netRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned));
        return netRes;
      }).catch(() => {
        // Offline navigation fallback to cached app shell
        if (req.mode === "navigate") {
          return caches.match("./Diavasma.html").then((fallback) => fallback || caches.match("./"));
        }
        return Response.error();
      });
    })
  );
});

