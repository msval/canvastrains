var canvas = document.getElementById('mainCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var ctx = canvas.getContext('2d');

var railColor = 'black';
var carLength = 15;
var carWidth = 8;
var carColor = 'brown';
var locomotiveColor = 'red';
var carDistance = 3;
var leftCycle = 200;
var rightCycle = 200;
var textColor = 'black';
var showTrainId = true;
var animationSpeed = 2;

var RailLine = function (x1, y1, x2, y2) {
	this.x1 = Math.ceil(x1);
	this.y1 = Math.ceil(y1);
	this.x2 = Math.ceil(x2);
	this.y2 = Math.ceil(y2);
};
RailLine.prototype.draw = function () {
	ctx.save();
	ctx.strokeStyle = railColor;
	ctx.beginPath();
	ctx.moveTo(this.x1, this.y1);
	ctx.lineTo(this.x2, this.y2);
	ctx.stroke();
	ctx.restore();
};

var Rail = function (id, railLines) {
	this.id = id;
	this.railLines = railLines;
	this.reservation = [];
};
Rail.prototype.xToy = function (x) {
	for (var i = 0; i < this.railLines.length; i++) {
		if (this.railLines[i].x1 <= x && x <= this.railLines[i].x2) {
			var a = (this.railLines[i].y2 - this.railLines[i].y1) / (this.railLines[i].x2 - this.railLines[i].x1);
			return this.railLines[i].y1 + a * (x - this.railLines[i].x1) - carWidth / 2;
		}
	}

	return this.railLines[0].y2 - carWidth / 2;
};
Rail.prototype.toAngle = function (x) {
	for (var i = 0; i < this.railLines.length; i++) {
		if (this.railLines[i].x1 <= x && x <= this.railLines[i].x2) {
			var dy = (this.railLines[i].y2 - this.railLines[i].y1);
			var dx = (this.railLines[i].x2 - this.railLines[i].x1);
			return Math.atan2(dy, dx);
		}
	}
	return 0;
};
Rail.prototype.left = function () {
	if (this.railLines && this.railLines[0]) {
		return this.railLines[0].x1;
	}
};
Rail.prototype.right = function () {
	if (this.railLines && this.railLines[this.railLines.length - 1]) {
		return this.railLines[this.railLines.length - 1].x2;
	}
};
Rail.prototype.middle = function () {
	return (this.left() + this.right()) / 2;
};
Rail.prototype.draw = function () {
	for (var i = 0; i < this.railLines.length; i++) {
		this.railLines[i].draw();
	}
};

var Car = function (color) {
	this.color = color;
};
Car.prototype.draw = function (id, x, rail) {
	var y = rail.xToy(x);
	var angle = rail.toAngle(x);
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(angle);
	if (this.color === locomotiveColor && showTrainId) {
		ctx.fillStyle = textColor;
		ctx.font = '12px arial';
		ctx.textBaseline = 'bottom';
		ctx.fillText(id, 0, 0);
	}
	ctx.fillStyle = this.color;
	ctx.beginPath();
	ctx.fillRect(-carLength / 2, 0, carLength, carWidth);
	ctx.fill();
	ctx.restore();
};

var Train = function (id, rail, speed, numCars, carColor) {
	this.id = id;
	this.rail = rail;
	this.previousRail = rail;
	this.speed = speed;
	this.state = 'moving';
	this.simState = '';
	this.reachedState = '';
	this.destinationX = null;

	var cars = [];
	for (var i = 0; i < numCars; i++) {
		this.x = speed > 0 ? rail.railLines[0].x1 : rail.railLines[0].x2;
		cars.push(new Car(i === 0 ? locomotiveColor : carColor));
	}
	this.cars = cars;
};
Train.prototype.move = function () {
	if (this.state == 'moving') {
		var newX = this.x + (this.speed) * animationSpeed;
		if (this.speed > 0 && newX > this.destinationX) {
			this.state = this.reachedState;
		}
		if (this.speed < 0 && newX < this.destinationX) {
			this.state = this.reachedState;
		}

		if (this.state == 'moving') {
			this.x = newX;
		}
	}
};
Train.prototype.draw = function () {
	for (var i = 0; i < this.cars.length; i++) {
		var x = this.x + (this.speed > 0 ? -1 : 1) * (i * (carLength + carDistance));
		var rail = this.rail;
		if (this.speed > 0 && x < this.rail.left()) {
			rail = this.previousRail;
		}
		if (this.speed < 0 && x >= this.rail.right()) {
			rail = this.previousRail;
		}

		this.cars[i].draw(this.id, x, rail);
	}
};
Train.prototype.trainLength = function () {
	return this.cars.length * (carLength + carDistance);
};

var RailSystem = function () {
	this.rails = [
		new Rail(0, [
			new RailLine(0, canvas.height / 2, canvas.width / 9, canvas.height / 2)
		]),
		new Rail(1, [
			new RailLine(canvas.width / 9, canvas.height / 2, canvas.width * 2 / 9, canvas.height / 3),
			new RailLine(canvas.width * 2 / 9, canvas.height / 3, canvas.width * 3 / 9, canvas.height / 3),
			new RailLine(canvas.width * 3 / 9, canvas.height / 3, canvas.width * 4 / 9, canvas.height / 2)
		]),
		new Rail(2, [
			new RailLine(canvas.width / 9, canvas.height / 2, canvas.width * 4 / 9, canvas.height / 2)
		]),
		new Rail(3, [
			new RailLine(canvas.width / 9, canvas.height / 2, canvas.width * 2 / 9, canvas.height * 2 / 3),
			new RailLine(canvas.width * 2 / 9, canvas.height * 2 / 3, canvas.width * 3 / 9, canvas.height * 2 / 3),
			new RailLine(canvas.width * 3 / 9, canvas.height * 2 / 3, canvas.width * 4 / 9, canvas.height / 2)
		]),
		new Rail(4, [
			new RailLine(canvas.width * 4 / 9, canvas.height / 2, canvas.width * 5 / 9, canvas.height / 2)
		]),
		new Rail(5, [
			new RailLine(canvas.width * 5 / 9, canvas.height / 2, canvas.width * 6 / 9, canvas.height / 3),
			new RailLine(canvas.width * 6 / 9, canvas.height / 3, canvas.width * 7 / 9, canvas.height / 3),
			new RailLine(canvas.width * 7 / 9, canvas.height / 3, canvas.width * 8 / 9, canvas.height / 2)
		]),
		new Rail(6, [
			new RailLine(canvas.width * 5 / 9, canvas.height / 2, canvas.width * 8 / 9, canvas.height / 2)
		]),
		new Rail(7, [
			new RailLine(canvas.width * 5 / 9, canvas.height / 2, canvas.width * 6 / 9, canvas.height * 2 / 3),
			new RailLine(canvas.width * 6 / 9, canvas.height * 2 / 3, canvas.width * 7 / 9, canvas.height * 2 / 3),
			new RailLine(canvas.width * 7 / 9, canvas.height * 2 / 3, canvas.width * 8 / 9, canvas.height / 2)
		]),
		new Rail(8, [
			new RailLine(canvas.width * 8 / 9, canvas.height / 2, canvas.width, canvas.height / 2)
		])
	];
};
RailSystem.prototype.draw = function () {
	for (var i = 0; i < this.rails.length; i++) {
		this.rails[i].draw();
	}
};

var SimMaster = function () {
	this.railSystem = new RailSystem();
	this.lcnt = -1;
	this.rcnt = -1;
	this.trains = [];
	this.trainIds = 0;
	this.maxNo = Math.floor(canvas.width / 9 / (carLength + carDistance)) - 2;
};
SimMaster.prototype.freeInSet = function (data) {
	var free = [];
	for (var i = 0; i < data.length; i++) {
		if (this.railSystem.rails[data[i]].reservation.length === 0) {
			free.push(data[i]);
		}
	}
	return free;
};
SimMaster.prototype.drawControlTower = function (x, y) {
	ctx.save();
	var width = Math.floor(canvas.width / 19);
	var height = Math.floor(canvas.height / 3);
	ctx.translate(x - width / 2, y - height / 2);
	ctx.fillStyle = 'lightgray';
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(0, height / 5);
	ctx.lineTo(width / 4, height * 2 / 5);
	ctx.lineTo(width / 2, height * 2 / 5);
	ctx.lineTo(width * 3 / 4, height / 5);
	ctx.lineTo(width * 3 / 4, 0);
	ctx.closePath();
	ctx.fill();
	ctx.fillRect(width / 4, (height * 2 / 5) - ctx.lineWidth , width / 4, (height * 3 / 5) + ctx.lineWidth);
	ctx.fillRect(width / 2, height * 3 / 5, width / 2, height * 2 / 5);
	ctx.fillStyle = 'gray';
	ctx.fillRect(0, 0, width * 3 / 4, 2);
	ctx.fillRect(width - width / 3, height - height / 10, width / 11, height / 11);
	ctx.fillStyle = '#ADDEFF';
	ctx.fillRect(width * 3 / 40, height / 25, width * 3 / 5, height * 4 / 25);
	ctx.restore();
};
SimMaster.prototype.draw = function () {
	var freeRailsL = this.freeInSet([0, 1, 2, 3]);
	var freeRailsR = this.freeInSet([8, 5, 6, 7]);
	var destinationX, numCars;
	if ((this.lcnt++ % leftCycle) === 0) {
		if (freeRailsL.length > 2 && this.freeInSet([0]).length > 0) {
			numCars = 1 + Math.floor(Math.random() * this.maxNo);
			this.trains[this.trains.length++] = new Train(this.trainIds++, simMaster.railSystem.rails[0], 1, numCars, randomColor());
			this.trains[this.trains.length - 1].destinationX = simMaster.railSystem.rails[0].right();
			this.trains[this.trains.length - 1].simState = 'goingToRegroup';
			this.trains[this.trains.length - 1].reachedState = 'firstTurn';
			this.railSystem.rails[0].reservation.push(this.trains[this.trains.length - 1].id);
		}
	}
	if ((this.rcnt++ % rightCycle) === 0) {
		if (freeRailsR.length > 2 && this.freeInSet([8]).length > 0) {
			numCars = 1 + Math.floor(Math.random() * this.maxNo);
			this.trains[this.trains.length++] = new Train(this.trainIds++, simMaster.railSystem.rails[8], -1, numCars, randomColor());
			this.trains[this.trains.length - 1].destinationX = simMaster.railSystem.rails[8].left();
			this.trains[this.trains.length - 1].simState = 'goingToRegroup';
			this.trains[this.trains.length - 1].reachedState = 'firstTurn';
			this.railSystem.rails[8].reservation.push(this.trains[this.trains.length - 1].id);
		}
	}
	this.railSystem.draw();
	for (var i = 0; i < this.trains.length; i++) {
		this.trains[i].move();
		if (this.trains[i].state === 'firstTurn') {
			var pick = this.trains[i].speed > 0 ? randomElement(freeRailsL) : randomElement(freeRailsR);
			destinationX = (this.railSystem.rails[pick].left() + this.railSystem.rails[pick].right()) / 2;
			this.railSystem.rails[pick].reservation.push(this.trains[i].id);
			this.trains[i].state = 'moving';
			this.trains[i].destinationX = destinationX;
			this.trains[i].reachedState = 'waitingForMiddle';
			this.trains[i].previousRail = this.trains[i].rail;
			this.trains[i].previousRail.reservation.shift();
			this.trains[i].rail = this.railSystem.rails[pick];
			this.railSystem.rails[4].reservation.push(this.trains[i].id);
		}
		if (this.trains[i].state === 'waitingForMiddle') {
			if (this.railSystem.rails[4].reservation[0] === this.trains[i].id) {
				var currentRail = this.trains[i].rail;
				this.trains[i].previousRail = currentRail;
				destinationX = this.trains[i].speed > 0 ? currentRail.right() : currentRail.left();
				this.trains[i].state = 'moving';
				this.trains[i].destinationX = destinationX;
				this.trains[i].reachedState = 'goIntoMiddle';
			}
		}
		if (this.trains[i].state === 'goIntoMiddle') {
			var middleRail = this.railSystem.rails[4];
			destinationX = this.trains[i].speed > 0 ? middleRail.right() : middleRail.left();
			this.trains[i].state = 'moving';
			this.trains[i].destinationX = destinationX;
			this.trains[i].reachedState = 'pickWayOut';
			this.trains[i].previousRail = this.trains[i].rail;
			this.trains[i].previousRail.reservation.shift();
			this.trains[i].rail = middleRail;
		}
		if (this.trains[i].state === 'pickWayOut') {
			var freeRailPickSet = this.freeInSet(this.trains[i].speed > 0 ? [5, 6, 7] : [1, 2, 3]);
			var wayOut = this.railSystem.rails[randomElement(freeRailPickSet)];
			if (wayOut) {
				destinationX = this.trains[i].speed > 0 ? wayOut.right() : wayOut.left();
				this.trains[i].state = 'moving';
				this.trains[i].destinationX = destinationX;
				this.trains[i].reachedState = 'goToExit';
				this.trains[i].previousRail = this.trains[i].rail;
				this.trains[i].previousRail.reservation.shift();
				this.trains[i].rail = wayOut;
				wayOut.reservation.push(this.trains[i].id);
				this.railSystem.rails[this.trains[i].speed > 0 ? 8 : 0].reservation.push(this.trains[i].id);
			}
		}
		if (this.trains[i].state === 'goToExit') {
			destinationX = this.trains[i].speed > 0 ? canvas.width + this.trains[i].trainLength() : - this.trains[i].trainLength();
			this.trains[i].state = 'moving';
			this.trains[i].destinationX = destinationX;
			this.trains[i].reachedState = 'exit';
			this.trains[i].previousRail = this.trains[i].rail;
			this.trains[i].previousRail.reservation.shift();
			this.trains[i].rail = this.railSystem.rails[this.trains[i].speed > 0 ? 8 : 0];
		}
		if (this.trains[i].state === 'exit') {
			this.railSystem.rails[this.trains[i].speed > 0 ? 8 : 0].reservation.shift();
			this.trains.splice(i, 1);
			i = 0;
		} else {
			this.trains[i].draw();
		}
	}

	if (showTrainId) {
		var middleSchedule = this.railSystem.rails[4].reservation;
		ctx.save();
		ctx.fillStyle = textColor;
		ctx.font = '20px arial';
		var text = 'No trains waiting for the control tower';
		if (middleSchedule.length > 0) {
			text = 'Control tower schedule: ';
			for (var j = 0; j < middleSchedule.length; j++) {
				text += middleSchedule[j] + ' ';
			}
		}
		var metrics = ctx.measureText(text);
		ctx.fillText(text, (canvas.width / 2) - metrics.width / 2, canvas.height * 4 / 5);
		ctx.restore();
	}

	this.drawControlTower(canvas.width / 2, canvas.height / 4);
};

var simMaster = new SimMaster();

window.onresize = function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	simMaster = new SimMaster();
};

window.requestAnimFrame = (function(){
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	function( callback ) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

function randomColor () {
	return 'rgb(' + Math.floor((Math.random() * 150)) + ', ' + Math.floor((Math.random() * 255)) + ',' + Math.floor((Math.random() * 255)) + ')';
}

function randomElement(data) {
	return data[Math.floor(Math.random() * data.length)];
}

var gui = new dat.GUI();
gui.add(window, 'animationSpeed').min(1).max(3).step(1).name('Speed');
gui.add(window, 'showTrainId').name('Show Text');
gui.add(window, 'leftCycle').min(100).max(1000).step(1).name('L New delay');
gui.add(window, 'rightCycle').min(100).max(1000).step(1).name('R New delay');

(function animloop(){
	requestAnimFrame(animloop);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	simMaster.draw();
})();