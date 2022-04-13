const version = 1.2;
const cacheName = `MyCacheName ${version}`;
const filesToCache = ["offline.html", "assets/images/icon.png", "assets/images/offline.svg", "src/app.js", "src/app.css"];

//Check battery for periodicsync
const batteryOK = async () => {
  try {
    const battery = await navigator.getBattery();
    if (battery.charging || battery.level > 0.2) {
      return true;
    }
    return false;
  } catch (e) {
    console.log('Could not access Battery API');
    // Just return true since some browsers like firefox doesn't support it
    return true;
  }
}

const syncContent = async () => {
  try {
    //Beside the battery and network storage space can be checked here
    // If any conditions aren't met we should not sync (fetch data)
    // battery is low, network slow or not enough storage space.
    if (await batteryOK() && networkOK()) {
      const response = await fetch('http://www.randomnumberapi.com/api/v1.0/random?min=0&max=125&count=1');
      if (response.ok) {
        const numbers = await response.json();
        const badgeNumber = numbers[0];
        navigator.setAppBadge(badgeNumber);
      }
    }
  } catch (e) {
    console.log('Could not sync content', e);
  }
}

//Check the network for periodicsync
const networkOK = () => {
  const { connection } = navigator;
  const { effectiveType, downlink } = connection;

  if (
    effectiveType !== 'slow-2G'
    && effectiveType !== '2G'
    && downlink > 1
  ) {
    return true;
  }

  return false;
}

//Similar to regular sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'my-sync-tag') {
    event.waitUntil(syncContent());
  }
})

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
