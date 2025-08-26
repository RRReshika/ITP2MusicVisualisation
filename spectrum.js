function Spectrum(){
	this.name = "spectrum";

	this.draw = function(){
		push();
	
		let spectrum = fourier.analyze();
		noStroke();
	
		// Move origin to bottom-left and rotate canvas
		translate(0, height);
		rotate(-HALF_PI);
	
		for (let i = 0; i < spectrum.length; i++) {
			let amp = spectrum[i];
	
			// Y becomes X axis after rotation
			let x = map(i, 0, spectrum.length, 0, height);
			let h = map(amp, 0, 255, 0, width);

			let r, g, b;

			if (amp < 128) {
				// gradient 1 pink theme
				r = map(amp, 0, 128, 255, 255);
				g = map(amp, 0, 128, 0, 200);
				b = map(amp, 0, 128, 150, 150);
			} else {
				// gradient 2 pink theme
				r = map(amp, 128, 255, 255, 138);
				g = map(amp, 128, 255, 200, 43);
				b = map(amp, 128, 255, 150, 226);
			}
			fill(r, g, b);
			
			rect(x, 0, height / spectrum.length, h);
        }

        pop();
    };
	
}
