class StateManager {

    constructor(netManager, states) {
        this.states = states;
        this.currentState = states[0];
        this.currentStateID = this.currentState.getID();
        this.setState(states[0].getID());
        this.netManager = netManager;
        let SM = this;
        this.netManager.onResponse = function (http_text) {
            SM.onResponse(http_text);
        }
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

    getState(stateName) {
        for (let i = 0; i < this.states.length; i++) {
            if (this.states[i].getID() === stateName) return this.states[i];
        }
        return null;
    }

    onResponse(http_text_response) {
        // Split message into parts and extract destination state name
        let message_parts = http_text_response.split(":");
        let dest_state_name = message_parts[0];
        // Get the actual state
        let dest_state = this.getState(dest_state_name.trim());
        // Forward the response to the appropriate state if found
        if (dest_state !== null) {
            let newMessage = "";
            for (let i = 1; i < message_parts.length; i++) newMessage = newMessage + message_parts[i] + ":"; // Recreate the message without the signature
            newMessage = newMessage.substr(0, newMessage.length - 1); // Remove last ":"
            dest_state.onResponse(newMessage); // Send new message
        }
    }

}