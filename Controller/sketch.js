class Character {
  constructor(spriteSheet, x, y, speed) {
    this.sprite = new Sprite(x, y, 32, 32);
    this.sprite.spriteSheet = spriteSheet;

    this.speed = speed;

    this.animations = {
      stand: { row: 0, frames: 1 },
      walk: { row: 0, frames: 4 },
      dead: { row: 0, col: 4 }
    };
    this.sprite.anis.frameDelay = 8;
    this.sprite.addAnis(this.animations);
    this.sprite.changeAni('stand');

    this.squished = false;
  }

  move() {
    this.sprite.changeAni('walk');
    if (this.sprite.position.x + this.sprite.width / 4 > width) {
      this.sprite.vel.x = this.sprite.vel.x * -1;
    } else if (this.sprite.position.x - this.sprite.width / 4 < 0) {
      this.sprite.vel.x = this.sprite.vel.x * -1;
    }
    if (this.sprite.vel.x <= 0) {
      this.sprite.vel.x = -this.speed;
      this.sprite.scale.x = -1;
    } else if (this.sprite.vel.x >= 0) {
      this.sprite.vel.x = this.speed;
      this.sprite.scale = 1;
    }
  }

  isClicked(px, py) {
    let d = dist(px, py, this.sprite.x, this.sprite.y);
    return d < 15;
  }

  squish() {
    this.squished = true;
    this.stop();
    squishSound.triggerAttackRelease("C4", "8n");
  }

  stop() {
    this.sprite.vel.x = 0;
    this.sprite.changeAni('dead');
  }
}

const GameState = {
  START: 'start',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver'
};

let currentState = GameState.START;
let characters = [];
let spriteSheets = ['assets/BugSprite.png'];
let score = 0;
let timer = 30;
let bugSpeed = 1;

//let scheduledEvents = [];

let port;
let latestData = "waiting for data";
let sw;

let neutralX = 512; // Neutral (center) position of the joystick X
let neutralY = 512; // Neutral (center) position of the joystick Y

let cursorX = 200;  // Default starting position X
let cursorY = 200;  // Default starting position Y

// Initialize a polyphonic synthesizer with a gentle sound
const ambientPolySynth = new Tone.PolySynth(Tone.Synth, {
  volume: -18, // Set a lower volume for background ambiance
  oscillator: {
      type: "sine" // A sine wave for its smooth, pure tone
  },
  envelope: {
      attack: 2, // Slow attack for a gentle onset
      decay: 1,
      sustain: 1,
      release: 4 // Long release for a fading-out effect
  }
}).toDestination();

// Add a reverb for spatial depth
const ambientReverb = new Tone.Reverb({
  decay: 8, // Long decay for an expansive sound
  preDelay: 0.5,
  wet: 0.7 // A higher wet level for a more profound reverb effect
}).toDestination();

// Connect the synth to the reverb
ambientPolySynth.connect(ambientReverb);

// Function to play a serene ambient chord sequence
function playAmbientChords() {
  const chords = [["F3", "A3", "C4", "E4"], ["E3", "G3", "C4", "D4"], ["G3", "B3", "D4", "F4"], ["A3", "C4", "E4", "G4"]];
  let chordIndex = 0;

  const nextChord = () => {
      ambientPolySynth.triggerAttackRelease(chords[chordIndex], "8n");
      chordIndex = (chordIndex + 1) % chords.length;

      // Schedule and save the ID of the next event
      let eventId = Tone.Transport.scheduleOnce(() => nextChord(), `+${Math.random() * 4 + 4}`);
      scheduledEvents.push(eventId); // Save for later cancellation
  };

  nextChord();
}

function startAmbientSound() {
  if (Tone.Transport.state !== "started") {
      scheduledEvents = []; // Reset scheduled events
      Tone.Transport.start();
      playAmbientChords();
  }
}

function stopAmbientSound() {
  ambientPolySynth.releaseAll();

  // Cancel all scheduled chord events
  scheduledEvents.forEach(eventId => Tone.Transport.clear(eventId));
  scheduledEvents = []; // Clear the array of scheduled events

  Tone.Transport.stop(); 
}


// Define synths for melody and bass lines
const melodySynth = new Tone.Synth({
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 1 },
}).toDestination();

const bassSynth = new Tone.Synth({
  oscillator: { type: 'sine' },
  envelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 1 },
}).toDestination();

// Define a melody
const melodyNotes = ["C4", "E4", "G4", "A4", "G4", "E4"];

