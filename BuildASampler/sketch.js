let reverb, sampler;

function preload() {
  // Initialize the sampler with multiple audio files
  sampler = new Tone.Players({
    trumpet: "assets/trumpet-c4-pianissimo.mp3",
    song: "assets/piano-with-beat-4.mp3",
    pew: "assets/pistol-pew.mp3",
    bird: "assets/bird.mp3",
  }).toDestination();
}

function setup() {
  createCanvas(400, 200); 

  reverb = new Tone.Reverb({
    decay: 1.5,
    wet: 0.5,
  }).toDestination();

  sampler.connect(reverb);

  // GUI controls
  createSampleButtons();
  createReverbControl();
}

function createSampleButtons() {
  let samples = ["trumpet", "song", "pew", "bird"];
  samples.forEach((sample, index) => {
    let btn = createButton(`Play ${sample}`);
    btn.position(10 + index * 100, 10);
    btn.mousePressed(() => {
      Tone.start();
      sampler.player(sample).start();
    });
  });
}

function createReverbControl() {
  let reverbControl = createSlider(0, 1, 0.5, 0.01);
  reverbControl.position(10, 60);
  reverbControl.input(() => {
    reverb.wet.value = reverbControl.value();
  });
}

function draw() {
  background('teal');
  fill('orange'); 
  text('Reverb', 10, 55); 
  text('Reverb Level: ' + reverb.wet.value.toFixed(2), 160, 75);
}
