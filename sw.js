/* Diavasma Service Worker - Offline Shell & Resilient Pre-caching (v41) */
const CACHE_NAME = "diavasma-shell-v41";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/boot.js",
  "./js/i18n.js",
  "./js/app.js",
  "./libs/pdf.min.js",
  "./libs/pdf.worker.min.js",
  "./fonts/fonts.css",
  "./fonts/AtkinsonHyperlegibleNext-latin-italic-400-0.woff2",
  "./fonts/AtkinsonHyperlegibleNext-latin-italic-400-1.woff2",
  "./fonts/AtkinsonHyperlegibleNext-latin-normal-400-2.woff2",
  "./fonts/AtkinsonHyperlegibleNext-latin-normal-400-3.woff2",
  "./fonts/AtkinsonHyperlegibleNext-latin-normal-600-4.woff2",
  "./fonts/AtkinsonHyperlegibleNext-sub5-normal-600-5.woff2",
  "./fonts/Literata-greek-italic-400-7.woff2",
  "./fonts/Literata-greek-italic-400-8.woff2",
  "./fonts/Literata-greek-normal-400-14.woff2",
  "./fonts/Literata-greek-normal-400-15.woff2",
  "./fonts/Literata-greek-normal-600-21.woff2",
  "./fonts/Literata-greek-normal-600-22.woff2",
  "./fonts/Literata-latin-italic-400-10.woff2",
  "./fonts/Literata-latin-italic-400-11.woff2",
  "./fonts/Literata-latin-normal-400-17.woff2",
  "./fonts/Literata-latin-normal-400-18.woff2",
  "./fonts/Literata-latin-normal-600-24.woff2",
  "./fonts/Literata-latin-normal-600-25.woff2",
  "./fonts/Literata-sub12-italic-400-12.woff2",
  "./fonts/Literata-sub13-normal-400-13.woff2",
  "./fonts/Literata-sub16-normal-400-16.woff2",
  "./fonts/Literata-sub19-normal-400-19.woff2",
  "./fonts/Literata-sub20-normal-600-20.woff2",
  "./fonts/Literata-sub23-normal-600-23.woff2",
  "./fonts/Literata-sub26-normal-600-26.woff2",
  "./fonts/Literata-sub6-italic-400-6.woff2",
  "./fonts/Literata-sub9-italic-400-9.woff2",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/images/DesktopD.png",
  "./assets/images/DesktopL.png",
  "./assets/images/MobileD.jpg",
  "./assets/images/MobileL.jpg"
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
          if (k !== CACHE_NAME) {
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

  // Bypass cache for external scraping proxies, icon aggregators & dynamic APIs
  if (
    url.hostname.includes("jina.ai") ||
    url.hostname.includes("allorigins") ||
    url.hostname.includes("corsproxy") ||
    url.hostname.includes("codetabs") ||
    url.hostname.includes("cors.lol") ||
    url.hostname.includes("favicone.com") ||
    url.hostname.includes("icon.horse") ||
    url.hostname.includes("duckduckgo.com") ||
    url.hostname.includes("google.com") ||
    url.hostname.includes("googleapis.com")
  ) {
    return;
  }

  // HTML Navigation: Network-First with strict 3-second Timeout and Cache Fallback
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html")) {
    const isShareTarget =
      url.searchParams.has("share_url") ||
      url.searchParams.has("share_text") ||
      url.searchParams.has("share_title");

    event.respondWith(
      (async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const netRes = await fetch(req, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (netRes && netRes.ok) {
            // Do not cache responses for share_target queries to prevent duplicate entries
            if (!isShareTarget) {
              const clone = netRes.clone();
              const cache = await caches.open(CACHE_NAME);
              await cache.put(req, clone);
            }
            return netRes;
          }
        } catch (err) {
          // Network timed out or failed; safely fall back to cache
        }

        // Cache fallback: try requested URL, then fallback to index.html
        const cached = await caches.match(req);
        if (cached) return cached;

        const fallback =
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
          }).catch(() => { });
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
