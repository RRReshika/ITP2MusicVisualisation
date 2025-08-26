// amplitude.js
// --- Start of student code  ---

let amplitudeVis = function() {
    this.name = "Amplitude Visualizer";
  
    this.amplitude = new p5.Amplitude();
    this.amplitudes = new Array(512).fill(0);
  
    this.setup = function() {
    };
  
    this.draw = function() {
        push()
      background(0);
   
      let a = this.amplitude.getLevel();
  
      this.amplitudes.push(a);
      this.amplitudes.shift();
  
      // Single ellipse
        let size = map(a, 0, 1, 100, 600) * 3; 

        // Outer layers
        for (let i = 7; i > 0; i--) {
        let glowSize = size + i * 40;
        let alpha = map(i, 5, 1, 20, 120);
        noFill();
        stroke(255, 105, 180, alpha); 
        strokeWeight(2);
        ellipse(width /2, height / 2, glowSize);
        }

        // Core ellipse
        noStroke();
        fill(255, 105, 180); 
        ellipse(width /2 , height / 2, size);


        // Glitter around
        for (let i = 0; i < 30; i++) {
            let angle = random(TWO_PI);
            let r = size / 2 + random(10, 40);
            let x = width /2 + cos(angle) * r;
            let y = height / 2 + sin(angle) * r;
        
            stroke(255, 182, 193, random(100, 255)); 
            strokeWeight(random(1, 3));
            point(x, y);
        }
      pop()
    };

    
  };
// --- End of student code  ---
  
  

  