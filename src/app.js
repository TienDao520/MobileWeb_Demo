let elements = {
  navigator: null,
  mapDiv: null,
  map: null,
  locateBtn: null,
  listenBtn: null,
  listenIntervalBtn: null,
  stopBtn: null,
};

const locate = () => { }
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