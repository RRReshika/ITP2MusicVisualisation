function noisesteep() {
  this.name = "noise Steep";
  this.noisesteep = 0.01;
  this.prog = 0;
  
  // Background visualization parameters
  this.backgroundParticles = [];
  this.numParticles = 80;
  this.bgOffset = 0;
  
  // Rotating polygons parameters
  this.polygons = [];
  this.numPolygons = 12;
  
  // Initialize background particles
  this.initBackgroundParticles = function() {
    this.backgroundParticles = [];
    for(let i = 0; i < this.numParticles; i++) {
      this.backgroundParticles.push({
        x: random(width),
        y: random(height),
        size: random(2, 8),
        speed: random(0.5, 2),
        angle: random(TWO_PI),
        noiseOffset: random(1000),
        alpha: random(50, 150),
        hue: random(280, 340) // Pink/purple range
      });
    }
  };
  
  // Initialize rotating polygons
  this.initPolygons = function() {
    this.polygons = [];
    for(let i = 0; i < this.numPolygons; i++) {
      this.polygons.push({
        x: random(width),
        y: random(height),
        sides: Math.floor(random(3, 8)), // 3-7 sides
        size: random(30, 100),
        rotation: random(TWO_PI),
        rotationSpeed: random(-0.02, 0.02),
        alpha: random(15, 40),
        strokeAlpha: random(30, 80),
        color: {
          h: random(280, 340), // Pink/purple range
          s: random(40, 80),
          b: random(60, 90)
        },
        driftSpeed: random(0.2, 0.8),
        driftAngle: random(TWO_PI),
        pulseOffset: random(TWO_PI),
        audioSensitivity: random(0.5, 1.5)
      });
    }
  };
  
  // Call init
  this.initBackgroundParticles();
  this.initPolygons();

  this.draw = function() {
    let colorScheme = controls.getColorScheme();
    let lineThickness = controls.getLineThickness();
    let visualizationSize = controls.getVisualizationSize();
    let beatSensitivity = controls.getBeatSensitivity();
    let animationSpeed = controls.getAnimationSpeed();
    let songSpeed = controls.getSongSpeed();
    
    background(0);
    
    this.drawBackgroundVisualization(colorScheme, visualizationSize, beatSensitivity, animationSpeed);
    this.drawRotatingPolygons(colorScheme, lineThickness, visualizationSize, beatSensitivity, animationSpeed);
    this.drawFlowingGrid(colorScheme, lineThickness, visualizationSize, animationSpeed);
    
    push();
    translate(width / 2, height / 2);
    scale(visualizationSize);
    beginShape();
    noFill();
    
    if (colorScheme === 'monochrome') {
      stroke(255, 255, 255);
    } else {
      stroke(255, 105, 180);
    }
    
    strokeWeight(3 * lineThickness);
    for (let i = 0; i < 100; i++) {
      var x = map(noise(i * this.noisesteep + this.prog), 0, 1, -200, 200) * 4 * visualizationSize;
      var y = map(noise(i * this.noisesteep + this.prog + 1000), 0, 1, -100, 100) * 4 * visualizationSize;
      vertex(x, y);
    }
    endShape();
    pop();
    
    push();
    translate(width / 2, height / 2);
    beginShape();
    noFill();
    
    if (colorScheme === 'monochrome') {
      stroke(255, 255, 255, 100);
    } else {
      stroke(255, 105, 180, 100);
    }
    
    strokeWeight(8 * lineThickness);
    for (let i = 0; i < 100; i++) {
      var x = map(noise(i * this.noisesteep + this.prog), 0, 1, -200, 200) * 4 * visualizationSize;
      var y = map(noise(i * this.noisesteep + this.prog + 1000), 0, 1, -100, 100) * 4 * visualizationSize;
      vertex(x, y);
    }
    endShape();
    pop();

    // Only move when music is playing, and tie movement to energy
    if (sound && sound.isPlaying()) {
      let spectrum = fourier.analyze();
      let energy = fourier.getEnergy("bass"); // or "mid", "treble"
      this.prog += map(energy, 0, 255, 0, 0.2);
      
      // Update background animation
      this.bgOffset += 0.02;
      this.updateBackgroundParticles(energy);
      this.updatePolygons(energy);
    }
  };
  
  this.drawBackgroundVisualization = function(colorScheme = 'pink-coral', visualizationSize = 1) {
    // Draw animated particles
    for(let i = 0; i < this.backgroundParticles.length; i++) {
      let p = this.backgroundParticles[i];
      
      // Set particle color with audio reactivity
      let energy = 0;
      if (sound && sound.isPlaying()) {
        energy = fourier.getEnergy("mid");
      }
      
      colorMode(HSB, 360, 100, 100, 255);
      let dynamicAlpha = p.alpha + map(energy, 0, 255, 0, 100);
      
      if (colorScheme === 'monochrome') {
        // Monochrome particles - white/gray
        fill(0, 0, 80, dynamicAlpha);
      } else {
        // Pink-coral particles
        fill(p.hue, 60, 70, dynamicAlpha);
      }
      
      noStroke();
      
      // Draw particle with slight glow
      let particleSize = p.size * visualizationSize;
      ellipse(p.x, p.y, particleSize);
      
      // Add subtle glow
      if (colorScheme === 'monochrome') {
        fill(0, 0, 90, dynamicAlpha * 0.3);
      } else {
        fill(p.hue, 40, 90, dynamicAlpha * 0.3);
      }
      ellipse(p.x, p.y, particleSize * 2);
      
      colorMode(RGB, 255);
    }
  };
  
  this.drawRotatingPolygons = function(colorScheme = 'pink-coral', lineThickness = 1, visualizationSize = 1) {
    let energy = 0;
    let bass = 0;
    if (sound && sound.isPlaying()) {
      energy = fourier.getEnergy("mid");
      bass = fourier.getEnergy("bass");
    }
    
    for(let i = 0; i < this.polygons.length; i++) {
      let poly = this.polygons[i];
      
      push();
      translate(poly.x, poly.y);
      rotate(poly.rotation);
      
      // Dynamic sizing based on audio
      let audioSize = map(energy * poly.audioSensitivity, 0, 255, 0.8, 1.4);
      let pulsing = 1 + sin(this.bgOffset * 3 + poly.pulseOffset) * 0.1;
      let finalSize = poly.size * audioSize * pulsing * visualizationSize;
      
      // Set colors with audio reactivity
      colorMode(HSB, 360, 100, 100, 255);
      
      // Fill with low alpha
      let fillAlpha = poly.alpha + map(bass, 0, 255, 0, 20);
      
      if (colorScheme === 'monochrome') {
        fill(0, 0, 80, fillAlpha);
      } else {
        fill(poly.color.h, poly.color.s, poly.color.b, fillAlpha);
      }
      
      // Stroke with higher alpha
      let strokeAlpha = poly.strokeAlpha + map(energy, 0, 255, 0, 40);
      
      if (colorScheme === 'monochrome') {
        stroke(0, 0, 90, strokeAlpha);
      } else {
        stroke(poly.color.h, poly.color.s + 20, poly.color.b + 10, strokeAlpha);
      }
      
      strokeWeight(1.5 * lineThickness);
      
      // Draw polygon
      this.drawPolygon(0, 0, finalSize, poly.sides);
      
      // Add inner glow on strong beats
      if(energy > 100) {
        noFill();
        if (colorScheme === 'monochrome') {
          stroke(0, 0, 95, strokeAlpha * 0.8);
        } else {
          stroke(poly.color.h, poly.color.s - 20, poly.color.b + 20, strokeAlpha * 0.8);
        }
        strokeWeight(0.8 * lineThickness);
        this.drawPolygon(0, 0, finalSize * 0.7, poly.sides);
      }
      
      colorMode(RGB, 255);
      pop();
    }
  };
  
  this.drawPolygon = function(x, y, radius, sides) {
    beginShape();
    for(let i = 0; i < sides; i++) {
      let angle = map(i, 0, sides, 0, TWO_PI);
      let px = x + cos(angle) * radius;
      let py = y + sin(angle) * radius;
      vertex(px, py);
    }
    endShape(CLOSE);
  };
  
  this.updatePolygons = function(energy) {
    for(let i = 0; i < this.polygons.length; i++) {
      let poly = this.polygons[i];
      
      // Rotate continuously
      poly.rotation += poly.rotationSpeed;
      
      // Add extra rotation on strong beats
      if(energy > 150) {
        poly.rotation += poly.rotationSpeed * 2;
      }
      
      // Gentle drift movement
      poly.x += cos(poly.driftAngle) * poly.driftSpeed;
      poly.y += sin(poly.driftAngle) * poly.driftSpeed;
      
      // Slightly change drift direction
      poly.driftAngle += random(-0.05, 0.05);
      
      // Wrap around screen with padding
      let padding = poly.size;
      if(poly.x < -padding) poly.x = width + padding;
      if(poly.x > width + padding) poly.x = -padding;
      if(poly.y < -padding) poly.y = height + padding;
      if(poly.y > height + padding) poly.y = -padding;
      
      // Occasionally change colors slightly
      if(random() < 0.01) {
        poly.color.h += random(-5, 5);
        poly.color.h = constrain(poly.color.h, 280, 340);
      }
    }
  };
  
  this.drawFlowingGrid = function(colorScheme = 'pink-coral', lineThickness = 1, visualizationSize = 1) {
    push();
    
    if (colorScheme === 'monochrome') {
      stroke(255, 255, 255, 30); // White grid for monochrome
    } else {
      stroke(100, 50, 120, 30); // Subtle purple grid
    }
    
    strokeWeight(1 * lineThickness);
    
    let gridSize = 40 * visualizationSize;
    let flowIntensity = 0;
    
    if (sound && sound.isPlaying()) {
      let treble = fourier.getEnergy("treble");
      flowIntensity = map(treble, 0, 255, 0, 20) * visualizationSize;
    }
    
    // Vertical flowing lines
    for(let x = 0; x < width; x += gridSize) {
      beginShape();
      noFill();
      for(let y = 0; y < height; y += 10) {
        let flowX = x + sin(y * 0.01 + this.bgOffset) * flowIntensity;
        vertex(flowX, y);
      }
      endShape();
    }
    
    // Horizontal flowing lines
    for(let y = 0; y < height; y += gridSize) {
      beginShape();
      noFill();
      for(let x = 0; x < width; x += 10) {
        let flowY = y + cos(x * 0.01 + this.bgOffset) * flowIntensity;
        vertex(x, flowY);
      }
      endShape();
    }
    
    pop();
  };
  
  this.updateBackgroundParticles = function(energy) {
    for(let i = 0; i < this.backgroundParticles.length; i++) {
      let p = this.backgroundParticles[i];
      
      // Move particles with noise-based flow
      let noiseX = noise(p.x * 0.005, p.y * 0.005, this.bgOffset + p.noiseOffset);
      let noiseY = noise(p.x * 0.005 + 1000, p.y * 0.005 + 1000, this.bgOffset + p.noiseOffset);
      
      let flowStrength = map(energy, 0, 255, 0.5, 3);
      p.x += (noiseX - 0.5) * flowStrength;
      p.y += (noiseY - 0.5) * flowStrength;
      
      // Gentle drift
      p.x += cos(p.angle) * p.speed;
      p.y += sin(p.angle) * p.speed;
      
      // Update angle with slight randomness
      p.angle += random(-0.1, 0.1);
      
      // Wrap around screen
      if(p.x < -10) p.x = width + 10;
      if(p.x > width + 10) p.x = -10;
      if(p.y < -10) p.y = height + 10;
      if(p.y > height + 10) p.y = -10;
      
      // Subtle size pulsing
      p.size += sin(this.bgOffset * 2 + i * 0.1) * 0.1;
      p.size = constrain(p.size, 2, 12);
    }
  };
  
  // Reset background when visualization changes
  this.onResize = function() {
    this.initBackgroundParticles();
    this.initPolygons();
  };
}
