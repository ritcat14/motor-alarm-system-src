
class ScheduleManager extends State {

    constructor(stateName, netManager, adminState) {
        super(stateName, netManager);
        this.div.class = "admin";
        this.adminState = adminState;
        this.isEditing = (stateName.includes("edit"));
    }

    init() {
        super.init();

        this.devices = this.adminState.getDevices();
        this.schedules = this.adminState.getSchedules();
        let lastID = (this.schedules.length > 0) ? this.schedules[this.schedules.length - 1].getID() : 0;
        this.newID = parseInt(lastID) + 1;

        // Calculate today's date and set date select minimum to this
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (dd < 10) dd = '0'+dd;
        if (mm<10) mm='0'+mm;

        today = yyyy + '-' + mm + '-' + dd;

        let innerHTML =
            "<table style='left: -170px'>" +
            "   <tr>" +
            "       <th>ID</th>" +
            "       <th>Start Time</th>" +
            "       <th>End Time</th>" +
            "       <th>Start Date</th>" +
            "       <th>End Date</th>" +
            "       <th>State</th>" +
            "       <th>Device BUS</th>";

        if (this.isEditing) innerHTML = innerHTML + "<th>Delete</th>"

        innerHTML = innerHTML +
            "   </tr>" +
            "   <tr>" +
            "       <td>" + this.newID + "</td>" +
            "       <td><input type='time' id='scheduleStartTime' required></td>" +
            "       <td><input type='time' id='scheduleEndTime' required></td>" +
            "       <td><input type='date' id='scheduleStartDate' required pattern='\d{4}/\d{2}/\d{2}' min='" + today + "'></td>" +
            "       <td><input type='date' id='scheduleEndDate' required pattern='\d{4}/\d{2}/\d{2}' min='" + today + "'></td>" +
            "       <td><select id='stateSelect'>" +
            "               <option value='on'>on</option>" +
            "               <option value='off'>off</option>" +
            "           </select></td>" +
            "       <td><select id='selectBus'>";

        for (let i = 0; i < this.devices.length; i++) {
            innerHTML = innerHTML +
                "           <option value='" + this.devices[i].getBus() + "'>" + this.devices[i].getBus() + "</option>";
        }

        innerHTML = innerHTML +
            "           </select>" +
            "       </td>";

        if (this.isEditing) innerHTML = innerHTML + "<td><button id='deleteSchedule'>DELETE</button></td>";

        innerHTML = innerHTML +
            "   </tr>" +
            "   <tr>" +
            "       <td></td>" +
            "       <td></td>" +
            "       <td><button id='closeSchedule' class='passbutton'>CLOSE</button></td>" +
            "       <td><button id='saveSchedule' class='passbutton'>SAVE</button></td>" +
            "       <td></td>";

        if (this.isEditing) innerHTML = innerHTML + "<td></td>";

        innerHTML = innerHTML +
            "   </tr>" +
            "</table>";

        this.div.innerHTML = innerHTML;

        let state = this;
        this.getElementInsideContainer(this.getID(), "closeSchedule").onclick = function () {
            state.requestStateChange("admin");
        }
        this.getElementInsideContainer(this.getID(), "saveSchedule").onclick = function () {
            state.saveSchedule();
        }
        this.getElementInsideContainer(this.getID(), "scheduleEndDate").onclick = function () {
            state.checkDateLimits();
        }
        this.getElementInsideContainer(this.getID(), "scheduleEndTime").onclick = function () {
            state.checkTimeLimits();
        }

        if (this.isEditing) {
            this.getElementInsideContainer(this.getID(), "deleteSchedule").onclick = function () {
                state.adminState.removeSchedule();
                state.requestStateChange("admin");
            }
            this.getElementInsideContainer(this.getID(), "scheduleStartDate").value = state.adminState.editingSchedule.getStartDate();
            this.getElementInsideContainer(this.getID(), "scheduleEndDate").value = state.adminState.editingSchedule.getEndDate();
            this.getElementInsideContainer(this.getID(), "scheduleStartTime").value = state.adminState.editingSchedule.getStartTime();
            this.getElementInsideContainer(this.getID(), "scheduleEndTime").value = state.adminState.editingSchedule.getEndTime();
            this.getElementInsideContainer(this.getID(), "stateSelect").value = state.adminState.editingSchedule.getState();

            let scheduleBus = state.adminState.editingSchedule.getDeviceBus();
            if (scheduleBus !== "")
                this.getElementInsideContainer(this.getID(), "selectBus").value = state.adminState.editingSchedule.getDeviceBus();
        }

    }

    checkDateLimits() {
        let startDateValue = document.getElementById("scheduleStartDate").value;
        if (startDateValue !== "") {
            document.getElementById("scheduleEndDate").setAttribute("min", startDateValue);
        }
    }

    checkTimeLimits() {
        let startTimeValue = document.getElementById("scheduleStartTime").value;
        if (startTimeValue !== "") {
            document.getElementById("scheduleEndTime").setAttribute("min", startTimeValue);
        }
    }

    saveSchedule() {
        // Create a schedule from information
        // Send to admin state for config update

        let startTime = document.getElementById("scheduleStartTime").value;
        let endTime = document.getElementById("scheduleEndTime").value;
        let startDate = document.getElementById("scheduleStartDate").value;
        let endDate = document.getElementById("scheduleEndDate").value;
        let state = document.getElementById("stateSelect").value;

        let selectedBusID = document.getElementById("selectBus").value;
        let device = this.adminState.getDeviceByBus(selectedBusID);

        if (device === null) {
            console.log("Fatal error - device with bus ID " + selectedBusID + " does not exist! Please contact system admin!!");
        } else {
            let schedule = new Schedule(this.newID, startTime, endTime, startDate, endDate, state, device);
            if (this.isEditing) this.adminState.updateSchedule(schedule);
            else this.adminState.addSchedule(schedule);
        }

        this.requestStateChange("admin");
    }

}