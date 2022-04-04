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

const saveState = async () => {
    console.log('saving state', state)

    //create a new handle
    const newHandle = await window.showSaveFilePicker();

    //create a writeable to write to
    const writeableStream = await newHandle.createWritable();

    //write to file no replacement, tab by 2 spaces
    await writeableStream.write(JSON.stringify(state, null, 2));

    //close the stream
    await writeableStream.close();

}

const loadState = async () => {

}

const handleChange = (e, key) => {
    state[key] = e.target.value;
}

const handleSwitchChange = (e) => {
    state.switch = e.target.checked;
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

    elements.saveBtn.addEventListener('click', saveState);

}

document.addEventListener('init', setupPage);




