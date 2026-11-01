/*
  Decko service worker (M10). No library. Small on purpose:
  - App shell and static files (/_next/static, /icons, the offline page): cache first.
    Their file names change when their content does, so a cached copy is never stale.
  - Pages, /api and sign-in are never cached. Offline, a page opens the offline card instead.
  It never reloads open pages: a new version takes over on the next visit.
  Bump VERSION to drop every old cache.
*/
const VERSION = "v3";
const STATIC = `static-${VERSION}`;
const OFFLINE = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      // The offline card and its stylesheets, so it looks right with no network.
      const cache = await caches.open(STATIC);
      const res = await fetch(OFFLINE, { cache: "reload" });
      const html = await res.clone().text();
      await cache.put(OFFLINE, res);
      await cache.addAll([...html.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]));
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== STATIC) await caches.delete(key);
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request));
  } else if (request.mode === "navigate") {
    // Always the network; the offline card only when there is none.
    event.respondWith(fetch(request).catch(async () => (await caches.match(OFFLINE)) || Response.error()));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}
