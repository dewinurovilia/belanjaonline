const CACHE_NAME = 'toko-defana-v11';

const urlsToCache = [

'./',
'./index.html',
'./style.css',
'./script.js',
'./admin.html'

];

/* INSTALL */

self.addEventListener('install', event => {

self.skipWaiting();

event.waitUntil(

caches.open(CACHE_NAME)
.then(cache => cache.addAll(urlsToCache))

);

});

/* AKTIF */

self.addEventListener('activate', event => {

event.waitUntil(

caches.keys().then(keys => {

return Promise.all(

keys.map(key => {

if(key !== CACHE_NAME){

return caches.delete(key);

}

})

);

})

);

return self.clients.claim();

});

/* FETCH */

self.addEventListener('fetch', event => {

event.respondWith(

fetch(event.request)

.then(response => {

const responseClone =
response.clone();

caches.open(CACHE_NAME)
.then(cache => {

cache.put(
event.request,
responseClone
);

});

return response;

})

.catch(() => caches.match(event.request))

);

});
