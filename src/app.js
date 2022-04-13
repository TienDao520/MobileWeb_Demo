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

const setupPage = () => {
    elements = {
        networkType: document.querySelector('#networkType'),
        networkOnline: document.querySelector('#networkOnline'),
        networkDownlink: document.querySelector('#networkDownlink'),

        batteryLevel: document.querySelector('#batteryLevel'),
        batteryCharging: document.querySelector('#batteryCharging'),
        batteryTime: document.querySelector('#batteryTime'),

    }
}

document.addEventListener('init', setupPage);