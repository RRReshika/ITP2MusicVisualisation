let amplitudeVis = function() {
    this.name = "Amplitude Visualizer";
  
    this.amplitude = new p5.Amplitude();
    this.amplitudes = new Array(512).fill(0);
    
    this.numBars = 64;
    this.barRadius = 1000;
    this.maxBarLength = 350;
    this.rotationSpeed = 0.02;
    this.currentRotation = 0;
    this.pulseOffset = 0;
  
    this.setup = function() {
    };
  
    this.draw = function() {
        push()
        background(0);
        
        let colorScheme = controls.getColorScheme();
        let lineThickness = controls.getLineThickness();
        let visualSize = controls.getVisualizationSize();
        let beatSensitivity = controls.getBeatSensitivity();
        let animationSpeed = controls.getAnimationSpeed();
        let songSpeed = controls.getSongSpeed();
   
        let a = this.amplitude.getLevel();
  
        this.amplitudes.push(a);
        this.amplitudes.shift();
        
        translate(width/2, height/2);
        scale(visualSize);
        translate(-width/2, -height/2);
        
        this.currentRotation += (this.rotationSpeed + (a * 0.05 * beatSensitivity)) * animationSpeed;
        this.pulseOffset += 0.08 * animationSpeed;

        let size = map(a * beatSensitivity, 0, 1, 120, 800) * 3;

        for (let i = 7; i > 0; i--) {
            let glowSize = size + i * 50;
            let alpha = map(i, 7, 1, 30, 150);
            noFill();
            
            let r, g, b;
            if (colorScheme === 'monochrome') {
                // Monochrome - grayscale gradient
                let grayValue = map(i, 1, 7, 100, 255);
                r = grayValue;
                g = grayValue;
                b = grayValue;
            } else {
                // Neon pink gradient
                let t = i / 7;
                r = 255;
                g = lerp(20, 120, t);  // Neon pink range
                b = lerp(147, 200, t); // Pink variations
            }
            
            stroke(r, g, b, alpha); 
            strokeWeight(3 * lineThickness); // Apply line thickness
            ellipse(width /2, height / 2, glowSize);
        }

        // Core ellipse with color scheme support
        noStroke();
        if (colorScheme === 'monochrome') {
            fill(255, 255, 255, 240); // White for monochrome
        } else {
            fill(255, 20, 147, 240); // Bright neon pink
        }
        ellipse(width /2 , height / 2, size);
        
        // Inner bright core
        if (colorScheme === 'monochrome') {
            fill(200, 200, 200, 200); // Light gray for monochrome
        } else {
            fill(255, 100, 200, 200); // Pink for color scheme
        }
        ellipse(width /2 , height / 2, size * 0.7);

        // Glitter around with color scheme support
        for (let i = 0; i < 40; i++) { // More glitter
            let angle = random(TWO_PI);
            let r = size / 2 + random(15, 60); // Wider spread
            let x = width /2 + cos(angle) * r;
            let y = height / 2 + sin(angle) * r;
        
            let glitterAlpha = random(150, 255);
            if (colorScheme === 'monochrome') {
                stroke(255, 255, 255, glitterAlpha); // White glitter
            } else {
                stroke(255, random(50, 150), random(180, 220), glitterAlpha); // Neon pink glitter
            }
            strokeWeight(random(2, 5) * lineThickness); // Apply line thickness to glitter
            point(x, y);
        }
        
        // Add frequency bars around the circumference
        this.drawFrequencyBars(colorScheme, lineThickness);
        
        pop()
    };

    // Function to draw frequency bars with movement and color scheme support
    this.drawFrequencyBars = function(colorScheme, lineThickness) {
        // Get frequency spectrum data
        let spectrum = fourier.analyze();
        
        push();
        translate(width/2, height/2);
        
        // Rotate the entire bar system
        rotate(this.currentRotation);
        
        // Draw bars around the circle with movement effects
        for(let i = 0; i < this.numBars; i++) {
            let angle = map(i, 0, this.numBars, 0, TWO_PI);
            
            // Map spectrum data to bars
            let specIndex = Math.floor(map(i, 0, this.numBars, 0, spectrum.length * 0.8));
            let specValue = spectrum[specIndex] || 0;
            
            // Movement effects
            let pulseEffect = sin(this.pulseOffset + i * 0.1) * 20; // Wave motion
            let waveEffect = sin(this.currentRotation * 3 + i * 0.15) * 15; // Sine wave movement
            
            // Calculate bar length with movement
            let baseLength = map(specValue, 0, 255, 10, this.maxBarLength);
            let barLength = baseLength + pulseEffect + waveEffect + (specValue * 0.8); // Enhanced reactivity
            
            // Bar positions
            let startX = cos(angle) * this.barRadius;
            let startY = sin(angle) * this.barRadius;
            let endX = cos(angle) * (this.barRadius + barLength);
            let endY = sin(angle) * (this.barRadius + barLength);
            
            // Color scheme support for frequency bars
            let intensity = map(specValue, 0, 255, 0.3, 1);
            let alpha = map(specValue, 0, 255, 120, 255);
            
            let r, g, b;
            if (colorScheme === 'monochrome') {
                // Monochrome - white to gray gradient
                let grayValue = map(specValue, 0, 255, 150, 255);
                r = grayValue;
                g = grayValue;
                b = grayValue;
            } else {
                // Neon pink gradient based on frequency
                let t = i / this.numBars;
                
                if(t < 0.33) {
                    // Bright coral pink
                    r = 255;
                    g = lerp(80, 40, t * 3);
                    b = lerp(160, 180, t * 3);
                } else if(t < 0.66) {
                    // Hot neon pink
                    r = 255;
                    g = lerp(40, 20, (t - 0.33) * 3);
                    b = lerp(180, 200, (t - 0.33) * 3);
                } else {
                    // Electric magenta
                    r = 255;
                    g = lerp(20, 60, (t - 0.66) * 3);
                    b = lerp(200, 147, (t - 0.66) * 3);
                }
                
                // Intensity boost for strong frequencies
                if(specValue > 100) {
                    r = min(255, r * 1.3);
                    g = min(255, g * 1.3);
                    b = min(255, b * 1.3);
                }
            }
            
            stroke(r, g, b, alpha);
            
            // Bar thickness based on frequency intensity and line thickness control
            let thickness = map(specValue, 0, 255, 2, 8) * lineThickness; // Apply line thickness
            strokeWeight(thickness);
            
            // Draw the frequency bar
            line(startX, startY, endX, endY);
            
            // Glow effect with color scheme support
            if(specValue > 80) { // Lower threshold for more glow
                // Outer glow
                if (colorScheme === 'monochrome') {
                    stroke(255, 255, 255, alpha * 0.6); // White glow
                } else {
                    stroke(255, 100, 200, alpha * 0.6); // Pink glow
                }
                strokeWeight((thickness + 4) * lineThickness);
                line(startX, startY, endX * 0.9, endY * 0.9);
                
                // Inner bright glow
                if (colorScheme === 'monochrome') {
                    stroke(255, 255, 255, alpha * 0.8); // White bright glow
                } else {
                    stroke(255, 150, 220, alpha * 0.8); // Pink bright glow
                }
                strokeWeight((thickness + 2) * lineThickness);
                line(startX, startY, endX * 0.7, endY * 0.7);
            }
            
            // Secondary bars for high frequencies
            if(specValue > 150) {
                let secondaryLength = barLength * 0.6;
                let secEndX = cos(angle) * (this.barRadius + secondaryLength);
                let secEndY = sin(angle) * (this.barRadius + secondaryLength);
                
                if (colorScheme === 'monochrome') {
                    stroke(255, 255, 255, alpha * 0.7); // White secondary bars
                } else {
                    stroke(255, 50, 180, alpha * 0.7); // Pink secondary bars
                }
                strokeWeight((thickness + 3) * lineThickness);
                line(startX, startY, secEndX, secEndY);
            }
        }
        
        // Counter-rotating bars
        rotate(-this.currentRotation * 0.5); // Counter-rotation
        
        for(let i = 0; i < this.numBars; i += 2) { // Every other bar
            let angle = map(i, 0, this.numBars, 0, TWO_PI);
            let specIndex = Math.floor(map(i, 0, this.numBars, 0, spectrum.length * 0.6));
            let specValue = spectrum[specIndex] || 0;
            
            if(specValue > 50) { // Only draw for active frequencies
                let barLength = map(specValue, 50, 255, 20, this.maxBarLength * 0.8);
                let pulseEffect = sin(this.pulseOffset * 1.5 + i * 0.08) * 15;
                barLength += pulseEffect;
                
                let startX = cos(angle) * (this.barRadius + 30);
                let startY = sin(angle) * (this.barRadius + 30);
                let endX = cos(angle) * (this.barRadius + 30 + barLength);
                let endY = sin(angle) * (this.barRadius + 30 + barLength);
                
                if (colorScheme === 'monochrome') {
                    stroke(255, 255, 255, 180); // White counter-rotating bars
                } else {
                    stroke(255, 80, 200, 180); // Bright neon pink
                }
                strokeWeight(3 * lineThickness); // Apply line thickness
                line(startX, startY, endX, endY);
            }
        }
        
        pop();
    };
    
};