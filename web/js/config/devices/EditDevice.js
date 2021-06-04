
class EditDevice extends State {

    constructor(netManager, adminState) {
        super("editDevice", netManager);
        this.adminState = adminState;
        this.div.class = "admin";

        this.buses = [5, 4, 3, 1];
        this.devices = this.adminState.getDevices();
        this.deviceTypes = this.adminState.getDeviceTypes();
    }

    init() {
        super.init();

        this.device = this.adminState.getEditingDevice();

        let innerHTML =
            "<table style='left: -170px'>" +
            "   <tr>" +
            "       <th>Bus</th>" +
            "       <th>Type</th>" +
            "       <th>Active</th>" +
            "       <th>Detect</th>" +
            "       <th>Calibrate</th>" +
            "       <th>Delete</th>" +
            "   </tr>" +
            "   <tr>" +
            "       <td><select id='selectBus'>";

        innerHTML = innerHTML + "<option value='" + this.device.getBus() + "'>" + this.device.getBus() + " </option>";

        for (let i = 0; i < this.buses.length; i++) {
            let found = 0;
            for (let j = 0; j < this.devices.length; j++) {
                if (this.devices[j].getBus() === "" + this.buses[i]) {
                    found = 1;
                    break;
                }
            }

            if (found === 0) innerHTML = innerHTML + "<option value='" + this.buses[i] + "'>" + this.buses[i] + " </option>";
        }

        innerHTML = innerHTML +
            "</select></td>" +
            "       <td><select id='selectType'>";

        for (let i = 0; i < this.deviceTypes.length; i++) {
            innerHTML = innerHTML + "<option value='" + this.deviceTypes[i] + "'>" + this.deviceTypes[i] + " </option>";
        }

        innerHTML = innerHTML +
            "</select></td>" +
            "       <td>" + this.device.getActive() + "</td>" +
            "       <td><button id='detectDevice'>DETECT</button><br><br><label id='detectLabel'>UNDETECTED</label></td>" +
            "       <td><button id='calibrateDevice'>CALIBRATE</button><br><br><label id='calibrationLabel'>Current calibration: N/A</label></td>" +
            "       <td><button id='deleteDevice'>DELETE</button></td>" +
            "   </tr>" +
            "  <tr>" +
            "    <td></td>" +
            "    <td></td>" +
            "    <td><button id='closeEdit' class='passbutton'>CLOSE</button></td>\n " +
            "    <td><button id='saveEdit' class='passbutton'>SAVE</button></td>\n " +
            "    <td></td>" +
            "    <td></td>" +
            "  </tr>" +
            "</table>";
        this.div.innerHTML = innerHTML;

        let state = this;
        this.getElementInsideContainer(this.getID(), "deleteDevice").onclick = function () {
            state.deleteDevice(state.device);
            state.requestStateChange("admin");
        };
        this.getElementInsideContainer(this.getID(), "closeEdit").onclick = function () {
            state.requestStateChange("admin");
        };
        this.getElementInsideContainer(this.getID(), "saveEdit").onclick = function () {
            let newDevice = new Device(document.getElementById("selectBus").value,
                document.getElementById("selectType").value, state.device.getActive());
            state.adminState.updateDevice(state.device, newDevice);
            state.requestStateChange("admin");
        };
        this.getElementInsideContainer(this.getID(), "detectDevice").onclick = function() {
            state.sendRequest("POST", "bash-script",
                "/home/pi/project/sensor/detect_device.sh " + document.getElementById("selectBus").value);
        };
        this.getElementInsideContainer(this.getID(), "calibrateDevice").onclick = function () {
            // TODO: Add device calibration
            state.sendRequest("POST", "bash-script", "");
        };
    }

    deleteDevice(device) {
        this.adminState.removeDevice(device); // Remove device from config
    }

    onResponse(http_text_exchange) {
        if (http_text_exchange.includes("detect_device")) {
            let scriptResponse = http_text_exchange.split(":")[2];
            document.getElementById("detectLabel").innerText = "Device detected:" + scriptResponse;
            if (scriptResponse === "false") document.getElementById("detectLabel").style = "color: red;";
            else document.getElementById("detectLabel").style = "color: green;";
        }
    }

}