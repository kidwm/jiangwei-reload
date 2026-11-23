const cacheName = "jw-reload-launcher-3";
const paths = [
  "/",
  "/launcher.js",
  "/launcher.css",
  "/public-key.json",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(paths)));
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith("jw-reload-launcher-") && name !== cacheName) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" || url.origin !== self.location.origin ||
    !paths.includes(url.pathname)
  ) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(url.pathname, response.clone());
      return response;
    } catch (error) {
      return await cache.match(url.pathname) ?? Promise.reject(error);
    }
  })());
});
