function Spectrum(){
	this.name = "spectrum";

	this.draw = function(){
		push();
	
		let spectrum = fourier.analyze();
		noStroke();
		
		let colorScheme = controls.getColorScheme();
		let lineThickness = controls.getLineThickness();
		let visualSize = controls.getVisualizationSize();
		let beatSensitivity = controls.getBeatSensitivity();
		let animationSpeed = controls.getAnimationSpeed();
		let songSpeed = controls.getSongSpeed();
	
		translate(0, height);
		rotate(-HALF_PI);
		scale(visualSize);
	
		for (let i = 0; i < spectrum.length; i++) {
			let amp = spectrum[i] * beatSensitivity;
			let x = map(i, 0, spectrum.length, 0, height / visualSize);
			let h = map(amp, 0, 255 * beatSensitivity, 0, width / visualSize);

			let r, g, b;
			
			if (colorScheme === 'monochrome') {
				let gray = map(amp, 0, 255, 50, 255);
				r = gray;
				g = gray;
				b = gray;
			} else {
				if (amp < 128) {
					r = map(amp, 0, 128, 255, 255);
					g = map(amp, 0, 128, 0, 200);
					b = map(amp, 0, 128, 150, 150);
				} else {
					r = map(amp, 128, 255, 255, 138);
					g = map(amp, 128, 255, 200, 43);
					b = map(amp, 128, 255, 150, 226);
				}
			}
			
			fill(r, g, b);
			
			// Bar width with line thickness
			let barWidth = (height / spectrum.length) * lineThickness;
			rect(x, 0, barWidth, h);
        }

        pop();
    };
	
}
