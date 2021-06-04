
class Schedule {

    constructor(ID, startTime, endTime, startDate, endDate, state, device) {
        this.ID = ID;
        this.startTime = startTime;
        this.endTime = endTime;
        this.startDate = startDate;
        this.endDate = endDate;
        this.state = state;
        this.device = device;
    }

    getID() {
        return this.ID;
    }

    getStartTime() {
        return this.startTime;
    }

    getEndTime() {
        return this.endTime;
    }

    getStartDate() {
        return this.startDate;
    }

    getEndDate() {
        return this.endDate;
    }

    getState() {
        return this.state;
    }

    getDevice() {
        return this.device;
    }

    getDeviceBus() {
        if (this.device === null) return "";
        else return this.device.getBus();
    }

    getStringData() {
        return this.getID() + "|" + this.getStartTime() + "|" + this.getEndTime() + "|" + this.getStartDate() + "|" +
            this.getEndDate() + "|" + this.getState() + "|" + this.getDeviceBus();
    }

}