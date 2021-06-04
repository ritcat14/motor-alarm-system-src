
class Config {

    constructor(data, netManager) {
        this.netManager = netManager;
        this.data = data.split("\n");
    }

    updateConfig() {
        // Send POST request to server to save config
        this.netManager.sendRequest("POST", "update-config", this.dataToString());
    }

    dataToString() {
        let result = "";
        for (let i = 0; i < this.data.length; i++) {
            if (result !== "" || result !== " ") result = result + this.data[i] + ";";
        }
        result = result.endsWith(";") ? result.substr(0, result.length - 1) : result;
        return result;
    }

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

    getAttributeData(attributeName) {
        let result = "";
        for (let i = 0; i < this.data.length; i++) {
            let attribute = this.data[i].split(":")[0];
            let data = this.data[i].split(":")[1];
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

    onResponse(http_text_exchange) {
        if (http_text_exchange.includes("updated-config")) {
            let parts = http_text_exchange.substr()
        }
    }

}