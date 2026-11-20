/* Diavasma Service Worker - Offline Shell & Resilient Pre-caching (v9) */
const CACHE_NAME = "diavasma-shell-v9";
const FONT_CACHE = "reading-room-fonts-v1";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./Diavasma.html",
  "./manifest.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./pdf.min.js",
  "./pdf.worker.min.js",
  "./fonts/fonts.css",
  "./styles.css",
  "./i18n.js",
  "./app.js",
  "./DesktopD.png",
  "./DesktopL.png",
  "./MobileD.jpg",
  "./MobileL.jpg"
];

// Install: precache app shell using Promise.allSettled for fault tolerance
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("[SW] Precache skipped for:", url, err.message);
          })
        )
      );
      return results;
    })
  );
});

// Activate: clean up outdated caches & claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME && k !== FONT_CACHE) {
            console.log("[SW] Deleting old cache:", k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-First with Timeout for Navigation, Cache-First for Assets
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests
  if (req.method !== "GET") return;

  // Ignore non-http/https protocols (e.g. chrome-extension://, blob:, data:)
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

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

  // HTML Navigation: Network-First with strict 3-second Timeout and Cache Fallback
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      (async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const netRes = await fetch(req, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (netRes && netRes.ok) {
            const clone = netRes.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put(req, clone);
            return netRes;
          }
        } catch (err) {
          // Network timed out or failed; safely fall back to cache
        }

        // Cache fallback: try requested URL, then fallback to Diavasma.html or index.html
        const cached = await caches.match(req);
        if (cached) return cached;

        const fallback =
          (await caches.match("./Diavasma.html")) ||
          (await caches.match("./index.html")) ||
          (await caches.match("./"));
        if (fallback) return fallback;

        return new Response(
          "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Diavasma Offline</title></head><body><h1>Diavasma Offline</h1><p>Ελέγξτε τη σύνδεσή σας ή κάντε refresh.</p></body></html>",
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      })()
    );
    return;
  }

  // App Shell & Local Resources: Cache-First with Stale-While-Revalidate
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) {
        // Background revalidation if online
        if (navigator.onLine && url.origin === self.location.origin) {
          fetch(req).then(async (netRes) => {
            if (netRes && netRes.ok && netRes.type === "basic") {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(req, netRes.clone());
            }
          }).catch(() => {});
        }
        return cached;
      }

      // Not in cache: fetch from network
      try {
        const netRes = await fetch(req);
        if (netRes && netRes.ok && netRes.type === "basic") {
          const clone = netRes.clone();
          const cache = await caches.open(CACHE_NAME);
          await cache.put(req, clone);
        }
        return netRes;
      } catch (err) {
        // Fallback responses if offline and resource is missing
        if (req.destination === "style") {
          return new Response("/* Offline CSS */", {
            headers: { "Content-Type": "text/css" }
          });
        }
        if (req.destination === "script") {
          return new Response("/* Offline JS */", {
            headers: { "Content-Type": "application/javascript" }
          });
        }
        return new Response("", { status: 408, statusText: "Offline" });
      }
    })()
  );
});
