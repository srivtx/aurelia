/* Aurelia service worker — app shell + offline-first content */
const VERSION = "aurelia-v3";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSETS = [
  "/",
  "/manifest.json",
  "/og.png",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .catch(() => {})
  );
});

/* allow the page to activate a waiting worker immediately */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("aurelia-") && !key.startsWith(VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* navigation: network-first with offline fallback to the shell */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() =>
          caches.match("/").then(
            (cached) =>
              cached ||
              new Response(
                "<!doctype html><title>Aurelia</title><style>body{background:#FAF7F3;color:#2d2320;font-family:Georgia,serif;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:24px}</style><div><h1 style='font-size:26px;font-weight:600'>You're offline ✦</h1><p style='color:#5a4e46;max-width:320px;line-height:21px;font-size:14px'>Reconnect to keep exploring — your saved looks are safe on this device.</p></div>",
                { headers: { "Content-Type": "text/html; charset=utf-8" } }
              )
          )
        )
    );
    return;
  }

  /* static assets: cache-first (stale-while-revalidate) */
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/screenshots/") ||
    url.pathname === "/og.png" ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
