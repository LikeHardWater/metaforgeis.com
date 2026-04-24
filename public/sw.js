const CACHE = 'metaforge-v1'
const OFFLINE_URL = '/login'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll([OFFLINE_URL, '/images/MFIS_Logo.svg']))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))))
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    fetch(e.request).catch(() => caches.match(OFFLINE_URL))
  )
})

// Push notification support
self.addEventListener('push', (e) => {
  if (!e.data) return
  const data = e.data.json()
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'MetaForge', {
      body: data.body ?? '',
      icon: '/images/MFIS_Logo.svg',
      badge: '/images/MFIS_Logo.svg',
      data: { url: data.url ?? '/app/dashboard' },
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then((cs) => {
      const url = e.notification.data?.url ?? '/app/dashboard'
      const existing = cs.find((c) => c.url === url)
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
