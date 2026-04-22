// Service Worker
// Phase 0 では最低限のキャッシュのみ。Phase 4 で本格的なオフライン対応を実装。

const CACHE_NAME = "english-practice-v1.3";
const CORE_ASSETS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/base.css",
    "./css/components.css",
    "./css/screens.css",
    "./js/main.js"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CORE_ASSETS).catch(err => {
                console.warn("一部アセットのキャッシュ失敗:", err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(
                names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Firebase関連・Gemini関連はキャッシュしない
    if (
        request.url.includes("firebaseapp.com") ||
        request.url.includes("googleapis.com") ||
        request.url.includes("gstatic.com/firebasejs") ||
        request.url.includes("generativelanguage.googleapis.com")
    ) {
        return; // デフォルトのネットワーク処理に任せる
    }

    // Cache First 戦略（Core assets向け）
    event.respondWith(
        caches.match(request).then((cached) => {
            return cached || fetch(request).then((resp) => {
                return resp;
            }).catch(() => {
                // オフライン時のフォールバック
                if (request.mode === "navigate") {
                    return caches.match("./index.html");
                }
            });
        })
    );
});
