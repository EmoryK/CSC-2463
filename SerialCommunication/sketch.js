let port;
let lightLevel = 0;  // Variable to store the light level
let connectButton, ledToggleButton;
let ledState = false;  // LED state tracker

function setup() {
  createCanvas(400, 400);
  port = createSerial();

  connectButton = createButton("Connect");
  connectButton.position(10, 10);
  connectButton.mousePressed(connect);

  ledToggleButton = createButton("Toggle LED");
  ledToggleButton.position(10, 40);
  ledToggleButton.mousePressed(toggleLED);
}

function draw() {
  let brightness = map(lightLevel, 0, 1023, 255, 0);
  background(brightness);
  let str = port.readUntil("\n");
  if (str.length > 0) {
    lightLevel = parseInt(str);  // Update light level with data from Arduino
  }

  fill(255 - brightness);
  textSize(16);
  text(`Light level: ${lightLevel}`, 10, 80);  // Display the light level
}

function connect() {
  if (!port.opened()) {
    port.open('Arduino', 9600);
  } else {
    port.close();
  }
}

function toggleLED() {
  ledState = !ledState;
  port.write(ledState ? 'H' : 'L');  // Send command to toggle LED
}