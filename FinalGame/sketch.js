let hours = 12;   // Start time at 12:00:00
let minutes = 0;
let seconds = 0;
let timeSpeed = 1;  // How many seconds pass in-game for each real-world second
let digits = [];
let digitSprites = [];
let colon;

let player; // Represents the child in bed
let coverMonster; // Represents the monster you need to hide from
let lightMonsterSprite;
//let gameClock;
let monsters = []; // Array to hold monster sprites
let gameState = "start"; // Can be "playing", "win", or "lose"


let isHiding = false; // Track whether the player is hiding

let startButton;

class Player {
  constructor(spriteSheet) {
      this.sprite = new Sprite();
      this.sprite.spriteSheet = spriteSheet; // sprite sheet
      this.sprite.scale.x *= canvas.w/512;
      this.sprite.scale.y *= canvas.h/248;
      this.sprite.collider = 'none';
      this.animations = {
        idle: { frameSize: [512,248], row: 0, frames: 1 },
        hide: { frameSize: [512,248], row: 0, col: 1, frames: 10 },
        underCover: { frameSize: [512,248], row: 0, col: 11, frames: 1 },
        flashlight:{frameSize: [512,248], row: 0, col: 12, frames:  9}
      };
      this.isHiding = false;
      this.sprite.addAnis(this.animations);
      this.sprite.changeAni('idle');
  }

  // Display the player on the screen
  display() {
      image(this.currentSprite, this.x, this.y, this.width, this.height);
  }

  // Update the player's status or position
  update() {
      // This function can be expanded to handle movement or other logic
  }

  // Method to handle hiding
  hide() {
      this.isHiding = true;
      this.sprite.changeAni('hide');
      this.sprite.ani.play(0);
      this.sprite.ani.noLoop();
  }

  // Method to stop hiding
  reset() {
      this.isHiding = false;
      this.sprite.changeAni('idle');
  }

  flash(){
    this.sprite.changeAni('flashlight');
    this.sprite.ani.play(0);
    this.sprite.ani.noLoop();
  }
}

class lightMonster {
  constructor(spriteSheet) {
      this.sprite = new Sprite();
      this.sprite.spriteSheet = spriteSheet; // sprite sheet
      this.sprite.scale.x *= canvas.w/512;
      this.sprite.scale.y *= canvas.h/248;
      this.sprite.collider = 'none';
      this.animations = {
        idle: { frameSize: [512,248], row: 0, frames: 1 },
        enter: { frameSize: [512,248], row: 0, col: 0, frames: 8 },
      };
      
      this.sprite.addAnis(this.animations); 
      this.sprite.changeAni('idle');
  }

  enter(){
      this.sprite.changeAni('enter');
      this.sprite.ani.play(0);
      this.sprite.ani.noLoop();
  }

  leave(){
    this.sprite.changeAni('enter');
    this.sprite.ani.rewind();
    this.sprite.ani.noLoop();
  }
}


function preload() {
  // Preload the button image
  mainRoomImg = loadImage('assets/MainRoom.png');
  coverMonsterSheet = 'assets/coverMonsterSheet.png';
  startButtonImg = loadImage('assets/StartButton-export.png');
  titleCardImg = loadImage('assets/startScreenHouse.png');
  lightMonsterImg = loadImage('assets/lightMonster.png ')
  playerSheet = loadImage('assets/PlayerHidingSprite.png');
  lightMonsterSheet = loadImage('assets/lightMonsterSheet.png');
  // Load each digit image
  for (let i = 0; i <= 9; i++) {
    digits[i] = loadImage(`assets/digit${i}.png`);
  }
  // Load the colon image
  colon = loadImage('assets/colon.png');

}
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

