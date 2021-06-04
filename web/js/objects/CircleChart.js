
class CircleChart {

    constructor(ID, radius, maxValue, barColor, backgroundColor, textSymbol, textColor, label, stats) {
        this.id = ID;
        this.radius = radius;
        this.maxValue = maxValue;
        this.barColor = barColor;
        this.backgroundColor = backgroundColor;
        this.textSymbol = textSymbol;
        this.textColor = textColor;
        this.label = label;
        this.lineWidth = radius/6;
        this.createCanvas(stats);
    }

    createCanvas(stats) {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "stats-canvas" + this.id;
        this.canvas.width = 200;
        this.canvas.height = 200;
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "50px";
        this.canvas.style.left = 30 + (this.id * 225) + "px";
        this.canvas.style.zIndex = '1';
        stats.getDiv().appendChild(this.canvas);
    }

    draw(value) {
        this.canvas = document.getElementById("stats-canvas" + this.id);
        const context = this.canvas.getContext("2d");

        context.clearRect(0, 0, this.radius*2, this.radius*2);

        const startAngle = 3 * (Math.PI / 4);
        const endAngle = (2 * Math.PI) + (Math.PI/4);
        const angleScale = (2 * Math.PI) - (Math.PI/2);

        const greenAngle = (2 * Math.PI) - (Math.PI/2);
        const orangeAngle = 1.95 * Math.PI;
        const redAngle = endAngle;

        let angle = (angleScale / this.maxValue) * value;
        const valueAngle = endAngle - (angleScale - angle);

        //
        context.lineWidth = 5;
        const outer_radius = this.radius + (this.lineWidth/2) + 5;
        context.beginPath();
        context.strokeStyle = 'green';
        context.arc(this.x, this.y, outer_radius, startAngle, greenAngle)
        context.stroke();

        context.beginPath();
        context.strokeStyle = 'orange';
        context.arc(this.x, this.y, outer_radius, greenAngle, orangeAngle);
        context.stroke();

        context.beginPath();
        context.strokeStyle = 'red';
        context.arc(this.x, this.y, outer_radius, orangeAngle, redAngle);
        context.stroke();

        //
        context.beginPath();
        context.strokeStyle = this.backgroundColor;
        context.lineWidth = this.lineWidth;
        context.arc(this.x, this.y, this.radius, startAngle, endAngle);
        context.stroke();

        context.beginPath();
        context.strokeStyle = this.barColor;
        context.arc(this.x, this.y, this.radius, startAngle, valueAngle);
        context.stroke();

        context.textAlign = 'center';
        context.fillStyle = this.textColor;
        context.font = (this.radius/2) + 'px Courier New';
        context.fillText(value, this.x, this.y);

        context.font = '10px Courier New';
        context.fillText(this.textSymbol, this.x, this.y + (this.radius/4));

        context.font = 'bold 18px Courier New';
        context.fillStyle = 'darkgreen';
        if (valueAngle > orangeAngle) context.fillStyle = '#b22222';
        if (valueAngle > greenAngle && valueAngle < orangeAngle) context.strokeStyle = 'orange';
        context.fillText(this.label, this.x, this.y + 75);
    }

    get x() {
        return this.width / 2;
    }

    get y() {
        return this.height / 2;
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }

}