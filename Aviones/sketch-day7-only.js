// =============================================================================
// sketch-day7-only.js — DAYS 1–7 (+ storm sky, lightning, 2 strikes = GAME OVER)
// =============================================================================
// In index.html: <script src="./sketch-day7-only.js"></script>
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
const stormStartDistance = 4200;
let distanceTravelled = 0;
let startTime = 0;
let elapsedTime = 0;

const baseSpeed = 4.5;
let currentSpeed = baseSpeed;
let gameAssets = {};
let gameAudio = {};
let audioReady = false;
let speedPenaltyTimer = 0;
let boostTimer = 0;

let isStormPhase = false;

let birds = [];
let birdSpawnTimer = 0;
let birdHits = 0;

let coins = [];
let coinSpawnTimer = 0;

let clouds = [];
let cloudSpawnTimer = 0;
let cloudBlindTimer = 0;

let lightnings = [];
let lightningSpawnTimer = 0;
let lightningHits = 0;


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

  if (!isStormPhase && distanceTravelled >= stormStartDistance) {
    isStormPhase = true;
  }

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
  if (boostTimer > 0) boostTimer--;
  if (speedPenaltyTimer > 0) speedPenaltyTimer--;

  currentSpeed = baseSpeed;
  if (speedPenaltyTimer > 0) {
    currentSpeed = baseSpeed * 0.6;
  }
  if (boostTimer > 0) {
    currentSpeed = baseSpeed * 1.8;
  }
}

function spawnEntities() {
  birdSpawnTimer++;
  coinSpawnTimer++;
  cloudSpawnTimer++;
  lightningSpawnTimer++;

  const birdEvery = isStormPhase ? 45 : 60;
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

  if (coinSpawnTimer >= 130) {
    coinSpawnTimer = 0;
    coins.push({
      x: random(laneLeft + 40, laneRight - 40),
      y: -20,
      size: 20,
      vy: random(2.4, 3.4),
    });
  }

  if (cloudSpawnTimer >= 170) {
    cloudSpawnTimer = 0;
    clouds.push({
      x: laneLeft - 80,
      y: random(70, height - 170),
      w: 90,
      h: 45,
      vx: random(1.8, 2.8),
    });
  }

  if (isStormPhase) {
    if (lightningSpawnTimer >= 75) {
      lightningSpawnTimer = 0;
      lightnings.push({
        x: random(laneLeft + 20, laneRight - 20),
        y: -30,
        w: 14,
        h: 44,
        vy: random(5.5, 7.2),
      });
    }
  }
}

