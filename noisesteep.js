function noisesteep() {
  this.name = "noise Steep";
  this.noisesteep = 0.01;
  this.prog = 0;

  this.draw = function() {
    push();
    translate(width / 2, height / 2);
    beginShape();
    noFill();
    stroke(255, 105, 180); // Hot pink
    for (let i = 0; i < 100; i++) {
      var x = map(noise(i * this.noisesteep + this.prog), 0, 1, -200, 200) * 4;
      var y = map(noise(i * this.noisesteep + this.prog + 1000), 0, 1, -100, 100) * 4;
      vertex(x, y);
    }
    endShape();

    // Only move when music is playing, and tie movement to energy
    if (sound && sound.isPlaying()) {
      let spectrum = fourier.analyze();
      let energy = fourier.getEnergy("bass"); // or "mid", "treble"
      this.prog += map(energy, 0, 255, 0, 0.2);
    }

    pop();
  }
}

