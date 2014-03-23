$(document).ready(function(){
	/****** INITIAL DEFINITION *****/
	var cWidth = $(window).innerWidth() - 5;	// Make the canvas width most of the window size
	var cHeight = $(window).innerHeight() - 5;	// The extra five is so arrow keys don't scroll the document

	function testOrientation() {
		if (cWidth < cHeight) {
			$('#canvas').hide();
			$('.message').text("Please rotate into landscape.");
		}
	}

	testOrientation();

	$('canvas').attr('width', cWidth);		// Resize the canvas to our screen dimensions
	$('canvas').attr('height', cHeight);

	var cElement = document.getElementById('canvas');
	var canvas = cElement.getContext("2d");	// Pull our canvas

	/****** LOADING SCREEN ******/
	canvas.clearRect(0, 0, cWidth, cHeight);
	canvas.font = (cWidth / 13) + "px PressStart2P";
	canvas.fillStyle = "#FFF";
	canvas.textAlign = "center";
	canvas.fillText("LOADING", cWidth / 2, cHeight / 2);

	/****** INITIATE CANVAS ******/
	var elapsed = 0;	// Amount of frames elapsed this game
	var window_focus = true;
	var muteThrottle = false;
	setInterval(function() {	// Draw and update every frame
		$(window).focus(function(){
			window_focus = true;
			if (gameMode == "normal") {
				bgMusic.play();
			} else {
				allStar.play();
			}
		});	// Called when the window is in focus
		$(window).blur(function(){window_focus = false; bgMusic.pause(); allStar.pause();});	// Called when the window isn't

		if (window_focus) {	// If the window is focused & the music is ready to play
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

			if (elapsed == 1) {
				threeFX.currentTime = 0;
				threeFX.play();
			} else if (elapsed == 60) {
				twoFX.currentTime = 0;
				twoFX.play();
			} else if (elapsed == 120) {
				oneFX.currentTime = 0;
				oneFX.play();
			}
		}
	}, 1000/60);	// Divide 1 second by our FPS

	var bgColour;
	var muteThrottle = false;
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
	function wheelOfSpin() {
		if (window_focus && elapsed > 60 * 3 && elapsed % 330 == 0) {
			invincible = false;	// Reset invinciblility
			bulletType    = "single";	// Reset bullets
			bulletNumber  = 0;
			bulletTimeout = 350;
			gameMode = "normal";
			allStar.pause();
			if (slowMo === true) {
				bulletSpeed *= 5;		// Reset the last one
				alienBulletSpeed *= 5;
				alienSpeed *= 5;
				alienBulletInt /= 5;	// Inverted because we divide by this
				starModifier *= 5;
				xSpeedMod = 1;

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

			var chooseNumber = function() {
				option = Math.floor(Math.random() * 10);	// Choose a random number
			}

			chooseNumber();

			while (option == 0 && bgAlpha == "f") {	// Sometimes this option isn't a good idea
				chooseNumber();
			}

			while (option == 4 && elapsed < 4000) {
				chooseNumber();
			}

			while (option == 1 && elapsed < 1000) {
				chooseNumber();
			}

			switch(option) {	// Do something depending on the random number
				case 0:
					bgAlpha = (parseInt(bgAlpha, 16) + 1).toString(16);	// This one raises a base 16 number by 1
					alertText = "PARTY HARDER!";
					break;
				case 1:
					ship.speed += 0.5;
					aliens.forEach(function(alien) {
						alien.speed += 0.5;
					});
					alienSpeed += 0.5;
					bulletSpeed += 0.5;
					alienBulletSpeed += 0.5;
					bullets.forEach(function(bullet) {
						bullet.speed += 0.5;
					});
					alienBullets.forEach(function(bullet) {
						bullet.speed += 0.5;
					});

					alertText = "SPEED UP!";
					break;
				case 2:
					aliens.forEach(function(alien) {	// This one speeds up aliens
						alien.speed += 0.5;
					});
					alienSpeed += 0.5;	// Speed up new aliens and bullets
					alienBulletInt += 100;

					alertText = "HARDER ALIENS!"
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

					alertText = "BIGGER BULLETS!";
					break;
				case 4:
					bulletSpeed /= 5;		// Slow. Everything. Down.
					alienBulletSpeed /= 5;	// You are Neo.
					alienSpeed /= 5;
					alienBulletInt *= 5;
					starModifier /= 5;
					xSpeedMod = 5;

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

					alertText = "IMMUNE TO BULLETS (5 SEC)";
					break;
				case 6:
					bulletType    = "double";
					bulletNumber  = 1;
					bulletTimeout = 350;

					alertText = "DOUBLE BULLETS!";
					break;
				case 7:
					bulletType    = "double";
					bulletNumber  = 2;
					bulletTimeout = 350;

					alertText = "TRIPLE BULLETS!";
					break;
				case 8:
					bulletType    = "laser";
					bulletTimeout = 700;

					alertText = "IMMA FIRIN MAH LASER!";
					break;
				case 9:
					gameMode = "shrek";
					bgMusic.pause();
					allStar.currentTime = 0;

					alertText = "SPACE SWAMP INCOMING!";
					break;
				default:
					alertText = "NO BONUS.";	// This is just to make people sad
					break;
			}

			alertAlpha = 0.1;	// Reset our alert
			alertStart = elapsed;
		}
	}

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

	/****** JQUERY MOBILE BROWSER DETECTOR *****/
	/* Courtesy of detectmobilebrowsers.com */
	(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

	if (jQuery.browser.mobile) {
		window.scrollTo(0, 1);
	}

	/****** DEFINE VARIABLES ******/
	var bullets      = [];	// We have a bunch of arrays.
	var alienBullets = [];	// These store things like
	var aliens       = [];	// aliens, stars and bullets.
	var stars        = [];

	var bulletThrottle      = false;
	var alienBulletThrottle = false;

	var alienDirection = "right";
	var alienY         = "";
	var score          = 0;
	var bulletNumber   = 0;

	var arrowsUsed = false;	// These change when we use the input
	var wasdUsed   = false;
	var spaceUsed  = false;
	var clickUsed  = false;

	var bgAlpha = "1";

	var bulletSpeed      = Math.floor(cHeight * 0.025);	// The speed is based on the height so users with tall screens have no advantage
	var alienBulletSpeed = Math.floor(cHeight * 0.006);
	var alienSpeed       = Math.floor(cWidth * 0.0037);	// If we don't round, they misalign
	var bulletWidth      = Math.floor(cWidth * 0.006);
	var bulletHeight     = Math.floor(cWidth * 0.016);
	var alienBulletWidth = Math.floor(cWidth * 0.008);
	var xSpeedMod        = 1;
	var bulletTimeout    = 350;

	if (jQuery.browser.mobile) {
		bulletWidth, bulletHeight, alienBulletWidth *= 2;
	}

	var alienBulletInt = 700;
	var invincible     = false;
	var bulletType     = "single";
	var gameMode       = "normal";

	var starModifier = 1;
	var firstRow     = true;
	
	var mousePos;
	var buttondown = {
		left: false,
		right: false,
		up: false,
		down: false,
		fire: false
	}
	var mouseDown = false;

	pushAlienRow();

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
			i.x += i.xSpeed;

			i.active = i.active && i.x >= 0 && i.x <= cWidth && i.y >= 0 && i.y <= cHeight;	// Only declare as active if its inside screen
		}

		return i;
	}

	function Laser(i) {
		i.active = true;

		i.width  = bulletWidth * 3;
		i.height = cHeight;
		i.colour = "#F60";
		i.start  = elapsed;
		i.alpha  = 1;

		i.draw = function() {
			canvas.fillStyle = this.colour;
			canvas.globalAlpha = this.alpha;
			canvas.fillRect(this.x, this.y, this.width, this.height);
			canvas.globalAlpha = 1;
		}

		i.update = function() {
			if (this.start > elapsed - 20) {
				this.alpha -= 0.1;

				if (this.alpha < 0.1) {
					this.active = false;
				}
			}
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

		if (jQuery.browser.mobile) {
			i.width = cWidth * 0.04;
		} else {
			i.width = cWidth * 0.025;
		}
		i.height = i.width;
		i.alpha  = 1;
		i.speed  = alienSpeed;
		i.state  = "alive";	// This is a determinator for animations

		i.draw = function() {
			if (this.active) {
				var alienImage;
				if (gameMode == "normal") {
					alienImage = document.getElementById("alien");
				} else {
					alienImage = document.getElementById("farquaad");
				}

				canvas.globalAlpha = this.alpha;	// Helps with fade out effect
				canvas.drawImage(alienImage, this.x, this.y, this.width, this.height);	// We're pulling the alien's sprite from raw html
				canvas.globalAlpha = 1;	// Reset this so we don't draw everything else transparent
			}
		}

		i.update = function() {
			if (i.yDirection == "down") {	// This is a little hacky.
				i.y += i.speed;

				if (i.y >= i.originalY + Math.floor(cWidth * 0.0625)) {	// If it has moved down about 80px, then stop moving
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
			if (i.x <= 1 && alienDirection == "left") {
				alienDirection = "right";
				pushAlienRow();
			} else if (i.x > cWidth - i.width && alienDirection == "right") {
				alienDirection = "left";
			}
		}

		return i;
	}

	if (jQuery.browser.mobile) {
		var shipWidth = cWidth * 0.04;
	} else {
		var shipWidth = cWidth * 0.025;
	}

	var ship = {	// Ship object constructor. It doesn't need to be a function
		colour: "#0BF",
		x     : cWidth / 2,	// Start at about the middle-bottom
		y     : cHeight - 60,
		width : shipWidth,
		height: shipWidth,
		speed : cWidth * 0.006,
		alpha : 1,
		state : "alive",
		draw  : function() {
			this.x += Math.random() - 0.5;	// Jitter it a little
			this.y += Math.random() - 0.5;	// Looks like its moving really fast

			var shipImage;
			if (gameMode == "normal") {
				shipImage = document.getElementById("ship");
			} else {
				shipImage = document.getElementById("shrek");
			}

			canvas.globalAlpha = this.alpha;
			canvas.drawImage(shipImage, this.x, this.y, this.width, this.height);
			canvas.globalAlpha = 1;
		},
		shoot : function() {	// Shoots bullets!
			switch(bulletType) {
				case "single":
					bullets.push(Bullet({
						x: this.x + this.width / 2,
						// The line above centers bullets by adding spacing then subtracting the # of bullets
						y: this.y,
						xSpeed: 0
					}));
					break;
				case "double":
					for (var i = 0; i <= bulletNumber; i++) {	// Space bullets properly
						bullets.push(Bullet({
							x: i * 8 + (this.x + this.width / 2) - (bulletNumber * 4),
							// The line above centers bullets by adding spacing then subtracting the # of bullets
							y: this.y,
							xSpeed: ((i * 5) - (bulletNumber * 2.5)) / xSpeedMod
						}));
					}
					break;
				case "laser":
					bullets.push(Laser({
						x: this.x + this.width / 2,
						y: this.y - cHeight
					}));
					break;
			}
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

	var arrow = {
		left: {
			x: 40,
			y: cHeight - 160,
			width: 40,
			height: 80
		},
		right: {
			x: 160,
			y: cHeight - 160,
			width: 40,
			height: 80
		},
		up: {
			x: 80,
			y: cHeight - 200,
			width: 80,
			height: 40
		},
		down: {
			x: 80,
			y: cHeight - 80,
			width: 80,
			height: 40
		},

		colour: "#FFF",
		alpha: 0.5,

		draw: function() {
			canvas.globalAlpha = this.alpha;
			canvas.fillStyle = this.colour;

			canvas.fillRect(this.left.x, this.left.y, this.left.width, this.left.height);
			canvas.fillRect(this.right.x, this.right.y, this.right.width, this.right.height);
			canvas.fillRect(this.up.x, this.up.y, this.up.width, this.up.height);
			canvas.fillRect(this.down.x, this.down.y, this.down.width, this.down.height);

			canvas.globalAlpha = 1;
		}
	}

	var button = {
		x: cWidth - 120,
		y: cHeight - 120,
		width: 80,
		height: 80,
		colour: "#FFF",
		alpha: 0.5,

		draw: function() {
			canvas.globalAlpha = this.alpha;
			canvas.fillStyle = this.colour;
			canvas.fillRect(this.x, this.y, this.width, this.height);
			canvas.globalAlpha = 1;
		}
	}

	function collides(a, b) {	// Collision detection. Very simple, works beautifully.
		return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
	}

	function testCollisions() {
		bullets.forEach(function(bullet) {	// If we shoot alien
			aliens.forEach(function(alien) {
				if (collides(bullet, alien) && alien.state == "alive") {
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
			if (alien.y + alien.height - 1 >= cHeight && alien.active) {
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

				allStar.pause();
				bgMusic.pause();	// Reset music
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
				y: 0,
				width: 1,
				height: 1
			}));
		}

		aliens.forEach(function(alien) {
			alien.originalY = alien.y;	// Move everyone down a little
			alien.yDirection = "down";
		});
	}

	bgMusic = document.getElementById('bg');
	allStar = document.getElementById('allstar');
	threeFX = document.getElementById('three');
	threeFX.pause();
	twoFX = document.getElementById('two');
	twoFX.pause();
	oneFX = document.getElementById('one');
	oneFX.pause();
	bgMusic.play();
	bgMusic.loop = true;	// OOOH MUSIC!
	allStar.loop = true;

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

	/****** ADD EVENT LISTENERS OUTSIDE OF INTERVAL FUNCTIONS ******/
	function touchXY(e) {
		if (!e) {
			var e = event;
		}
		e.preventDefault();
		mousePos = {
			x: e.targetTouches[e.targetTouches.length - 1].pageX - cElement.offsetLeft,
			y: e.targetTouches[e.targetTouches.length - 1].pageY - cElement.offsetTop,
			width: 1,
			height: 1
		}
	}

	cElement.addEventListener("touchstart", function(e) {
		mouseDown = true;
		touchXY(e);
	}, false);

	cElement.addEventListener("touchmove", touchXY, false);

	cElement.addEventListener("touchend", function() {
		mouseDown = false;
	}, false);

	document.body.addEventListener("touchcancel", function() {
		mouseDown = false;
	})

	/****** DEFINE UPDATE AND DRAW FUNCTIONS ******/
	function update() {
		wheelOfSpin();

		if (mouseDown) {	// If we're touching the screen
			if (collides(mousePos, arrow.left)) {
				buttondown.up = buttondown.right = buttondown.down = false;
				buttondown.left = true;
			} else if (collides(mousePos, arrow.right)) {
				buttondown.left = buttondown.up = buttondown.down = false;
				buttondown.right = true;
			} else if (collides(mousePos, arrow.up)) {
				buttondown.left = buttondown.right = buttondown.down = false;
				buttondown.up = true;
			} else if (collides(mousePos, arrow.down)) {
				buttondown.left = buttondown.right = buttondown.up = false;
				buttondown.down = true;
			}

			if (collides(mousePos, button)) {
				buttondown.fire = true;
			}
		} else {
			buttondown.left = buttondown.right = buttondown.up = buttondown.down = buttondown.fire = false;
		}

		if (ship.state == "alive") {	// You can't move when you're dead
			if (keydown.left || keydown.a || buttondown.left) {	// Detect movement keys, move appropriately
				ship.x -= ship.speed;
			} else if (keydown.right || keydown.d || buttondown.right) {
				ship.x += ship.speed;
			} else if (keydown.up || keydown.w || buttondown.up) {
				ship.y -= ship.speed;
			} else if (keydown.down || keydown.s || buttondown.down) {
				ship.y += ship.speed;
			}	// BTW, this is in a else if because diagonal movement was too fast

			if (keydown.left || keydown.right || keydown.up || keydown.down) {	// Help us track some stuff
				arrowsUsed = true;
			}

			if (keydown.a || keydown.d || keydown.w || keydown.s) {
				wasdUsed = true;
			}

			if (keydown.space || buttondown.fire) {
				spaceUsed = true;

				if (bulletThrottle === false) {	// If we haven't shot recently
					ship.shoot();
					bulletThrottle = true;
					setTimeout(function(){bulletThrottle = false;}, bulletTimeout);	// Shoot on the beat
				}
			}
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

		if (aliens.filter(function(alien) {
			return alien.active;
		}).length == 0) {
			pushAlienRow();
			alienDirection = "right";
		}

		aliens.forEach(function(alien) {
			if (alien.active) {
				alien.direction();
			}
		});

		aliens.forEach(function(alien) {	// For each alien
			alien.update();

			if (alien.state == "dying") {
				killObject(alien);
			}
		});

		for (var x = 0; x < 10; x++) {	// Legitimately fixes the alignment bug
			for (var y = 0; y < Math.floor(aliens.length / 10); y++) {
				aliens[(y * 10) + x].x = aliens[x].x;	// I don't know how I thought of this
			}
		}	// This is a truly great moment in human history

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

		if (gameMode == "normal") {
			bgMusic.play();
			allStar.pause();
		} else {
			allStar.play();
			bgMusic.pause();
		}

		if (alertAlpha < 1 && alertText != "" && elapsed - alertStart < 100) {	// Fade text in
			alertAlpha += 0.1;
		} else if (alertText != "" && elapsed - alertStart >= 100) {	// Fade text out after that
			alertAlpha -= 0.1;
		}

		if (alertAlpha <= 0.1) {	// Reset text when it's faded
			alertText = "";
		}

		if (keydown.m && !muteThrottle) {	// Mute music
			if (bgMusic.muted || allStar.muted){
				bgMusic.muted = false;
				oneFX.muted = false;
				twoFX.muted = false;
				threeFX.muted = false;
				allStar.muted = false;
			} else {
				bgMusic.muted = true;
				oneFX.muted = true;
				twoFX.muted = true;
				threeFX.muted = true;
				allStar.muted = true;
			}

			muteThrottle = true;
			setTimeout(function(){muteThrottle = false;}, 400);
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

		if (gameMode != "normal") {
			canvas.globalAlpha = 0.3;
			canvas.drawImage(document.getElementById("farfaraway"), 0, 0, cWidth, cHeight);
			canvas.globalAlpha = 1;
		}

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

				while (!aliens[randomAlien].active) {	// If the alien is dead don't shoot
					randomAlien = Math.floor(Math.random() * aliens.length);
				}

				alienBullets.push(AlienBullet({
					x: aliens[randomAlien].x,
					y: aliens[randomAlien].y
				}));
				alienBulletThrottle = true;
				setTimeout(function(){alienBulletThrottle = false;}, alienBulletInt); // Shoot every two beats
			}
		}

		canvas.font = (cWidth / 42) + "px PressStart2P";	// Print our score
		canvas.fillStyle = "#FFF";
		canvas.textAlign = "left";
		canvas.fillText("SCORE:" + score, 10, cHeight);

		canvas.font = (cWidth / 32) + "px PressStart2P";	// Print the latest alert
		canvas.fillStyle = "rgba(255, 255, 255, " + alertAlpha + ")";
		canvas.textAlign = "center";
		canvas.fillText(alertText, cWidth / 2, 55);

		canvas.fillStyle = "#F0F";
		canvas.fillRect(0, 0, cWidth * (((elapsed + 330) % 330) / 330), 5);

		if (jQuery.browser.mobile) {
			arrow.draw();
			button.draw();
		}
	}

	function resetGame() {
		bgAlpha = "1";
		canvas.clearRect(0, 0, cWidth, cHeight);

		ship.x     = cWidth / 2;	// We must rebuild him!
		ship.y     = cHeight - 60;
		ship.alpha = 1;
		ship.state = "alive";	// Back from the dead!

		bulletThrottle      = false;	// Reset
		alienBulletThrottle = false;	// Every
		pushAlienRow();               	// Changed
		alienDirection      = "right";// Variable
		alienY              = "";
		score               = 0;
		ship.speed          = cWidth * 0.006;
		timeLeft            = 3;
		textSize            = cWidth / 16;
		numberY             = cHeight / 2 + 90;
		bulletSpeed         = Math.floor(cHeight * 0.025);
		alienBulletSpeed    = Math.floor(cHeight * 0.006);
		alienSpeed          = Math.floor(cWidth * 0.0037);
		bulletWidth         = Math.floor(cWidth * 0.003);
		bulletHeight        = Math.floor(cWidth * 0.008);
		alienBulletWidth    = Math.floor(cWidth * 0.004);
		alienBulletInt      = 700;
		option              = 0;
		alertText           = "";
		slowMo              = false;
		invincible          = false;
		starModifier        = 1;
		bulletNumber        = 0;
		bulletType          = "single";
		bulletTimeout       = 350;
		gameMode            = "normal";

		aliens       = [];	// Clearing these arrays works because they're either
		bullets      = [];	// initially rebuilt or rebuilt on frame
		alienBullets = [];
		stars        = [];

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
	var textSize = cWidth / 16;
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

		canvas.font = (cWidth / 16) + "px PressStart2P";
		canvas.fillStyle = textColor;
		canvas.textAlign = 'center';
		canvas.fillText(textBody, cWidth / 2, cHeight / 2 - 80);

		if (elapsed % 60 == 0) {	// If a second passes
			timeLeft--;
		}

		textSize += (cWidth / 3200);	// Text gets bigger
		numberY  += (cWidth / 6400);	// from the center point

		if (!firstTry) {	// Only show score if we got one
			canvas.font = (cWidth / 32) + "px PressStart2P";
			canvas.fillText("Score:" + score, cWidth / 2, cHeight / 2 + 180);

			/*canvas.font = "25px PressStart2P";
			canvas.fillStyle = "#55ACEE";
			canvas.fillText("Press T to tweet your score!", cWidth / 2, cHeight / 2 + 220);*/

			canvas.fillStyle = "#F00";

			/*if (keydown.t) {
				var scoreDescription;

				if (score < 10) {
					scoreDescription = "a%20now-proven%20possible";
				} else if (score < 100) {
					scoreDescription = "a%20downright%20terrible";
				} else if (score < 1000) {
					scoreDescription = "a%20reasonably%20decent";
				} else if (score < 3000) {
					scoreDescription = "an%20altogether%20average";
				} else if (score < 6000) {
					scoreDescription = "a%20pretty%20good%20yet%20improvable";
				} else if (score < 9000) {
					scoreDescription = "a%20hands-down%20impressive";
				} else if (score < 14000) {
					scoreDescription = "a%20totally%20awesome";
				} else if (score < 20000) {
					scoreDescription = "an%20extremely%20commendable";
				} else if (score < 30000) {
					scoreDescription = "a%20nobel-prize-worthy";
				} else {
					scoreDescription = "a%20laws-of-physics%2Fsanity-breaking";
				}

				var twitterIntent = "https://twitter.com/intent/tweet?text=I%20got%20" + scoreDescription + "%20score%20of%20" + score + "%20in%20%23spacerave2014%20@&url=https%3A%2F%2Fhuw.github.io";
				window.open(twitterIntent, "Tweet your score");
			}*/
		}

		canvas.font = (cWidth / 51) + "px PressStart2P";	// Highscores here
		canvas.fillText("Highscore:" + highScore, cWidth / 2, cHeight / 2 + 260)

		canvas.font = textSize + "px PressStart2P";	// Show us the time left in seconds
		canvas.fillText(timeLeft, cWidth / 2, numberY);

		canvas.font = (cWidth / 64) + "px PressStart2P";

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

		canvas.fillText(textBody, cWidth / 2, cHeight / 2 + 220);	// Fill the tutorial text
	}
});
