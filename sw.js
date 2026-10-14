/* [Grok-Bot] Umzug nach bhaktiservices.github.io: alte Caches loeschen, abmelden, Seiten neu laden (-> Weiterleitung) */
self.addEventListener("install",function(){self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.map(function(n){return caches.delete(n)}))}).then(function(){return self.registration.unregister()}).then(function(){return self.clients.matchAll({type:"window"})}).then(function(c){c.forEach(function(x){try{x.navigate(x.url)}catch(e){}})}))});
