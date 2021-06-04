
class NetManager {

    constructor() {
        this.http_exchange = create_http_exchange();
    }


    onResponse(http_response) {
        console.log("HTTP Response:" + http_response);
    }

    checkResponse() {
        let manager = this;
        let exchange = this.http_exchange;
        this.http_exchange.onreadystatechange = function () {
            if (exchange.readyState === 4 && exchange.status === 200) {
                manager.onResponse(exchange.responseText);
            }
        }
    }

    sendRequest(type, heading, content) {
        send_request(this.http_exchange, type, heading, content);
    }

}