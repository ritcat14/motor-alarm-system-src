
class Stats extends State {

    constructor(netManager) {
        super("stats", netManager);
        this.div.class = "stats";
        this.circleCharts = [];
    }

    init() {
        console.log("Stats init");
        super.init();
        let fields = ["longitude", "latitude"];
        let i;
        for (i = 0; i < fields.length; i++) {
            const element = document.createElement("p");
            element.id = fields[i];
            this.div.appendChild(element);
        }

        const labels = ['TEMP1', 'TEMP2', 'SPEED'];
        const units = ['°C', '°F', 'MPH'];

        for (i = 0; i < 3; i++) {
            this.circleCharts[i] = new CircleChart(i, 80, 100, '#92DD86', '#8ABDEC',
                units[i], 'white', labels[i]);
        }
    }

    update() {
        this.netManager.sendRequest("GET", "data", "test");
    }

    onResponse(http_text_exchange) {
        const parts = http_text_exchange.split("\n");

        let longitude;
        let latitude;
        let temp1, temp2, speed;

        let i;
        for (i = 0; i < parts.length; i++) {
            const currentData = parts[i].split(":");
            if (currentData[0] === "long") longitude = currentData[1];
            else if (currentData[0] === "lat") latitude = currentData[1];
            else if (currentData[0] === "temp1") temp1 = currentData[1];
            else if (currentData[0] === "temp2") temp2 = currentData[1];
            else if (currentData[0] === "speed") speed = currentData[1];
        }

        document.getElementById("latitude").innerHTML = "Latitude: " + latitude;
        document.getElementById("longitude").innerHTML = "Longitude:" + longitude;

        this.circleCharts[0].draw(this.getRandomValue(0, 100));

        this.circleCharts[1].draw(this.getRandomValue(0, 100));

        this.circleCharts[2].draw(this.getRandomValue(0, 100));

        console.log("SPEED:" + speed);
        console.log("TEMP1:" + temp1);
        console.log("TEMP2:" + temp2);
        console.log("Latitude:" + latitude);
        console.log("Longitude:" + longitude);
    }

    getRandomValue(min, max) {
        return Math.floor(Math.random() * max) + min;
    }

}