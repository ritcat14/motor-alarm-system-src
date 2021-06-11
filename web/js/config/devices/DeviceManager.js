
class DeviceManager extends State {

    constructor(stateName, netManager, adminState) {
        super(stateName, netManager);
        this.div.class = "admin";
        this.adminState = adminState;
        this.buses = [5,4,3,1];
        this.deviceTypes = adminState.getDeviceTypes();
        this.isEditing = (stateName.includes("edit"));
    }

    init() {
        super.init();

        this.devices = this.adminState.getDevices();
        this.deviceTypes = this.adminState.getDeviceTypes();

        let innerHTML =
            "<table style='left: -170px'>\n" +
            "  <tr>\n" +
            "    <th>Bus</th>\n" +
            "    <th>Type</th>\n" +
            "    <th>Threshold</th>\n" +
            "    <th>Detect</th>\n " +
            "    <th>Calibrate</th>\n ";

        if (this.isEditing) innerHTML = innerHTML + "<th>Delete</th>"

        innerHTML = innerHTML +
            "  </tr>" +
            "  <tr>" +
            "    <td>" +
            "        <select id='selectBus'>";

        for (let i = 0; i < this.buses.length; i++) {
            let found = 0;
            for (let j = 0; j < this.devices.length; j++) {
                if (this.devices[j].getBus() === "" + this.buses[i]) {
                    if (this.isEditing && this.adminState.editingDevice.getBus() === "" + this.buses[i]) continue;
                    found = 1;
                    break;
                }
            }

            if (found === 0) innerHTML = innerHTML + "<option value='" + this.buses[i] + "'>" + this.buses[i] + " </option>";
        }
        innerHTML = innerHTML +
            "        </select>" +
            "    </td>\n" +
            "    <td>" +
            "        <select id='selectType'>";

        for (let i = 0; i < this.deviceTypes.length; i++) {
            innerHTML = innerHTML + "<option value='" + this.deviceTypes[i] + "'>" + this.deviceTypes[i] + " </option>";
        }

        innerHTML = innerHTML +
            "        </select>" +
            "</td>" +
            "    <td><input id='thresholdInput' value=''></td>" +
            "    <td><button id='detectDevice'>DETECT</button><br><br><label id='detectLabel' style='color: red;'>UNDETECTED</label></td>" +
            "    <td><button id='calibrateDevice'>CALIBRATE</button><br><br><label id='calibrationLabel'>Current calibration: N/A</label></td>";

        if (this.isEditing) innerHTML = innerHTML + "<td><button id='deleteDevice'>DELETE</button></td>";

        innerHTML = innerHTML +
            "  </tr>" +
            "  <tr>" +
            "    <td></td>" +
            "    <td><button id='closeAddDevice' class='passbutton'>CLOSE</button></td>\n " +
            "    <td><button id='saveAddDevice' class='passbutton'>SAVE</button></td>\n " +
            "    <td></td>";

        if (this.isEditing) innerHTML = innerHTML + "<td></td>";

        innerHTML = innerHTML +
            "  </tr>" +
            "</table>";

        this.div.innerHTML = innerHTML;

        let state = this;
        this.getElementInsideContainer(this.getID(), "closeAddDevice").onclick = function () {
            state.requestStateChange("admin");
        };
        this.getElementInsideContainer(this.getID(), "saveAddDevice").onclick = function () {
            state.saveAddDevice();
        };
        this.getElementInsideContainer(this.getID(), "detectDevice").onclick = function() {
            state.sendRequest("POST", "script",
                "/home/pi/project/sensor/detect_device.sh " + document.getElementById("selectBus").value);
        };
        this.getElementInsideContainer(this.getID(), "calibrateDevice").onclick = function () {
            state.sendRequest("POST", "script", "/home/pi/project/sensor/python_executor.sh " +
                "\"/home/pi/project/sensor/calibrate_device.py " + document.getElementById("selectBus").value +
                " " + document.getElementById("selectType").value + "\"");
        };

        if (this.isEditing) {
            this.getElementInsideContainer(this.getID(), "deleteDevice").onclick = function () {
                state.adminState.removeDevice();
                state.requestStateChange("admin");
            };
            this.getElementInsideContainer(this.getID(), "selectType").value = this.adminState.editingDevice.getType();
            this.getElementInsideContainer(this.getID(), "selectBus").value = this.adminState.editingDevice.getBus();
            this.sendRequest("GET", "fileCheck:/home/pi/project/sensor/sensor_data/"
                + this.adminState.editingDevice.getBus() + ".cal", "");
            this.getElementInsideContainer(this.getID(), "thresholdInput").value = this.adminState.editingDevice.getThreshold();
        }

    }

    onResponse(http_text_exchange) {
        if (http_text_exchange.includes("detect_device")) {
            let scriptResponse = http_text_exchange.split(":")[2];
            document.getElementById("detectLabel").innerText = "Device detected:" + scriptResponse;
            if (scriptResponse === "false") document.getElementById("detectLabel").style = "color: red;";
            else document.getElementById("detectLabel").style = "color: green;";
        } else if (http_text_exchange.includes("calibrate_device")) {
            let scriptResponse = http_text_exchange.split(":")[2];
            if (scriptResponse === "true") document.getElementById("calibrationLabel").innerHTML = "Calibration status: complete";
            else document.getElementById("calibrationLabel").innerHTML = "Calibration status: incomplete";
        } else if (http_text_exchange.includes(".cal")) {
            console.log("Calibration exist check:" + http_text_exchange);
            let response = http_text_exchange.split(":")[1];
            if (response === "true") document.getElementById("calibrationLabel").innerHTML = "Calibration status: complete";
            else document.getElementById("calibrationLabel").innerHTML = "Calibration status: incomplete";
        }
    }

    saveAddDevice() {
        let selectBus = document.getElementById("selectBus");
        let selectType = document.getElementById("selectType");
        let threshold = document.getElementById("thresholdInput");

        let device = new Device(selectBus.value, selectType.value, threshold.value);

        if (this.isEditing) this.adminState.updateDevice(device);
        else this.adminState.addDevice(device);

        this.requestStateChange("admin");
    }

}