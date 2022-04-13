let elements = {
    networkType: null,
    networkOnline: null,
    networkDownlink: null,

    batteryLevel: null,
    batteryCharging: null,
    batteryTime: null,


}

const deviceState = {
    network: {
        type: null,
        effectiveType: null,
        downlink: null,
        downlinkMax: null,
        online: true,
        connection,
    },
    battery: {
        charging: false,
        level: null,
        chargeTime: null,
        dischargeTime: null,
    },
    vibrateInterval: null,
}

const onNetworkUpdate = (networkInfo) => {

}

const handleOnlineChange = (online) => {
}

const initNetwork = () => {
    onNetworkUpdate(undefined);
    handleOnlineChange(true);

}

const setupPage = () => {
    elements = {
        networkType: document.querySelector('#networkType'),
        networkOnline: document.querySelector('#networkOnline'),
        networkDownlink: document.querySelector('#networkDownlink'),

        batteryLevel: document.querySelector('#batteryLevel'),
        batteryCharging: document.querySelector('#batteryCharging'),
        batteryTime: document.querySelector('#batteryTime'),

    }

    // Network
    initNetwork();
}

document.addEventListener('init', setupPage);