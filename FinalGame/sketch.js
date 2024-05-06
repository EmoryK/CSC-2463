let port;

let hours = 12;   // Start time at 12:00:00
let minutes = 0;
let seconds = 0;
let totalSeconds = 0; // Variable to track total elapsed time in seconds
let timeSpeed = 1;  // How many seconds pass in-game for each real-world second
let digits = [];
let digitSprites = [];
let colon;
let roomDrawn = false;

let bubbleSprites = [];

let room;
let player; // Represents the child in bed
let coverMonster; // Represents the monster you need to hide from
let lightMonsterSprite;
let hideMonsterSprite;

let lightMonsterReady = true; // Flag to control spawning of lightMonster
let lastCoverMonsterSpawnTime = 0; // Timestamp of last coverMonster spawn
let lastLightMonsterSpawnTime = 0;
let lastHideMonsterSpawnTime = 0;

let monsterThatKilled;

//let gameClock;
let monsters = []; // Array to hold monster sprites
let gameState = "start"; // Can be "playing", "win", or "lose"


let isHiding = false; // Track whether the player is hiding
let lightOn = false; // Track whether the player has flashlight on

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

      this.isHoldingBreath = false;
      this.breathCapacity = 50; // Total breath the player can hold
      this.currentBreath = 50; // Current breath remaining
      this.breathDecreaseRate = .2; // Rate at which breath decreases per frame
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

  startHoldingBreath() {
    if (!this.isHoldingBreath && this.currentBreath > 0) {
        this.isHoldingBreath = true;
        //this.sprite.changeAni('holdBreath'); // Change animation if exists
    }
  }

  stopHoldingBreath() {
    this.isHoldingBreath = false;
    //this.sprite.changeAni('idle'); // Revert to idle animation
  }

  updateBreath() {
    if (this.isHoldingBreath) {
      this.currentBreath -= this.breathDecreaseRate;
      if (this.currentBreath <= 0) {
        this.stopHoldingBreath();
        this.currentBreath = 0;
      }
    } else if (this.currentBreath < this.breathCapacity) {
      this.currentBreath += this.breathDecreaseRate / 2;  // Regain breath more slowly
    }
    this.displayBreath();  // Update the display based on the current breath
  }

  displayBreath() {
    let numBubbles = Math.ceil(this.currentBreath / 10);  // Each bubble represents 10 breath units
    bubbleSprites.forEach((bubble, index) => {
      if (index < numBubbles) {
        bubble.visible = true;
      } else {
        bubble.visible = false;
      }
    });
  }
  
  // Method to stop hiding
  reset() {
      this.isHiding = false;
      this.lightOn = false;
      this.sprite.changeAni('idle');
  }

  flash(){
    this.lightOn = true;
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
class hideMonster {
  constructor(spriteSheet) {
      this.sprite = new Sprite();
      this.sprite.spriteSheet = spriteSheet; // sprite sheet
      this.sprite.scale.x *= canvas.w/512;
      this.sprite.scale.y *= canvas.h/248;
      this.sprite.collider = 'none';
      this.animations = {
        idle: { frameSize: [512,248], row: 0, frames: 1 },
        enter: { frameSize: [512,248], row: 0, col: 0, frames: 26},
      };
      
      this.sprite.addAnis(this.animations); 
      this.sprite.changeAni('idle');
  }

  enter(){
      this.sprite.changeAni('enter');
      this.sprite.ani.play(0);
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
  hideMonsterSheet = loadImage('assets/HideMonster.png');
  bubbleImg = loadImage('assets/bubble.png');
  jumpScare = loadImage('assets/JumpScareCoverMonster.png');
  jumpScare2 = loadImage('assets/JumpScareLightMonster.png');
  jumpScare3 = loadImage('assets/JumpScareHideMonster.png');
  deadScreen = loadImage('assets/DEADpixel.png');
  confettiSheet = loadImage('assets/Confetti.png');
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

async function playHideMonsterSound() {
  await Tone.start();  // Ensure the Tone.js context is ready

  // Use a synth with a frequency modulation for an alien-like sound
  const fmSynth = new Tone.FMSynth({
      harmonicity: 8.5,  // Ratio of the frequencies of the modulator to the carrier
      modulationIndex: 2,  // Depth of the modulation
      detune: 0,  // Detune in cents
      oscillator: {
          type: 'sine'  // Pure tone for the carrier
      },
      envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.1,
          release: 0.5
      },
      modulation: {
          type: 'square'  // Square wave for a more digital, computer-like sound
      },
      modulationEnvelope: {
          attack: 0.2,
          decay: 0.3,
          sustain: 0.2,
          release: 0.5
      }
  }).toDestination();

  const volume = new Tone.Volume(-20).toDestination();  // Lower the volume for subtlety
  fmSynth.connect(volume);

  const now = Tone.now();
  fmSynth.triggerAttackRelease("C4", "8n", now);  // Play a note with quick duration
  fmSynth.triggerAttackRelease("G4", "8n", now + 0.3);  // A second note for more complexity
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
let passMidnight = false;

function updateInGameTime() {
  seconds += timeSpeed; // Increment seconds by the time speed each frame
  totalSeconds += timeSpeed;
  if (seconds >= 60) { // Handle minute overflow
      seconds = 0;
      minutes++;
  }
  if (minutes >= 60) { // Handle hour overflow
      minutes = 0;
      hours++;
  }
  if (hours >= 13) { // Handle hour overflow
      passMidnight = true;
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
  background(10); // Set a background color for the start screen
  fill(255);
  textSize(48);
  textAlign(CENTER, CENTER);
 // text("Shadows Under the Bed", width / 2, height / 3); // Game title
  
  textSize(24);
}


function startGame() {
  gameState = "playing"; // Change game state to start the game
  
}

function drawPlayingScreen() {
  background(0); // Dark background for a horror theme
  fill(255);
  /*textSize(20);
  
  textAlign(CENTER,CENTER);
  text("PLAYING", width / 2, height / 3);*/
  if(!roomDrawn){
    roomDrawn = true;
    startButton.remove();
    title.remove();
    titleCard.remove();
    hideMonsterSprite = new hideMonster(hideMonsterSheet);
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

    let bubX = 20
    let bubY = canvas.h - 40
    for (let i = 0; i < 10; i++) {
      bubbleSprites[i] = new Sprite(bubX, bubY, bubbleImg.width, bubbleImg.height, 'none');
      bubbleSprites[i].img = bubbleImg;
      bubbleSprites[i].collision = 'none';
      bubX += bubbleImg.width -10;
    }
    
  }

}

let coverMonsterSpawned = false;
let lightMonsterSpawned = false;
let hideMonsterSpawned = false;
let monsterSpawnInterval = 20; // seconds - interval between lightMonster considerations
let lightMonsterDistance = 5;
let modNum;

function updateMonsters() {
  // Handle coverMonster spawning
  if (!coverMonsterSpawned && (totalSeconds - lastCoverMonsterSpawnTime) > 120) {
    if(Math.random(200) <= 0.001){
      spawnCoverMonster();
    }
  }
  if (!hideMonsterSpawned && (totalSeconds - lastHideMonsterSpawnTime) > 120) {
    if(Math.random(200) <= 0.0008){
      spawnHideMonster();
    }
  }

  // Handle lightMonster spawning and progression
  if (!lightMonsterSpawned && (totalSeconds - lastLightMonsterSpawnTime) > monsterSpawnInterval) {
    if(lightMonsterDistance == 5){
      modNum = Math.floor(Math.random() * (170 - 100 + 1) + 100);
    }
    if(totalSeconds%modNum == 0){
      if(lightMonsterDistance >= 0){
        port.write("distance:" +lightMonsterDistance);
      }
      lightMonsterDistance--;
    }
    if(lightMonsterDistance==0){
      lightMonsterSprite.enter();
      lightMonsterSpawned = true;
      lastLightMonsterSpawnTime = totalSeconds;
    }
    //advanceLightMonster();
  }
  if(hours>=6 && passMidnight){
    clearEverything();
    gameState = "win";
  }
}

function spawnCoverMonster() {
  console.log("Spawning Cover Monster");
  coverMonster.x = canvas.w / 2;
  coverMonster.changeAni('grow');
  coverMonster.ani.play();
  lastCoverMonsterSpawnTime = totalSeconds;
  coverMonsterSpawned = true;
  lightMonsterReady = false; // Temporarily disable lightMonster spawning
  //setTimeout(() => { lightMonsterReady = true; }, 30000); // 30 seconds delay before lightMonster can spawn again
}
function spawnHideMonster() {
  console.log("Spawning Hide Monster");
  playHideMonsterSound();
  hideMonsterSpawned = true;
  setTimeout(() => {
    hideMonsterSprite.enter();
    lastHideMonsterSpawnTime = totalSeconds;
    console.log("Hide Monster has entered the game");
}, 4000);  // 10000 milliseconds = 10 seconds
}

function advanceLightMonster() {
  if (!lightMonsterSpawned) {
    modNum = Math.random(100,200);
    console.log("Light Monster Spawning");
    lightMonsterSprite.enter();
    lightMonsterSpawned = true;
    lastLightMonsterSpawnTime = totalSeconds;

  }
}



let lost = false;

function checkMonsterInteraction() {
  if (coverMonsterSpawned && coverMonster.ani.frame >= 33) {
    if (!player.lightOn) {
      console.log("Defeat by Cover Monster");
      defeatByMonster(jumpScare);
    } else {
      console.log("Reset Cover Monster");
      resetCoverMonster();
    }
  }

  if (lightMonsterSpawned && (totalSeconds - lastLightMonsterSpawnTime > 120)) {
    if (!player.isHoldingBreath) {
      console.log("Defeat by Light Monster");
      defeatByMonster(jumpScare2);
    } else {
      console.log("Reset Light Monster");
      resetLightMonster();
    }
  }

  if (hideMonsterSpawned && (hideMonsterSprite.sprite.ani.frame > 10 &&  hideMonsterSprite.sprite.ani.frame < 22)){
    if (!player.isHiding) {
      console.log("Defeat by Hide Monster");
      defeatByMonster(jumpScare3);
    } else{
      hideMonsterSpawned = false;
    }
  }
  
}

function defeatByMonster(monsterImage) {
  clearEverything();
  playJumpScareSound();
  monsterThatKilled = monsterImage;
  lost = true;
}

function resetCoverMonster() {
  coverMonster.ani.frame = 0;
  coverMonster.ani.stop();
  coverMonster.x = -100;
  coverMonsterSpawned = false;
}

function resetLightMonster() {
  lightMonsterSprite.leave();
  lightMonsterSpawned = false;
  lightMonsterDistance = 5;
  lightMonsterStage = 0;
  port.write("distance:" +lightMonsterDistance);
  //updateArduinoLights();
}


function connect() {
  if (!port.opened()) {
    port.open('Arduino', 9600);
  } else {
    port.close();
  }
}

function setup() {
  new Canvas();
  collider = 'none';
  port = createSerial();

  connectButton = createButton("Connect");
  connectButton.position(10, 10);
  connectButton.mousePressed(connect);

  titleCard = new Sprite();
  titleCard.collider = 'none';
  titleCardImg.resize(canvas.w, canvas.h);
  titleCard.img = titleCardImg;

  //drawSprites();
  
  startButton = new Sprite();
	startButton.img = startButtonImg;
  startButton.scale = canvas.w/3500;
  startButton.x = canvas.w/2
  startButton.y = canvas.h/1.5

  title = new Sprite();
	title.img = 'assets/Title.png';
  title.scale = canvas.w/4500;
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
      drawPlayingScreen();
      updateInGameTime();
      serialEvent();
      player.updateBreath(); // Update the player's breath status
      //displayInGameTime();
      //handlePlayerInput();
      //updateMonsters();
      //checkMonsterInteraction();
      updateMonsters();
      checkMonsterInteraction();
      if(lost){
        gameState = "lose";
      }
      /*if(win){
        gameState = "win";
      }*/
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
  if (key === 'B' || key === 'b') {
    player.startHoldingBreath();
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
  if (key === 'B' || key === 'b') {
    player.stopHoldingBreath();
  }
}

function mousePressed() {
  if (gameState === "start" && startButton.mouse.presses()) {
      startGame();
  }
}

function serialEvent() {
  let data = port.readUntil("\n").trim();  // Read data as line and trim it
  if (data.startsWith("tilt")) {
    let value = data.split(":")[1];
    if (value === "1" && !isHiding) {
      player.hide();  // Call player hide function
      isHiding = true;
    } else if (value === "0" && isHiding) {
      player.reset();  // Reset the player
      isHiding = false;
    }
  } else if (data.startsWith("button")) {
    let value = data.split(":")[1];
    if (value === "1" && !lightOn) {
      player.flash();  // Turn on flashlight
      lightOn = true;
    } else if (value === "0" && lightOn) {
      player.reset();  // Turn off flashlight
      lightOn = false;
    }
  } else if (data.startsWith("breath")) {
    let value = data.split(":")[1];
    if (value === "1" && !player.isHoldingBreath) {
      player.startHoldingBreath();  // Turn on flashlight
    } else if (value === "0" && player.isHoldingBreath) {
      player.stopHoldingBreath();  // Turn off flashlight
    }
  }
}

let screenExists = false;
function displayWinScreen() {
  fill(255);
  textSize(32);
  text("You've survived the night!", 200, height / 9);
  if(!screenExists){
    screenExists = true;
    confetti = new Sprite(canvas.w/2, canvas.h-100, 100, 100, 'none');
    confetti.spriteSheet = confettiSheet;
    animations = {
      explode: { frameSize: [4096/8, 4096/8], frames: 63},
    };
    confetti.anis.frameDelay = 3;
    confetti.addAnis(animations);
    confetti.changeAni('explode');
    confetti.ani.noLoop();
    confetti.scale.x *= 3;
    confetti.scale.y *= 3;
  }
}

function displayLoseScreen() {
  //room.remove();
  if (!screenExists) { // Create the jump scare screen only if it doesn't already exist
    screenExists = true;
    screen = new Sprite();
    screen.collision = 'none';
    screen.img = monsterThatKilled;
    dead = new Sprite(canvas.w/2, canvas.h/1.5, canvas.w/500, canvas.h/500, 'none');
    //dead.collision = 'none';
    dead.img = deadScreen;
  }
  
  fill(255);
  textSize(32);
  //text("Caught by the monster...", 200, height / 2);
  
}

function clearEverything() {
  room.remove();
  player.sprite.remove();
  coverMonster.remove();
  lightMonsterSprite.sprite.remove();
  bubbleSprites.forEach((bubble) => {
        bubble.remove();
  });
  digitSprites.forEach((digit) => {
    digit.remove();
  });
  colonSprite.remove();
}