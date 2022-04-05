const version = 1.2;
const cacheName = `Background Activity Test Cache ${version}`;
const onsenUI = [
  'https://unpkg.com/onsenui@2.11.2/css/onsen-css-components.min.css',
  'https://unpkg.com/onsenui@2.11.2/css/onsenui-core.min.css',
  'https://unpkg.com/onsenui@2.11.2/css/onsenui.min.css',
  'https://unpkg.com/onsenui@2.11.2/js/onsenui.min.js',
  'https://unpkg.com/onsenui@2.11.2/css/material-design-iconic-font/css/material-design-iconic-font.min.css',
  'https://unpkg.com/onsenui@2.11.2/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.woff2',
];
const libraries = [
  'https://unpkg.com/localforage@1.10.0/dist/localforage.min.js'
]
const filesToCache = ['index.html', 'images/icon.png', 'images/offline.svg', 'src/app.js', 'src/app.css', ...onsenUI, ...libraries];
const bgSyncID = 'sync-messages'

self.importScripts(...libraries);

const sendOutboxMessages = async () => {
  try {
    //get message from database
    const messages = await localforage.getItem('logs');
    //use POST to send data
    const response = await fetch('https://google.ca', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
  } catch (e) {
    console.error('There was an error with our background sync request', e);
  }
};


//Where you go get the sink event 
//when your device connects back to the Internet, 
//so you can do is listen for that
self.addEventListener('sync', (event) => {
  if (event.tag == bgSyncID) {
    console.log('[Service Worker]: Syncing messages via Background Sync API');
    //Since service worker is a proxy, we need to wait for properly request done
    //Run the operation after checkin the Bg ID
    event.waitUntil(sendOutboxMessages());
  }
});


self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then(async (cache) => {
    for (const file of filesToCache) {
      try {
        await cache.add(file);
      } catch (e) {
        console.error(file, e);
      }
    }
  }));
  console.log("Service Worker installed...");
});

self.addEventListener("fetch", (event) => {
  console.log(event.request.url, new Date());
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      // Fallback to network and if it fails, return the offline page.
      return fetch(event.request).catch((error) => {
        console.log('Network error...', error);
        console.log('Attempting Offline fallback.');
        return caches.open(cacheName).then((cache) => {
          return cache.match("offline.html");
        });
      });
    })
  );
});

self.addEventListener("activate", (e) => {
  console.log("Service Worker: Activate");
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== cacheName) {
            console.log("Service Worker: Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
