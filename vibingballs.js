// --- Start of student-written code (original) ---

//draw the waveform to the screen
function Vibingballs()
{
	//vis name
	this.name = "Vibing Balls";
    var amp = new p5.Amplitude();
    this.amp = null;

  this.setup = function () {
    this.amp = new p5.Amplitude();
  };

    this.draw = function(){
	background(0); 
    var vol =amp.getLevel();
   
	push();

    
	for(var i = 0; i < windowWidth; i+=50){
        for(var j = 0; j < windowWidth; j+=50){

            let t = map(i + j, 0, windowWidth + windowHeight, 0, 1); // mix factor
            let r = lerp(255, 255, t); 
            let g = lerp(105, 127, t); 
            let b = lerp(180, 80, t);  
    
            fill(r, g, b, 200); 
            let pulse = map(vol, 0, 1, 20, 60);
            ellipse(i + random(vol*100), j + random(vol*150), pulse );
        }
            
	};
   
    pop();
}
}

// --- End of student-written code (original) ---
