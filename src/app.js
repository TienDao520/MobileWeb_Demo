let elements = {
    networkType: null,
    networkOnline: null,
    networkDownlink: null,

    batteryLevel: null,
    batteryCharging: null,
    batteryTime: null,

    vibrateOnce: null,
    vibratePattern: null,
    vibratePersistent: null,
    vibrateCancel: null,

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
    connection.addEventListener('change', onNetworkUpdate);
    window.addEventListener('online', () => handleOnlineChange(true));
    window.addEventListener('offline', () => handleOnlineChange(false));
}

//Handle when battery level changes
const onLevelChange = (bat) => {
    //battery.level returns a number between zero and one
    const level = Math.round(bat.level * 100);
    console.log(`Battery level: ${level}%`);
    deviceState.battery.level = level;
    //set the progress bar
    elements.batteryLevel.setAttribute('value', level);

    //For each level change for class to effect the display with css
    if (level > 66) {
        elements.batteryLevel.classList.add('high');

        elements.batteryLevel.classList.remove('medium');
        elements.batteryLevel.classList.remove('low');
    } else if (level > 33) {
        elements.batteryLevel.classList.add('medium');

        elements.batteryLevel.classList.remove('low');
        elements.batteryLevel.classList.remove('high');
    } else {
        elements.batteryLevel.classList.add('low');

        elements.batteryLevel.classList.remove('high');
        elements.batteryLevel.classList.remove('medium');
    }
    onTimeChange(bat);
}

//Handle when battery is charging
const onChargingChange = (bat) => {
    console.log(`Battery charging?: ${bat.charging ? 'Yes' : 'No'}`);
    deviceState.battery.charging = bat.charging;
    elements.batteryCharging.innerHTML = bat.charging ? 'Charging' : 'Discharging';

    //For charging add class to effect the display with css
    if (bat.charging) {
        elements.batteryCharging.classList.add('charging');
        elements.batteryCharging.classList.remove('discharging');
    } else {
        elements.batteryCharging.classList.add('discharging');
        elements.batteryCharging.classList.remove('charging');
    }
    onTimeChange(bat);

}

const onTimeChange = (bat) => {
    //If we're actually charging you want to run charge time last 
    //so that it shows the charging time
    if (bat.charging) {
        onDischargeTimeChange(bat);
        onChargeTimeChange(bat);
    } else {
        onChargeTimeChange(bat);
        onDischargeTimeChange(bat);
    }

}

const onChargeTimeChange = (bat) => {
    console.log(`Battery charging time: ${bat.chargingTime} seconds`);
    deviceState.battery.chargeTime = bat.chargingTime;
    elements.batteryTime.innerHTML = `${bat.chargingTime}(s)`;
    elements.batteryTime.classList.add('charging');
    elements.batteryTime.classList.remove('discharging');
}

const onDischargeTimeChange = (bat) => {
    console.log(`Battery discharging time: ${bat.dischargingTime} seconds`);
    deviceState.battery.dischargeTime = bat.dischargingTime;
    elements.batteryTime.innerHTML = `${bat.chargingTime}(s)`;
    elements.batteryTime.classList.add('discharging');
    elements.batteryTime.classList.remove('charging');
}

const updateBatteryInfo = (bat) => {
    console.log('------INITIAL BATTERY STATE-----')
    onLevelChange(bat);
    onChargingChange(bat);
    onTimeChange(bat);
    console.log('------INITIAL BATTERY STATE-----')
}

const initBattery = async () => {
    try {
        //navigator.getBattery() return a promise
        const battery = await navigator.getBattery();
        //check the battery is exist
        if (battery) {
            updateBatteryInfo(battery);
            battery.addEventListener('levelchange', () => onLevelChange(battery));
            battery.addEventListener('chargingchange', () => onLevelChange(battery));
            battery.addEventListener('chargingtimechange', () => onChargeTimeChange(battery));
            battery.addEventListener('dischargingtimechange', () => onDischargeTimeChange(battery));
        }
    } catch (e) {
        console.log('Does not support the Battery API', e);
    }
}



const setupPage = () => {
    elements = {
        networkType: document.querySelector('#networkType'),
        networkOnline: document.querySelector('#networkOnline'),
        networkDownlink: document.querySelector('#networkDownlink'),

        batteryLevel: document.querySelector('#batteryLevel'),
        batteryCharging: document.querySelector('#batteryCharging'),
        batteryTime: document.querySelector('#batteryTime'),

        vibrateOnce: document.querySelector('#vibrateOnce'),
        vibratePattern: document.querySelector('#vibratePattern'),
        vibratePersistent: document.querySelector('#vibratePersistent'),
        vibrateCancel: document.querySelector('#vibrateCancel'),

    }

    // Network
    initNetwork();

    // Battery 
    initBattery();

}

document.addEventListener('init', setupPage);