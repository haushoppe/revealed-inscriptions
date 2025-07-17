// ** main glitch variables - adjust if required

let fRate = 20;
let img = [
  '/scales-experiment/assets/20250715_122746.webp',
  '/scales-experiment/assets/20250715_123618.webp',
  '/scales-experiment/assets/20250715_124225.webp',
  '/scales-experiment/assets/20250715_124515.webp',
  '/scales-experiment/assets/20250715_125034.webp',
  '/scales-experiment/assets/20250715_125614.webp',
];
let gRandMin = 0;
let gRandMax = 2;
let g;

// ** slice image

let originalImg;
let workingImg;
let buffer; // object for off-screen drawing and image manipulation

let iterationCounter = 0;
let imageResetCounter = 0;

// ** new: multi-image support
let imgArray = [];
let imgPaths = img;
let currentImgIndex = -1;

let isPaused = false;

function preload() {
  imgArray = imgPaths.map(path => loadImage(path));
}

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

  currentImgIndex = floor(random(imgArray.length));
  originalImg = imgArray[currentImgIndex].get();
  workingImg = originalImg.get();

  // creates a hidden canvas (offscreen buffer)
  buffer = createGraphics(originalImg.width, originalImg.height);
  buffer.noSmooth();
  g.loadImage(workingImg);
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
    imageResetCounter++;
  } else {
    imageResetCounter = 0;
  }

  if (imageResetCounter > 2) {
    rearrangeImage();
  }

  g.resetBytes();
  g.randomBytes(rand);
  g.buildImage();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function rearrangeImage() {

  if (!workingImg) { return; }

  // reset
  if (iterationCounter >= 5) {
    let newIndex;
    do {
      newIndex = floor(random(imgArray.length));
    } while (imgArray.length > 1 && newIndex === currentImgIndex);

    currentImgIndex = newIndex;
    originalImg = imgArray[currentImgIndex].get();
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
  }`;

  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

window.addEventListener('load', function() {

  addGlobalStyles();

  const c = document.getElementById('c');

  document.addEventListener('keydown', (e) => {
    if (e.code === "KeyP") {
      isPaused = !isPaused;
    }
  });
});