async function playJumpScareSound() {
  await Tone.start(); // Make sure Tone.js audio context is initialized

  // Adding a reverb for spatial depth
  const reverb = new Tone.Reverb({
    decay: 2,
    wet: 0.6
  }).toDestination();

  // Create a synth for a dissonant tone with added pitch modulation
  const synth = new Tone.Synth({
    oscillator: {
      type: 'sawtooth'
    },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.1,
      release: 0.2
    }
  }).connect(reverb);

  // Pitch modulation to add an eerie wobble
  const vibrato = new Tone.Vibrato({
    maxDelay: 0.005,
    frequency: 5,
    depth: 0.1,
    type: 'sine'
  }).toDestination();
  synth.connect(vibrato);

  // Create a noise source for an unsettling effect
  const noise = new Tone.Noise({
    volume: -7,
    type: 'pink'
  }).connect(reverb);

  // More aggressive envelope for the noise for a sudden impact
  const noiseEnv = new Tone.AmplitudeEnvelope({
    attack: 0.005,  // Quicker attack for a more startling effect
    decay: 0.1,
    sustain: 0.1,
    release: 0.2
  }).toDestination();
  noise.connect(noiseEnv);

  // Play the dissonant tone and noise
  synth.volume.value = -10; // Adjust volume to suitable levels
  synth.triggerAttackRelease("C4", "8n"); // Dissonant note, short duration for shock
  noise.start();
  noiseEnv.triggerAttackRelease("8n"); // Match duration of the synth for synchronized impact

  // Optionally, stop the noise after the sound has played to clean up
  setTimeout(() => {
    noise.stop();
    vibrato.stop();
  }, 500); // Stop the noise shortly after it plays
}


function updateInGameTime() {
  seconds += timeSpeed; // Increment seconds by the time speed each frame

  if (seconds >= 60) { // Handle minute overflow
      seconds = 0;
      minutes++;
  }
  if (minutes >= 60) { // Handle hour overflow
      minutes = 0;
      hours++;
  }
  if (hours >= 13) { // Handle hour overflow
      hours = 1;
  }
  updateDigitSprites();
}



function updateDigitSprites() {
  let h = nf(hours, 2);
  let m = nf(minutes, 2);
  //let s = nf(seconds, 2);
  let timeString = h + m ; // Concatenate the time string

  for (let i = 0; i < 4; i++) {
      //digitSprites[i].img = timeString.charAt(i);
      digitSprites[i].img = digits[parseInt(timeString.charAt(i))];
  }
}

function drawStartScreen() {
  background(0); // Set a background color for the start screen
  fill(255);
  textSize(48);
  textAlign(CENTER, CENTER);
 // text("Shadows Under the Bed", width / 2, height / 3); // Game title
  
  textSize(24);
}


function startGame() {
  gameState = "playing"; // Change game state to start the game
  // Additional setup if needed when starting the game
  
}

function drawPlayingScreen() {
  background(0); // Dark background for a horror theme
  fill(255);
  textSize(20);
  
  textAlign(CENTER,CENTER);
  text("PLAYING", width / 2, height / 3);
  if(!roomDrawn){
    
    room = new Sprite();
    room.collider = 'none';
    mainRoomImg.resize(canvas.w, canvas.h);
    room.img = mainRoomImg;
    
    
    
    coverMonster = new Sprite(-100, this.canvas.h / 2, 50, 50);
    coverMonster.spriteSheet = coverMonsterSheet;
    animations = {
      grow: { frameSize: [64,64], frames: 34},
    };
    coverMonster.anis.frameDelay = 8;
    coverMonster.addAnis(animations);
    coverMonster.ani.stop();
    coverMonster.scale.x *= canvas.w/512;
    coverMonster.scale.y *= canvas.h/248;

    lightMonsterSprite  = new lightMonster(lightMonsterSheet);

    player = new Player(playerSheet);

    let x = canvas.w - 125;
    const y = 40;
    for (let i = 0; i < 4; i++) {  // Create six digit sprites for HH:MM:SS
        digitSprites[i] = new Sprite(x, y, digits[0].width, digits[0].height);
        digitSprites[i].img = digits[0];
        digitSprites[i].collision = 'none';
        digitSprites[i].scale = canvas.w/3000;
        x += digitSprites[0].width;
        if (i === 1 || i === 3) {  // Place colon sprites after HH and MM
            if (i === 1) {
                colonSprite = new Sprite(x, y, colon.width, colon.height);
                colonSprite.collision = 'none';
                colonSprite.img = colon;
                colonSprite.scale = canvas.w/3000;
            } /*else {
                let secondColon = new Sprite(x, y, colon.width, colon.height);
                secondColon.img = colon;
                secondColon.scale = canvas.w/3000;
            }*/
            x += colonSprite.width;
        }
    }

    roomDrawn = true;
  }



  // Display any static elements of the room or environment here
  // Update and display monsters
  updateMonsters();
  checkMonsterInteraction();
  // Implement any additional game logic specific to the playing state
  //checkGameState(); // Check for win/lose conditions or other state transitions

}

