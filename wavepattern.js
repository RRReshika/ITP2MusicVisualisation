function WavePattern(){
    this.name = "wavepattern";
    
    this.waveOffset = 0;
    this.beatIntensity = 0;
    this.smoothBeat = 0;
    this.waveforms = [];
    this.numWaveforms = 12;
    
    this.lastBeatTime = 0;
    this.beatThreshold = 180;
    this.beatDecay = 0.95;
    
    this.initWaveforms = function() {
        this.waveforms = [];
        for(let i = 0; i < this.numWaveforms; i++) {
            this.waveforms.push({
                frequency: random(0.003, 0.012),
                amplitude: random(0.3, 1.2),
                phase: random(TWO_PI),
                speed: 1.0,
                yOffset: random(-60, 60),
                complexity: random(2, 6),
                beatSensitivity: random(0.5, 1.5)
            });
        }
    };
    
    this.initWaveforms();

    this.draw = function(){
        background(0);
        
        let colorScheme = controls.getColorScheme();
        let lineThickness = controls.getLineThickness();
        let visualSize = controls.getVisualizationSize();
        let beatSensitivity = controls.getBeatSensitivity();
        let animationSpeed = controls.getAnimationSpeed();
        let songSpeed = controls.getSongSpeed();
        
        let spectrum = fourier.analyze();
        let waveform = fourier.waveform();
        let bass = fourier.getEnergy("bass");
        let mid = fourier.getEnergy("mid");
        let treble = fourier.getEnergy("treble");
        
        // Beat detection with beat sensitivity
        let totalEnergy = bass + mid + treble;
        let adjustedThreshold = this.beatThreshold / beatSensitivity;
        if(totalEnergy > adjustedThreshold && millis() - this.lastBeatTime > (100 / animationSpeed)) {
            this.beatIntensity = map(totalEnergy, adjustedThreshold, 700, 1, 3) * beatSensitivity;
            this.lastBeatTime = millis();
        }
        
        // Smooth beat decay
        this.smoothBeat = lerp(this.smoothBeat, this.beatIntensity, 0.1 * animationSpeed);
        this.beatIntensity *= this.beatDecay;
        
        // Update animation with animation speed
        if (sound && sound.isPlaying()) {
            this.waveOffset += (0.015 + (bass / 5000)) * animationSpeed;
        }
        
        push();
        
        // Apply visualization scaling
        translate(width/2, height/2);
        scale(visualSize);
        translate(-width/2, -height/2);
        translate(0, height/2);
        
        // Enable additive blending for glow effect
        drawingContext.globalCompositeOperation = 'screen';
        
        // Draw multiple complex waveforms
        for(let w = 0; w < this.waveforms.length; w++) {
            let wf = this.waveforms[w];
            
            // Calculate opacity based on layer
            let alpha = map(w, 0, this.waveforms.length-1, 80, 200);
            
            // Color variations based on scheme
            let r, g, b;
            
            if (colorScheme === 'monochrome') {
                // Monochrome - various shades of white/gray
                let grayValue = map(w, 0, this.waveforms.length-1, 100, 255);
                r = grayValue;
                g = grayValue;
                b = grayValue;
            } else {
                // Pink-coral scheme (original)
                let t = w / (this.waveforms.length - 1);
                
                if(t < 0.33) {
                    // Light coral to coral
                    r = 255;
                    g = lerp(160, 127, t * 3);
                    b = lerp(122, 140, t * 3);
                } else if(t < 0.66) {
                    // Coral to hot pink
                    r = 255;
                    g = lerp(127, 105, (t - 0.33) * 3);
                    b = lerp(140, 180, (t - 0.33) * 3);
                } else {
                    // Hot pink to magenta
                    r = 255;
                    g = lerp(105, 20, (t - 0.66) * 3);
                    b = lerp(180, 147, (t - 0.66) * 3);
                }
            }
            
            stroke(r, g, b, alpha);
            strokeWeight(map(w, 0, this.waveforms.length-1, 0.5, 2.5) * lineThickness);
            noFill();
            
            // Generate complex waveform - SYNCHRONIZED MOVEMENT
            beginShape();
            for(let x = 0; x < width; x += 1) {
                let y = 0;
                
                // Build complex wave using multiple harmonics
                for(let h = 1; h <= wf.complexity; h++) {
                    let freq = wf.frequency * h;
                    let amp = (wf.amplitude / h) * 40;
                    
                    // PRIMARY SYNCHRONIZED MOVEMENT - all use same waveOffset
                    y += sin((x * freq) + (wf.phase) + (this.waveOffset * h)) * amp;
                    
                    // SECONDARY SYNCHRONIZED MOVEMENT - same timing
                    y += cos((x * freq * 0.7) + (wf.phase * 1.3) + (this.waveOffset * h * 1.2)) * (amp * 0.3);
                }
                
                // Add audio reactivity
                let spectrumIndex = Math.floor(map(x, 0, width, 0, spectrum.length * 0.8));
                let spectrumValue = spectrum[spectrumIndex] || 0;
                let audioReactive = map(spectrumValue, 0, 255, 0, 60) * wf.beatSensitivity;
                
                // Beat intensity modulation - SYNCHRONIZED
                let beatMod = this.smoothBeat * wf.beatSensitivity * 15;
                
                // Waveform data influence
                let waveIndex = Math.floor(map(x, 0, width, 0, waveform.length));
                let waveValue = waveform[waveIndex] || 0;
                let waveInfluence = waveValue * 30 * wf.beatSensitivity;
                
                // Combine all influences
                y += audioReactive + beatMod + waveInfluence + wf.yOffset;
                
                // Add subtle noise for organic feel - SYNCHRONIZED
                let noiseInfluence = (noise(x * 0.002, w * 0.1, this.waveOffset * 0.5) - 0.5) * 8;
                y += noiseInfluence;
                
                vertex(x, y);
            }
            endShape();
            
            // Draw additional harmonics for density - SYNCHRONIZED
            if(w < this.waveforms.length / 2) {
                stroke(r, g, b, alpha * 0.4);
                strokeWeight(0.8);
                beginShape();
                for(let x = 0; x < width; x += 2) {
                    let y = 0;
                    
                    // Shifted harmonic - SYNCHRONIZED TIMING
                    for(let h = 1; h <= 3; h++) {
                        let freq = wf.frequency * h * 1.5;
                        let amp = (wf.amplitude / (h * 2)) * 25;
                        y += sin((x * freq) + (wf.phase + PI/4) + (this.waveOffset * h * 1.8)) * amp;
                    }
                    
                    // Audio influence
                    let spectrumIndex = Math.floor(map(x, 0, width, 0, spectrum.length * 0.6));
                    let spectrumValue = spectrum[spectrumIndex] || 0;
                    y += map(spectrumValue, 0, 255, 0, 40) * wf.beatSensitivity;
                    y += this.smoothBeat * 10 + wf.yOffset * 0.7;
                    
                    vertex(x, y);
                }
                endShape();
            }
        }
        
        // Reset blend mode
        drawingContext.globalCompositeOperation = 'source-over';
        
        // Add glow effect - SYNCHRONIZED with color scheme support
        drawingContext.shadowBlur = 15;
        
        if (colorScheme === 'monochrome') {
            drawingContext.shadowColor = 'rgba(255, 255, 255, 0.4)'; // White glow for monochrome
        } else {
            drawingContext.shadowColor = 'rgba(255, 105, 180, 0.6)'; // Coral pink glow for pink-coral scheme
        }
        
        // Redraw key waveforms with glow - SYNCHRONIZED
        for(let w = Math.floor(this.waveforms.length * 0.7); w < this.waveforms.length; w++) {
            let wf = this.waveforms[w];
            
            // Apply color scheme to glow layer
            if (colorScheme === 'monochrome') {
                stroke(255, 255, 255, 120); // White for monochrome
            } else {
                stroke(255, 105, 180, 120); // Coral pink for pink-coral scheme
            }
            
            strokeWeight(1.5);
            noFill();
            
            beginShape();
            for(let x = 0; x < width; x += 3) {
                let y = 0;
                
                for(let h = 1; h <= 2; h++) {
                    let freq = wf.frequency * h;
                    let amp = (wf.amplitude / h) * 35;
                    // SYNCHRONIZED MOVEMENT - same waveOffset for all
                    y += sin((x * freq) + (wf.phase) + (this.waveOffset * h)) * amp;
                }
                
                // Strong beat reactivity for glow layer
                let spectrumIndex = Math.floor(map(x, 0, width, 0, spectrum.length * 0.5));
                let spectrumValue = spectrum[spectrumIndex] || 0;
                y += map(spectrumValue, 0, 255, 0, 50) * wf.beatSensitivity;
                y += this.smoothBeat * 20 + wf.yOffset;
                
                vertex(x, y);
            }
            endShape();
        }
        
        // Reset shadow
        drawingContext.shadowBlur = 0;
        
        pop();
    };
    
    // Reset waveforms when visualization is selected
    this.onResize = function() {
        this.initWaveforms();
    };
}