// Define a bass line that complements the melody
const bassNotes = ["C2", "C2", "D2", "D2", "E2", "E2"];

// Create a sequence for the melody
const melodySequence = new Tone.Sequence((time, note) => {
  melodySynth.triggerAttackRelease(note, "8n", time);
}, melodyNotes, "4n");

// Create a sequence for the bass line
const bassSequence = new Tone.Sequence((time, note) => {
  bassSynth.triggerAttackRelease(note, "8n", time);
}, bassNotes, "2n");

melodySynth.volume.value = -12; // Adjusts volume to -12 dB
bassSynth.volume.value = -12; // Adjusts volume to -12 dB

// Function to start the background music
function startBackgroundMusic() {
  Tone.Transport.bpm.value = 120; // Set the tempo
  Tone.Transport.start(); // Start the Tone Transport
  melodySequence.start(0); // Start the melody sequence immediately
  bassSequence.start(0); // Start the bass sequence immediately
}

// Function to stop the background music
function stopBackgroundMusic() {
  melodySequence.stop(); // Stop the melody sequence
  bassSequence.stop(); // Stop the bass sequence
  Tone.Transport.stop(); // Stop the Tone Transport
}

function updateMusicTempo() {
  let newBPM = 120; // Starting BPM
  
  if (timer < 20) { // Speed up when 20 seconds are left
    newBPM += (20 - timer) * 8; // Increase BPM by 2 for each second less than 30
  }
  // Apply the new BPM to Tone's Transport
  Tone.Transport.bpm.value = newBPM;
}


const missSound = new Tone.Synth({
  oscillator: { type: 'sine' }, // A sine wave for a smooth tone
  envelope: {
      attack: 0.01, // Quick attack
      decay: 0.1, // Short decay
      sustain: 0, // No sustain
      release: 0.1 // Quick release
  },
  volume: -20 // Lower volume for faintness
}).toDestination();


const squishSound = new Tone.Synth({
  oscillator: { type: "sine" }
}).toDestination();

squishSound.volume.value = -10;

const startSound = new Tone.MembraneSynth().toDestination();

// Define a synth pad for the background
const gameOverPad = new Tone.PolySynth(Tone.Synth, {
  volume: -20,
  oscillator: {
    type: 'sine',
  },
  envelope: {
    attack: 0.5,
    decay: 1,
    sustain: 0.5,
    release: 2,
  },
}).toDestination();

// Add reverb to the pad for depth
const reverb = new Tone.Reverb({
  decay: 5,
  preDelay: 0.5,
  wet: 0.5,
}).toDestination();

gameOverPad.connect(reverb);

// Define a melody synth for the game over sound
const gameOverMelody = new Tone.Synth({
  oscillator: {
    type: 'triangle8',
  },
  envelope: {
    attack: 0.05,
    decay: 0.2,
    sustain: 0.3,
    release: 1,
  },
}).toDestination();

// Play the game over sound
function playGameOverSound() {
  // Start the pad sound
  gameOverPad.triggerAttackRelease(['G2', 'D3', 'F3'], '8n');

  // Play a simple melody over the pad
  gameOverMelody.triggerAttackRelease('C4', '8n', '+0.5');
  gameOverMelody.triggerAttackRelease('E4', '8n', '+0.75');
  gameOverMelody.triggerAttackRelease('G4', '8n', '+1');
  gameOverMelody.triggerAttackRelease('A4', '8n', '+1.25');
  gameOverMelody.triggerAttackRelease('C4', '8n', '+1.5');
}

function setup() {
  createCanvas(400, 400);
  port = createSerial();
  connectButton = createButton("Connect");
  connectButton.position(10, 10);
  connectButton.mousePressed(connect);
  
  //port.on('data', serialEvent);
}



function connect() {
  if (!port.opened()) {
    port.open('Arduino', 9600);
  } else {
    port.close();
  }
}

  


function draw() {
  background(220);

  let str = port.readUntil("\n");  // Read until newline
  if (str && str.length > 0) {
    latestData = str.trim();
    let parsedData = latestData.split(',');
    if (parsedData.length === 3) {
      let xValue = parseInt(parsedData[0]);
      let yValue = parseInt(parsedData[1]);
      sw = parseInt(parsedData[2]);
      // Adjust cursorX and cursorY based on joystick displacement
      if (Math.abs(xValue - neutralX) > 100) { // Adding deadzone to prevent drift
        cursorX += (xValue - neutralX) / 50;  // Adjust the divisor for sensitivity
        cursorX = constrain(cursorX, 0, width);  // Ensure the cursor stays within the canvas
      }
      if (Math.abs(yValue - neutralY) > 100) { // Adding deadzone to prevent drift
        cursorY += (yValue - neutralY) / 50;  // Adjust the divisor for sensitivity
        cursorY = constrain(cursorY, 0, height);  // Ensure the cursor stays within the canvas
      }
    }
  }

  handleJoystickInput(sw);
  drawCursor(cursorX, cursorY);

  switch (currentState) {
    case GameState.START:
      displayStartScreen();
      break;
    case GameState.PLAYING:
      updateAndDisplayGame();
      break;
    case GameState.GAME_OVER:
      displayGameOverScreen();
      break;
  }
}

