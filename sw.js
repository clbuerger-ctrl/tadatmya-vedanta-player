/* TV Player V1.62 — shell only; never cache Dropbox audio */
const CACHE="tv-player-v162";
const SHELL=["./","index.html","app.js","cover.jpg","manifest.webmanifest"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch",function(e){
  const url=new URL(e.request.url);
  // never cache Dropbox / cross-origin audio
  if(url.origin!==self.location.origin) return;
  if(e.request.method!=="GET") return;
  // network-first for navigations and JS/HTML; cache fallback
  e.respondWith(
    fetch(e.request).then(function(res){
      if(res && res.ok){
        const copy=res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); }).catch(function(){});
      }
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(hit){ return hit || caches.match("index.html"); });
    })
  );
});
