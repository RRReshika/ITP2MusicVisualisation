function Needles() {
		this.name = "needles";
	
		var minAngle = PI + PI / 10;
		var maxAngle = TWO_PI - PI / 10;
	
		this.plotsAcross = 2;
		this.plotsDown = 2;
		this.frequencyBins = ["bass", "lowMid", "highMid", "treble"];
	
		this.onResize = function() {
			this.pad = width / 20;
			this.plotWidth = (width - this.pad) / this.plotsAcross;
			this.plotHeight = (height - this.pad) / this.plotsDown;
			this.dialRadius = (this.plotWidth - this.pad) / 2 - 5;
		};
		this.onResize();
	
		this.draw = function() {
			var spectrum = fourier.analyze();
			var currentBin = 0;
			push();
			background(0);
			
			let colorScheme = controls.getColorScheme();
			let lineThickness = controls.getLineThickness();
			let visualSize = controls.getVisualizationSize();
			let beatSensitivity = controls.getBeatSensitivity();
			let animationSpeed = controls.getAnimationSpeed();
			let songSpeed = controls.getSongSpeed();
			
			scale(visualSize);
			
			let scaledPlotWidth = this.plotWidth / visualSize;
			let scaledPlotHeight = this.plotHeight / visualSize;
			let scaledDialRadius = this.dialRadius / visualSize;
	
			for (var i = 0; i < this.plotsDown; i++) {
				for (var j = 0; j < this.plotsAcross; j++) {
					let x = j * scaledPlotWidth + this.pad / 2 / visualSize;
					let y = i * scaledPlotHeight + this.pad / 2 / visualSize;
					let w = scaledPlotWidth - this.pad / visualSize;
					let h = scaledPlotHeight - this.pad / visualSize;
	
					let centreX = x + w / 2;
					let bottomY = y + h;
	
					push();
					translate(centreX, bottomY);
					strokeWeight(10 * lineThickness / 2); // Apply line thickness
					
					if (colorScheme === 'monochrome') {
						stroke(200, 200, 200, 180);
						drawingContext.shadowColor = color(200, 200, 200);
					} else {
						stroke(255, 20, 147, 180);
						drawingContext.shadowColor = color(255, 20, 147);
					}
					
					noFill();
					drawingContext.shadowBlur = 30;
					arc(0, 0, scaledDialRadius * 2, scaledDialRadius * 2, minAngle, maxAngle);
					pop();
	
					this.ticks(centreX, bottomY, this.frequencyBins[currentBin], scaledDialRadius, scaledPlotHeight, colorScheme);
	
					let energy = fourier.getEnergy(this.frequencyBins[currentBin]);
					this.needle(energy * beatSensitivity, centreX, bottomY, scaledDialRadius, lineThickness, colorScheme, animationSpeed);
	
					currentBin++;
				}
			}
			pop();
		};
	
		this.needle = function(energy, centreX, bottomY, dialRadius, lineThickness, colorScheme, animationSpeed = 1) {
			push();
			
			if (colorScheme === 'monochrome') {
				stroke(255, 255, 255);
				drawingContext.shadowColor = color(255, 255, 255);
			} else {
				stroke('#ff61d3');
				drawingContext.shadowColor = color('#ff61d3');
			}
			
			strokeWeight(2 * lineThickness);
			drawingContext.shadowBlur = 20;
			translate(centreX, bottomY);
			let theta = map(energy, 0, 255, minAngle, maxAngle);
			let x = dialRadius * cos(theta);
			let y = dialRadius * sin(theta);
			line(0, 0, x, y);
			pop();
		};
	
		this.ticks = function(centreX, bottomY, freqLabel, dialRadius, plotHeight, colorScheme) {
			var nextTickAngle = minAngle;
			push();
			
			if (colorScheme === 'monochrome') {
				stroke(255);
				fill('#666');
			} else {
				stroke(255);
				fill('#333');
			}
			
			translate(centreX, bottomY);
			arc(0, 0, 20, 20, PI, 2 * PI);
			textAlign(CENTER);
			textSize(12);
			text(freqLabel, 0, -(plotHeight / 2));
	
			for (var i = 0; i < 9; i++) {
				var x = dialRadius * cos(nextTickAngle);
				var x1 = (dialRadius - 5) * cos(nextTickAngle);
				var y = dialRadius * sin(nextTickAngle);
				var y1 = (dialRadius - 5) * sin(nextTickAngle);
				line(x, y, x1, y1);
				nextTickAngle += PI / 10;
			}
			pop();
		};
	}



