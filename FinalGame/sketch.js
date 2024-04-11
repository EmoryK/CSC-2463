let player; // Represents the child in bed
let monsters = []; // Array to hold monster sprites
let gameState = "playing"; // Can be "playing", "win", or "lose"

// Ensure Tone.js is ready
function startAudio() {
  Tone.start();

  // Adjusting the Ambient Synth for a more pronounced atmospheric sound
  const ambientSynth = new Tone.PolySynth(Tone.Synth, {
    volume: -20, // Increase volume for more presence
    oscillator: {
      type: "sine",
    },
    envelope: {
      attack: 8, 
      decay: 4,
      sustain: 0.4, 
      release: 8, 
    },
  }).toDestination();

  // Deepening the reverb effect for a richer spatial experience
  const reverb = new Tone.Reverb({
    decay: 20, // Longer decay for a more expansive sound
    wet: 0.8, // Increased wetness for a more immersive reverb effect
  }).toDestination();
  ambientSynth.connect(reverb);

  // Enhancing the modulation effect for greater texture variation
  const vibrato = new Tone.Vibrato({
    maxDelay: 0.005,
    frequency: 0.3, // Slightly more frequent for noticeable modulation
    depth: 0.15, // Increased depth for a more pronounced vibrato effect
    type: "sine"
  }).toDestination();
  ambientSynth.connect(vibrato);

  // Fine-tuning the Pitch Shift for a wider range of ambient texture
  const pitchShift = new Tone.PitchShift({
    pitch: 0, 
    windowSize: 0.1,
    feedback: 0.5, // Increased feedback for a richer pitch-shifted texture
  }).toDestination();
  ambientSynth.connect(pitchShift);

  // Function to play ambient sounds, now with a broader range of notes for more variety
  const playAmbientSound = () => {
    const notes = ["C3", "E3", "G3", "B3", "D4", "F4", "A4"]; // Extended note range
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    ambientSynth.triggerAttackRelease(randomNote, "4n");
  };


  const whisperSynth = new Tone.NoiseSynth({
    volume: -30,
    noise: {
      type: "brown"
    },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.1,
      release: 0.1
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.1,
      release: 0.1,
      baseFrequency: 500,
      octaves: 2.6
    }
  }).toDestination();
  whisperSynth.connect(reverb);

  const startlingSynth = new Tone.MembraneSynth({
    volume: -5,
    pitchDecay: 0.05,
    octaves: 3,
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0.01,
      release: 1.4,
      attackCurve: "exponential"
    },
  }).toDestination();
  startlingSynth.connect(reverb);

  const playEerieEffects = () => {
    if (Math.random() < 0.2) {
      whisperSynth.triggerAttackRelease("8n");
    }
    if (Math.random() < 0.05) { // Less frequent to enhance the shock factor
      const notes = ["C1", "G1", "C2"];
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      startlingSynth.triggerAttack(randomNote);
    }
  };
  // Subtly altering pitch shift to add dynamic changes to the soundscape
  const randomPitchShift = () => {
    const pitchOptions = [-12, -5, 0, 5, 12];
    const randomPitch = pitchOptions[Math.floor(Math.random() * pitchOptions.length)];
    pitchShift.pitch = randomPitch;
  };

  // Modifying vibrato parameters dynamically for an organic, evolving feel
  const adjustVibrato = () => {
    vibrato.frequency.value = Math.random() * 0.5 + 0.2; // More noticeable fluctuations
    vibrato.depth.value = Math.random() * 0.25 + 0.1; // Greater depth for enhanced modulation
  };

  // Enhanced loop for ambient sound with adjustments for more presence and engagement
  const ambientLoop = new Tone.Loop((time) => {
    playAmbientSound();
    playEerieEffects(); 
    randomPitchShift();
    adjustVibrato();
  }, "1m"); // Shorter loop duration for more frequent evolution

  // Start the loops
  Tone.Transport.start();
  ambientLoop.start("+0.5"); // Immediate start with a slight lead-in for initiation clarity
}



function ensureAudioStarts() {
  Tone.start().then(() => {
    console.log("Audio context started");
    // Once audio context is started, we can remove these listeners
    window.removeEventListener('click', ensureAudioStarts);
    window.removeEventListener('keydown', ensureAudioStarts);

    // Call any function that starts playing audio here
    startAudio(); // Start playing background music
  }).catch(err => console.error("Error starting audio context:", err));
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize player sprite here
  player = createSprite(width / 2, height - 50, 50, 50); // Example player sprite

  // Attach an event listener to the window object to start audio on the first user interaction
  window.addEventListener('click', ensureAudioStarts);
  window.addEventListener('keydown', ensureAudioStarts);
}

function draw() {
  background(0); // Dark background for the horror theme
  
  // Game state management
  switch (gameState) {
    case "playing":
      // Update game elements and check for game events
      handlePlayerInput();
      updateMonsters();
      drawSprites(); // This will draw all sprites, including the player and monsters
      break;
    case "win":
      displayWinScreen();
      break;
    case "lose":
      displayLoseScreen();
      break;
  }
}

function handlePlayerInput() {
  if (keyWentDown('H')) { // Hiding under covers
    console.log("Hiding under covers");
  }
  // Add more controls as needed
}

function updateMonsters() {
  // Logic to handle monsters' behavior
}

function displayWinScreen() {
  fill(255);
  textSize(32);
  text("You've survived the night!", 100, height / 2);
}

function displayLoseScreen() {
  fill(255);
  textSize(32);
  text("Caught by the monster...", 100, height / 2);
}

