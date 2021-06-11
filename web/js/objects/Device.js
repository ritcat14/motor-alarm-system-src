
class Device {

    constructor(busID, type, threshold) {
        this.busID = busID;
        this.deviceType = type;
        this.threshold = threshold;
    }

    getStringData() {
        return this.getBus() + "|" + this.getType() + "|" + this.getThreshold();
    }

    getThreshold() {
        return this.threshold;
    }

    getBus() {
        return this.busID;
    }

    getType() {
        return this.deviceType;
    }

}