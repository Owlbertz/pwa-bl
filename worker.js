var VERSION="v0.1.0",APP_ROOT="/pwa-bl/",ASSET_CACHE_NAME="bl-asset-cache-"+VERSION,ASSET_URLS=["/","index.html","offline.html"].map(function(e){return APP_ROOT+e});self.addEventListener("install",function(e){void 0,e.waitUntil(caches.open(ASSET_CACHE_NAME).then(function(e){return e.addAll(ASSET_URLS)}))}),self.addEventListener("activate",function(e){void 0,e.waitUntil(caches.keys().then(function(e){return Promise.all(e.map(function(e){if(ASSET_CACHE_NAME!==e)return void 0,caches.delete(e)}))}))}),self.addEventListener("fetch",function(e){e.respondWith(caches.match(e.request).then(function(t){if(t)return t;var n=e.request.clone();return fetch(n).then(function(t){if(!t||200!==t.status||"basic"!==t.type)return 404===t.status&&void 0,t;var n=t.clone();return caches.open(ASSET_CACHE_NAME).then(function(t){t.put(e.request,n)}),t}).catch(function(e){void 0})}))});