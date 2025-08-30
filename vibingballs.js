function Vibingballs() {
	this.name = "Vibing Balls";
    var amp = new p5.Amplitude();
    this.amp = null;

    this.setup = function () {
        this.amp = new p5.Amplitude();
    };

    this.draw = function(){
        background(0); 
        var vol = amp.getLevel();
        
        let colorScheme = controls.getColorScheme();
        let lineThickness = controls.getLineThickness();
        let visualSize = controls.getVisualizationSize();
        let beatSensitivity = controls.getBeatSensitivity();
        let animationSpeed = controls.getAnimationSpeed();
        let songSpeed = controls.getSongSpeed();
       
        push();
        translate(width/2, height/2);
        scale(visualSize);
        translate(-width/2, -height/2);
        
        for(var i = 0; i < windowWidth; i+=25){
            for(var j = 0; j < windowHeight; j+=25){

                let r, g, b;
                if (colorScheme === 'monochrome') {
                    let t = map(i + j, 0, windowWidth + windowHeight, 0, 1);
                    let grayValue = lerp(150, 255, t);
                    r = grayValue;
                    g = grayValue;
                    b = grayValue;
                } else {
                    let t = map(i + j, 0, windowWidth + windowHeight, 0, 1);
                    r = lerp(255, 255, t); 
                    g = lerp(105, 127, t); 
                    b = lerp(180, 80, t);  
                }
        
                fill(r, g, b, 200); 
                
                if (lineThickness > 1) {
                    stroke(r, g, b, 150);
                    strokeWeight(lineThickness);
                } else {
                    noStroke();
                }
                
                let pulse = map(vol * beatSensitivity, 0, 1, 25, 80);
                let randomMovement = vol * 100 * beatSensitivity * animationSpeed;
                ellipse(i + random(randomMovement), j + random(vol*150*animationSpeed), pulse);
            }
        }
       
        pop();
    }
}
