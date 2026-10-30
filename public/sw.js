// Service Worker للوحة الإدارة: يجعلها قابلة للتثبيت كتطبيق. لا تخزين مؤقت — البيانات دائماً من الشبكة
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* تمرير للشبكة كما هو */ });
