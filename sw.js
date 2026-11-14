/* RoadStake UI — سرویس‌ورکر ساده: ذخیره‌ی فایل‌های برنامه برای کار بدون اینترنت.
   با هر انتشار نسخه‌ی جدید، مقدار VERSION را عوض کنید تا حافظه‌ی قدیمی پاک شود. */
const VERSION = 'roadstake-ui-3.11.15-r19';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;
  // ابتدا شبکه (برای گرفتن نسخه‌ی جدید)، در صورت قطع اینترنت از حافظه
  e.respondWith(fetch(e.request).then(function (r) {
    const copy = r.clone(); caches.open(VERSION).then(function (c) { c.put(e.request, copy); }); return r;
  }).catch(function () { return caches.match(e.request).then(function (m) { return m || caches.match('./index.html'); }); }));
});
