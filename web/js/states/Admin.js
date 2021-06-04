
class Admin extends State {

    constructor(netManager, config) {
        super("admin", netManager);
        this.div.class = "admin";
        this.config = config;
        this.devices = [];
        this.deviceTypes = ["accelerometer", "gyroscope", "temperature"];
        this.schedules = [];
    }

    init() {
        super.init();
        this.div.innerHTML =
            "<table style='left: -170px' class='adminTable'>\n" +
            "  <tr class='adminTableRow'>\n" +
            "    <th class='adminTableRow'>Change Password</th>\n" +
            "    <th class='adminTableRow'>Device Management</th>\n" +
            "    <th class='adminTableRow'>Scheduling</th>\n " +
            "  </tr>" +
            "  <tr class='adminTableRow'>" +
            "    <td class='adminTableRow'>" +
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
            "    <td class='adminTableRow'><div id='devicesDiv'></div><button id='addDeviceButton' class='passbutton'>ADD</button></td>\n " +
            "    <td class='adminTableRow'><div id='schedulingDiv'></div><button id='addSchedule' class='passbutton'>ADD</button>" +
            "    </td>" +
            "</tr></table></div>";

        let admin = this;
        this.getElementInsideContainer(this.getID(), "passbutton").onclick = function () {
            admin.updatePassword();
        };

        this.getElementInsideContainer(this.getID(), "addDeviceButton").onclick = function () {
            admin.requestStateChange("addDevice")
        };
        this.getElementInsideContainer(this.getID(), "addSchedule").onclick = function () {
            admin.requestStateChange("addSchedule");
        }
        this.update();
    }

    update() {
        this.devices = [];
        this.schedules = [];
        let schedulingDiv = document.getElementById("schedulingDiv");
        let devicesDiv = document.getElementById("devicesDiv");

        let schedulesInnerHTML =
            "        <table>" +
            "            <tr>" +
            "                <th>ID</th>" +
            "                <th>Start Time</th>" +
            "                <th>End Time</th>" +
            "                <th>Start Date</th>" +
            "                <th>End Date</th>" +
            "                <th>State</th>" +
            "                <th>Device BUS</th>" +
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

        let deviceData = this.config.getAttributeData("devices");
        let scheduleData = this.config.getAttributeData("schedules");

        if (deviceData !== "") {
            let deviceDataParts = deviceData.split("*");

            for (let i = 0; i < deviceDataParts.length; i++) {
                let separatedData = deviceDataParts[i].split("|");
                if (separatedData === "") break;
                let bus = separatedData[0];
                let type = separatedData[1];
                let active = separatedData[2];

                this.devices[i] = new Device(bus, type, active);

                devicesInnerHTML = devicesInnerHTML +
                    "<tr>" +
                    "   <td>" + bus + "</td>" +
                    "   <td>" + type + "</td>" +
                    "   <td>" + active + "</td>" +
                    "   <td><button id='editDevice" + bus + "'>EDIT</button></td>" +
                    "</tr>";
            }
        }

        if (scheduleData !== "") {
            let scheduleDataParts = scheduleData.split("*");
            for (let i = 0; i < scheduleDataParts.length; i++) {
                let separatedData = scheduleDataParts[i].split("|");
                if (separatedData === "") break;
                let id = separatedData[0];
                let startTime = separatedData[1];
                let endTime = separatedData[2];
                let startDate = separatedData[3];
                let endDate = separatedData[4];
                let state = separatedData[5];
                let busID = separatedData[6];

                schedulesInnerHTML = schedulesInnerHTML +
                    "<tr>" +
                    "   <td>" + id + "</td>" +
                    "   <td>" + startTime + "</td>" +
                    "   <td>" + endTime + "</td>" +
                    "   <td>" + startDate + "</td>" +
                    "   <td>" + endDate + "</td>" +
                    "   <td>" + state + "</td>" +
                    "   <td>" + busID + "</td>" +
                    "   <td><button id='editSchedule" + id + "'>EDIT</button></td>" +
                    "</tr>";

                let device = this.getDeviceByBus(busID);
                this.schedules[i] = new Schedule(id, startTime, endTime, startDate, endDate, state, device);
            }
        }

        schedulingDiv.innerHTML = schedulesInnerHTML + "        </table>";
        devicesDiv.innerHTML = devicesInnerHTML + "        </table>";

        let admin = this;
        for (let i = 0; i < this.devices.length; i++) {
            let elementName = "editDevice" + this.devices[i].getBus();
            document.getElementById(elementName).onclick = function () {
                admin.setEditingDevice(admin.devices[i]);
                admin.requestStateChange("editDevice");
            };
        }

        for (let i = 0; i < this.schedules.length; i++) {
            let elementName = "editSchedule" + this.schedules[i].getID();
            document.getElementById(elementName).onclick = function () {
                admin.setEditingSchedule(admin.schedules[i]);
                admin.requestStateChange("editSchedule");
            };
        }

        document.getElementById("addDeviceButton").hidden = this.devices.length === 4;
    }

    setEditingDevice(dev) {
        this.editingDevice = dev;
    }

    setEditingSchedule(schedule) {
        this.editingSchedule = schedule;
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
            super.sendRequest("POST", "update-password", currPass + ";" + newPass);
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

    removeDevice() {
        this.config.removeDevice(this.editingDevice);
    }

    updateDevice(newDevice) {
        this.config.updateDevice(this.editingDevice, newDevice);
    }

    addSchedule(schedule) {
        this.config.addSchedule(schedule);
    }

    removeSchedule() {
        this.config.removeSchedule(this.editingSchedule);
    }

    updateSchedule(newSchedule) {
        this.config.updateSchedule(this.editingSchedule, newSchedule);
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
        } else this.config.onResponse(http_text_exchange);
    }

    getDevices() {
        return this.devices;
    }

    getDeviceByBus(bus) {
        for (let i = 0; i < this.devices.length; i++) {
            if (this.devices[i].getBus() === bus) return this.devices[i];
        }
        return null;
    }

    setDevices(devices) {
        this.devices = devices;
    }

    getDeviceTypes() {
        return this.deviceTypes;
    }

    getSchedules() {
        return this.schedules;
    }

}