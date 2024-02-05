let currentColor;
let colors;
let paletteWidth = 60; // Width of the color palette area

function setup() {
  createCanvas(800, 600);
  background(255); 

  // Initialize colors in the palette
  colors = [color(255,0,0), color(255,165,0), color(255,255,0), color(0,128,0), 
            color(0,255,255), color(0,0,255), color(255,0,255), color(150,75,0),
            color(255,255,255), color(0,0,0)];
            
  // Draw the color palette
  drawPalette();

  // Set default paint color
  currentColor = colors[9];
}

function draw() {
  // Draw only when mouse is pressed and not on the palette
  if (mouseIsPressed && mouseX > paletteWidth) {
    stroke(currentColor);
    strokeWeight(4); // Set the paint brush size
    line(pmouseX, pmouseY, mouseX, mouseY); // Draw line for smoother paint
  }
}

function mousePressed() {
  // Change color if the palette is clicked
  if (mouseX < paletteWidth) {
    let index = floor(mouseY / (height / colors.length));
    currentColor = colors[index];
  }
}

// Function to draw the color palette
function drawPalette() {
  for (let i = 0; i < colors.length; i++) {
    fill(colors[i]);
    noStroke();
    rect(0, i * (height / colors.length), paletteWidth, height / colors.length);
  }
}

function draw() {
  if (mouseIsPressed) {
    if (mouseX > paletteWidth) { // Ensure we don't draw over the palette
      stroke(currentColor);
      strokeWeight(4);
      line(mouseX, mouseY, pmouseX, pmouseY); // Draw line for smoother strokes
    }
  }
  // Redraw the palette to ensure it's always on top
  drawPalette();
}
