// =============================================================================
// sketch-day4-only.js — DAYS 1–4 (+ birds, slow on hit, GAME OVER at 4 hits)
// =============================================================================
// In index.html: <script src="./sketch-day4-only.js"></script>
// Full game: sketch.js
// =============================================================================

const GAME_STATE = {
  PLAYING: "playing",
  GAME_OVER: "game_over",
  WIN: "win",
};

let gameState = GAME_STATE.PLAYING;

let player = null;
const laneLeft = 120;
const laneRight = 680;
const finishDistance = 8000;
let distanceTravelled = 0;
let startTime = 0;
let elapsedTime = 0;

const baseSpeed = 4.5;
let currentSpeed = baseSpeed;
let speedPenaltyTimer = 0;

let birds = [];
let birdSpawnTimer = 0;
let birdHits = 0;

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
    return;
  }

  if (gameState === GAME_STATE.GAME_OVER) {
    drawGame();
    drawEndScreen(false);
    return;
  }

  if (gameState === GAME_STATE.WIN) {
    drawGame();
    drawEndScreen(true);
  }
}

function updateGame() {
  elapsedTime = (millis() - startTime) / 1000;
  handleInput();
  updateSpeedEffects();
  distanceTravelled += currentSpeed;

  spawnEntities();
  updateEntities();
  checkCollisions();
  cleanupEntities();

  if (distanceTravelled >= finishDistance) {
    gameState = GAME_STATE.WIN;
  }
}

function updateSpeedEffects() {
  if (speedPenaltyTimer > 0) {
    speedPenaltyTimer--;
  }
  currentSpeed = baseSpeed;
  if (speedPenaltyTimer > 0) {
    currentSpeed = baseSpeed * 0.6;
  }
}

function spawnEntities() {
  birdSpawnTimer++;
  const birdEvery = 60;
  if (birdSpawnTimer >= birdEvery) {
    birdSpawnTimer = 0;
    birds.push({
      x: laneLeft - 30,
      y: random(80, height - 120),
      w: 28,
      h: 18,
      vx: random(3.5, 5.5),
    });
  }
}

function updateEntities() {
  for (let i = 0; i < birds.length; i++) {
    birds[i].x += birds[i].vx;
  }
}

function checkCollisions() {
  for (let i = birds.length - 1; i >= 0; i--) {
    if (isCollidingRect(player, birds[i])) {
      birds.splice(i, 1);
      birdHits++;
      speedPenaltyTimer = 90;
    }
  }
  if (birdHits >= 4) {
    gameState = GAME_STATE.GAME_OVER;
  }
}

function cleanupEntities() {
  birds = birds.filter((b) => b.x < laneRight + 50);
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
  drawEntities();
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

function drawEntities() {
  for (let i = 0; i < birds.length; i++) {
    fill("#222");
    noStroke();
    rect(birds[i].x, birds[i].y, birds[i].w, birds[i].h, 4);
  }
}

function drawHUD() {
  noStroke();
  fill(0, 0, 0, 110);
  rect(width / 2, 25, width, 50);
  fill(255);
  textSize(14);
  textAlign(LEFT, CENTER);
  text(`Time: ${elapsedTime.toFixed(2)} s`, 15, 24);
  text(`Speed: ${currentSpeed.toFixed(1)}`, 160, 24);
  text(`Bird hits: ${birdHits}/4`, 300, 24);
  const progress = constrain(distanceTravelled / finishDistance, 0, 1);
  text(`Progress: ${Math.floor(progress * 100)}%`, 450, 24);
  textAlign(CENTER, CENTER);
}

function drawEndScreen(isWin) {
  fill(0, 0, 0, 180);
  rect(width / 2, height / 2, width, height);
  fill(255);
  textSize(32);
  text(isWin ? "You Landed Safely!" : "Plane Destroyed!", width / 2, 120);
  textSize(18);
  text(`Your time: ${elapsedTime.toFixed(2)} s`, width / 2, 165);
  textSize(14);
  text("Press R to play again", width / 2, 360);
}

function isCollidingRect(a, b) {
  return (
    abs(a.x - b.x) * 2 < a.w + b.w &&
    abs(a.y - b.y) * 2 < a.h + b.h
  );
}

function keyPressed() {
  if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN) {
    if (key === "r" || key === "R") {
      startNewGame();
    }
  }
}

function startNewGame() {
  createPlayer();
  distanceTravelled = 0;
  startTime = millis();
  elapsedTime = 0;
  currentSpeed = baseSpeed;
  speedPenaltyTimer = 0;
  birdHits = 0;
  birds = [];
  birdSpawnTimer = 0;
  gameState = GAME_STATE.PLAYING;
}