let spawned = false;

function updateMonsters() {
    // Example logic to move the monster across the screen
    //coverMonster.vel.x = 1;
    if (coverMonster.x < 0) {
      if (random(100) < .1) { // Random chance to spawn
          coverMonster.x = canvas.w/2;
          coverMonster.layer
          coverMonster.changeAni('grow');
          coverMonster.ani.play();
          spawned = true;

          lightMonsterSprite.enter();
          // Adjust speed as needed
      }
  } else if (coverMonster.x > canvas.w) {
      // Reset monster position after it moves off-screen
      coverMonster.x = -100;
      coverMonster.vel.x = 0;
  }
}

function drawMonsters() {
  // Placeholder for monster rendering logic
  // Loop through your monsters array and draw each monster
  // Example: monsters.forEach(monster => { drawSprite(monster); });
  
}

function checkMonsterInteraction() {
  // Check if the monster is close to the player
  if (coverMonster.ani.frame >= 33 && spawned) {
      if (!isHiding) {
          // Player caught by the monster
          coverMonster.ani.stop();
          playJumpScareSound();
          gameState = "lose";
          console.log("Caught by the monster!");
      }
      else{
        coverMonster.ani.frame = 0;
        coverMonster.ani.stop();
        coverMonster.x = -100;
        
        lightMonsterSprite.leave();
        spawned = false;
      }
  }
}
function drawSprites(){
  coverMonster = new Sprite(-100, this.canvas.h / 2, 50, 50);
}
let roomDrawn = false;

function setup() {
  new Canvas();
  collider = 'none';

  titleCard = new Sprite();
  titleCard.collider = 'none';
  titleCardImg.resize(canvas.w, canvas.h);
  titleCard.img = titleCardImg;

  //drawSprites();
  
  startButton = new Sprite();
	startButton.img = startButtonImg;
  startButton.scale = canvas.w/3500;
  startButton.x = canvas.w/3
  startButton.y = canvas.h/1.5

  title = new Sprite();
	title.img = 'assets/Title.png';
  title.scale = canvas.w/5000;
  title.x = canvas.w/2
  title.y = canvas.h/3

  /*lightMonster = new Sprite();
  lightMonster.img = lightMonsterImg;
  lightMonster.scale = canvas.w/1000
  lightMonster.x = canvas.w/1.18
  lightMonster.y = canvas.h/2*/
  

  // Attach an event listener to the window object to start audio on the first user interaction
  window.addEventListener('click', ensureAudioStarts);
  window.addEventListener('keydown', ensureAudioStarts);
}

function draw() {
  // Game state management
  switch (gameState) {
    case "start":
      drawStartScreen();
      //updateInGameTime();
      //displayInGameTime();
      break;
    case "playing":
      // Update game elements and check for game events
      startButton.remove();
      title.remove();
      titleCard.remove();
      drawPlayingScreen();
      updateInGameTime();
      //displayInGameTime();
      //handlePlayerInput();
      //updateMonsters();
      //checkMonsterInteraction();
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

function keyPressed() {
  // Player hides when 'H' is pressed
  if (key === 'H' || key === 'h') {
    if(!isHiding){
      player.hide();
    }
    isHiding = true;
    
    console.log("Hiding under covers");
  }
  if (key === 'F' || key === 'f') {
    if(!isHiding){
      player.flash();
    }
    console.log("Flashlight is on");
  }
}

function keyReleased() {
  if (key === 'H' || key === 'h') {
      isHiding = false; // Player stops hiding when 'H' is released
      player.reset();
  }
  if (key === 'F' || key === 'f') {
    if(!isHiding){
    player.reset();
    }
  }
}

function mousePressed() {
  // Check if mouse is over the button and the button is pressed
  if (startButton.mouse.presses()) {
    startGame(); // Call the function to start the game
  }
}

function displayWinScreen() {
  fill(255);
  textSize(32);
  text("You've survived the night!", 200, height / 2);
}

function displayLoseScreen() {
  room.remove();
  fill(255);
  textSize(32);
  text("Caught by the monster...", 200, height / 2);
}

