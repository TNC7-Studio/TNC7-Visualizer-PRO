const CACHE_NAME = 'tnc7-pro-cache-v32';
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
    // Hanya file aplikasi sendiri (GET, origin yang sama); CDN & API lirik dibiarkan lewat tanpa diubah
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

    // Strategi: Network First, fallback to Cache
    // Setiap kali online, salinan di cache ikut diperbarui supaya mode offline tidak tertinggal versi lama
    event.respondWith(
        fetch(event.request).then(response => {
            if (response.ok) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
            }
            return response;
        }).catch(() => {
            return caches.match(event.request, { ignoreSearch: true });
        })
    );
});
