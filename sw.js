const CACHE_NAME = 'tnc7-pro-cache-v19';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', event => {
    // Membuka cache dan menyimpan aset dasar
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    // Menghapus cache versi lama jika ada pembaruan
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Strategi: Network First, fallback to Cache
    // Ini memastikan pengguna selalu mendapat versi terbaru dari GitHub
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
