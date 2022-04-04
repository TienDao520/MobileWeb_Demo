let elements = {
  navigator: null,
  alertBtn: null,
  confirmBtn: null,
  promptBtn: null,
  toastBtn: null,
  sheetBtn: null,
  tabsRow: null,
  cardsRow: null,
  emptyRow: null,
  switch: null,
};

const showAlert = () => {
  ons.notification.alert('This is an alert!');
}
const showConfirm = async () => {
  try {
    const result = await ons.notification.confirm('This is a question?');
    ons.notification.alert(`You selected: ${result ? 'Ok' : 'Cancel'}`);
  } catch (e) {
    console.error(e);
  }
}
const showPrompt = async () => {
  try {
    const result = await ons.notification.prompt('This is also a question?');
    const message = result ? `Entered: ${result}` : 'Entered nothing!';
    ons.notification.alert(message);
  } catch (e) {
    console.error(e);
  }
}
const showToast = () => {
  ons.notification.toast('Testing!')
}
const showSheet = async () => {
  const btns = [
    'Button 0',
    'Button 1',
    {
      label: 'Button 2',
      modifier: 'destructive',
      icon: 'md-done'
    },
    {
      label: 'Cancel',
      icon: 'md-close'
    },
  ];
  try {
    const index = await ons.openActionSheet({
      title: "My Action Sheet",
      cancellable: true,
      buttons: btns,
    });
    const result = btns[index];
    ons.notification.alert(`You selected: ${result?.label || result || 'nothing'}`)
  } catch (e) {
    console.error(e);
  }
}

const changePage = (page, data) => {
  elements.navigator.pushPage(page, { data });
}

const changeStyles = (e) => {
  const plat = e.target.checked ? 'android' : 'ios';
  ons.forcePlatformStyling(plat);
}

document.addEventListener('init', (e) => {
  if (e.target.id === 'home') {
    elements = {
      navigator: document.querySelector('#navigator'),
      alertBtn: document.querySelector('#alertBtn'),
      confirmBtn: document.querySelector('#confirmBtn'),
      promptBtn: document.querySelector('#promptBtn'),
      toastBtn: document.querySelector('#toastBtn'),
      sheetBtn: document.querySelector('#sheetBtn'),
      emptyRow: document.querySelector('#empty-row'),
      tabsRow: document.querySelector('#tabs-row'),
      cardsRow: document.querySelector('#cards-row'),
      switch: document.querySelector('#switch'),
    }
  
    elements.alertBtn.addEventListener('click', showAlert);
    elements.confirmBtn.addEventListener('click', showConfirm);
    elements.promptBtn.addEventListener('click', showPrompt);
    elements.toastBtn.addEventListener('click', showToast);
    elements.sheetBtn.addEventListener('click', showSheet);
  
    ons.preload(['views/tabs.html', 'views/cards.html']);
    elements.emptyRow.addEventListener('click', () => changePage('empty.html'));
    elements.tabsRow.addEventListener('click', () => changePage('views/tabs.html'));
    elements.cardsRow.addEventListener('click', () => changePage('views/cards.html', { id: "1234", text: "Hello!" }));
    elements.switch.addEventListener('change', (e) => changeStyles(e))
  }
  
  if (e.target.id === "cards") {
    console.log(elements.navigator.topPage.data);
    elements.cardBtn = document.querySelector('#cardBtn');
    elements.cardBtn.addEventListener('click', () => changePage('views/tabs.html'));
  }
});

// // Padd the history with an extra page
// window.addEventListener('load', () => window.history.pushState({ }, ''));
// // When the back button is pressed, if there is more pages on our navigator we will popPage(), else we will exit our application
// window.addEventListener('popstate', () => {
//   const { pages } = elements.navigator;
//   if (pages & pages.length > 1) {
//     elements.navigator.popPage();
//     window.history.pushState({ }, '');
//   } else {
//     window.history.back();
//   }
// });

const popPage = () => elements.navigator.popPage();
// Padd the history with an extra page so that we don't exit right away
window.addEventListener('load', () => window.history.pushState({ }, ''));
// When the browser goes back a page, if our navigator has more than one page we pop the page and prevent the back event by adding a new page
// Otherwise we trigger a second back event, because we padded the history we need to go back twice to exit the app.
window.addEventListener('popstate', () => {
  const { pages } = elements.navigator;
  if (pages && pages.length > 1) {
    popPage();
    window.history.pushState({ }, '');
  } else {
    window.history.back();
  }
});