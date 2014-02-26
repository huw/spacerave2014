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
	var bullets        = [];
	var aliens         = [];
	var stars          = [];
	var bulletThrottle = false;
	var alienDirection = "right";
	var alienRandom    = 0;

	function Bullet(i) {	// Bullet class constructor
		i.active    = true;
		
		i.speed     = 20;
		i.width     = 4;
		i.height    = 10;
		i.color     = "#F09"

		i.draw = function() {
			canvas.fillStyle = this.color;
			canvas.fillRect(this.x, this.y, this.width, this.height);
		}

		i.update = function() {
			i.y -= i.speed;

			i.active = i.active && i.x >= 0 && i.x <= cWidth && i.y >= 0 && i.y <= cHeight;
		}

		return i;
	}

	function Alien(i) {	// Alien class constructor
		i.active = true;

		i.width = 30;
		i.height = 30;
		i.color = "#F00";
		i.speed = 4;
		i.state = "alive";

		i.draw = function() {
			canvas.drawImage(document.getElementById("alien"), this.x, this.y, this.width, this.height);
		}

		i.update = function() {
			if (alienDirection == "left") {
				i.x -= i.speed;
			} else if (alienDirection == "right") {
				i.x += i.speed;
			}
		}

		i.direction = function() {
			if (i.x < 0) {
				alienDirection = "right";
			} else if (i.x > cWidth - i.width) {
				alienDirection = "left";
			}
		}

		return i;
	}

	for (var y = 0; y < 3; y++) {
		for (var x = 0; x < 10; x++) {	// Iterate through a 3x10 matrix, push aliens based on their positon here
			aliens.push(Alien({
				x: 40 + x * 80,
				y: 40 + y * 80
			}));
		}
	}

	var ship = {	// Ship object constructor. It doesn't need to be a function
		color : "#0BF",
		x     : cWidth / 2,
		y     : cHeight - 60,
		width : 30,
		height: 30,
		speed : 5,
		state : "alive",
		draw  : function() {
			this.x += Math.random() - 0.5;
			this.y += Math.random() - 0.5;

			canvas.drawImage(document.getElementById("ship"), this.x, this.y, this.width, this.height);
		},
		shoot : function() {
			bullets.push(Bullet({
				speed: 20,
				x    : (this.x + this.width / 2) - Math.random() * 4,	// Quick random modifier for fun
				y    : this.y
			}));
		}
	}

	function Star(i) {
		i.active = true;

		i.x = Math.random() * cWidth;
		i.y = 0;
		i.width = Math.random() * 4;
		i.height = i.width;
		i.speed = 5 + (i.width * 5);
		i.color = "#FFF";

		i.draw = function() {
			canvas.fillStyle = this.color;
			canvas.fillRect(this.x, this.y, this.width, this.height);
		}

		i.update = function() {
			i.y += i.speed;

			i.active = i.active && i.x >= 0 && i.x <= cWidth && i.y >= 0 && i.y <= cHeight;
		}

		return i;
	}

	function collides(a, b) {	// Collision detection
		return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
	}

	function testCollisions() {
		bullets.forEach(function(bullet) {
			aliens.forEach(function(alien) {
				if (collides(bullet, alien)) {
					bullet.active = false;
					alien.state = "dying";
				}
			});
		});

		aliens.forEach(function(alien) {
			if (collides(ship, alien)) {
				alien.state = "dying";
				ship.state = "dying";
			}
		});
	}

	function killObject(object) {
		object.width -= 1;
		object.height -= 1;
		object.x += 0.5;
		object.y += 0.5;

		if (object.width < 1) {
			object.state = "dead";
			object.active = false;
		}
	}

	/****** DEFINE UPDATE AND DRAW FUNCTIONS ******/
	function update() {
		if (ship.state == "alive") {
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
		}

		bullets.forEach(function(bullet) {	// For each bullet, call its update method
			bullet.update();
		});

		bullets = bullets.filter(function(bullet) {	// Cut bullet list down to just active bullets
			return bullet.active;
		});

		aliens.forEach(function(alien) {	// For each alien
			alien.update();

			if (alien.state == "dying") {
				killObject(alien);
			}
		});

		aliens.forEach(function(alien) {
			alien.direction();
		});

		aliens = aliens.filter(function(alien) {	// Cut star list down
			return alien.active;
		});

		stars.forEach(function(star) {
			star.update();
		});

		stars = stars.filter(function(star) {	// Cut star list down
			return star.active;
		});

		testCollisions();

		if (ship.state == "dying") {
			killObject(ship);
		}
	}

	function draw() {
		canvas.clearRect(0, 0, cWidth, cHeight);	// Clear the canvas on each frame

		if (ship.state != "dead") {	// Draw the ship
			ship.draw();
		}

		bullets.forEach(function(bullet) {	// Draw the bullets
			bullet.draw();
		});

		aliens.forEach(function(alien) {	// Draw the aliens
			alien.draw();
		});

		stars.forEach(function(star) {	// Draw the stars
			star.draw();
		});

		console.log(stars.length);

		stars.push(Star({}));
	}
});