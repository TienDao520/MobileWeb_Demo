const elements = {
    textInpt: null,
    rangeInpt: null,
    switchInpt: null,
    radio1Inpt: null,
    radio2Inpt: null,
    saveBtn: null,
    loadBtn: null,

}

let state = {
    text: null,
    range: null,
    switch: null,
    radio: null,
}

const handleChange = (e, key) => {
    state[key] = e.target.value;
    saveState();
}

const handleSwitchChange = (e) => {
    state.switch = e.target.checked;
    saveState();
}

const setupPage = () => {
    elements.textInpt = document.querySelector('#text');
    elements.rangeInpt = document.querySelector('#range');
    elements.switchInpt = document.querySelector('#switch');
    elements.radio1Inpt = document.querySelector('#radio-1');
    elements.radio2Inpt = document.querySelector('#radio-2');
    elements.saveBtn = document.querySelector('#save');
    elements.loadBtn = document.querySelector('#load');


    elements.textInpt.addEventListener('change', (e) => handleChange(e, 'text'));
    elements.rangeInpt.addEventListener('change', (e) => handleChange(e, 'range'));
    elements.switchInpt.addEventListener('change', handleSwitchChange);
    elements.radio1Inpt.addEventListener('change', (e) => handleChange(e, 'radio'));
    elements.radio2Inpt.addEventListener('change', (e) => handleChange(e, 'radio'));

}

document.addEventListener('init', setupPage);




