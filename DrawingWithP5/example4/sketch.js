function setup() {
  createCanvas(400, 400);
}

function draw() {
 
  background(0,0,125);
  stroke(255, 255, 255);
  strokeWeight(6);
  
  fill(0, 130, 0);

  circle(200, 200, 200)
  
  fill(255, 0, 0);
  
  beginShape();
    vertex(200, 100);
    vertex(225, 170);
    vertex(300, 170);
    vertex(245, 210)
    vertex(260, 280)
    vertex(200, 245);
    vertex(140, 280);
    vertex(155, 210)
    vertex(100, 170);
    vertex(175, 170);
  endShape(CLOSE);
}