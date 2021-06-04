
class Config {

    constructor(data, netManager) {
        this.netManager = netManager;
        this.data = data.split("\n");
    }

    // Devices

    removeDevice(device) {
        let deviceData = this.getAttributeData("devices");
        let dataParts = deviceData.split("*");
        let newData = "";

        for (let i = 0; i < dataParts.length; i++) {
            let currentBusID = dataParts[i].split("|")[0];
            if (currentBusID !== device.getBus()) newData = newData + dataParts[i] + "*";
        }
        newData = newData.endsWith("*") ? newData.substr(0, newData.length - 1) : newData;
        this.modifyAttribute("devices", newData);
    }

    addDevice(device) {
        let deviceData = this.getAttributeData("devices");
        let newData = device.getStringData();

        deviceData = deviceData + "*" + newData;
        deviceData = deviceData.startsWith("*") ? deviceData.substr(1, deviceData.length - 1) : deviceData;

        this.modifyAttribute("devices", deviceData);
    }

    updateDevice(oldDevice, newDevice) {
        let deviceData = this.getAttributeData("devices");
        let dataParts = deviceData.split("*");
        let newData = "";

        for (let i = 0; i < dataParts.length; i++) {
            let currentBusID = dataParts[i].split("|")[0];
            if (currentBusID !== oldDevice.getBus()) newData = newData + dataParts[i] + "*";
            else { // Old device found in config data, so update to new device data
                console.log("Updated device data:" + newDevice.getStringData());
                newData = newData + newDevice.getStringData() + "*";
            }
        }

        newData = newData.endsWith("*") ? newData.substr(0, newData.length - 1) : newData;
        this.modifyAttribute("devices", newData);
    }

    // Schedules

    removeSchedule(schedule) {
        let scheduleData = this.getAttributeData("schedules");
        let dataParts = scheduleData.split("*");
        let newData = "";

        for (let i = 0; i < dataParts.length; i++) {
            let currentID = dataParts[i].split("|")[0];
            if (currentID !== schedule.getID()) newData = newData + dataParts[i] + "*";
        }

        newData = newData.endsWith("*") ? newData.substr(0, newData.length - 1) : newData;
        this.modifyAttribute("schedules", newData);
    }

    addSchedule(schedule) {
        let scheduleData = this.getAttributeData("schedules");
        let newData = schedule.getStringData();

        scheduleData = scheduleData + "*" + newData;
        scheduleData = scheduleData.startsWith("*") ? scheduleData.substr(1, scheduleData.length - 1) : scheduleData;

        this.modifyAttribute("schedules", scheduleData);
    }

    updateSchedule(oldSchedule, newSchedule) {
        let scheduleData = this.getAttributeData("schedules");
        let dataParts = scheduleData.split("*");
        let newData = "";

        for (let i = 0; i < dataParts.length; i++) {
            let currentID = dataParts[i].split("|")[0];
            if (currentID !== oldSchedule.getID()) newData = newData + dataParts[i] + "*";
            else { // Old schedule found in config, so update to new device data
                console.log("Updated schedule data:" + newSchedule.getStringData());
                newData = newData + newSchedule.getStringData() + "*";
            }
        }

        newData = newData.endsWith("*") ? newData.substr(0, newData.length - 1) : newData;
        this.modifyAttribute("schedules", newData);
    }

    // Config editing

    updateConfig() {
        // Send POST request to server to save config
        this.netManager.sendRequest("POST", "admin/update-config", this.dataToString());
    }

    dataToString() {
        let result = "";
        for (let i = 0; i < this.data.length; i++) {
            if (result !== "" || result !== " ") result = result + this.data[i] + ";";
        }
        result = result.endsWith(";") ? result.substr(0, result.length - 1) : result;
        return result;
    }

    getAttributeData(attributeName) {
        let result = "";
        for (let i = 0; i < this.data.length; i++) {
            let dataParts = this.data[i].split(":");

            let attribute = dataParts[0];
            let data = dataParts[1];

            if (dataParts.length > 2) {
                for (let i = 2; i < dataParts.length; i++) {
                    data = data + ":" + dataParts[i];
                }
            }

            if (attribute === attributeName) {
                result = data;
                break;
            }
        }
        return result;
    }

    modifyAttribute(attributeName, attributeData) {
        let newData = this.data;                                                            // Copy of data
        for (let i = 0; i < this.data.length; i++) {
            let attribute = this.data[i].split(":")[0];                                     // Retrieve attribute for current data item
            if (attribute === attributeName) newData[i] = attribute + ":" + attributeData;  // If this is the attribute we wish to change, change it in the copied list
        }
        this.data = newData;                                                                 // Finally copy new list into data
        this.updateConfig();                                                                // And let the server know to update the file at the server end
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = data;
    }

    onResponse(http_text_exchange) {
        if (http_text_exchange.includes("updated-config")) {
            let data = http_text_exchange.substr(15, http_text_exchange.length - 15);
            this.setData(data.split("\n"));
        }
    }

}