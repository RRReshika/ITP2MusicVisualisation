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
			background(0); // dark background for neon effect
	
			for (var i = 0; i < this.plotsDown; i++) {
				for (var j = 0; j < this.plotsAcross; j++) {
					let x = j * this.plotWidth + this.pad / 2;
					let y = i * this.plotHeight + this.pad / 2;
					let w = this.plotWidth - this.pad;
					let h = this.plotHeight - this.pad;
	
					let centreX = x + w / 2;
					let bottomY = y + h;
	
					// Neon arc dial background
					push();
					translate(centreX, bottomY);
					strokeWeight(10);
					stroke(255, 20, 147, 180); // neon pink
					noFill();
					drawingContext.shadowBlur = 30;
					drawingContext.shadowColor = color(255, 20, 147); // neon pink
					arc(0, 0, this.dialRadius * 2, this.dialRadius * 2, minAngle, maxAngle);
					pop();
	
					// Ticks and label
					this.ticks(centreX, bottomY, this.frequencyBins[currentBin]);
	
					// Needle
					let energy = fourier.getEnergy(this.frequencyBins[currentBin]);
					this.needle(energy, centreX, bottomY);
	
					currentBin++;
				}
			}
			pop();
		};
	
		this.needle = function(energy, centreX, bottomY) {
			push();
			stroke('#ff61d3');//pink color by student
			strokeWeight(2);
			drawingContext.shadowBlur = 20;
			drawingContext.shadowColor = color('#ff61d3');//pink color by student
			translate(centreX, bottomY);
			let theta = map(energy, 0, 255, minAngle, maxAngle);
			let x = this.dialRadius * cos(theta);
			let y = this.dialRadius * sin(theta);
			line(0, 0, x, y);
			pop();
		};
	
		this.ticks = function(centreX, bottomY, freqLabel) {
			var nextTickAngle = minAngle;
			push();
			stroke(255);
			fill('#333');
			translate(centreX, bottomY);
			arc(0, 0, 20, 20, PI, 2 * PI);
			textAlign(CENTER);
			textSize(12);
			text(freqLabel, 0, -(this.plotHeight / 2));
	
			for (var i = 0; i < 9; i++) {
				var x = this.dialRadius * cos(nextTickAngle);
				var x1 = (this.dialRadius - 5) * cos(nextTickAngle);
				var y = this.dialRadius * sin(nextTickAngle);
				var y1 = (this.dialRadius - 5) * sin(nextTickAngle);
				line(x, y, x1, y1);
				nextTickAngle += PI / 10;
			}
			pop();
		};
	}



