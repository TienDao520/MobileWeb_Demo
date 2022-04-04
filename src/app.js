let elements = {
  navigator: null,
  mapDiv: null,
  map: null,
  locateBtn: null,
  listenBtn: null,
  listenIntervalBtn: null,
  stopBtn: null,
};

const onLocateSuccess = (position) => {
  // const coords = position.coords;
  const { coords } = position;

  console.log(coords.latitude, coords.longitude);
  const leafletCoords = { lon: coords.longitude, lat: coords.latitude };
  elements.map.setView(leafletCoords, 12);

  if (elements.marker) elements.map.removeLayer(elements.marker);
  if (elements.circle) elements.map.removeLayer(elements.circle);

  elements.marker = L.marker(leafletCoords)
    .addTo(elements.map)
    .bindPopup(`You are within ${Number(coords.accuracy).toFixed(1)} meters from this point @ ${new Date(position.timestamp).toLocaleString()}`)
    .openPopup();
  elements.circle = L.circle(leafletCoords, coords.accuracy).addTo(elements.map);
};

const errors = {
  1: '[PERMISSION_DENIED] Permission was denied to access location services.',
  2: '[POSITION_UNAVAILABLE] The GPS was not able to determine a location',
  3: '[TIMEOUT] The GPS failed to determine a location within the timeout duration',
};

const onLocateFailure = (error) => {
  console.error('Could not access location services!');
  console.error('errors[error.code]', errors[error.code]);
  console.error('error.message', error.message);
};

const locate = () => {
  if (!navigator.geolocation) {
    console.log('Geolocation is not supported by your browser!');
  } else {
    //Set up the callback for getCurrentPosition parameters
    navigator.geolocation.getCurrentPosition(onLocateSuccess, onLocateFailure);
  }
}
const listen = () => { }
const listenInterval = () => { }
const stopListening = () => { }




const setUpPage = (evt) => {
  console.log('start init', evt.target.id);
  if (evt.target.id === 'home') {
    elements = {
      navigator: document.querySelector('#navigator'),
      mapDiv: document.querySelector('#map'),
      map: initMap(),
      locateBtn: document.querySelector('#locateBtn'),
      listenBtn: document.querySelector('#listenBtn'),
      listenIntervalBtn: document.querySelector('#listenIntervalBtn'),
      stopBtn: document.querySelector('#stopBtn'),
    };

    elements.locateBtn.addEventListener('click', locate);
    elements.listenBtn.addEventListener('click', listen);
    elements.listenIntervalBtn.addEventListener('click', listenInterval);
    elements.stopBtn.addEventListener('click', () => stopListening);

  }
};



document.addEventListener('init', setUpPage);