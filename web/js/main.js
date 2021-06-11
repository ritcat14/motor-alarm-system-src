
function init() {
    let netManager = new NetManager();
    let config = new Config(CONFIG_DATA, netManager);

    let adminState;

    let states = [ adminState = new Admin(netManager, config) , new Stats(netManager), new DeviceManager("addDevice", netManager, adminState),
        new DeviceManager("editDevice", netManager, adminState), new ScheduleManager("addSchedule", netManager, adminState),
        new ScheduleManager("editSchedule", netManager, adminState)];
    this.stateManager = new StateManager(netManager, states);
    this.stateManager.setState("admin");

    let main = this;

    document.getElementById("button1").onclick = function () {
        main.stateManager.setState("admin");
    };
    document.getElementById("button2").onclick = function () {
        main.stateManager.setState("stats");
    };
    document.getElementById("button3").onclick = function () {
        main.stateManager.setState("track");
    };
    document.getElementById("button4").onclick = function () {
        history.go(0);
    };
}

function update() {
    this.stateManager.update();
}

init();

update();
setInterval(update, 3000);