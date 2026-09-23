/* TV Player V1.66 — shell only; never cache Dropbox audio; never serve HTML as JS */
const CACHE="tv-player-v166";
const SHELL=[
  "./",
  "index.html",
  "app.js",
  "lesungen.js",
  "zeitraum.js",
  "feedback.js",
  "cover-rule.js",
  "cover-fx.js",
  "live.js",
  "cover.jpg",
  "manifest.webmanifest",
  "sw.js"
];
function isAssetRequest(req){
  const u=new URL(req.url);
  const p=u.pathname;
  return /\.(js|css|webmanifest|jpg|jpeg|png|svg|ico)$/i.test(p) || p.endsWith("/sw.js");
}
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
  if(url.origin!==self.location.origin) return;
  if(e.request.method!=="GET") return;
  e.respondWith(
    fetch(e.request).then(function(res){
      if(res && res.ok){
        const copy=res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); }).catch(function(){});
      }
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(hit){
        if(hit) return hit;
        // Never fall back to index.html for scripts/assets — that emptied the playlist.
        if(isAssetRequest(e.request)) return Response.error();
        return caches.match("index.html");
      });
    })
  );
});
