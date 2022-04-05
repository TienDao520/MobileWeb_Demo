const app = {
    visibilityState: document.wasDiscarded ? 'discarded' : 'initial',
    logs: [],
    loadedLogs: false,

    elements: {
        stateEl: null,
        logList: null,
    }
}


/*********************
 * Application States*
 * *******************
 * Active -> Visible and has input focus
 * Passive -> Visible without input focus
 * Hidden -> Not visible but not frozen
 * Frozen -> Frozen to preserve CPU/battery/data usage. (All timers freeze and execution is suspended)
 * Terminated -> The application is unloaded and cleared from memory. User closed the tab, browser etc
 * Discarded -> Unloaded and cleared from memory to preserve CPU/battery/data usage
 *              and will do a full page reload when the tab is next visited
 */

const determineState = () => {

    //two way to tell if a page is hidden, document.visibilityState === 'hidden' is old
    if (document.hidden || document.visibilityState === 'hidden') {
        app.visibilityState = 'hidden';
        return renderState();
    }

    if (document.hasFocus()) {
        app.visibilityState = 'active';
        return renderState();
    }

    app.visibilityState = 'passive';
    return renderState();
}


const renderLog = (state, time) => {
    const newStateEL = document.createElement('ons-list-item');
    newStateEL.setAttribute('modifier', 'longdivider');

    const center = document.createElement('div');
    center.classList.add('center');
    center.appendChild(document.createTextNode(state || app.visibilityState));

    const right = document.createElement('div');
    right.classList.add('right');
    right.appendChild(document.createTextNode(time || new Date().toLocaleString()));

    newStateEL.appendChild(center);
    newStateEL.appendChild(right);

    if (!state && !time) {
        app.logs = [
            ...app.logs,
            {
                state: state || app.visibilityState,
                time: time || new Date().toLocaleString(),
            },
        ];
    }

    // try {
    //   localforage.setItem('logs', app.logs);
    // } catch (e) {
    //   console.error(e);
    // }

    app.elements.logList.appendChild(newStateEL);
};


const renderState = () => {
    app.elements.visibilityState.innerHTML = app.visibilityState;
    renderLog();
};

const setupPage = () => {
    // Init state and render status
    app.elements.visibilityState = document.querySelector('#status');
    app.elements.logList = document.querySelector('#log-list');

    // Legacy page focus and blur
    window.addEventListener('focus', determineState);
    window.addEventListener('blur', determineState);

    // Show / Hide API
    window.addEventListener('pageshow', determineState);
    window.addEventListener('pagehide', determineState);

    // Page Lifecycle API
    window.addEventListener('visibilitychange', determineState);

    // Freeze / Resume API
    window.addEventListener('freeze', determineState);
    window.addEventListener('resume', determineState);


}

document.addEventListener('init', setupPage);