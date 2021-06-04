
class State {

    constructor(id, netManager) {
        this.div = document.createElement("div");
        this.div.id = id;
        this.netManager = netManager;
    }

    init() {
        this.netManager.onResponse = this.onResponse;
    }

    update() {}

    onResponse(http_text_exchange) {
        console.log("Admin state on response: " + http_text_exchange);
    }

    getID() {
        return this.div.id;
    }

    getDiv() {
        return this.div;
    }

    requestStateChange(stateID) {
        console.log("State " + this.getID() + " requested to change to: " + stateID);
        this.requestedChange = true;
        this.stateRequested = stateID;
    }

    getElementInsideContainer(containerID, childID) {
        var elm = {};
        var elms = document.getElementById(containerID).getElementsByTagName("*");
        for (var i = 0; i < elms.length; i++) {
            if (elms[i].id === childID) {
                elm = elms[i];
                break;
            }
        }
        return elm;
    }

    isStateRequested() {
        return this.requestedChange;
    }

    getStateRequested() {
        return this.stateRequested;
    }

    changeComplete() {
        this.requestedChange = false;
        this.stateRequested = "";
    }

}