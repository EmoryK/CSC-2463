let synth = new Tone.PolySynth(Tone.Synth);
const reverb = new Tone.Reverb({
  decay: 1.5, // Room size simulation
  preDelay: 0 // Delay before the reverb starts
}).toDestination();

synth.connect(reverb);

const scales = {
  'C Major': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  'G Major': ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4'],
  'A Minor': ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
  'E Minor': ['E3', 'F#3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4'],
  'D Major': ['D3', 'E3', 'F#3', 'G3', 'A3', 'B3', 'C#4', 'D4'],
  'B Minor': ['B3', 'C#4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4'],
  'F# Minor': ['F#3', 'G#3', 'A3', 'B3', 'C#4', 'D4', 'E4', 'F#4'],
  'C Minor': ['C3', 'D3', 'D#3', 'F3', 'G3', 'G#3', 'A#3', 'C4'],
  'G Minor': ['G3', 'A3', 'A#3', 'C4', 'D4', 'D#4', 'F4', 'G4'],
  'D Minor': ['D3', 'E3', 'F3', 'G3', 'A3', 'A#3', 'C4', 'D4'],
  'A Major': ['A3', 'B3', 'C#4', 'D4', 'E4', 'F#4', 'G#4', 'A4'],
  'E Major': ['E3', 'F#3', 'G#3', 'A3', 'B3', 'C#4', 'D#4', 'E4'],
  'F Major': ['F3', 'G3', 'A3', 'A#3', 'C4', 'D4', 'E4', 'F4'],
  'Bb Major': ['A#3', 'C4', 'D4', 'D#4', 'F4', 'G4', 'A4', 'A#4'],
  'Eb Major': ['D#3', 'F3', 'G3', 'G#3', 'A#3', 'C4', 'D4', 'D#4'],
  'Ab Major': ['G#3', 'A#3', 'C4', 'C#4', 'D#4', 'F4', 'G4', 'G#4']
};

let currentScale = scales['C Major'];
let scaleSelect;

function setup() {
  createCanvas(400, 400);

  // Dropdown for scale selection
  scaleSelect = createSelect();
  scaleSelect.position(10, 10);
  for (let scale in scales) {
    scaleSelect.option(scale);
  }
  scaleSelect.changed(onScaleChange);

  // Slider for Reverb Decay (Room Size)
  window.roomSizeSlider = createSlider(0, 10, 1.5, 0.1);
  roomSizeSlider.position(10, 365);
  roomSizeSlider.input(() => {
    reverb.decay = roomSizeSlider.value();
  });

  // Slider for Reverb Wet Level
  window.wetLevelSlider = createSlider(0, 1, 0.5, 0.01);
  wetLevelSlider.position(160, 365);
  wetLevelSlider.input(() => {
    reverb.wet.value = wetLevelSlider.value();
  });
}

function onScaleChange() {
  let scaleName = scaleSelect.value();
  currentScale = scales[scaleName];
}

function keyPressed() {
 
  scaleSelect.elt.blur();

  const keyToScaleIndex = {
    'a': 0,
    's': 1,
    'd': 2,
    'f': 3,
    'g': 4,
    'h': 5,
    'j': 6,
    'k': 7  // K maps to the eighth note in the scale
  };

  if (keyToScaleIndex.hasOwnProperty(key)) {
    let playNote = currentScale[keyToScaleIndex[key]];
    synth.triggerAttack(playNote);
  }
}

function keyReleased() {


  const keyToScaleIndex = {
    'a': 0,
    's': 1,
    'd': 2,
    'f': 3,
    'g': 4,
    'h': 5,
    'j': 6,
    'k': 7
  };

  if (keyToScaleIndex.hasOwnProperty(key)) {
    let playNote = currentScale[keyToScaleIndex[key]];
    synth.triggerRelease(playNote, '+0.03');
  }
}

function draw() {
  background(94, 169, 190);
  
  // Set text characteristics for labels and values
  fill(253, 248, 226); // Set text color to black for visibility
  textSize(15); // Set text size for labels and values

  // Labels for sliders
  text('Room Size (Decay):', 10, 330); 
  text('Wet Level (Mix):', 160, 330); 

  // Display current values above sliders
  text(`Value: ${roomSizeSlider.value().toFixed(2)}`, 10, 350); // Display Room Size value
  text(`Value: ${wetLevelSlider.value().toFixed(2)}`, 160, 350); // Display Wet Level value

  // Instructions and current scale display
  fill(243, 191, 179); // Change fill color for different text, if desired
  textSize(32);
  text('Play A-K for Synth', 50, 180);
  textSize(24);
  text(`Current Scale: ${scaleSelect.value()}`, 50, 220);
}


