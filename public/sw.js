const CACHE_NAME = 'spell-deck-v1'
const CRITICAL_ASSETS = ['/', '/index.html', '/data/spells.json', '/manifest.json']

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(CRITICAL_ASSETS).catch(() => {
				// Individual asset failures shouldn't block SW activation
			})
		})
	)
	self.skipWaiting()
})

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
		)
	)
	self.clients.claim()
})

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return

	event.respondWith(
		caches.match(event.request).then((cached) => {
			const fetchPromise = fetch(event.request)
				.then((response) => {
					if (response.ok) {
						const clone = response.clone()
						caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
					}
					return response
				})
				.catch(() => cached)

			return cached || fetchPromise
		})
	)
})
