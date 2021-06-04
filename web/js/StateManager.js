class StateManager {

    constructor(netManager, states) {
        this.states = states;
        this.currentState = states[0];
        this.currentStateID = this.currentState.getID();
        this.setState(states[0].getID());
        this.netManager = netManager;
    }

    addState(state) {
        this.states[this.states.length] = state;
    }

    setState(stateID) {
        for (let i = 0; i < this.states.length; i++) {
            let state = this.states[i];
            if (stateID === state.getID()) {
                this.currentState.changeComplete();
                this.currentState = state;
                this.currentStateID = state.getID();
                document.getElementById("main-content").innerHTML = ""; // wipe current content
                document.getElementById("main-content").appendChild(this.currentState.getDiv()); // Add provided content to main-content pane
                this.currentState.init();
                console.log("State set to:" + this.currentState.getID());
                console.log("Current state:" + this.currentState);
                return;
            }
        }
        console.log("ERROR: State " + stateID + " not found!");
    }

    update() {
        this.netManager.checkResponse();
        if (this.currentState === undefined) {
            console.log("Current state undefined!")
            console.log("State undefined:" + this.currentStateID);
        } else {
            this.currentState.update();
            if (this.currentState.getStateRequested()) {
                console.log("State manager handling change request");
                this.setState(this.currentState.getStateRequested());
            }
        }
    }

    onResponse(http_text_response) {
        console.log(http_text_response);
        this.currentState.onResponse(http_text_response);
    }

}