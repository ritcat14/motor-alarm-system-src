
class Device {

    constructor(busID, type, active) {
        this.busID = busID;
        this.deviceType = type;
        this.isActive = active;
    }

    getStringData() {
        return this.getBus() + "|" + this.getType() + "|" + this.getActive();
    }

    getBus() {
        return this.busID;
    }

    getType() {
        return this.deviceType;
    }

    getActive() {
        return this.isActive;
    }

}