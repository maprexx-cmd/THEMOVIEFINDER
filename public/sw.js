/* sw.js – Service Worker per Movie Finder */
const CACHE_VERSION = "mf-v7"
const STATIC_CACHE = "mf-static-" + CACHE_VERSION

const STATIC_ASSETS = ["/", "/manifest.webmanifest", "/icon-192-v6.png", "/icon-512-v6.png"]

/* install */
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE)
      await cache.addAll(STATIC_ASSETS)
      self.skipWaiting()
    })(),
  )
})

/* activate */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((k) => k.startsWith("mf-static-") && k !== STATIC_CACHE).map((k) => caches.delete(k)),
      )
      self.clients.claim()
    })(),
  )
})

/* fetch */
self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  const accept = req.headers.get("accept") || ""
  const isHTML = req.mode === "navigate" || accept.includes("text/html")

  // HTML sempre da rete. Se offline usa cache.
  if (isHTML) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req)
        } catch {
          const cached = await caches.match("/")
          return cached || new Response("Offline", { status: 503 })
        }
      })(),
    )
    return
  }

  // Altri file: cache first
  event.respondWith(
    (async () => {
      const cached = await caches.match(req)
      if (cached) return cached

      try {
        const fresh = await fetch(req)
        const cache = await caches.open(STATIC_CACHE)
        cache.put(req, fresh.clone())
        return fresh
      } catch {
        return new Response("", { status: 504 })
      }
    })(),
  )
})
