const CACHE_NAME = "hanzilane-v1";
const APP_SHELL = [
  "/",
  "/vocabulary",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned)),
          );
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(event.request)) ||
            caches.match("/") ||
            Response.error()
          );
        }),
    );
    return;
  }

  if (
    url.pathname.startsWith("/_next/") ||
    APP_SHELL.includes(url.pathname) ||
    /\.(?:png|svg|ico|webp|jpg|jpeg|css|js)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(event.request).then(async (cached) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            const cloned = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned)),
            );
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      }),
    );
  }
});
