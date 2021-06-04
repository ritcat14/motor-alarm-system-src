
class Admin extends State {

    constructor(netManager, config) {
        super("admin", netManager);
        this.div.class = "admin";
        this.config = config;
        this.devices = [];
        this.deviceTypes = ["accelerometer", "gyroscope", "temperature"];
    }

    init() {
        super.init();
        this.div.innerHTML =
            "<table style='left: -170px'>\n" +
            "  <tr>\n" +
            "    <th>Change Password</th>\n" +
            "    <th>Device Management</th>\n" +
            "    <th>Scheduling</th>\n " +
            "  </tr>" +
            "  <tr>" +
            "    <td>" +
            "        <div>" +
            "            <table>" +
            "                <tr><td><label>Current Password:<br>\n" +
            "                            <input id=oldpass name=oldpass type=password value=\"\" maxlength=10 style=\"font-family: Verdana; font-size: 12pt; text-align: center; color: #003399;\">\n" +
            "                        </label></td></tr>" +
            "                <tr><td><label>New Password:<br>\n" +
            "                            <input id=newpass name=newpass type=password value=\"\" maxlength=20 style=\"font-family: Verdana; font-size: 12pt; text-align: center; color: #003399;\">\n" +
            "                        </label></td></tr>" +
            "                <tr><td><label>Verify New Password:<br>\n" +
            "                            <input id=verifynewpass name=verifynewpass type=password value=\"\" maxlength=20 style=\"font-family: Verdana; font-size: 12pt; text-align: center; color: #003399;\">\n" +
            "                        </label></td></tr>" +
            "            </table>" +
            "            <label id='passMessage'></label><br>" +
            "            <input type=\"submit\" id=\"passbutton\" value=\"SUBMIT\" class=\"inputButton\"></td>" +
            "        </div>" +
            "    </td>\n" +
            "    <td><div id='devicesDiv'></div><button id='addDeviceButton' class='passbutton'>ADD</button></td>\n " +
            "    <td><div id='schedulingDiv'></div><button id='addSchedule' class='passbutton'>ADD</button>" +
            "    </td>" +
            "</tr></table></div>";

        let admin = this;
        this.getElementInsideContainer(this.getID(), "passbutton").onclick = function () {
            admin.updatePassword();
        };

        this.getElementInsideContainer(this.getID(), "addDeviceButton").onclick = function () {
            admin.requestStateChange("addDevice")
        };
        this.update();
    }

    update() {
        this.devices = [];
        let schedulingDiv = document.getElementById("schedulingDiv");
        let devicesDiv = document.getElementById("devicesDiv");

        let innerHTML =
            "        <table>" +
            "            <tr>" +
            "                <th>ID</th>" +
            "                <th>Time</th>" +
            "                <th>Date</th>" +
            "                <th>State</th>" +
            "                <th>Action</th>" +
            "            </tr>";

        let devicesInnerHTML =
            "        <table>" +
            "            <tr>" +
            "                <th>Bus</th>" +
            "                <th>Type</th>" +
            "                <th>Active</th>" +
            "                <th>Action</th>" +
            "            </tr>";


        let data = this.config.getData();

        for (let i = 0; i < data.length; i++) {
            let attribute = data[i].split(":")[0];

            if (attribute === "schedules") { // Load schedule data into table
                let scheduleData = data[i].split(":")[1];
                let parts = scheduleData.split("*");
                for (let j = 0; j < parts.length; j++) {
                    let finalParts = parts[j].split("|");
                    innerHTML = innerHTML + "<tr><td>" + finalParts[0] + "</td><td>" + finalParts[1] + "</td><td>" +
                        finalParts[2] + "</td><td>" + finalParts[3] + "</td><td><button>EDIT</button></td></tr>\n";
                }
            } else if (attribute === "devices") {
                let deviceData = data[i].split(":")[1];
                if (deviceData === "" || deviceData === " " || deviceData === "none") break;
                let parts = deviceData.split("*");
                for (let j = 0; j < parts.length; j++) {
                    let finalParts = parts[j].split("|");
                    devicesInnerHTML = devicesInnerHTML + "<tr><td>" + finalParts[0] + "</td><td>" + finalParts[1] + "</td><td>" +
                        finalParts[2] + "</td><td><button id='editDevice" + finalParts[0] + "'>EDIT</button></td></tr>\n";
                    this.devices[j] = new Device(finalParts[0], finalParts[1], finalParts[2]);
                }
                break;
            }
        }

        schedulingDiv.innerHTML = innerHTML + "        </table>";
        devicesDiv.innerHTML = devicesInnerHTML + "        </table>";

        let admin = this;
        for (let i = 0; i < this.devices.length; i++) {
            let elementName = "editDevice" + this.devices[i].getBus();
            document.getElementById(elementName).onclick = function () {
                admin.requestStateChange("editDevice");
                admin.setEditingDevice(admin.devices[i]);
            };
        }

        document.getElementById("addDeviceButton").hidden = this.devices.length === 4;
    }

    updatePassword() {
        let currPass = document.getElementById("oldpass").value.code();
        let newPass = document.getElementById("newpass").value.code();
        let newVerifyPass = document.getElementById("verifynewpass").value.code();
        let message = document.getElementById("passMessage");
        if (currPass === 0 || newPass === 0 || newVerifyPass === 0) {
            message.innerHTML = "Field is blank!";
            message.style = "color: #FF0000;";
            return;
        }
        // Verify passwords match
        if (newPass === newVerifyPass) {
            // Send request to server to verify update
            this.netManager.sendRequest("POST", "update-password", currPass + ";" + newPass);
            message.innerHTML = "Updating...";
            message.style = "color: #FFFFFF;";
        } else {
            message.innerHTML = "Passwords do not match!";
            message.style = "color: #FF0000;";
        }
    }

    addDevice(device) {
        this.config.addDevice(device);
    }

    removeDevice(device) {
        this.config.removeDevice(device);
    }

    updateDevice(oldDevice, newDevice) {
        this.config.updateDevice(oldDevice, newDevice);
    }

    setEditingDevice(dev) {
        this.editingDevice = dev;
    }

    getEditingDevice() {
        return this.editingDevice;
    }

    onResponse(http_text_exchange) {
        if (http_text_exchange.includes("password-changed")) {
            let message = document.getElementById("passMessage");
            message.innerText = http_text_exchange.split(":")[1];
            if (http_text_exchange.includes("incorrect")) {
                message.style = "color: #FF0000;";
            } else {
                message.style = "color: #00FF00;";
                history.go(0);
            }
        }
    }

    getDevices() {
        return this.devices;
    }

    setDevices(devices) {
        this.devices = devices;
    }

    getDeviceTypes() {
        return this.deviceTypes;
    }

}