function updateEntities() {
  for (let i = 0; i < birds.length; i++) {
    birds[i].x += birds[i].vx;
  }
  for (let i = 0; i < coins.length; i++) {
    coins[i].y += coins[i].vy;
  }
  for (let i = 0; i < clouds.length; i++) {
    clouds[i].x += clouds[i].vx;
  }
  for (let i = 0; i < lightnings.length; i++) {
    lightnings[i].y += lightnings[i].vy;
  }
  if (cloudBlindTimer > 0) {
    cloudBlindTimer--;
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

  for (let i = coins.length - 1; i >= 0; i--) {
    if (isCollidingCircleRect(coins[i], player)) {
      coins.splice(i, 1);
      boostTimer = 180;
      playSfx(gameAudio.jump);
    }
  }

  for (let i = clouds.length - 1; i >= 0; i--) {
    if (isCollidingRect(player, clouds[i])) {
      clouds.splice(i, 1);
      cloudBlindTimer = 95;
    }
  }

  for (let i = lightnings.length - 1; i >= 0; i--) {
    if (isCollidingRect(player, lightnings[i])) {
      lightnings.splice(i, 1);
      lightningHits++;
      speedPenaltyTimer = 120;
    }
  }

  if (birdHits >= 4) {
    triggerGameOver();
  }
  if (lightningHits >= 2) {
    triggerGameOver();
  }
}

function cleanupEntities() {
  birds = birds.filter((b) => b.x < laneRight + 50);
  coins = coins.filter((c) => c.y < height + 30);
  clouds = clouds.filter((c) => c.x < laneRight + 120);
  lightnings = lightnings.filter((l) => l.y < height + 40);
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
  drawCloudBlindEffect();
}

function drawBackground() {
  const bgImg = isStormPhase ? gameAssets.stormBg : gameAssets.bg;
  if (bgImg) {
    imageMode(CORNER);
    image(bgImg, 0, 0, width, height);
  } else if (isStormPhase) {
    background("#4f5d75");
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


function drawEntities() {
  for (let i = 0; i < birds.length; i++) {
    if (gameAssets.bird) {
      imageMode(CENTER);
      image(gameAssets.bird, birds[i].x, birds[i].y, birds[i].w + 12, birds[i].h + 12);
    } else {
      fill("#222");
      noStroke();
      rect(birds[i].x, birds[i].y, birds[i].w, birds[i].h, 4);
    }
  }
  for (let i = 0; i < clouds.length; i++) {
    if (gameAssets.cloud) {
      imageMode(CENTER);
      image(gameAssets.cloud, clouds[i].x, clouds[i].y, clouds[i].w + 12, clouds[i].h + 16);
    } else {
      fill("#dde2e6");
      noStroke();
      rect(clouds[i].x, clouds[i].y, clouds[i].w, clouds[i].h, 16);
    }
  }
  for (let i = 0; i < lightnings.length; i++) {
    if (gameAssets.lightning) {
      imageMode(CENTER);
      image(gameAssets.lightning, lightnings[i].x, lightnings[i].y, lightnings[i].w + 18, lightnings[i].h + 10);
    } else {
      fill("#ffe066");
      noStroke();
      rect(lightnings[i].x, lightnings[i].y, lightnings[i].w, lightnings[i].h, 2);
    }
  }
  for (let i = 0; i < coins.length; i++) {
    fill("#ffd166");
    stroke("#b08900");
    strokeWeight(2);
    ellipse(coins[i].x, coins[i].y, coins[i].size, coins[i].size);
  }
}

function drawHUD() {
  noStroke();
  fill(0, 0, 0, 110);
  rect(width / 2, 35, width, 62);
  fill(255);
  textSize(12);
  textAlign(LEFT, CENTER);
  text(`Time: ${elapsedTime.toFixed(2)} s`, 10, 20);
  text(`Speed: ${currentSpeed.toFixed(1)}`, 130, 20);
  text(`Birds: ${birdHits}/4`, 240, 20);
  text(`Lightning: ${lightningHits}/2`, 330, 20);
  text(`Boost: ${boostTimer > 0 ? "ON" : "OFF"}`, 460, 20);
  const progress = constrain(distanceTravelled / finishDistance, 0, 1);
  text(`Progress: ${Math.floor(progress * 100)}%`, 560, 20);
  textAlign(CENTER, CENTER);
  if (isStormPhase) {
    fill("#ffe066");
    textSize(13);
    text("STORM PHASE", width / 2, 52);
  }
}

function drawCloudBlindEffect() {
  if (cloudBlindTimer > 0) {
    noStroke();
    fill(230, 230, 230, 210);
    const blindHeight = max(120, player.y - 60);
    rect(width / 2, blindHeight / 2, laneRight - laneLeft, blindHeight);
  }
}

function drawEndScreen(isWin) {
  const endBg = isWin ? gameAssets.endWinBg : gameAssets.endLoseBg;
  if (endBg) {
    imageMode(CORNER);
    image(endBg, 0, 0, width, height);
    fill(0, 0, 0, 120);
    rect(width / 2, height / 2, width, height);
  } else {
    fill(0, 0, 0, 180);
    rect(width / 2, height / 2, width, height);
  }
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

function isCollidingCircleRect(circleObj, rectObj) {
  const cx = circleObj.x;
  const cy = circleObj.y;
  const r = circleObj.size / 2;
  const rx = rectObj.x - rectObj.w / 2;
  const ry = rectObj.y - rectObj.h / 2;
  const rw = rectObj.w;
  const rh = rectObj.h;
  const nearestX = constrain(cx, rx, rx + rw);
  const nearestY = constrain(cy, ry, ry + rh);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < r * r;
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

function keyPressed() {
  unlockAudio();
  if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN) {
    if (key === "r" || key === "R") {
      startNewGame();
    }
  }
}


function triggerGameOver() {
  if (gameState !== GAME_STATE.GAME_OVER) {
    gameState = GAME_STATE.GAME_OVER;
    playSfx(gameAudio.die);
  }
}

function startNewGame() {
  createPlayer();
  distanceTravelled = 0;
  startTime = millis();
  elapsedTime = 0;
  currentSpeed = baseSpeed;
  speedPenaltyTimer = 0;
  boostTimer = 0;
  birdHits = 0;
  lightningHits = 0;
  isStormPhase = false;
  birds = [];
  coins = [];
  clouds = [];
  lightnings = [];
  birdSpawnTimer = 0;
  coinSpawnTimer = 0;
  cloudSpawnTimer = 0;
  lightningSpawnTimer = 0;
  cloudBlindTimer = 0;
  gameState = GAME_STATE.PLAYING;
}
