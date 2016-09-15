/**
 * For proper scoping, the worker.js file has to be at the same level as index.js file.
 * This path can be set in `APP_ROOT` variable to have quick control over the cached files.
 */

const VERSION = 'v0.0.16', // Current version
    APP_ROOT = '/pwa-bl/', // Application root (aka directory of the index.html file)
    ASSET_CACHE_NAME = 'bl-asset-cache-' + VERSION, // Cache name
    ASSET_URLS = ([ // URLs of files that should be prefetched
      '/',
      'index.html',
      'offline.html',
      /*'css/main.css',
      'css/fonts.css',
      'js/main.js',
      'js/util.js',
      'js/predictions.js',
      'js/store.js',
      'js/points.js',
      'js/touch.js'*/
    ].map(function(url) {
      return APP_ROOT + url;
    }));

/**
 * Event listener for the `install` event.
 * Is fired the first time the woker is called by a browser.
 */
self.addEventListener('install', (event) => {
  console.log('Installing...', VERSION);
  // Perform install steps
  event.waitUntil(
    caches.open(ASSET_CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(ASSET_URLS);
      })
  );
});

/**
 * Event listener for the `activate` event.
 * Is fired once the worker updates. Used to migrate.
 */
self.addEventListener('activate', (event) => {
  console.log('Activated!', VERSION);

  // Delete all old caches...
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) { // Compare each available cache with the current version's cache
          if (ASSET_CACHE_NAME !== cacheName) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/**
 * Event listener for the `fetch` event.
 * Used when a ressource is requested by the page.
 * Only requests for files within the worker's scope are calling this.
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the request.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              if (response.status === 404) {
                console.error('Failed to fetch!', response);
              }
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have 2 stream.
            var responseToCache = response.clone();

            caches.open(ASSET_CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(function(err) {
          console.error(err);
        });
      })
    );
});