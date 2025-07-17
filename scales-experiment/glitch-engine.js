// ** main glitch variables - adjust if required

let fRate = 20;
let img = '/content/45f869235d71180f0c5dab27331b6b61331e25a57a387308cc9db5d9319d39b9i0';
let gRandMin = 0;
let gRandMax = 3;
let g;

// ** slice image

let originalImg;
let workingImg;
let buffer; // object for off-screen drawing and image manipulation

let iterationCounter = 0;
let noiseStormCounter = 0;


// ** glitch sound

let noise, noiseFilter;
let soundInitialized = false;
let soundActive = false;
let isPaused = false;

function calculateFitSize(imgWidth, imgHeight, canvasWidth, canvasHeight) {
  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;
  let w, h;

  if (canvasRatio > imgRatio) {
    h = canvasHeight;
    w = h * imgRatio;
  } else {
    w = canvasWidth;
    h = w / imgRatio;
  }

  return { w, h };
}

function displayGlitchedImage() {
  const { w, h } = calculateFitSize(g.image.width, g.image.height, width, height);
  image(g.image, width / 2 - w / 2, height / 2 - h / 2, w, h);
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('c');
  noSmooth();
  frameRate(fRate);
  g = new Glitch();
  loadImage(img, (img) => {

    originalImg = img.get();
    workingImg = originalImg.get();

    // creates a hidden canvas (offscreen buffer)
    buffer = createGraphics(originalImg.width, originalImg.height);
    buffer.noSmooth();
    g.loadImage(workingImg);
  });
}

function draw() {
  if (!isPaused) {
    applyGlitch();
    displayGlitchedImage();
  }
}

function applyGlitch() {

  const rand = Math.floor(random(gRandMin, gRandMax + 1));

  // more than 3 times "rand > 2" makes a longer period of noise (because it's not stopped)
  // when there is a "storm" we also rearrange the image
  if (rand === gRandMax) {
    noiseStormCounter++;
  } else {
    noiseStormCounter = 0;
  }

  if (noiseStormCounter > 2) {
    rearrangeImage();
  }

  g.resetBytes();
  g.randomBytes(rand);
  g.buildImage();
  triggerGlitchSound(rand);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function rearrangeImage() {

  if (!workingImg) { return; }

  // reset
  if (iterationCounter >= 5) {
    workingImg = originalImg.get();
    iterationCounter = 0;
  } else {

    const sliceHeight = Math.floor(random(10, workingImg.height / 4));
    const sliceY = Math.floor(random(0, workingImg.height - sliceHeight));

    buffer.clear();
    buffer.image(workingImg, 0, sliceHeight, workingImg.width, sliceY, 0, 0, workingImg.width, sliceY);
    buffer.image(workingImg, 0, 0, workingImg.width, sliceHeight, 0, sliceY, workingImg.width, sliceHeight);
    buffer.image(workingImg, 0, sliceY + sliceHeight, workingImg.width, workingImg.height - sliceY - sliceHeight, 0, sliceY + sliceHeight, workingImg.width, workingImg.height - sliceY - sliceHeight);
    workingImg = buffer.get();

    iterationCounter++;
  }

  g.loadImage(workingImg);
}

async function initializeGlitchSound() {
  if (soundInitialized) return;

  await Tone.start();

  noise = new Tone.Noise('white').start();
  noiseFilter = new Tone.AutoFilter({
    frequency: '6000n',
    baseFrequency: 200,
    octaves: 2
  }).toDestination();

  noise.connect(noiseFilter);
  noiseFilter.start();

  soundInitialized = true;
}

function triggerGlitchSound(rand) {
  if (!soundInitialized) { return; }

  noiseFilter.baseFrequency = 200 * rand;

  if (rand === gRandMax && soundActive) {
    noise.start();
  } else {
    noise.stop();
  }
}

function addGlobalStyles() {

  var style = document.createElement('style');
  var css = `
  body {
    background: black;
    margin: 0;
    overflow: hidden;
  }

  #c {
    position: relative;
    width: 100vw;
    height: 100vh;
  }

  #i {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
  }`;

  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

window.addEventListener('load', function() {

  addGlobalStyles();

  const c = document.getElementById('c');
  const i = document.getElementById('i');

  async function toggleSound() {
    await initializeGlitchSound();
    soundActive = !soundActive;
    i.textContent = soundActive ? '🔈' : '🔇';
    i.style.opacity = soundActive ? '0.3' : '1';
  }

  document.addEventListener('keydown', async (e) => {

    if (e.code === "Space") {
      e.preventDefault();
      await toggleSound();
    }

    if (e.code === "KeyP") {
      isPaused = !isPaused;
    }
  });

  c.addEventListener('click', async () => await toggleSound());
});