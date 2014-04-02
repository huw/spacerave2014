#\#spacerave2014

For my Software Design class, we have been tasked with creating a game in VB.NET. It is supposed to be inspired by Space Invaders.
Luckily for me, the marking criteria didn't specify a language to use. I didn't like the low framerates of Windows Forms and GDI+, especially when drawing a lot of images or rectangles.

HTML5 Canvas can do better at the kind of task I wanted to achieve. I wanted a fast-paced game which was *enjoyable*. Gaming using GDI+ was *not* enjoyable.

So rewrote the code to canvas, added a bunch of features which I wanted, and finally you have this, **#spacerave2014**. The name is inspired by viral marketing crossed with that hipster hashtagging trend which makes the app seem somewhat cooler.

##How to play
All instructions are included when you start the game, but if you need a refresher:

* Arrow keys or WASD to move

* Space or click to shoot

##Gameplay
Gameplay is simple. You start out with infinite waves of aliens slowly advancing towards you while you try to kill as many as you can. Score is based on time alive.
Every ~3 seconds, the Wheel of Spin is activated. This chooses a random gameplay modifier to apply. These include movement speed and background intensity.