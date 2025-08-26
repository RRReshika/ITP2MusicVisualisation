function Firework() {
  this.name = "Coral Pink Minimal Burst";
  this.particles = [];

  this.spawn = function(x, y, bass = 128, treble = 128) {
    for (let i = 0; i < 32; i++) {
      let angle = random(TWO_PI);
      let speed = random(2, 5) * map(bass, 0, 255, 0.8, 1.2);
      let len = random(80, 180) * map(treble, 0, 255, 0.8, 1.1);
      let colorMix = lerpColor(color('#FF69B4'), color('#FF7F50'), i / 32);
      if (random() < 0.1) colorMix = color('#FFD700'); // occasional gold
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
    // Soft center glow (optional, can remove if you want only random bursts)
    // push();
    // noStroke();
    // fill(255, 182, 193, 80);
    // ellipse(width / 2, height / 2, 120);
    // pop();

    if (sound && sound.isPlaying()) {
      let bass = fourier.getEnergy("bass");
      let treble = fourier.getEnergy("treble");
      if (bass > 100 && frameCount % 12 === 0) {
        // Spawn only one firework per beat
        let rx = random(width * 0.2, width * 0.8);
        let ry = random(height * 0.2, height * 0.8);
        this.spawn(rx, ry, bass, treble);
      }
    }

    // Draw and update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      push();
      stroke(p.color.levels[0], p.color.levels[1], p.color.levels[2], p.alpha);
      strokeWeight(3);
      line(p.x, p.y, p.endX, p.endY);

      // Minimal circles at the end of each line
      noStroke();
      fill(p.color.levels[0], p.color.levels[1], p.color.levels[2], p.alpha * 0.7);
      ellipse(p.endX, p.endY, p.circleSize);

      pop();

      // Animate: move end points outward, fade out
      let moveDist = p.speed * 0.8;
      p.endX += cos(p.angle) * moveDist;
      p.endY += sin(p.angle) * moveDist;
      p.alpha -= 4;

      if (p.alpha < 10) {
        this.particles.splice(i, 1);
      }
    }
  };
}