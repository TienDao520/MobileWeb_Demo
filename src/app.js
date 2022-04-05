const app = {
    visibilityState: document.wasDiscarded ? 'discarded' : 'initial',
    logs: [],
    loadedLogs: false,

    idleDetector: null,
    idleState: {},
    abortController: null,

    wakeLock: null,

    bgSyncID: 'sync-messages',

    elements: {
        stateEl: null,
        logList: null,

        idleStateEL: null,
        startIdleBtn: null,
        stopIdleBtn: null,

        lockStateEL: null,
        acquireLockBtn: null,
        releaseLockBtn: null,

        orientationStateEL: null,
        portraitBtn: null,
        landscapeBtn: null,

        backgroundSyncBtn: null,

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

const onFreeze = () => {
    app.visibilityState = 'frozen';
    renderState();
};

const onHide = (e) => {
    // If true, page will enter the back-forward cache of the browser
    // this is also considered frozen
    if (e.persisted) {
        // If the event persisted, your app will enter the back/forward cache
        // of the browser and this is considered frozen
        onFreeze();
    } else {
        // Otherwise page is just terminated
        app.visibilityState = 'terminated';
        renderState();
    }
};

const renderLog = async (state, time) => {
    const newStateEL = document.createElement('ons-list-item');
    newStateEL.setAttribute('modifier', 'longdivider');

    if (state && time) {
        const left = document.createElement('div');
        left.classList.add('left');
        const badge = document.createElement('span');
        badge.classList.add('notification');
        badge.appendChild(document.createTextNode(' '));
        left.appendChild(badge);
        newStateEL.append(left);
    }

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

    try {
        localforage.setItem('logs', app.logs);
    } catch (e) {
        console.error(e);
    }

    app.elements.logList.appendChild(newStateEL);
};


const renderState = () => {
    app.elements.visibilityState.innerHTML = app.visibilityState;
    renderLog();
};


const loadLogs = async () => {
    //Check whether loadedLogs already
    if (app.loadedLogs) return;

    try {
        const logs = (await localforage.getItem('logs')) || [];
        //array fetch from localforage
        app.logs = [...logs];
        app.logs.forEach((l) => renderLog(l.state, l.time));
        app.loadedLogs = true;
    } catch (e) {
        console.error(e);
    }
};

const onIdleChange = () => {
    //const userState = app.idleDetector.userState;
    //const screenState = app.idleDetector.screenState;
    //userState -> active or idle
    //screenState -> unlocked or locked
    const { userState, screenState } = app.idleDetector;
    app.idleState = {
        userState,
        screenState,
    };
    app.elements.idleStateEL.innerHTML = `${userState}, ${screenState}`;
    console.log(`Idle change: ${userState}, ${screenState}.`);
};

const startIdleDetection = async () => {
    if ((await IdleDetector.requestPermission()) != 'granted') {
        console.error('Idle detection permission denied.');
        return;
    }

    try {
        app.idleDetector = new IdleDetector();
        app.abortController = new AbortController();
        app.elements.idleStateEL.innerHTML = `Detecting`;
        app.idleDetector.addEventListener('change', onIdleChange);

        await app.idleDetector.start({
            threshold: 60000, // 60 seconds = 6000ms
            signal: app.abortController.signal, // Hook up abort controller in order to stop the detector later
        });
        console.log('IdleDetector is active.');
    } catch (e) {
        app.elements.idleStateEL.innerHTML = `Not Detecting`;
        console.error(e.name, e.message);
    }
};

const stopIdleDetection = () => {
    try {
        app.abortController.abort();
        app.elements.idleStateEL.innerHTML = `Not Detecting`;
    } catch (error) {
        console.log('IdleDetector is stopped.', error);
    }

};

const releaseWakeLock = async () => {
    try {
        await app.wakeLock.release();
        app.elements.lockStateEL.innerHTML = 'Wake Lock Released';
    } catch (e) {
        console.error(e);
        app.elements.lockStateEL.innerHTML = e;
    }
};

const acquireWakeLock = async () => {
    try {
        app.wakeLock = await navigator.wakeLock.request('screen');
        app.wakeLock.addEventListener('release', releaseWakeLock);
        app.elements.lockStateEL.innerHTML = 'Wake Lock Acquired';
    } catch (e) {
        console.error(e);
        app.elements.lockStateEL.innerHTML = e;
    }
};

const renderOrientation = () => {
    const orientation = screen.orientation.type;
    app.elements.orientationStateEL.innerHTML = orientation;
};

// choose between primary and secondary giving it to specific primary will be the regular portrait mode, 
//giving it secondary will be like the upside down portrait mode.
const lockPortraitOrientation = async () => {
    try {
        await document.body.requestFullscreen();
        await screen.orientation.lock('portrait');
    } catch (e) {
        app.elements.orientationStateEL.innerHTML = e;
    }
};

const lockLandscapeOrientation = async () => {
    try {
        await document.body.requestFullscreen();
        await screen.orientation.lock('landscape');
    } catch (e) {
        app.elements.orientationStateEL.innerHTML = e;
    }
};

const checkForBackgroundSync = async () => {
    const registration = await navigator.serviceWorker.ready;
    try {
        //Get an array of all the sync that registered
        const tags = await registration.sync.getTags();
        //Check if your tags include
        //If yes we skip since we don't need to enable background sync twice
        if (tags.includes('sync-messages')) {
            console.log('Messages sync already requested');
            app.elements.backgroundSyncBtn.setAttribute('disabled', true);
            app.elements.backgroundSyncBtn.innerHTML = `Background Sync Enabled`;
            return true;
        }
        return false;
    } catch {
        return false;
    }
};


const setupPage = async () => {
    // Init state and render status
    app.elements.visibilityState = document.querySelector('#status');
    app.elements.logList = document.querySelector('#log-list')

    app.elements.idleStateEL = document.querySelector('#idleStatus');
    app.elements.startIdleBtn = document.querySelector('#startIdleBtn');
    app.elements.stopIdleBtn = document.querySelector('#stopIdleBtn');

    app.elements.lockStateEL = document.querySelector('#lockStatus');
    app.elements.acquireLockBtn = document.querySelector('#acquireLockBtn');
    app.elements.releaseLockBtn = document.querySelector('#releaseLockBtn');

    app.elements.orientationStateEL = document.querySelector('#orientationStatus');
    app.elements.portraitBtn = document.querySelector('#portraitBtn');
    app.elements.landscapeBtn = document.querySelector('#landscapeBtn');

    app.elements.backgroundSyncBtn = document.querySelector('#backgroundSyncBtn');

    await loadLogs();
    renderState();


    // Legacy page focus and blur
    window.addEventListener('focus', determineState);
    window.addEventListener('blur', determineState);

    // Show / Hide API
    window.addEventListener('pageshow', determineState);
    window.addEventListener('pagehide', onHide);

    // Page Lifecycle API
    window.addEventListener('visibilitychange', determineState);

    // Freeze / Resume API
    window.addEventListener('freeze', onFreeze);
    window.addEventListener('resume', determineState);

    // Idle Detection API
    app.elements.startIdleBtn.addEventListener('click', startIdleDetection);
    app.elements.stopIdleBtn.addEventListener('click', stopIdleDetection);

    // Wake Lock API
    app.elements.acquireLockBtn.addEventListener('click', acquireWakeLock);
    app.elements.releaseLockBtn.addEventListener('click', releaseWakeLock);

    // Orientation API
    // Check whether it has an  onchange property
    //and if it does it's similar to how the broadcast channel API works 
    //you can't add an event listener, you can only give it a callback function so.
    if ('onchange' in screen.orientation) {
        screen.orientation.onchange = renderOrientation;
        renderOrientation();
    }
    app.elements.portraitBtn.addEventListener('click', lockPortraitOrientation);
    app.elements.landscapeBtn.addEventListener('click', lockLandscapeOrientation);

    // Background Sync API
    checkForBackgroundSync();
    app.elements.backgroundSyncBtn.addEventListener('click', registerForBackgroundSync);

}

document.addEventListener('init', setupPage);