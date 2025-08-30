//global for the controls and input 
var controls = null;
//store visualisations in a container
var vis = null;
//variable for the p5 sound object
var sound = null;
//variable for p5 fast fourier transform
var fourier;

//variable for the pause/play button
var isInitialised = false
var startStopBtn;

function preload(){
	sound = loadSound('assets/stomper_reggae_bit.mp3');

	
}
console.log('p5 version:', p5.prototype.VERSION);
console.log('createButton:', typeof createButton);



function setup(){
	 createCanvas(windowWidth, windowHeight);
	 background(0);
	 controls = new ControlsAndInput();
	 

	 //instantiate the fft object
	 fourier = new p5.FFT();

	 //create a new visualisation container and add visualisations
	 vis = new Visualisations();
	 vis.add(new Spectrum());
	 vis.add(new WavePattern());
	 vis.add(new Needles());
	 vis.add(new amplitudeVis());
	 vis.add(new Vibingballs());
	 vis.add(new noisesteep());
	 vis.add(new Firework());
	 vis.add(new SpiralVisualizer());
	
	//support vars 
	playbackButton=new PlaybackButton()
	startStopBtn = createButton('Start');
    startStopBtn.position(20, 20);
    startStopBtn.mousePressed(toggleAudio);

}

function draw(){
	background(0);

	if (isInitialised==false)
	{
		push()
		textSize(30);
		fill(255);
		textFont('Courier New');
		text('Press Start Button for The Menu ',width/2-200,height/2);
		return;
		pop();
	}

	//draw the selected visualisation and controsl
	vis.selectedVisual.draw();
	controls.draw();
	playbackButton.draw()

	
	
}

function mousePressed(){
	controls.mousePressed();
}

function mouseDragged(){
	controls.mouseDragged();
}

function mouseReleased(){
	controls.mouseReleased();
}

function keyPressed(){
	controls.keyPressed(keyCode);

	if (!isInitialised) {
		isInitialised = true;
		sound.loop(0, map(mouseX, 0, width, 0.5, 2)); // loop with rate control by the mouse position
		if (startStopBtn) startStopBtn.html('Stop');
	}

	// Spacebar to pause/play
	if (key === ' ') {
		if (sound.isPlaying()) {
			sound.pause();
			if (startStopBtn) startStopBtn.html('Start');
		} else {
			sound.loop(0, map(mouseX, 0, width, 0.5, 2));
			if (startStopBtn) startStopBtn.html('Stop');
		}
	}
}

//when the window has been resized. Resize canvas to fit 
//if the visualisation needs to be resized call its onResize method
function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
	if(vis.selectedVisual.hasOwnProperty('onResize')){
		vis.selectedVisual.onResize();
	}
}

function toggleAudio() {
    if (!isInitialised) {
        isInitialised = true;
        sound.loop();
        startStopBtn.html('Stop');
    } else if (sound.isPlaying()) {
        sound.pause();
        startStopBtn.html('Start');
    } else {
        sound.loop();
        startStopBtn.html('Stop');
    }
}

