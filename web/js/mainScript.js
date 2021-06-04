// x, y, radius, startValue, maxValue, barColor, textSymbol, textColor
let stateManager;

/*function editDevice(busID) {
    let device = getDevice(busID);
    console.log("Editing device:" + device.getBus());
    let editDevice = document.createElement("div");
    editDevice.class = "admin";
    editDevice.id = "editDevice";
    editDevice.innerHTML =
        "<table>" +
        "   <tr>" +
        "       <th>Bus</th>" +
        "       <th>Type</th>" +
        "       <th>Active</th>" +
        "       <th>Detect</th>" +
        "       <th>Calibrate</th>" +
        "       <th>Delete</th>" +
        "   <\tr>" +
        "   <tr>" +
        "       <td></td>" +
        "       <td></td>" +
        "       <td></td>" +
        "       <td></td>" +
        "       <td></td>" +
        "       <td><button id='deleteDevice'>DELETE</button></td>" +
        "   <\tr>" +
        "<\table>";

    //TODO: Set state

    document.getElementById("deleteDevice").onclick = deleteDevice(device);
}*/

/*function deleteDevice(device) {
    let newDevices = [];
    let counter = 0;
    for (let i = 0; i < devices.length; i++) {
        if (devices[i].getBus() !== device.getBus()) {
            newDevices[counter] = devices[i];
            counter++;
        }
    }
    devices = newDevices; // Remove device from devices list
    config.removeDevice(device); // Remove device from config
    //TODO: Set state back to admin
}*/

function init() {
    let netManager = new NetManager();
    let config = new Config(CONFIG_DATA, netManager);

    document.getElementById("button1").onclick = function () {
        stateManager.setState("admin");
    };
    document.getElementById("button2").onclick = function () {
        stateManager.setState("stats");
    };
    document.getElementById("button3").onclick = function () {
        stateManager.setState("track");
    };
    document.getElementById("button4").onclick = function () {
        history.go(0);
    };

    let adminState;

    let states = [ adminState = new Admin(netManager, config) , new Stats(netManager), new DeviceManager("addDevice", netManager, adminState),
        new DeviceManager("editDevice", netManager, adminState), new ScheduleManager("addSchedule", netManager, adminState),
        new ScheduleManager("editSchedule", netManager, adminState)];
    stateManager = new StateManager(netManager, states);
    stateManager.setState("admin");
}

function update() {
    stateManager.update();
}

init();

update();
setInterval(update, 3000);



/*
        if (!this.cameraState) {
            this.netManager.sendRequest("POST", "bash-script", "/home/pi/project/camera/camera_on.sh");
        } else {
            this.netManager.sendRequest("POST", "bash-script", "/home/pi/project/camera/camera_off.sh");
        }

    map = document.createElement("div");
    map.id = "map";
    map.class = "track";
    this.div.innerHTML =
        "<script async src='https://maps.googleapis.com/maps/api/js?key=AIzaSyCh1UK0LA-So2r0dKkvXxX3wa68zP95yGQ&callback=initMap'></script>";


const parts = http_response_text.split("\n");

if (http_response_text.startsWith("password-changed")) {
    document.getElementById("passMessage").innerHTML = http_response_text.split(":")[1];
} else if (http_response_text.startsWith("script-value")) {
    if (http_response_text.includes("detect_device")) {
        let scriptResponse = http_response_text.split(":")[2];
        console.log("Device detected:" + scriptResponse);
    }
} else {
}*/