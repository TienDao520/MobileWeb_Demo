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

const setupPage = () => {
    elements.textInpt = document.querySelector('#text');
    elements.rangeInpt = document.querySelector('#range');
    elements.switchInpt = document.querySelector('#switch');
    elements.radio1Inpt = document.querySelector('#radio-1');
    elements.radio2Inpt = document.querySelector('#radio-2');
    elements.saveBtn = document.querySelector('#save');
    elements.loadBtn = document.querySelector('#load');
}

document.addEventListener('init', setupPage);




