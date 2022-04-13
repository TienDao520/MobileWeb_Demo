let elements = {
    networkType: null,
    networkOnline: null,
    networkDownlink: null,

    batteryLevel: null,
    batteryCharging: null,
    batteryTime: null,


}

//get action from navigator
const { connection } = navigator
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
    const network = networkInfo || deviceState.network.connection;
    const { type, effectiveType, downlink, downlinkMax } = network;
    console.log(`Current network type is: ${type || 'unkown'}`);
    console.log(`This network is equivalent to a: ${effectiveType || 'unkown'} cellular network`);
    console.log(`The network speed is: ${downlink || 'unkown'} mb`);
    console.log(`The theoretical maximum network speed is: ${downlinkMax || 'unkown'} mb`);

    deviceState.network.type = type;
    deviceState.network.effectiveType = effectiveType;
    deviceState.network.downlink = downlink;
    deviceState.network.downlinkMax = downlinkMax;

    //For display
    elements.networkType.innerHTML = `${type || '-'} | ${effectiveType || '-'}`;
    elements.networkDownlink.innerHTML = `${downlink || '-'}mb | ${downlinkMax || '-'}mb`;

}

//Handle for online and offline
const handleOnlineChange = (online) => {
    console.log(`The user is ${online ? 'currently' : 'not currently'} connected to a Local Area Network.`);
    deviceState.network.online = online;
    //in case like background sync API
    //check to make sure data stay remote then no need to fetch right now
    //connection === deviceState.network.connection
    const savingData = connection.saveData === true ? 'Save ON' : 'Save OFF';
    elements.networkOnline.innerHTML = online ? `Online | ${savingData}` : `Offline | ${savingData}`;
    if (online) {
        //replace the class for css display
        elements.networkOnline.classList.add('online')
        elements.networkOnline.classList.remove('offline')
    } else {
        elements.networkOnline.classList.add('offline')
        elements.networkOnline.classList.remove('online')
    }
}

const initNetwork = () => {
    //undefined at initial
    onNetworkUpdate(undefined);
    //We are online by default (begining) 
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