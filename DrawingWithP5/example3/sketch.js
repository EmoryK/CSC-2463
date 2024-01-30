function setup() {
  createCanvas(400, 200);
  angleMode(DEGREES);
}

function draw() {
 
  background(0);

  noStroke();
  
  fill(255, 255, 0);
  arc(100, 100, 100, 100, -135, 135)
  
  fill(255, 0, 0);
  circle(250, 100, 100);
  rect(200, 100, 100,50);
  
  fill(255, 255, 255);
  circle(225, 100, 30);
  circle(275, 100, 30);
  
  fill(0, 0, 255);
  circle(225, 100, 20);
  circle(275, 100, 20);
  
}