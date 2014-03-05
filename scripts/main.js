$(document).ready(function(){
	/****** INITIAL DEFINITION *****/
	var cWidth = $(window).innerWidth() - 5;	// Make the canvas width most of the window size
	var cHeight = $(window).innerHeight() - 5;	// The extra five is so arrow keys don't scroll the document

	$('canvas').attr('width', cWidth);		// Resize the canvas to our screen dimensions
	$('canvas').attr('height', cHeight);

	var canvas = document.getElementById("canvas").getContext("2d");	// Pull our canvas

	/****** INITIATE CANVAS ******/
	var elapsed = 0;	// Amount of frames elapsed this game
	var window_focus = true;
	var muteThrottle = false;
	setInterval(function() {	// Draw and update every frame
		$(window).focus(function(){window_focus = true; bgMusic.play()});	// Called when the window is in focus
		$(window).blur(function(){window_focus = false; bgMusic.pause();});	// Called when the window isn't

		if (keydown.m && !muteThrottle) {	// Mute music
			if (!bgMusic.muted){
				bgMusic.muted = true;
			} else if (bgMusic.muted){
				bgMusic.muted = false;
			}

			var muteThrottle = true;
			setTimeout(function(){muteThrottle = false;}, 300);
		}

		if (window_focus && bgMusic.readyState == 4) {	// If the window is focused & the music is ready to play
			if (elapsed > 60 * 3) {	// After the 3 second countdown
				update();	// The big two. These do (almost) everything.
				draw();
			} else if (elapsed == 0) {
				canvas.clearRect(0, 0, cWidth, cHeight);	// Clear the canvas when we reset
			} else if (elapsed == 60 * 3) {	// Reset once, right before we play
				resetGame();
			} else {
				beginRave();	// Display the countdown if we're not playing or resetting
			}
			elapsed++;	// Should be obvious
		}
	}, 1000/60);	// Divide 1 second by our FPS

	var bgColour;
	setInterval(function() {
		if (window_focus) {
			bgColour = randomColour(bgAlpha, bgColour, bgAlpha + "00", "F0F");	// Change the background colour
		}
	}, 350);	// Called every beat

	var alertStart;
	var alertAlpha;
	var option;
	var alertText = "";
	var slowMo = false;
	setInterval(function() {	// The Wheel of Spin!
		if (window_focus && elapsed > 60 * 3) {
			invincible = false;	// Reset invinciblility
			if (slowMo === true) {
				bulletSpeed *= 5;		// Reset the last one
				alienBulletSpeed *= 5;
				alienSpeed *= 5;
				alienBulletInt /= 5;	// Inverted because we divide by this
				starModifier *= 5;

				aliens.forEach(function(alien) {
					alien.speed *= 5;
				});
				alienBullets.forEach(function(bullet) {
					bullet.speed *= 5;
				});
				bullets.forEach(function(bullet) {
					bullet.speed *= 5;
				});
				stars.forEach(function(star) {
					star.speed *= 5;
				});

				slowMo = false;
			}

			option = Math.floor(Math.random() * 6);	// Choose a random number

			while (option == 0 && bgAlpha == "f") {	// Sometimes this option isn't a good idea
				option = Math.floor(Math.random() * 6);
			}

			switch(option) {	// Do something depending on the random number
				case 0:
					bgAlpha = (parseInt(bgAlpha, 16) + 1).toString(16);	// This one raises a base 16 number by 1
					alertText = "PARTY HARDER!";
					break;
				case 1:
					ship.speed += 0.5;	// This one raises our movement speed a little
					alertText = "SPEED UP!";
					break;
				case 2:
					aliens.forEach(function(alien) {	// This one speeds up aliens
						alien.speed += 0.3;
					});
					alienSpeed += 0.3;	// Speed up new aliens and bullets
					alienBulletInt += 100;

					alertText = "ALIEN SPEED & BULLETS UP!"
					break;
				case 3:
					bulletSpeed      += 1;
					bulletWidth      += 1;
					bulletHeight     += 1;
					alienBulletWidth += 1;

					bullets.forEach(function(bullet) {
						bullet.speed  += 1;
						bullet.width  += 1;
						bullet.height += 1;
					});
					alienBullets.forEach(function(bullet) {
						bullet.width  += 1;
						bullet.height += 1;
					});

					alertText = "BULLET ENHANCEMENTS!";
					break;
				case 4:
					bulletSpeed /= 5;		// Slow. Everything. Down.
					alienBulletSpeed /= 5;	// You are Neo.
					alienSpeed /= 5;
					alienBulletInt *= 5;
					starModifier /= 5;

					aliens.forEach(function(alien) {
						alien.speed /= 5;
					});
					alienBullets.forEach(function(bullet) {
						bullet.speed /= 5;
					});
					bullets.forEach(function(bullet) {
						bullet.speed /= 5;
					});
					stars.forEach(function(star) {
						star.speed /= 5;
					});

					slowMo = true;

					alertText = "SLOW MO!";
					break;
				case 5:
					invincible = true;

					alertText = "UNKILLABLE BY BULLETS! (5 SEC)"
					break;
				default:
					alertText = "NO BONUS.";	// This is just to make people sad
					break;
			}

			alertAlpha = 0.1;	// Reset our alert
			alertStart = elapsed;
		}
	}, 5600);

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

	/****** COOKIE RETRIEVER ******/
	/* Again, I don't wanna reinvent the wheel.
	   Taken from stackoverflow */
	var createCookie = function(name, value, days) {
	    var expires;
	    if (days) {
	        var date = new Date();
	        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
	        expires = "; expires=" + date.toGMTString();
	    } else {
	        expires = "";
	    }
	    document.cookie = name + "=" + value + expires + "; path=/";
	}

	function getCookie(c_name) {
	    if (document.cookie.length > 0) {
	        c_start = document.cookie.indexOf(c_name + "=");
	        if (c_start != -1) {
	            c_start = c_start + c_name.length + 1;
	            c_end = document.cookie.indexOf(";", c_start);
	            if (c_end == -1) {
	                c_end = document.cookie.length;
	            }
	            return unescape(document.cookie.substring(c_start, c_end));
	        }
	    }
	    return 0;
	}

	/****** DEFINE VARIABLES ******/
	var bullets      = [];	// We have a bunch of arrays.
	var alienBullets = [];	// These store things like
	var aliens       = [];	// aliens, stars and bullets.
	var stars        = [];

	var bulletThrottle        = false;
	var alienBulletThrottle   = false;
	pushAlienRow();

	var alienDirection = "right";
	var alienY         = "";
	var score          = 0;

	var arrowsUsed = false;	// These change when we use the input
	var wasdUsed   = false;
	var spaceUsed  = false;
	var clickUsed  = false;

	var bgAlpha = "1";

	var bulletSpeed      = cHeight * 0.025;	// The speed is based on the height so users with tall screens have no advantage
	var alienBulletSpeed = cHeight * 0.006;
	var alienSpeed       = Math.floor(cWidth * 0.003);	// If we don't round, they misalign
	var bulletWidth      = cWidth * 0.003;
	var bulletHeight     = cWidth * 0.008;
	var alienBulletWidth = cWidth * 0.004;

	var alienBulletInt = 700;
	var invincible     = false;

	var starModifier = 1;

	function Bullet(i) {	// Bullet class constructor
		i.active = true;

		i.speed  = bulletSpeed;
		i.width  = bulletWidth;	// We base the size on width because
		i.height = bulletHeight;	// width is more likely to represent screen size
		i.colour = "#F0F";

		i.draw = function() {
			canvas.fillStyle = this.colour;
			canvas.fillRect(this.x, this.y, this.width, this.height);
		}

		i.update = function() {
			i.y -= i.speed;

			i.active = i.active && i.x >= 0 && i.x <= cWidth && i.y >= 0 && i.y <= cHeight;	// Only declare as active if its inside screen
		}

		return i;
	}

	function AlienBullet(i) {
		i.active = true;

		i.speed  = alienBulletSpeed;	// Alien bullets are pretty much the same as normal ones
		i.width  = alienBulletWidth;
		i.height = i.width;
		i.colour = "#F00";

		i.draw = function() {
			canvas.fillStyle = this.colour;
			canvas.fillRect(this.x, this.y, this.width, this.height);
		}

		i.update = function() {
			i.y += i.speed;

			i.active = i.active && i.x >= 0 && i.x <= cWidth && i.y >= 0 && i.y <= cHeight;
		}

		return i;
	}

	function Alien(i) {	// Alien class constructor
		i.active = true;

		i.width  = cWidth * 0.025;	// A lot of the game revolves around them
		i.height = i.width;			// being equal between screens
		i.colour = "#F00";
		i.alpha  = 1;
		i.speed  = alienSpeed;
		i.state  = "alive";	// This is a determinator for animations

		i.draw = function() {
			canvas.globalAlpha = this.alpha;	// Helps with fade out effect
			canvas.drawImage(document.getElementById("alien"), this.x, this.y, this.width, this.height);	// We're pulling the alien's sprite from raw html
			canvas.globalAlpha = 1;	// Reset this so we don't draw everything else transparent
		}

		i.update = function() {
			if (i.yDirection == "down") {	// This is a little hacky.
				i.y += i.speed;

				if (i.y >= i.originalY + cWidth * 0.0625) {	// If it has moved down about 80px, then stop moving
					i.yDirection = "";
				}
			}

			if (alienDirection == "left") {	// Move as told to
				i.x -= i.speed;
			} else if (alienDirection == "right") {
				i.x += i.speed;
			}
		}

		i.direction = function() {	// Which way should we be going?
			if (i.x < 0) {
				alienDirection = "right";

				aliens.forEach(function(alien) {	// This moves the bottom row outta the way
					alien.x += alien.speed;			// so new aliens don't misalign
				});

				pushAlienRow();
			} else if (i.x > cWidth - i.width) {
				alienDirection = "left";
			}
		}

		return i;
	}

	var ship = {	// Ship object constructor. It doesn't need to be a function
		colour: "#0BF",
		x     : cWidth / 2,	// Start at about the middle-bottom
		y     : cHeight - 60,
		width : cWidth * 0.025,	// You know the drill with relative sizing
		height: cWidth * 0.025,
		speed : cWidth * 0.006,
		alpha : 1,
		state : "alive",
		draw  : function() {
			this.x += Math.random() - 0.5;	// Jitter it a little
			this.y += Math.random() - 0.5;	// Looks like its moving really fast

			canvas.globalAlpha = this.alpha;
			canvas.drawImage(document.getElementById("ship"), this.x, this.y, this.width, this.height);
			canvas.globalAlpha = 1;
		},
		shoot : function() {	// Shoots bullets!
			bullets.push(Bullet({
				x: (this.x + this.width / 2) - Math.random() * 4,	// Fire bullets from slightly random spots
				y: this.y
			}));
		}
	}

	function Star(i) {
		i.active = true;

		i.x      = Math.random() * cWidth;	// Start somewhere at the top
		i.height = i.width;
		i.colour = "#CCC";

		i.draw   = function() {
			canvas.fillStyle = this.colour;
			canvas.fillRect(this.x, this.y, this.width, this.height);
		}

		i.update = function() {
			i.y += i.speed;

			i.active = i.active && i.x >= 0 && i.x <= cWidth && i.y >= 0 && i.y <= cHeight;
		}

		return i;
	}

	for (var x = 0; x < 40; x++) {	// We need to start with initial stars else it looks stupid
		starWidth = Math.random() * 4;
		stars.push(Star({
			y: Math.random() * cHeight,
			width: starWidth,
			speed: (5 + (starWidth * 5)) * starModifier
		}));
	}

	function collides(a, b) {	// Collision detection. Very simple, works beautifully.
		return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
	}

	function testCollisions() {
		bullets.forEach(function(bullet) {	// If we shoot alien
			aliens.forEach(function(alien) {
				if (collides(bullet, alien)) {
					bullet.active = false;	// Don't display the bullet
					alien.state = "dying";	// Don't display the alien
				}
			});
		});

		aliens.forEach(function(alien) {	// If we smash into an alien
			if (alien.state == "alive") {	// Don't smash into dying aliens
				if (collides(ship, alien)) {
					alien.state = "dying";	// Kill us both
					ship.state = "dying";
				}
			}
		});

		if (invincible === false) {
			alienBullets.forEach(function(bullet) {	// If we are shot
				if (collides(ship, bullet)) {
					ship.state = "dying";
				}
			});
		}

		aliens.forEach(function(alien) {	// Kill us if the alien reaches the bottom
			if (alien.y >= cHeight) {
				ship.state = "dying";
			}
		});
	}

	function killObject(object) {
		object.alpha -= 0.04 	// We fade away

		if (object.alpha < 0.01) {	// If we've faded
			object.state = "dead";	// We die
			object.active = false;	// Goodbye

			if (object == ship) {	// This is us. We're dead.
				firstTry = false;	// We're not green anymore
				elapsed  = 0;		// Start from the beginning

				bgMusic.pause()	// Reset music
				bgMusic.currentTime = 0;

				if (score > highScore) {
					createCookie("highscore", score + 1, "90");	// Improvements.
				}
			}
		}
	}

	function pushAlienRow() {
		for (var x = 0; x < 10; x++) {
			aliens.push(Alien({
				x: x * (cWidth * 0.0625),	// Add a space between each one
				y: 0
			}));
		}

		aliens.forEach(function(alien) {
			alien.originalY = alien.y;	// Move everyone down a little
			alien.yDirection = "down";
		});
	}

	bgMusic = document.getElementById('bg');
	bgMusic.play();
	bgMusic.loop = true;	// OOOH MUSIC!

	function randomColour(top, prev, avoid, avoid2) {	// Returns a random bright hex colour
		var colors = [0, 0, 0];	// Initiate array

		while (colors.join("") == top+top+top ||	// Avoid black and white
		colors.join("") == "000" ||
		colors.join("") == avoid ||	// Avoid x colour
		colors.join("") == avoid2 ||
		"#" + colors.join("") == prev) {	// Avoid the last colour
			for (var x = 0; x < colors.length; x++) {
				if (Math.random() < 0.5) {	  // Randomly choose x or 0 for the colour
					colors[x] = top;		  // Then join them to make 'F00' for example
				} else {
					colors[x] = "0";
				}
			}
		}

		return "#" + colors.join("");	// Push back a valid hex colour
	};

	/****** DEFINE UPDATE AND DRAW FUNCTIONS ******/
	function update() {
		if (ship.state == "alive") {	// You can't move when you're dead
			if (keydown.left || keydown.a) {	// Detect movement keys, move appropriately
				ship.x -= ship.speed;
			} else if (keydown.right || keydown.d) {
				ship.x += ship.speed;
			} else if (keydown.up || keydown.w) {
				ship.y -= ship.speed;
			} else if (keydown.down || keydown.s) {
				ship.y += ship.speed;
			}	// BTW, this is in a else if because diagonal movement was too fast

			if (keydown.left || keydown.right || keydown.up || keydown.down) {	// Help us track some stuff
				arrowsUsed = true;
			}

			if (keydown.a || keydown.d || keydown.w || keydown.s) {
				wasdUsed = true;
			}

			if (keydown.space) {
				spaceUsed = true;

				if (bulletThrottle === false) {	// If we haven't shot recently
					ship.shoot();
					bulletThrottle = true;
					setTimeout(function(){bulletThrottle = false;}, 350);	// Shoot on the beat
				}
			}

			$("#canvas").click(function(e){	// Same thing as above except somewhat clickier
				clickUsed = true;

			    if (bulletThrottle === false) {
			    	ship.shoot();
			    	bulletThrottle = true;
			    	setTimeout(function(){bulletThrottle = false;}, 350);
			    }
			});
		}

		if (ship.x <= 0) {	// Reset position if we go out of bounds
			ship.x = 0;
		}

		if (ship.x >= cWidth - ship.width) {	// Same thing
			ship.x = cWidth - ship.width;
		}

		if (ship.y <= 0) {
			ship.y = 0;
		}

		if (ship.y >= cHeight - ship.height) {
			ship.y = cHeight - ship.height;
		}

		bullets.forEach(function(bullet) {	// For each bullet, call its update method
			bullet.update();
		});

		bullets = bullets.filter(function(bullet) {	// Cut bullet list down to just active bullets
			return bullet.active;
		});

		alienBullets.forEach(function(bullet) {
			bullet.update();
		});

		alienBullets = alienBullets.filter(function(bullet) {
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

		aliens = aliens.filter(function(alien) {	// Cut aliens
			return alien.active;
		});

		if (aliens.length == 0) {
			pushAlienRow();
			alienDirection = "right";
		}

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

		score += 1;	// Add to the score!

		bgMusic.play();	// Play music!

		if (alertAlpha < 1 && alertText != "" && elapsed - alertStart < 100) {	// Fade text in
			alertAlpha += 0.1;
		} else if (alertText != "" && elapsed - alertStart >= 100) {	// Fade text out after that
			alertAlpha -= 0.1;
		}

		if (alertAlpha <= 0.1) {	// Reset text when it's faded
			alertText = "";
		}
	}

	function draw() {
		/* Here drawing order is incredibly important.
		First we have to clear the canvas, to prevent persistence.
		Then we draw the background stars, *then* the ships,
		and finally the bullets */

		canvas.clearRect(0, 0, cWidth, cHeight);
		canvas.fillStyle = bgColour;
		canvas.fillRect(0, 0, cWidth, cHeight);	// Background colour!

		if (ship.state != "dead") {	// Draw unless we did died
			ship.draw();
		}

		stars.forEach(function(star) {
			star.draw();
		});

		aliens.forEach(function(alien) {
			alien.draw();
		});

		bullets.forEach(function(bullet) {
			bullet.draw();
		});

		alienBullets.forEach(function(bullet) {
			bullet.draw();
		});

		starWidth = Math.random() * 4;
		stars.push(Star({	// Add a star every frame
			y: 0,
			width: starWidth,
			speed: (5 + (starWidth * 5)) * starModifier
		}));

		if (alienBulletThrottle === false) {	// Aliens shoot
			if (aliens[0]) {
				var randomAlien = Math.floor(Math.random() * aliens.length);	// Random alien shoots

				alienBullets.push(AlienBullet({
					x: aliens[randomAlien].x,
					y: aliens[randomAlien].y
				}));
				alienBulletThrottle = true;
				setTimeout(function(){alienBulletThrottle = false;}, alienBulletInt); // Shoot every two beats
			}
		}

		canvas.font = "30px PressStart2P";	// Print our score
		canvas.fillStyle = "#FFF";
		canvas.textAlign = "left";
		canvas.fillText("SCORE:" + score, 10, cHeight);

		canvas.font = "40px PressStart2P";	// Print the latest alert
		canvas.fillStyle = "rgba(255, 255, 255, " + alertAlpha + ")";
		canvas.textAlign = "center";
		canvas.fillText(alertText, cWidth / 2, 55);
	}

	function resetGame() {
		canvas.clearRect(0, 0, cWidth, cHeight);

		ship.x     = cWidth / 2;	// We must rebuild him!
		ship.y     = cHeight - 60;
		ship.alpha = 1;
		ship.state = "alive";	// Back from the dead!

		aliens       = [];	// Clearing these arrays works because they're either
		bullets      = [];	// initially rebuilt or rebuilt on frame
		alienBullets = [];
		stars        = [];

		bulletThrottle        = false;	// Reset
		alienBulletThrottle   = false;	// Every
		pushAlienRow();               	// Changed
		alienDirection        = "right";// Variable
		alienY                = "";
		score                 = 0;
		bgAlpha               = "1";
		ship.speed            = cWidth * 0.006;
		timeLeft              = 3;
		textSize              = 80;
		numberY               = cHeight / 2 + 90;
		bulletSpeed           = cHeight * 0.025;	// The speed is based on the height so users with tall screens have no advantage
		alienBulletSpeed      = cHeight * 0.006;
		alienSpeed            = Math.floor(cWidth * 0.003);	// If we don't round, they misalign
		bulletWidth           = cWidth * 0.003;
		bulletHeight          = cWidth * 0.008;
		alienBulletWidth      = cWidth * 0.004;
		alienBulletInt        = 700;
		option                = 0;
		alertText             = "";
		slowMo                = false;
		invincible            = false;
		starModifier          = 1;

		for (var x = 0; x < 40; x++) {	// We need to start with initial stars else it looks stupid
			starWidth = Math.random() * 4;
			stars.push(Star({
				y: Math.random() * cHeight,
				width: starWidth,
				speed: (5 + (starWidth * 5)) * starModifier
			}));
		}
	}

	var timeLeft = 3;
	var firstTry = true;
	var textSize = 80;
	var numberY  = cHeight / 2 + 90;
	function beginRave() {
		canvas.clearRect(0, 0, cWidth, cHeight);

		highScore = getCookie("highscore");	// Grabbin scores

		if (firstTry) {
			textColor = "#FFF";
			var textBody  = "BEGIN RAVE";	// Intro screen FTW
		} else {
			textColor = "#F00";
			var textBody  = "GAME OVER";	// You only lost if you were there
		}

		canvas.font = "80px PressStart2P";
		canvas.fillStyle = textColor;
		canvas.textAlign = 'center';
		canvas.fillText(textBody, cWidth / 2, cHeight / 2 - 80);

		if (elapsed % 60 == 0) {	// If a second passes
			timeLeft--;
		}

		textSize += 0.4;	// Text gets bigger
		numberY  += 0.2;	// from the center point

		if (!firstTry) {	// Only show score if we got one
			canvas.font = "40px PressStart2P";
			canvas.fillText("Score:" + score, cWidth / 2, cHeight / 2 + 180);
		}

		canvas.font = "25px PressStart2P";	// Highscores here
		canvas.fillText("Highscore:" + highScore, cWidth / 2, cHeight / 2 + 230)

		canvas.font = textSize + "px PressStart2P";	// Show us the time left in seconds
		canvas.fillText(timeLeft, cWidth / 2, numberY);

		canvas.font = "20px PressStart2P";

		if (!arrowsUsed) {	// Generate tutorial text. This one's pretty big, but very useful
			if (!wasdUsed) {
				if (!spaceUsed) {
					if (!clickUsed) {
						textBody = "Arrows or WASD to move, click or space to shoot.";
					} else {
						textBody = "Arrows or WASD to move, you can also use space to shoot!";
					}
				} else {
					if (!clickUsed) {
						textBody = "Arrows or WASD to move, you can also click to shoot!";
					} else {
						textBody = "Arrows or WASD to move";
					}
				}
			} else {
				if (!spaceUsed) {
					if (!clickUsed) {
						textBody = "You can also use arrows to move, click or space to shoot.";
					} else {
						textBody = "You can also use arrows to move or space to shoot!";
					}
				} else {
					if (!clickUsed) {
						textBody = "You can also use arrows to move or click to shoot!";
					} else {
						textBody = "You can also use arrows to move.";
					}
				}
			}
		} else {
			if (!wasdUsed) {
				if (!spaceUsed) {
					if (!clickUsed) {
						textBody = "You can also use WASD to move, click or space to shoot.";
					} else {
						textBody = "You can also use WASD to move, and space to shoot!";
					}
				} else {
					if (!clickUsed) {
						textBody = "You can also use WASD to move, and click to shoot!";
					} else {
						textBody = "You can also use WASD to move";
					}
				}
			} else {
				if (!spaceUsed) {
					if (!clickUsed) {
						textBody = "You can use click or space to shoot.";
					} else {
						textBody = "You can also space to shoot.";
					}
				} else {
					if (!clickUsed) {
						textBody = "You can also click to shoot!";
					} else {
						textBody = "";
					}
				}
			}
		}

		canvas.fillText(textBody, cWidth / 2, cHeight / 2 + 270);	// Fill the tutorial text
	}
});
