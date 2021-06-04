
class AddDevice extends State {

    constructor(netManager, adminState) {
        super("addDevice", netManager);
        this.div.class = "admin";
        this.adminState = adminState;
        this.buses = [5,4,3,1];
        this.devices = adminState.getDevices();
        this.deviceTypes = adminState.getDeviceTypes();
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
            "    <th>Detect</th>\n " +
            "    <th>Calibrate</th>\n " +
            "  </tr>" +
            "  <tr>" +
            "    <td>" +
            "        <select id='selectBus'>";

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
            "    <td><button id='detectDevice'>DETECT</button><br><br><label id='detectLabel' style='color: red;'>UNDETECTED</label></td>" +
            "    <td><button id='calibrateDevice'>CALIBRATE</button><br><br><label id='calibrationLabel'>Current calibration: N/A</label></td>" +
            "  </tr>" +
            "  <tr>" +
            "    <td></td>" +
            "    <td><button id='closeAddDevice' class='passbutton'>CLOSE</button></td>\n " +
            "    <td><button id='saveAddDevice' class='passbutton'>SAVE</button></td>\n " +
            "    <td></td>" +
            "  </tr>" +
            "</table>";

        this.div.innerHTML = innerHTML;

        let admin = this;
        this.getElementInsideContainer(this.getID(), "closeAddDevice").onclick = function () {
            admin.requestStateChange("admin");
        };
        this.getElementInsideContainer(this.getID(), "saveAddDevice").onclick = function () {
            admin.saveAddDevice();
        };
        this.getElementInsideContainer(this.getID(), "detectDevice").onclick = function() {
            admin.netManager.sendRequest("POST", "bash-script",
                "/home/pi/project/sensor/detect_device.sh " + document.getElementById("selectBus").value);
        };
        this.getElementInsideContainer(this.getID(), "calibrateDevice").onclick = function () {
            // TODO: Add device calibration
            admin.netManager.sendRequest("POST", "bash-script", "");
        };
    }

    onResponse(http_text_exchange) {
        if (http_text_exchange.includes("detect_device")) {
            let scriptResponse = http_text_exchange.split(":")[2];
            document.getElementById("detectLabel").innerText = "Device detected:" + scriptResponse;
            if (scriptResponse === "false") document.getElementById("detectLabel").style = "color: red;";
            else document.getElementById("detectLabel").style = "color: green;";
        }
    }

    saveAddDevice() {
        let index = 0;
        if (this.devices.length > 0) index = this.devices.length;

        let selectBus = document.getElementById("selectBus");
        let selectType = document.getElementById("selectType");

        let device = new Device(selectBus.value, selectType.value, false);

        this.devices[index] = device;

        this.adminState.addDevice(device);

        this.requestStateChange("admin");
    }

}