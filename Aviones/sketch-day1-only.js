// =============================================================================
// sketch-day1-only.js — DAY 1 ONLY (then copy forward and add day 2, 3, …)
// =============================================================================
// In index.html: <script src="./sketch-day1-only.js"></script>
// This file: sky, lane, plane, gentle drift, race distance, speed in HUD.
// Full game with all teaching comments: sketch.js
// =============================================================================

const GAME_STATE = { PLAYING: "playing" };
let gameState = GAME_STATE.PLAYING;

let player = null;
const laneLeft = 120;
const laneRight = 680;
let distanceTravelled = 0;

const baseSpeed = 4.5;
let currentSpeed = baseSpeed;
let gameAssets = {};
let gameAudio = {};
let audioReady = false;

function preload() {
  gameAssets = {
    bg: loadImage("assets/fondo.png"),
    stormBg: loadImage("assets/fondotormenta.png"),
    endWinBg: loadImage("assets/fondoFin.png"),
    endLoseBg: loadImage("assets/gameOver.png"),
    plane: loadImage("assets/pngtree-white-flying-airplane-illustration-png-image_4735479.png"),
    bird: loadImage("assets/icons8-pato-volador-100.png"),
    cloud: loadImage("assets/icons8-nubes-100.png"),
    lightning: loadImage("assets/icons8-flash-activado-94.png"),
  };
  gameAudio = {
    jump: loadSound("assets/jump.mp3"),
    die: loadSound("assets/die.mp3"),
  };
}

function setup() {
  createCanvas(800, 500);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  startNewGame();
}

function draw() {
  drawBackground();
  if (gameState === GAME_STATE.PLAYING) {
    updateGame();
    drawGame();
  }
}

function updateGame() {
  handleInput();
  distanceTravelled += currentSpeed;
}

function handleInput() {
  player.y += 0.8;
  player.x = constrain(player.x, laneLeft + player.w / 2, laneRight - player.w / 2);
  player.y = constrain(player.y, 50, height - 50);
}

function drawGame() {
  drawTrack();
  drawPlayer();
  drawHUD();
}

function drawBackground() {
  if (gameAssets.bg) {
    imageMode(CORNER);
    image(gameAssets.bg, 0, 0, width, height);
  } else {
    background("#87ceeb");
  }
}


function drawTrack() {
  noStroke();
  fill("#4a4e69");
  rect((laneLeft + laneRight) / 2, height / 2, laneRight - laneLeft, height);
  stroke("#f1faee");
  strokeWeight(3);
  line(laneLeft, 0, laneLeft, height);
  line(laneRight, 0, laneRight, height);
  noStroke();
}

function createPlayer() {
  player = {
    x: width / 2,
    y: height - 70,
    w: 55,
    h: 28,
    color: "#e63946",
  };
}

function drawPlayer() {
  if (gameAssets.plane) {
    push();
    tint(player.color);
    imageMode(CENTER);
    image(gameAssets.plane, player.x, player.y, player.w + 18, player.h + 14);
    pop();
    return;
  }

  noStroke();
  fill(player.color);
  rect(player.x, player.y, player.w, player.h, 6);
  fill("#f8f9fa");
  triangle(
    player.x,
    player.y - player.h / 2 - 10,
    player.x - 8,
    player.y - player.h / 2,
    player.x + 8,
    player.y - player.h / 2
  );
}


function drawHUD() {
  noStroke();
  fill(0, 0, 0, 110);
  rect(width / 2, 25, width, 50);
  fill(255);
  textSize(14);
  textAlign(LEFT, CENTER);
  text(`Distance: ${Math.floor(distanceTravelled)}`, 15, 24);
  text(`Speed: ${currentSpeed.toFixed(1)}`, 220, 24);
  textAlign(CENTER, CENTER);
}


function playSfx(soundObj) {
  if (soundObj && soundObj.isLoaded && soundObj.isLoaded()) {
    soundObj.play();
  }
}

function unlockAudio() {
  if (!audioReady) {
    userStartAudio();
    audioReady = true;
  }
}

function startNewGame() {
  createPlayer();
  distanceTravelled = 0;
  currentSpeed = baseSpeed;
  gameState = GAME_STATE.PLAYING;
}
