function SpiralVisualizer() {
    this.name = "Spiral Visualizer";
    
    // Spiral parameters
    this.rotation = 0;
    this.numRings = 50;
    this.maxRadius = 300;
    this.rotationSpeed = 0.01;
    this.spiralTightness = 0.3;
    
    // Audio reactive parameters
    this.beatIntensity = 0;
    this.smoothBeat = 0;
    this.lastBeatTime = 0;
    this.beatThreshold = 0.3;
    this.beatDecay = 0.94;
    
    this.setup = function() {
        // Initialize or reset spiral parameters
        this.rotation = 0;
        this.beatIntensity = 0;
        this.smoothBeat = 0;
        this.lastBeatTime = 0;
        this.maxRadius = min(width, height) * 0.35;
    };
    
    this.draw = function() {
        let colorScheme = controls.getColorScheme();
        let lineThickness = controls.getLineThickness();
        let visualizationSize = controls.getVisualizationSize();
        let beatSensitivity = controls.getBeatSensitivity();
        let animationSpeed = controls.getAnimationSpeed();
        let songSpeed = controls.getSongSpeed();
        
        background(0);
        
        let spectrum = [];
        let amplitude = 0;
        
        if (fourier) {
            spectrum = fourier.analyze();
            if (sound && sound.isPlaying()) {
                amplitude = fourier.getEnergy("bass") / 255;
            }
        }
        
        // Apply beat sensitivity to threshold and intensity
        let adjustedThreshold = this.beatThreshold / beatSensitivity;
        if (amplitude > adjustedThreshold && millis() - this.lastBeatTime > (150 / animationSpeed)) {
            this.beatIntensity = map(amplitude, adjustedThreshold, 1, 1, 2.5) * beatSensitivity;
            this.lastBeatTime = millis();
        }
        
        this.smoothBeat = lerp(this.smoothBeat, this.beatIntensity, 0.1 * animationSpeed);
        this.beatIntensity *= this.beatDecay;
        
        let rotationMultiplier = 1 + this.smoothBeat * 0.5;
        this.rotation += this.rotationSpeed * rotationMultiplier * animationSpeed;
        
        push();
        translate(width/2, height/2);
        rotate(this.rotation);
        scale(visualizationSize);
        
        this.drawSpiral(spectrum, amplitude, colorScheme, lineThickness, beatSensitivity, animationSpeed, visualizationSize);
        
        pop();
    };
    
    this.drawSpiral = function(spectrum, amplitude, colorScheme = 'pink-coral', lineThickness = 1, beatSensitivity = 1, animationSpeed = 1, visualizationSize = 1) {
        noFill();
        strokeWeight(2 * lineThickness);
        
        // Calculate dynamic parameters with beat sensitivity
        let dynamicRadius = (this.maxRadius + amplitude * 50 * beatSensitivity + this.smoothBeat * 30);
        let spiralOffset = this.rotation * 10;
        
        // Draw multiple spiral arms
        for (let arm = 0; arm < 3; arm++) {
            let armOffset = (TWO_PI / 3) * arm;
            
            // Draw concentric spiral rings
            for (let ring = 0; ring < this.numRings; ring++) {
                let t = ring / this.numRings;
                let radius = t * dynamicRadius;
                
                // Color based on ring position and audio
                let hue, saturation, brightness, alpha;
                
                if (colorScheme === 'monochrome') {
                    hue = 0;
                    saturation = 0;
                    brightness = map(t + amplitude + this.smoothBeat, 0, 3, 40, 95);
                    alpha = map(t, 0, 1, 200, 80);
                } else {
                    hue = (t * 360 + spiralOffset + arm * 60) % 360;
                    if (hue > 30 && hue < 300) {
                        hue = 330 + (hue % 60);
                    }
                    saturation = map(amplitude + this.smoothBeat, 0, 2, 40, 100);
                    brightness = map(t, 0, 1, 60, 95);
                    alpha = map(t, 0, 1, 200, 80);
                }
                let specIndex = Math.floor(map(ring, 0, this.numRings, 0, spectrum.length * 0.7));
                let specValue = spectrum[specIndex] || 0;
                let audioInfluence = map(specValue, 0, 255, 0.8, 1.4);
                
                if (colorScheme === 'monochrome') {
                    let grayValue = map(t + amplitude + this.smoothBeat, 0, 3, 100, 255);
                    stroke(grayValue, grayValue, grayValue, alpha);
                } else {
                    colorMode(HSB, 360, 100, 100, 255);
                    stroke(hue, saturation, brightness, alpha);
                    colorMode(RGB, 255);
                }
                
                beginShape();
                let points = 200;
                for (let i = 0; i < points; i++) {
                    let angle = map(i, 0, points, 0, TWO_PI * 6); // Multiple rotations
                    let currentRadius = (radius * i / points) * audioInfluence;
                    
                    // Spiral equation with audio modulation
                    let spiralAngle = angle + armOffset + (currentRadius * this.spiralTightness);
                    let x = cos(spiralAngle) * currentRadius;
                    let y = sin(spiralAngle) * currentRadius;
                    
                    // Add subtle wave modulation
                    let wave = sin(angle * 3 + spiralOffset) * 5 * amplitude * visualizationSize;
                    let waveX = cos(spiralAngle + PI/2) * wave;
                    let waveY = sin(spiralAngle + PI/2) * wave;
                    
                    vertex(x + waveX, y + waveY);
                }
                endShape();
                
                // Draw additional glow layer for outer rings
                if (ring > this.numRings * 0.7) {
                    if (colorScheme === 'monochrome') {
                        let glowGray = map(t + amplitude + this.smoothBeat, 0, 3, 120, 255);
                        stroke(glowGray, glowGray, glowGray, alpha * 0.5);
                    } else {
                        colorMode(HSB, 360, 100, 100, 255);
                        stroke(hue, saturation - 20, brightness + 10, alpha * 0.5);
                        colorMode(RGB, 255);
                    }
                    strokeWeight(3 * lineThickness);
                    beginShape();
                    for (let i = 0; i < points; i += 2) {
                        let angle = map(i, 0, points, 0, TWO_PI * 6);
                        let currentRadius = (radius * i / points) * audioInfluence;
                        let spiralAngle = angle + armOffset + (currentRadius * this.spiralTightness);
                        let x = cos(spiralAngle) * currentRadius;
                        let y = sin(spiralAngle) * currentRadius;
                        vertex(x, y);
                    }
                    endShape();
                    strokeWeight(2 * lineThickness);
                }
            }
        }
        
        // Draw center highlight
        if (this.smoothBeat > 0.5) {
            if (colorScheme === 'monochrome') {
                fill(255, 255, 255, 150);
            } else {
                fill(255, 200, 100, 150);
            }
            noStroke();
            ellipse(0, 0, (20 + this.smoothBeat * 20) * visualizationSize);
            
            if (colorScheme === 'monochrome') {
                fill(200, 200, 200, 100);
            } else {
                fill(255, 150, 50, 100);
            }
            ellipse(0, 0, (40 + this.smoothBeat * 30) * visualizationSize);
        }
        
        // Add outer glow effect on beats
        if (amplitude > 0.3) {
            drawingContext.shadowBlur = 20 * visualizationSize;
            
            if (colorScheme === 'monochrome') {
                drawingContext.shadowColor = `rgba(255, 255, 255, ${amplitude})`;
                stroke(255, 255, 255, amplitude * 255);
            } else {
                drawingContext.shadowColor = `rgba(255, 100, 200, ${amplitude})`;
                stroke(255, 100, 200, amplitude * 255);
            }
            
            noFill();
            strokeWeight(1 * lineThickness);
            
            let glowRadius = dynamicRadius * 0.9;
            beginShape();
            for (let i = 0; i < 100; i++) {
                let angle = map(i, 0, 100, 0, TWO_PI * 5);
                let r = glowRadius + sin(angle * 2 + spiralOffset) * 20 * visualizationSize;
                let x = cos(angle) * r;
                let y = sin(angle) * r;
                vertex(x, y);
            }
            endShape();
            
            drawingContext.shadowBlur = 0;
        }
        
        // Ensure color mode is reset
        colorMode(RGB, 255);
    };
    
    // Handle window resize
    this.onResize = function() {
        // Adjust max radius based on screen size
        this.maxRadius = min(width, height) * 0.35;
    };
}