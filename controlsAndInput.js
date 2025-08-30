// Audio controls and GUI
function ControlsAndInput(){
  
	this.menuDisplayed = false;
	
	// Control bar at bottom
	this.controlBar = {
		height: 80,
		padding: 20,
		y: 0
	};
	
	// Play button
	this.playButton = {
		x: 0,
		y: 0,
		size: 40,
		isPlaying: false
	};
	
	// Audio scrub bar
	this.scrubBar = {
		x: 0,
		y: 0,
		width: 400,
		height: 6,
		isDragging: false,
		progress: 0
	};
	
	// Volume control
	this.volumeControl = {
		x: 0,
		y: 0,
		width: 100,
		height: 6,
		isDragging: false,
		volume: 0.5
	};
	
	// Frequency labels for spectrum
	this.freqLabels = ["31", "63", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];
	
	// GUI Panel
	this.guiPanel = {
		x: 0,
		y: 80,
		width: 280,
		height: 350,
		isVisible: true,
		backgroundColor: [0, 0, 0, 180]
	};
	
	// Color scheme control
	this.colorScheme = {
		current: 'pink-coral',
		buttonY: 130,
		buttonWidth: 90,
		buttonHeight: 35
	};
	
	// Line thickness slider
	this.lineThickness = {
		value: 2,
		min: 1,
		max: 10,
		x: 0,
		y: 200,
		width: 180,
		height: 20,
		isDragging: false
	};
	
	// Visualization size slider
	this.visualizationSize = {
		value: 1.0,
		min: 0.5,
		max: 2.0,
		x: 0,
		y: 250,
		width: 180,
		height: 20,
		isDragging: false
	};
	
	// Beat sensitivity control
	this.beatSensitivity = {
		value: 1.0,
		min: 0.1,
		max: 3.0,
		x: 0,
		y: 300,
		width: 180,
		height: 20,
		isDragging: false
	};
	
	// Animation speed control
	this.animationSpeed = {
		value: 1.0,
		min: 0.2,
		max: 3.0,
		x: 0,
		y: 350,
		width: 180,
		height: 20,
		isDragging: false
	};
	
	// Song speed control (playback rate)
	this.songSpeed = {
		value: 1.0,
		min: 0.25,
		max: 2.0,
		x: 0,
		y: 400,
		width: 180,
		height: 20,
		isDragging: false
	};
  
	// Handle UI clicks
	this.mousePressed = function(){
		// Check GUI panel controls first
		if (this.guiPanelHitCheck()) {
			return;
		}
		
		// Check volume control
		if (this.volumeControlHitCheck()) {
			return;
		}
		
		// Check scrub bar click
		if (this.scrubBarHitCheck()) {
			return;
		}
		
		// Check play button
		if (this.playButtonHitCheck()) {
			this.togglePlayback();
			return;
		}
		
		// Toggle fullscreen
		let fs = fullscreen();
		fullscreen(!fs);
	};
	
	// Handle mouse dragging
	this.mouseDragged = function() {
		if (this.scrubBar.isDragging && sound && sound.buffer) {
			let progress = constrain((mouseX - this.scrubBar.x) / this.scrubBar.width, 0, 1);
			let newTime = progress * sound.buffer.duration;
			
			// Only update position during drag
			this.scrubBar.progress = progress;
			this.scrubBar.targetTime = newTime;
		}
		
		if (this.volumeControl.isDragging) {
			let volume = constrain((mouseX - this.volumeControl.x) / this.volumeControl.width, 0, 1);
			this.volumeControl.volume = volume;
			if (sound) {
				sound.setVolume(volume);
			}
		}
		
		// Handle GUI slider dragging
		if (this.lineThickness.isDragging) {
			let value = constrain(
				map(mouseX, this.lineThickness.x, this.lineThickness.x + this.lineThickness.width, 
					this.lineThickness.min, this.lineThickness.max), 
				this.lineThickness.min, this.lineThickness.max
			);
			this.lineThickness.value = value;
		}
		
		if (this.visualizationSize.isDragging) {
			let value = constrain(
				map(mouseX, this.visualizationSize.x, this.visualizationSize.x + this.visualizationSize.width, 
					this.visualizationSize.min, this.visualizationSize.max), 
				this.visualizationSize.min, this.visualizationSize.max
			);
			this.visualizationSize.value = value;
		}
		
		if (this.beatSensitivity.isDragging) {
			let value = constrain(
				map(mouseX, this.beatSensitivity.x, this.beatSensitivity.x + this.beatSensitivity.width, 
					this.beatSensitivity.min, this.beatSensitivity.max), 
				this.beatSensitivity.min, this.beatSensitivity.max
			);
			this.beatSensitivity.value = value;
		}
		
		if (this.animationSpeed.isDragging) {
			let value = constrain(
				map(mouseX, this.animationSpeed.x, this.animationSpeed.x + this.animationSpeed.width, 
					this.animationSpeed.min, this.animationSpeed.max), 
				this.animationSpeed.min, this.animationSpeed.max
			);
			this.animationSpeed.value = value;
		}
		
		if (this.songSpeed.isDragging) {
			let value = constrain(
				map(mouseX, this.songSpeed.x, this.songSpeed.x + this.songSpeed.width, 
					this.songSpeed.min, this.songSpeed.max), 
				this.songSpeed.min, this.songSpeed.max
			);
			this.songSpeed.value = value;
			// Apply playback rate change
			if (sound && sound.isPlaying()) {
				sound.rate(value);
			}
		}
	};
	
	// Handle mouse release
	this.mouseReleased = function() {
		// Jump to final position when dragging stops
		if (this.scrubBar.isDragging && sound && this.scrubBar.targetTime !== undefined) {
			sound.jump(this.scrubBar.targetTime);
			this.scrubBar.targetTime = undefined;
		}
		
		this.scrubBar.isDragging = false;
		this.volumeControl.isDragging = false;
		this.lineThickness.isDragging = false;
		this.visualizationSize.isDragging = false;
		this.beatSensitivity.isDragging = false;
		this.animationSpeed.isDragging = false;
		this.songSpeed.isDragging = false;
	};
	
	// Check if play button was clicked
	this.playButtonHitCheck = function() {
		let distance = dist(mouseX, mouseY, this.playButton.x, this.playButton.y);
		return distance <= this.playButton.size / 2;
	};
	
	// Check if scrub bar was clicked
	this.scrubBarHitCheck = function() {
		if (mouseX >= this.scrubBar.x && 
			mouseX <= this.scrubBar.x + this.scrubBar.width &&
			mouseY >= this.scrubBar.y - 10 && 
			mouseY <= this.scrubBar.y + this.scrubBar.height + 10) {
			
			if (sound && sound.buffer) {
				this.scrubBar.isDragging = true;
				let progress = (mouseX - this.scrubBar.x) / this.scrubBar.width;
				progress = constrain(progress, 0, 1);
				let newTime = progress * sound.buffer.duration;
				
				// Jump to clicked position
				sound.jump(newTime);
				this.scrubBar.progress = progress;
			}
			return true;
		}
		return false;
	};
	
	// Check if volume control was clicked
	this.volumeControlHitCheck = function() {
		if (mouseX >= this.volumeControl.x && 
			mouseX <= this.volumeControl.x + this.volumeControl.width &&
			mouseY >= this.volumeControl.y - 10 && 
			mouseY <= this.volumeControl.y + this.volumeControl.height + 10) {
			
			this.volumeControl.isDragging = true;
			let volume = (mouseX - this.volumeControl.x) / this.volumeControl.width;
			volume = constrain(volume, 0, 1);
			this.volumeControl.volume = volume;
			if (sound) {
				sound.setVolume(volume);
			}
			return true;
		}
		return false;
	};
	
	// Check if GUI panel controls were clicked
	this.guiPanelHitCheck = function() {
		// Check if click is within GUI panel
		if (mouseX >= this.guiPanel.x && mouseX <= this.guiPanel.x + this.guiPanel.width &&
			mouseY >= this.guiPanel.y && mouseY <= this.guiPanel.y + this.guiPanel.height) {
			
			// Check color scheme buttons
			let pinkButtonX = this.guiPanel.x + 25;
			let monoButtonX = this.guiPanel.x + 145;
			let buttonY = this.colorScheme.buttonY;
			
			if (mouseY >= buttonY && mouseY <= buttonY + this.colorScheme.buttonHeight) {
				if (mouseX >= pinkButtonX && mouseX <= pinkButtonX + this.colorScheme.buttonWidth) {
					this.colorScheme.current = 'pink-coral';
					return true;
				}
				if (mouseX >= monoButtonX && mouseX <= monoButtonX + this.colorScheme.buttonWidth) {
					this.colorScheme.current = 'monochrome';
					return true;
				}
			}
			
			// Check line thickness slider
			if (mouseX >= this.lineThickness.x && 
				mouseX <= this.lineThickness.x + this.lineThickness.width &&
				mouseY >= this.lineThickness.y - 10 && 
				mouseY <= this.lineThickness.y + this.lineThickness.height + 10) {
				this.lineThickness.isDragging = true;
				let value = constrain(
					map(mouseX, this.lineThickness.x, this.lineThickness.x + this.lineThickness.width, 
						this.lineThickness.min, this.lineThickness.max), 
					this.lineThickness.min, this.lineThickness.max
				);
				this.lineThickness.value = value;
				return true;
			}
			
			// Check visualization size slider
			if (mouseX >= this.visualizationSize.x && 
				mouseX <= this.visualizationSize.x + this.visualizationSize.width &&
				mouseY >= this.visualizationSize.y - 10 && 
				mouseY <= this.visualizationSize.y + this.visualizationSize.height + 10) {
				this.visualizationSize.isDragging = true;
				let value = constrain(
					map(mouseX, this.visualizationSize.x, this.visualizationSize.x + this.visualizationSize.width, 
						this.visualizationSize.min, this.visualizationSize.max), 
					this.visualizationSize.min, this.visualizationSize.max
				);
				this.visualizationSize.value = value;
				return true;
			}
			
			// Check beat sensitivity slider
			if (mouseX >= this.beatSensitivity.x && 
				mouseX <= this.beatSensitivity.x + this.beatSensitivity.width &&
				mouseY >= this.beatSensitivity.y - 10 && 
				mouseY <= this.beatSensitivity.y + this.beatSensitivity.height + 10) {
				this.beatSensitivity.isDragging = true;
				let value = constrain(
					map(mouseX, this.beatSensitivity.x, this.beatSensitivity.x + this.beatSensitivity.width, 
						this.beatSensitivity.min, this.beatSensitivity.max), 
					this.beatSensitivity.min, this.beatSensitivity.max
				);
				this.beatSensitivity.value = value;
				return true;
			}
			
			// Check animation speed slider
			if (mouseX >= this.animationSpeed.x && 
				mouseX <= this.animationSpeed.x + this.animationSpeed.width &&
				mouseY >= this.animationSpeed.y - 10 && 
				mouseY <= this.animationSpeed.y + this.animationSpeed.height + 10) {
				this.animationSpeed.isDragging = true;
				let value = constrain(
					map(mouseX, this.animationSpeed.x, this.animationSpeed.x + this.animationSpeed.width, 
						this.animationSpeed.min, this.animationSpeed.max), 
					this.animationSpeed.min, this.animationSpeed.max
				);
				this.animationSpeed.value = value;
				return true;
			}
			
			// Check song speed slider
			if (mouseX >= this.songSpeed.x && 
				mouseX <= this.songSpeed.x + this.songSpeed.width &&
				mouseY >= this.songSpeed.y - 10 && 
				mouseY <= this.songSpeed.y + this.songSpeed.height + 10) {
				this.songSpeed.isDragging = true;
				let value = constrain(
					map(mouseX, this.songSpeed.x, this.songSpeed.x + this.songSpeed.width, 
						this.songSpeed.min, this.songSpeed.max), 
					this.songSpeed.min, this.songSpeed.max
				);
				this.songSpeed.value = value;
				// Apply playback rate change
				if (sound && sound.isPlaying()) {
					sound.rate(value);
				}
				return true;
			}
			
			return true; // Click consumed within panel
		}
		return false;
	};
	
	// Toggle playback
	this.togglePlayback = function() {
		if (!isInitialised) {
			isInitialised = true;
			this.playButton.isPlaying = true;
			sound.loop();
		} else if (sound.isPlaying()) {
			sound.pause();
			this.playButton.isPlaying = false;
		} else {
			sound.loop();
			this.playButton.isPlaying = true;
		}
	};
  
	// Keyboard controls
	this.keyPressed = function(keycode){
		// Spacebar for play/pause
		if(keycode == 32){
			if (isInitialised) {
				this.togglePlayback();
			} else {
				this.menuDisplayed = !this.menuDisplayed;
			}
		}
		
		// Arrow keys for seeking
		if(keycode == 37 && sound && sound.buffer) { // Left arrow
			let currentTime = sound.currentTime();
			let newTime = Math.max(0, currentTime - 5);
			sound.jump(newTime);
		}
		
		if(keycode == 39 && sound && sound.buffer) { // Right arrow
			let currentTime = sound.currentTime();
			let newTime = Math.min(sound.buffer.duration, currentTime + 5);
			sound.jump(newTime);
		}
		
		// Volume controls
		if(keycode == 38) { // Up arrow
			this.volumeControl.volume = Math.min(1, this.volumeControl.volume + 0.1);
			if (sound) sound.setVolume(this.volumeControl.volume);
		}
		
		if(keycode == 40) { // Down arrow
			this.volumeControl.volume = Math.max(0, this.volumeControl.volume - 0.1);
			if (sound) sound.setVolume(this.volumeControl.volume);
		}
  
		// Number keys for visualizations
		if(keycode > 48 && keycode < 57){
			var visNumber = keycode - 49;
			vis.selectVisual(vis.visuals[visNumber].name); 
		}
	};
	
	// Update scrub bar progress
	this.updateScrubBar = function() {
		// Only update progress when not dragging
		if (sound && sound.buffer && !this.scrubBar.isDragging) {
			let currentTime = sound.currentTime();
			let totalDuration = sound.buffer.duration;
			
			// Better loop detection
			if (currentTime < 0.5 && this.scrubBar.progress > 0.8) {
				this.scrubBar.progress = 0;
			} else if (currentTime >= totalDuration - 0.1) {
				this.scrubBar.progress = 1;
			} else {
				this.scrubBar.progress = currentTime / totalDuration;
			}
		}
		
		// Update play button state
		if (sound) {
			this.playButton.isPlaying = sound.isPlaying();
		}
	};
  
	// Draw everything
	this.draw = function(){
		// Update positions and progress
		this.updatePositions();
		this.updateScrubBar();
		
		// Draw GUI control panel
		this.drawGUIPanel();
		
		// Draw control background
		this.drawControlBackground();
		
		// Draw control elements
		this.drawPlayButton();
		this.drawScrubBar();
		this.drawTimeDisplay();
		this.drawVolumeControl();
		
		// Menu at top-left
		push();
		this.menu();
		pop();
	};
	
	// Update control positions
	this.updatePositions = function() {
		this.controlBar.y = height - this.controlBar.height;
		
		// GUI Panel at top right
		this.guiPanel.x = width - this.guiPanel.width - 20;
		
		// Update slider positions
		this.lineThickness.x = this.guiPanel.x + 50;
		this.visualizationSize.x = this.guiPanel.x + 50;
		this.beatSensitivity.x = this.guiPanel.x + 50;
		this.animationSpeed.x = this.guiPanel.x + 50;
		this.songSpeed.x = this.guiPanel.x + 50;
		
		// Play button on left
		this.playButton.x = this.controlBar.padding + 30;
		this.playButton.y = this.controlBar.y + this.controlBar.height/2;
		
		// Scrub bar in center
		let centerX = width / 2;
		this.scrubBar.x = centerX - this.scrubBar.width / 2;
		this.scrubBar.y = this.controlBar.y + this.controlBar.height - 25;
		
		// Volume control on right
		this.volumeControl.x = width - this.controlBar.padding - this.volumeControl.width - 50;
		this.volumeControl.y = this.controlBar.y + this.controlBar.height - 25;
	};
	
	// Draw control bar background
	this.drawControlBackground = function() {
		push();
		fill(0, 0, 0, 180);
		noStroke();
		rect(0, this.controlBar.y, width, this.controlBar.height);
		
		// Gradient effect
		for(let i = 0; i < this.controlBar.height; i++) {
			let alpha = map(i, 0, this.controlBar.height, 180, 120);
			stroke(40, 40, 40, alpha);
			line(0, this.controlBar.y + i, width, this.controlBar.y + i);
		}
		pop();
	};
	
	// Draw frequency spectrum
	this.drawFrequencySpectrum = function() {
		if (!sound || !sound.isPlaying()) return;
		
		let spectrum = fourier.analyze();
		let spectrumHeight = 30;
		let startY = this.controlBar.y + 10;
		let barWidth = (width - 100) / spectrum.length;
		
		push();
		noStroke();
		
		for(let i = 0; i < spectrum.length; i++) {
			let amp = spectrum[i];
			let h = map(amp, 0, 255, 0, spectrumHeight);
			
			// Color gradient from green to yellow to red
			let t = map(h, 0, spectrumHeight, 0, 1);
			let r, g, b;
			
			if (t < 0.5) {
				// Green to yellow
				r = lerp(0, 255, t * 2);
				g = 255;
				b = 0;
			} else {
				// Yellow to red
				r = 255;
				g = lerp(255, 0, (t - 0.5) * 2);
				b = 0;
			}
			
			fill(r, g, b, 200);
			
			let x = 50 + i * barWidth;
			rect(x, startY + spectrumHeight - h, Math.max(1, barWidth - 1), h);
		}
		pop();
	};
	
	// Draw play/pause button
	this.drawPlayButton = function() {
		push();
		
		// Button circle
		fill(60, 60, 60);
		stroke(120, 120, 120);
		strokeWeight(2);
		ellipse(this.playButton.x, this.playButton.y, this.playButton.size);
		
		// Icon
		fill(255);
		noStroke();
		
		if (this.playButton.isPlaying) {
			// Pause icon
			let barWidth = 4;
			let barHeight = 12;
			let spacing = 3;
			rect(this.playButton.x - spacing - barWidth/2, this.playButton.y - barHeight/2, barWidth, barHeight);
			rect(this.playButton.x + spacing - barWidth/2, this.playButton.y - barHeight/2, barWidth, barHeight);
		} else {
			// Play icon
			let size = 10;
			triangle(
				this.playButton.x - size/2 + 2, this.playButton.y - size/2,
				this.playButton.x - size/2 + 2, this.playButton.y + size/2,
				this.playButton.x + size/2 + 2, this.playButton.y
			);
		}
		
		pop();
	};
	
	// Draw the audio scrub bar
	this.drawScrubBar = function() {
		push();
		
		// Track
		fill(60, 60, 60);
		noStroke();
		rect(this.scrubBar.x, this.scrubBar.y, this.scrubBar.width, this.scrubBar.height, 3);
		
		// Progress bar
		if (sound && sound.buffer) {
			let progressWidth = this.scrubBar.progress * this.scrubBar.width;
			fill(255, 105, 180);
			rect(this.scrubBar.x, this.scrubBar.y, progressWidth, this.scrubBar.height, 3);
			
			// Handle
			let handleX = this.scrubBar.x + progressWidth;
			fill(255, 255, 255);
			noStroke();
			ellipse(handleX, this.scrubBar.y + this.scrubBar.height/2, 12);
		}
		
		pop();
	};
	
	// Draw time display
	this.drawTimeDisplay = function() {
		if (sound && sound.buffer) {
			let currentTime = sound.currentTime();
			let totalTime = sound.buffer.duration;
			
			let currentMin = Math.floor(currentTime / 60);
			let currentSec = Math.floor(currentTime % 60);
			let totalMin = Math.floor(totalTime / 60);
			let totalSec = Math.floor(totalTime % 60);
			
			// Format time strings
			let currentTimeStr = currentMin + ":" + (currentSec < 10 ? "0" : "") + currentSec;
			let totalTimeStr = totalMin + ":" + (totalSec < 10 ? "0" : "") + totalSec;
			
			push();
			fill(200, 200, 200);
			noStroke();
			textAlign(CENTER, CENTER);
			textSize(14);
			textFont("Arial");
			
			// Time display below scrub bar
			text(currentTimeStr + " / " + totalTimeStr, 
				 this.scrubBar.x + this.scrubBar.width/2, 
				 this.scrubBar.y + 20);
			
			pop();
		}
	};
	
	// Draw volume control
	this.drawVolumeControl = function() {
		push();
		
		// Volume icon
		fill(180, 180, 180);
		noStroke();
		textAlign(CENTER, CENTER);
		textSize(18);
		text("🔊", this.volumeControl.x - 25, this.volumeControl.y + 3);
		
		// Volume bar track
		fill(60, 60, 60);
		noStroke();
		rect(this.volumeControl.x, this.volumeControl.y, this.volumeControl.width, this.volumeControl.height, 3);
		
		// Volume level
		let volumeWidth = this.volumeControl.volume * this.volumeControl.width;
		fill(180, 180, 180);
		rect(this.volumeControl.x, this.volumeControl.y, volumeWidth, this.volumeControl.height, 3);
		
		// Volume handle
		let handleX = this.volumeControl.x + volumeWidth;
		fill(255, 255, 255);
		ellipse(handleX, this.volumeControl.y + this.volumeControl.height/2, 10);
		
		pop();
	};
  
	this.menu = function(){
		// Menu box at top-left
		let menuX = 20;
		let menuY = 60;
		let menuWidth = 280;
		let menuHeight = 240;
		
		// Background styling
		push();
		
		// Main background
		fill(40, 40, 40, 230);
		stroke(120, 120, 120);
		strokeWeight(2);
		rect(menuX, menuY, menuWidth, menuHeight, 12);
		
		// Inner border
		stroke(60, 60, 60);
		strokeWeight(1);
		rect(menuX + 3, menuY + 3, menuWidth - 6, menuHeight - 6, 8);
		
		// Title
		fill(255);
		noStroke();
		textAlign(CENTER, TOP);
		textSize(16);
		textFont("Arial");
		text("SELECT VISUALIZATION", menuX + menuWidth/2, menuY + 15);
		
		// Title underline
		stroke(100, 100, 100);
		strokeWeight(1);
		line(menuX + 20, menuY + 38, menuX + menuWidth - 20, menuY + 38);
		
		// Visualization list
		textAlign(LEFT, TOP);
		textSize(14);
		fill(255);
		noStroke();
		
		let startY = menuY + 50;
		let lineSpacing = 22;
		
		// List visualizations
		for (let i = 0; i < vis.visuals.length; i++){
			let yPos = startY + i * lineSpacing;
			
			// Highlight current selection
			if (vis.selectedVisual && vis.selectedVisual.name === vis.visuals[i].name) {
				fill(80, 150, 255, 100);
				stroke(80, 150, 255);
				strokeWeight(1);
				rect(menuX + 10, yPos - 3, menuWidth - 20, lineSpacing - 2, 4);
				fill(255);
				noStroke();
			}
			
			text((i + 1) + " : " + vis.visuals[i].name, menuX + 20, yPos + 2);
		}
		
		// Instructions
		fill(180);
		textSize(11);
		textAlign(CENTER, TOP);
		text("Press 1-8 to select visualization", menuX + menuWidth/2, menuY + menuHeight - 15);
		
		pop();
	};
	
	// Draw the GUI control panel
	this.drawGUIPanel = function() {
		if (!this.guiPanel.isVisible) return;
		
		push();
		
		// Panel background
		fill(this.guiPanel.backgroundColor[0], this.guiPanel.backgroundColor[1], 
			 this.guiPanel.backgroundColor[2], this.guiPanel.backgroundColor[3]);
		stroke(120, 120, 120);
		strokeWeight(2);
		rect(this.guiPanel.x, this.guiPanel.y, this.guiPanel.width, this.guiPanel.height, 12);
		
		// Inner border
		stroke(60, 60, 60);
		strokeWeight(1);
		rect(this.guiPanel.x + 3, this.guiPanel.y + 3, this.guiPanel.width - 6, this.guiPanel.height - 6, 8);
		
		// Panel title
		fill(255);
		noStroke();
		textAlign(CENTER, TOP);
		textSize(18);
		textFont("Arial");
		text("VISUAL CONTROLS", this.guiPanel.x + this.guiPanel.width/2, this.guiPanel.y + 20);
		
		// Title underline
		stroke(100, 100, 100);
		strokeWeight(1);
		line(this.guiPanel.x + 30, this.guiPanel.y + 45, this.guiPanel.x + this.guiPanel.width - 30, this.guiPanel.y + 45);
		
		// Color scheme section
		this.drawColorSchemeControls();
		
		// Line thickness section
		this.drawLineThicknessControl();
		
		// Visualization size section
		this.drawVisualizationSizeControl();
		
		// Beat sensitivity section
		this.drawBeatSensitivityControl();
		
		// Animation speed section
		this.drawAnimationSpeedControl();
		
		// Song speed section
		this.drawSongSpeedControl();
		
		pop();
	};
	
	// Draw color scheme controls
	this.drawColorSchemeControls = function() {
		// Section title
		fill(220, 220, 220);
		textAlign(LEFT, TOP);
		textSize(14);
		text("Color Scheme", this.guiPanel.x + 25, this.guiPanel.y + 65);
		
		// Pink-Coral button
		let pinkButtonX = this.guiPanel.x + 25;
		let pinkButtonY = this.colorScheme.buttonY;
		
		if (this.colorScheme.current === 'pink-coral') {
			fill(255, 105, 180);
			stroke(255, 255, 255);
			strokeWeight(2);
		} else {
			fill(60, 60, 60);
			stroke(120, 120, 120);
			strokeWeight(1);
		}
		rect(pinkButtonX, pinkButtonY, this.colorScheme.buttonWidth, this.colorScheme.buttonHeight, 6);
		
		// Pink button text
		fill(255);
		noStroke();
		textAlign(CENTER, CENTER);
		textSize(11);
		text("Pink-Coral", pinkButtonX + this.colorScheme.buttonWidth/2, pinkButtonY + this.colorScheme.buttonHeight/2);
		
		// Monochrome button
		let monoButtonX = this.guiPanel.x + 145;
		
		if (this.colorScheme.current === 'monochrome') {
			fill(180, 180, 180);
			stroke(255, 255, 255);
			strokeWeight(2);
		} else {
			fill(60, 60, 60);
			stroke(120, 120, 120);
			strokeWeight(1);
		}
		rect(monoButtonX, pinkButtonY, this.colorScheme.buttonWidth, this.colorScheme.buttonHeight, 6);
		
		// Mono button text
		fill(255);
		noStroke();
		textAlign(CENTER, CENTER);
		text("Monochrome", monoButtonX + this.colorScheme.buttonWidth/2, pinkButtonY + this.colorScheme.buttonHeight/2);
	};
	
	// Draw line thickness control
	this.drawLineThicknessControl = function() {
		// Section title
		fill(220, 220, 220);
		textAlign(LEFT, TOP);
		textSize(12);
		text("Line Thickness: " + this.lineThickness.value.toFixed(1), this.guiPanel.x + 25, this.guiPanel.y + 100);
		
		// Slider track
		fill(40, 40, 40);
		noStroke();
		rect(this.lineThickness.x, this.lineThickness.y, this.lineThickness.width, this.lineThickness.height, 10);
		
		// Slider progress
		let progress = map(this.lineThickness.value, this.lineThickness.min, this.lineThickness.max, 0, 1);
		let progressWidth = progress * this.lineThickness.width;
		fill(255, 105, 180);
		rect(this.lineThickness.x, this.lineThickness.y, progressWidth, this.lineThickness.height, 10);
		
		// Slider handle
		let handleX = this.lineThickness.x + progressWidth;
		// Shadow
		fill(0, 0, 0, 100);
		ellipse(handleX + 1, this.lineThickness.y + this.lineThickness.height/2 + 1, 16);
		// Handle
		fill(255);
		stroke(200, 200, 200);
		strokeWeight(1);
		ellipse(handleX, this.lineThickness.y + this.lineThickness.height/2, 16);
	};
	
	// Draw visualization size control
	this.drawVisualizationSizeControl = function() {
		fill(220, 220, 220);
		textAlign(LEFT, TOP);
		textSize(12);
		text("Visualization Size: " + this.visualizationSize.value.toFixed(1) + "x", this.guiPanel.x + 25, this.guiPanel.y + 150);
		
		fill(40, 40, 40);
		noStroke();
		rect(this.visualizationSize.x, this.visualizationSize.y, this.visualizationSize.width, this.visualizationSize.height, 10);
		
		let progress = map(this.visualizationSize.value, this.visualizationSize.min, this.visualizationSize.max, 0, 1);
		let progressWidth = progress * this.visualizationSize.width;
		fill(100, 200, 255);
		rect(this.visualizationSize.x, this.visualizationSize.y, progressWidth, this.visualizationSize.height, 10);
		
		let handleX = this.visualizationSize.x + progressWidth;
		fill(0, 0, 0, 100);
		ellipse(handleX + 1, this.visualizationSize.y + this.visualizationSize.height/2 + 1, 16);
		fill(255);
		stroke(200, 200, 200);
		strokeWeight(1);
		ellipse(handleX, this.visualizationSize.y + this.visualizationSize.height/2, 16);
	};
	
	// Draw beat sensitivity control
	this.drawBeatSensitivityControl = function() {
		fill(220, 220, 220);
		textAlign(LEFT, TOP);
		textSize(12);
		text("Beat Sensitivity: " + this.beatSensitivity.value.toFixed(1), this.guiPanel.x + 25, this.guiPanel.y + 200);
		
		fill(40, 40, 40);
		noStroke();
		rect(this.beatSensitivity.x, this.beatSensitivity.y, this.beatSensitivity.width, this.beatSensitivity.height, 10);
		
		let progress = map(this.beatSensitivity.value, this.beatSensitivity.min, this.beatSensitivity.max, 0, 1);
		let progressWidth = progress * this.beatSensitivity.width;
		fill(255, 165, 0);
		rect(this.beatSensitivity.x, this.beatSensitivity.y, progressWidth, this.beatSensitivity.height, 10);
		
		let handleX = this.beatSensitivity.x + progressWidth;
		fill(0, 0, 0, 100);
		ellipse(handleX + 1, this.beatSensitivity.y + this.beatSensitivity.height/2 + 1, 16);
		fill(255);
		stroke(200, 200, 200);
		strokeWeight(1);
		ellipse(handleX, this.beatSensitivity.y + this.beatSensitivity.height/2, 16);
	};
	
	// Draw animation speed control
	this.drawAnimationSpeedControl = function() {
		fill(220, 220, 220);
		textAlign(LEFT, TOP);
		textSize(12);
		text("Animation Speed: " + this.animationSpeed.value.toFixed(1) + "x", this.guiPanel.x + 25, this.guiPanel.y + 250);
		
		fill(40, 40, 40);
		noStroke();
		rect(this.animationSpeed.x, this.animationSpeed.y, this.animationSpeed.width, this.animationSpeed.height, 10);
		
		let progress = map(this.animationSpeed.value, this.animationSpeed.min, this.animationSpeed.max, 0, 1);
		let progressWidth = progress * this.animationSpeed.width;
		fill(0, 255, 255);
		rect(this.animationSpeed.x, this.animationSpeed.y, progressWidth, this.animationSpeed.height, 10);
		
		let handleX = this.animationSpeed.x + progressWidth;
		fill(0, 0, 0, 100);
		ellipse(handleX + 1, this.animationSpeed.y + this.animationSpeed.height/2 + 1, 16);
		fill(255);
		stroke(200, 200, 200);
		strokeWeight(1);
		ellipse(handleX, this.animationSpeed.y + this.animationSpeed.height/2, 16);
	};
	
	// Draw song speed control
	this.drawSongSpeedControl = function() {
		fill(220, 220, 220);
		textAlign(LEFT, TOP);
		textSize(12);
		text("Song Speed: " + this.songSpeed.value.toFixed(2) + "x", this.guiPanel.x + 25, this.guiPanel.y + 300);
		
		fill(40, 40, 40);
		noStroke();
		rect(this.songSpeed.x, this.songSpeed.y, this.songSpeed.width, this.songSpeed.height, 10);
		
		let progress = map(this.songSpeed.value, this.songSpeed.min, this.songSpeed.max, 0, 1);
		let progressWidth = progress * this.songSpeed.width;
		fill(50, 255, 50);
		rect(this.songSpeed.x, this.songSpeed.y, progressWidth, this.songSpeed.height, 10);
		
		let handleX = this.songSpeed.x + progressWidth;
		fill(0, 0, 0, 100);
		ellipse(handleX + 1, this.songSpeed.y + this.songSpeed.height/2 + 1, 16);
		fill(255);
		stroke(200, 200, 200);
		strokeWeight(1);
		ellipse(handleX, this.songSpeed.y + this.songSpeed.height/2, 16);
	};
	
	// Get current color scheme
	this.getColorScheme = function() {
		return this.colorScheme.current;
	};
	
	// Get current line thickness
	this.getLineThickness = function() {
		return this.lineThickness.value;
	};
	
	// Get current visualization size
	this.getVisualizationSize = function() {
		return this.visualizationSize.value;
	};
	
	// Get current beat sensitivity
	this.getBeatSensitivity = function() {
		return this.beatSensitivity.value;
	};
	
	// Get current animation speed
	this.getAnimationSpeed = function() {
		return this.animationSpeed.value;
	};
	
	// Get current song speed
	this.getSongSpeed = function() {
		return this.songSpeed.value;
	};
}