function handleMiss() {
  missSound.triggerAttackRelease("C6", "8n"); // Play a high, soft note
}

let hitBug = false;

function mousePressed() {
  hitBug = false;
  if (currentState === GameState.START) {
    startGame();
  } else if (currentState === GameState.PLAYING) {
    characters.forEach((character, i) => {
      if (character.isClicked(mouseX, mouseY) && !character.squished) {
        character.squish();
        score++;
        bugSpeed += 0.2;
        hitBug = true;
        addNewCharacter();
      }
    });
    if (!hitBug) {
      handleMiss(); // Play the miss sound
    }
  }
  
}

function startGame() {
  Tone.start().then(() => {
    stopAmbientSound(); 
    Tone.Transport.bpm.value = 120; // Reset BPM to starting value
    startBackgroundMusic(); // Start or restart background music
  });
  currentState = GameState.PLAYING;
  resetGame();
}

function transitionToGameOver() {
  currentState = GameState.GAME_OVER;
  stopBackgroundMusic();
  playGameOverSound();
  displayGameOverScreen();
}

function resetGame() {
  characters = [];
  score = 0;
  timer = 30;
  bugSpeed = 1;
  for (let i = 0; i < 5; i++) {
    addNewCharacter();
  }
  setInterval(function() {
    if (timer > 0) {
      timer--;
    }
  }, 1000);
  loop(); // Ensure the game loop is running
}

function addNewCharacter() {
  let x = random(60, width - 40);
  let y = random(60, height - 40);
  characters.push(new Character(spriteSheets[0], x, y, bugSpeed));
}

function updateAndDisplayGame() {
  //fill(0);
  //textSize(16);
  //textAlign(LEFT, TOP);
  //text(`Score: ${score}`, 10, 20);
 // text(`Time: ${timer}`, 10, 40);

  //updateMusicTempo();

  /*if (latestData !== "waiting for data") {
    let parsedData = latestData.split(',');
    if (parsedData.length === 3) {
      handleJoystickInput(parseInt(parsedData[0]), parseInt(parsedData[1]), parseInt(parsedData[2]));
    }
  }*/
  
  updateMusicTempo();
  displayGameInfo();

  characters.forEach(character => {
    if (!character.squished) character.move();
    character.sprite.collider = 'none';
  });

  if (timer <= 0) transitionToGameOver();
}

function displayGameInfo() {
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 330, 20);
  text(`Time: ${timer}`, 330, 40);
}

let buttonPressedLastFrame = false;
let lastButtonState = 1;

function handleJoystickInput(buttonState) {
  hitBug = false;  // Reset hitBug at the start of the function
  
  if (buttonState === 0 && lastButtonState !== 0 && currentState === GameState.PLAYING) { // Assuming button press is active low
    characters.forEach(character => {
      if (character.isClicked(cursorX, cursorY) && !character.squished) {
        character.squish();
        score++;
        bugSpeed += 0.2;
        port.write('B'); // Trigger the buzzer
        hitBug = true;  // Set hitBug to true if any character is squished
        addNewCharacter();
      }
    });

    if (!hitBug) {
      handleMiss(); // If no bug was hit, play the miss sound
    }
  }
  lastButtonState = buttonState;
}

function drawCursor(x, y) {
  fill(255, 0, 0);  // Color of the cursor
  ellipse(x, y, 10, 10);  // Draw an ellipse at the cursor position
}


function displayStartScreen() {
  if (currentState === GameState.START && Tone.Transport.state !== "started") {
    startAmbientSound();
  }
  textSize(24);
  textAlign(CENTER, CENTER);
  text("Click to start", width / 2, height / 2);
}

function displayGameOverScreen() {
  textSize(32);
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  text(`Game Over! Score: ${score}`, width / 2, height / 2);
  stopBackgroundMusic();
  noLoop(); // Stops the draw loop
}


