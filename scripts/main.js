$(document).ready(function(){
	/****** INITIAL DEFINITION *****/
	var cWidth = $(window).innerWidth() - 5;
	var cHeight = $(window).innerHeight() - 5;

	$('canvas').attr('width', cWidth);	// Resize the canvas
	$('canvas').attr('height', cHeight);

	var canvas = document.getElementById("canvas").getContext("2d");	// Pull our canvas

	/****** INITIATE CANVAS ******/
	var elapsed = 0;
	setInterval(function() {	// Draw and update every frame
		update();
		draw();
		elapsed++;
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
	var bullets = [];
	var bulletThrottle = false;

	function Bullet(i) {	// Bullet class constructor
		i.active    = true;
		
		i.xVelocity = 0;
		i.yVelocity = -i.speed;
		i.width     = 2;
		i.height    = 10;
		i.color     = "#F09"

		i.humanVisible = function() {
			return i.x >= 0 && i.x <= cWidth && i.y >= 0 && i.y <= cHeight;
		}

		i.draw = function() {
			canvas.fillStyle = this.color;
			canvas.fillRect(this.x, this.y, this.width, this.height);
		}

		i.update = function() {
			i.x += i.xVelocity;
			i.y += i.yVelocity;

			i.active = i.active && i.humanVisible();
		}

		return i;
	}

	var ship = {
		color : "#0BF",
		x     : cWidth / 2,
		y     : cHeight - 60,
		width : 30,
		height: 30,
		speed : 5,
		draw  : function() {
			canvas.fillStyle = this.color;
			canvas.fillRect(this.x, this.y, this.width, this.height);
		},
		shoot : function() {
			bullets.push(Bullet({
				speed: 20,
				x    : this.x + this.width / 2,
				y    : this.y
			}));
		}
	}

	/****** DEFINE UPDATE AND DRAW FUNCTIONS ******/
	function update() {
		if (keydown.left || keydown.a) {
			ship.x -= ship.speed;

			if (ship.x <= 0) {	// Reset position if we go out of bounds
				ship.x = 0;
			}
		} else if (keydown.right || keydown.d) {
			ship.x += ship.speed;

			if (ship.x >= cWidth - ship.width) {
				ship.x = cWidth - ship.width;
			}
		} else if (keydown.up || keydown.w) {
			ship.y -= ship.speed;

			if (ship.y <= 0) {
				ship.y = 0;
			}
		} else if (keydown.down || keydown.s) {
			ship.y += ship.speed;

			if (ship.y >= cHeight - ship.height) {
				ship.y = cHeight - ship.height;
			}
		}

		if (keydown.shift) { // Move faster when holding shift
			ship.speed = 10;
		} else {
			ship.speed = 5;
		}

		if (keydown.space) {
			if (bulletThrottle === false) {	// If we haven't shot recently
				ship.shoot();
				bulletThrottle = true;
				setTimeout(function(){bulletThrottle = false;}, 300);	// Don't let us shoot until 300ms
			}
		}

		bullets.forEach(function(bullet) {	// For each bullet, call its update method
			bullet.update();
		});

		bullets = bullets.filter(function(bullet) {	// Cut bullet list down to just active bullets
			return bullet.active;
		});
	}

	function draw() {
		canvas.clearRect(0, 0, cWidth, cHeight);	// Clear the canvas on each frame

		ship.draw();	// Draw the ship

		bullets.forEach(function(bullet) {	// Draw the bullets
			bullet.draw();
		});
	}
});