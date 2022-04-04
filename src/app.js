const elements = {
    textInpt: null,
    rangeInpt: null,
    switchInpt: null,
    radio1Inpt: null,
    radio2Inpt: null,
    saveBtn: null,
    loadBtn: null,

    used: null,
    progressBarCntr: null,
    remaining: null,
    persistBtn: null,

}

let state = {
    text: null,
    range: null,
    switch: null,
    radio: null,
}

const sufixes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const humanReadableSize = (bytes) => {
    //determine which array at i is the suffix to use
    //then rounds it up a little and and fixes it to two decimal points
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return !bytes && '0 Bytes' || (bytes / Math.pow(1024, i)).toFixed(2) + " " + sufixes[i];
}

const checkQuota = async () => {
    if (navigator.storage && navigator.storage.estimate) {
        const quota = await navigator.storage.estimate();

        const percentUsed = (quota.usage / quota.quota) * 100;
        const remaining = quota.quota - quota.usage;

        const progress = document.createElement('ons-progress-bar');
        progress.setAttribute('value', percentUsed);
        progress.setAttribute('secondary-value', 100 - percentUsed);
        elements.progressBarCntr.appendChild(progress);

        const usedText = document.createTextNode(`${humanReadableSize(quota.usage)}`);
        elements.used.appendChild(usedText);

        const remainingText = document.createTextNode(`${humanReadableSize(remaining)}`);
        elements.remaining.appendChild(remainingText);
    }
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

/**Start File system API
 * Change this to saveState, loadState to use
 */
const saveStateFile = async () => {
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

const loadStateFile = async () => {
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
/**End File system API */

/**Start Local store*/
const saveState = () => {
    //it except string only so we need JSON.stringify
    localStorage.setItem('state', JSON.stringify(state, null, 2));
}

const loadState = () => {
    const newState = JSON.parse(localStorage.getItem('state'));
    state = { ...newState };

    // set all element values to loaded state
    elements.textInpt.value = state.text;
    elements.rangeInpt.value = state.range;
    elements.switchInpt.checked = state.switch;
    elements.radio1Inpt.checked = state.radio === 'red';
    elements.radio2Inpt.checked = state.radio === 'blue';
}
/**End Local store API */

const handleChange = (e, key) => {
    state[key] = e.target.value;
    //It will save automatically using localStorage for every change
    //We don't need permission for it
    //Just small data since it may effect to UI thread
    saveState();
}

const handleSwitchChange = (e) => {
    state.switch = e.target.checked;
    //It will save automatically using localStorage for every change
    //We don't need permission for it
    //Just small data since it may effect to UI thread
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

    elements.used = document.querySelector('#used');
    elements.progressBarCntr = document.querySelector('#progressBarContainer');
    elements.remaining = document.querySelector('#remaining');
    elements.persistBtn = document.querySelector('#persist');

    elements.textInpt.addEventListener('change', (e) => handleChange(e, 'text'));
    elements.rangeInpt.addEventListener('change', (e) => handleChange(e, 'range'));
    elements.switchInpt.addEventListener('change', handleSwitchChange);
    elements.radio1Inpt.addEventListener('change', (e) => handleChange(e, 'radio'));
    elements.radio2Inpt.addEventListener('change', (e) => handleChange(e, 'radio'));

    elements.saveBtn.addEventListener('click', saveState);
    elements.loadBtn.addEventListener('click', loadState);

    loadState();
    checkQuota();

}

document.addEventListener('init', setupPage);




