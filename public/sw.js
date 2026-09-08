/* Aurelia service worker — app shell + offline-first content
   + Web Share Target inbox (Android share sheet → on-device analysis) */
const VERSION = "aurelia-v4";
const SHELL_CACHE = `${VERSION}-shell`;
const SHARE_INBOX = "aurelia-share-inbox";
const SHARE_INBOX_URL = "/share-inbox/last";
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
            .filter((key) => key.startsWith("aurelia-") && !key.startsWith(VERSION) && key !== SHARE_INBOX)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ---------- Web Share Target ----------
   Android's share sheet POSTs multipart/form-data to /share-target
   (manifest.share_target). We stash the image in Cache Storage and
   notify/redirect — the page then pulls it from /share-inbox/last and
   runs the on-device k-means/ΔE pipeline. Text shares become a
   prefilled global search via ?q=. Nothing is ever uploaded. */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* POST /share-target — receives the shared file/text */
  if (request.method === "POST" && url.pathname === "/share-target") {
    event.respondWith(
      (async () => {
        try {
          const formData = await request.formData();
          const files = formData.getAll("image").concat(formData.getAll("images")).filter((f) => f instanceof File);
          const text = String(formData.get("text") ?? "");
          const title = String(formData.get("title") ?? "");

          if (files.length > 0) {
            const file = files[0];
            const cache = await caches.open(SHARE_INBOX);
            await cache.put(
              SHARE_INBOX_URL,
              new Response(await file.arrayBuffer(), {
                headers: {
                  "content-type": file.type || "application/octet-stream",
                  "x-filename": encodeURIComponent(file.name || "shared-photo"),
                  "cache-control": "no-store",
                },
              })
            );
            const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
            for (const c of clients) {
              c.postMessage({ type: "shared-image", name: file.name, mime: file.type });
            }
            return Response.redirect("/?shared=1#/colors", 303);
          }

          if (text || title) {
            const q = encodeURIComponent([title, text].filter(Boolean).join(" ").slice(0, 80));
            const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
            for (const c of clients) {
              c.postMessage({ type: "shared-text", text, title });
            }
            return Response.redirect(`/?q=${q}#/`, 303);
          }
        } catch (err) {
          /* fall through to a safe redirect */
        }
        return Response.redirect("/", 303);
      })()
    );
    return;
  }

  /* GET /share-inbox/last — the page picks up the stashed image */
  if (request.method === "GET" && url.pathname === SHARE_INBOX_URL) {
    event.respondWith(
      caches.open(SHARE_INBOX).then((cache) =>
        cache.match(SHARE_INBOX_URL).then(
          (hit) =>
            hit ||
            new Response("", { status: 404, headers: { "cache-control": "no-store" } })
        )
      )
    );
    return;
  }

  if (request.method !== "GET") return;
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
