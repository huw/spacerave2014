$(document).ready(function(){
	/****** INITIAL DEFINITION *****/
	var cWidth = $(window).innerWidth() - 5;
	var cHeight = $(window).innerHeight() - 5;

	$('canvas').attr('width', cWidth);	// Resize the canvas
	$('canvas').attr('height', cHeight);

	var canvas = document.getElementById("canvas").getContext("2d");	// Pull our canvas

	/****** INITIATE CANVAS ******/
	setInterval(function() {	// Draw and update every frame
		update();
		draw();
	}, 1000/60);	// The number we divide by is the FPS

	/****** JQUERY-KEYDOWN-DETECTOR-O-MATIC-2000 ******/
	/* 	I kinda copied this bit from a canvas tutorial.
		It just simplifies the whole keypress detection
		experience */
	$(function() {
		window.keydown = {};

		function keyName(event) {
			return jQuery.hotkeys.specialKeys[event.which] || String.fromCharCode(event.which).toLowerCase();
		}

		$(document).bind("keydown", function(event) {
			keydown[keyName(event)] = true;
		});

		$(document).bind("keyup", function(event) {
			keydown[keyName(event)] = false;
		});
	});

	/****** DEFINE VARIABLES ******/
	var ship = {
		color : "#00BBFF",
		x     : cWidth / 2,
		y     : cHeight - 60,
		width : 30,
		height: 30,
		speed : 5,
		draw  : function() {
			canvas.fillStyle = this.color;
			canvas.fillRect(this.x, this.y, this.width, this.height);
		}
	}

	/****** DEFINE UPDATE AND DRAW FUNCTIONS ******/
	function update() {
		if (keydown.left || keydown.a) {
			ship.x -= ship.speed;

			if (ship.x <= 0) {	// Reset position if we go out of bounds
				ship.x = 0;
			}
		}

		if (keydown.right || keydown.d) {
			ship.x += ship.speed;

			if (ship.x >= cWidth - ship.width) {
				ship.x = cWidth - ship.width;
			}
		}

		if (keydown.up || keydown.w) {
			ship.y -= ship.speed;

			if (ship.y <= 0) {
				ship.y = 0;
			}
		} 

		if (keydown.down || keydown.s) {
			ship.y += ship.speed;

			if (ship.y >= cHeight - ship.height) {
				ship.y = cHeight - ship.height;
			}
		}

		if (keydown.shift) {
			ship.speed = 10;
		} else {
			ship.speed = 5;
		}
	}

	function draw() {
		canvas.clearRect(0, 0, cWidth, cHeight);

		ship.draw();
	}
});