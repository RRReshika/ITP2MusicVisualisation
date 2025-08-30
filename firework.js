function Firework() {
  this.name = "firework";
  this.particles = [];

  this.spawn = function(x, y, bass = 128, treble = 128, colorScheme = 'pink-coral') {
    for (let i = 0; i < 32; i++) {
      let angle = random(TWO_PI);
      let speed = random(2, 5) * map(bass, 0, 255, 0.8, 1.2);
      let len = random(80, 180) * map(treble, 0, 255, 0.8, 1.1);
      
      let colorMix;
      if (colorScheme === 'monochrome') {
        let grayValue = map(i, 0, 32, 200, 255);
        colorMix = color(grayValue, grayValue, grayValue);
        if (random() < 0.1) colorMix = color(255, 255, 255);
      } else {
        colorMix = lerpColor(color('#FF69B4'), color('#FF7F50'), i / 32);
        if (random() < 0.1) colorMix = color('#FFD700');
      }
      
      let endX = x + cos(angle) * len;
      let endY = y + sin(angle) * len;
      this.particles.push({
        x: x,
        y: y,
        angle: angle,
        len: len,
        color: colorMix,
        alpha: 180,
        endX: endX,
        endY: endY,
        speed: speed,
        circleSize: random(8, 18)
      });
    }
  };

  this.draw = function() {
    let colorScheme = controls.getColorScheme();
    let lineThickness = controls.getLineThickness();
    let visualSize = controls.getVisualizationSize();
    let beatSensitivity = controls.getBeatSensitivity();
    let animationSpeed = controls.getAnimationSpeed();
    let songSpeed = controls.getSongSpeed();

    if (sound && sound.isPlaying()) {
      if (fourier) {
        fourier.analyze();
      }
      
      let bass = fourier.getEnergy("bass");
      let treble = fourier.getEnergy("treble");
      
      // Apply beat sensitivity to bass threshold
      let bassThreshold = 40 / beatSensitivity;
      
      if (bass > bassThreshold && frameCount % Math.max(1, Math.round(8 / Math.max(0.5, animationSpeed))) === 0) {
        let rx = random(width * 0.2, width * 0.8);
        let ry = random(height * 0.2, height * 0.8);
        this.spawn(rx, ry, bass * beatSensitivity, treble, colorScheme);
      }
      
      if (frameCount % Math.max(1, Math.round(60 / Math.max(0.5, animationSpeed))) === 0 && this.particles.length < 5) {
        let rx = random(width * 0.3, width * 0.7);
        let ry = random(height * 0.3, height * 0.7);
        this.spawn(rx, ry, Math.max(bass * beatSensitivity, 80), Math.max(treble, 80), colorScheme);
      }
    }

    // Draw and update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      push();
      stroke(p.color.levels[0], p.color.levels[1], p.color.levels[2], p.alpha);
      strokeWeight(lineThickness * visualSize);
      line(p.x, p.y, p.endX, p.endY);

      // Minimal circles at the end of each line
      noStroke();
      fill(p.color.levels[0], p.color.levels[1], p.color.levels[2], p.alpha * 0.7);
      ellipse(p.endX, p.endY, p.circleSize * visualSize);

      pop();

      // Animate: move end points outward, fade out
      let moveDist = p.speed * animationSpeed * visualSize;
      p.endX += cos(p.angle) * moveDist;
      p.endY += sin(p.angle) * moveDist;
      p.alpha -= 4;

      if (p.alpha < 10) {
        this.particles.splice(i, 1);
      }
    }
  };
}
