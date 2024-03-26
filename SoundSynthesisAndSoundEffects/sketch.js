let img;
function preload() {
  img = loadImage('assets/poolDive.jpg'); // Load the image
}

function setup() {
  createCanvas(600, 400);
  resetSketch(); // Call at setup to initialize
}

function draw() {
  // The image display and sound triggering logic will be in mouseClicked
}

function mouseClicked() {
  background(255); // Clear the canvas
  image(img, 0, 0, width, height); // Display the image

  // Start audio context on user interaction
  if (Tone.context.state !== 'running') {
    Tone.context.resume();
  }

  // Splash sound setup
  const splash = setupSplash();

  // Bubbles sound setup
  const bubbles = setupBubbles();

  // Play the splash
  splash.triggerAttackRelease("8n");

  // Play the bubbles sound after a short delay
  setTimeout(() => {
    bubbles.triggerAttack("C4");
  }, 150);

  // Schedule the reset of the sketch
  setTimeout(() => {
    resetSketch(); // Resets the sketch after the sounds have played
  }, 2000); // Adjust the timeout duration based on the total sound playing time
}

function setupSplash() {
  const splash = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: {
      attack: 0.01,
      decay: 0.4,
      sustain: 0.1,
      release: 0.3
    }
  }).toDestination();

  const reverb = new Tone.Reverb({
    decay: 2.5,
    preDelay: 0.1,
    wet: 0.5
  }).toDestination();

  splash.connect(reverb);
  return splash;
}

function setupBubbles() {
  const bubbles = new Tone.MembraneSynth().toDestination();

  const reverb2 = new Tone.Reverb({
    decay: 2,
    preDelay: 0.1,
    wet: 0.2
  }).toDestination();

  bubbles.connect(reverb2);
  bubbles.volume.rampTo(-Infinity, 10);
  const lfo = new Tone.LFO({
    type: 'sine',
    min: 300,
    max: 600,
    frequency: "8n",
  }).start();
  lfo.connect(bubbles.frequency);

  return bubbles;
}

function resetSketch() {
  background(220); // Resets the background
  textSize(24);
  text("Click the canvas to dive in!", 10, 30);
}


