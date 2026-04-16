// =============================================================================
// sketch-day2-only.js — DAYS 1 + 2 (steering: A / W / D)
// =============================================================================
// In index.html: <script src="./sketch-day2-only.js"></script>
// Full game: sketch.js
// =============================================================================

const GAME_STATE = { PLAYING: "playing" };
let gameState = GAME_STATE.PLAYING;

let player = null;
const laneLeft = 120;
const laneRight = 680;
let distanceTravelled = 0;

const baseSpeed = 4.5;
let currentSpeed = baseSpeed;

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
  const horizontalSpeed = 6;
  const verticalSpeed = 4;
  if (keyIsDown(65)) player.x -= horizontalSpeed;
  if (keyIsDown(68)) player.x += horizontalSpeed;
  if (keyIsDown(87)) {
    player.y -= verticalSpeed;
  } else {
    player.y += 1.4;
  }
  player.x = constrain(player.x, laneLeft + player.w / 2, laneRight - player.w / 2);
  player.y = constrain(player.y, 50, height - 50);
}

function drawGame() {
  drawTrack();
  drawPlayer();
  drawHUD();
}

function drawBackground() {
  background("#87ceeb");
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

function startNewGame() {
  createPlayer();
  distanceTravelled = 0;
  currentSpeed = baseSpeed;
  gameState = GAME_STATE.PLAYING;
}
