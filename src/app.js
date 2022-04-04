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

const pickerOpts = {
    //https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
    types: [
        {
            description: 'JSON Object State',
            accept: {
                'application/json': ['.json']
            }
        },
    ],
    //don't allow users to use all option
    excludeAcceptAllOption: true,
    multiple: false
};

const saveState = async () => {
    console.log('saving state', state)

    //create a new handle
    //Added pickerOpts to save as a certain type of file
    const newHandle = await window.showSaveFilePicker(pickerOpts);

    //create a writeable to write to
    const writeableStream = await newHandle.createWritable();

    //write to file no replacement, tab by 2 spaces
    await writeableStream.write(JSON.stringify(state, null, 2));

    //close the stream
    await writeableStream.close();

}

const loadState = async () => {
    console.log('loading state')

    // get file handle
    const [fileHandle] = await window.showOpenFilePicker(pickerOpts);

    // get the file meta data
    const fileData = await fileHandle.getFile();

    try {
        // create a file reader instance
        const reader = new FileReader();

        // file reader uses events instead of promises
        reader.addEventListener('load', () => {
            // the text will be within the reader.result property
            const newState = JSON.parse(reader.result);
            state = { ...newState };

            // set the values of the controls on the page to match state
            elements.textInpt.value = state.text;
            elements.rangeInpt.value = state.range;
            elements.switchInpt.checked = state.switch;
            elements.radio1Inpt.checked = state.radio === 'red';
            elements.radio2Inpt.checked = state.radio === 'blue';
        });

        // read the file data as text
        reader.readAsText(fileData);
    } catch (e) {
        console.log('error loading state', e);
    }
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
    elements.loadBtn.addEventListener('click', loadState);
}

document.addEventListener('init', setupPage);




