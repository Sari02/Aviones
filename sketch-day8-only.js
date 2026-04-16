// =============================================================================
// sketch-day8-only.js — FULL GAME (days 1–8): menu + plane choice + top 3 times
// =============================================================================
// In index.html: <script src="./sketch-day8-only.js"></script>
// Same game as sketch.js, without MILESTONE switches (everything is always on).
// Teaching copy with DAY comments: sketch.js
// =============================================================================

const GAME_STATE = {
  CHARACTER_SELECT: "character_select",
  PLAYING: "playing",
  GAME_OVER: "game_over",
  WIN: "win",
};

let gameState = GAME_STATE.CHARACTER_SELECT;

const characterOptions = [
  { name: "Red Falcon", color: "#e63946" },
  { name: "Blue Comet", color: "#3a86ff" },
  { name: "Green Arrow", color: "#2a9d8f" },
];
let selectedCharacterIndex = 0;

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

let bestTimes = [];
const bestTimesStorageKey = "airplane_race_best_times";

function setup() {
  createCanvas(800, 500);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  loadBestTimes();
}

function draw() {
  drawBackground();

  if (gameState === GAME_STATE.CHARACTER_SELECT) {
    drawCharacterSelection();
    return;
  }

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

function drawCharacterSelection() {
  fill(255);
  textSize(30);
  text("Airplane Rescue Race", width / 2, 70);

  textSize(18);
  text("Choose your airplane (press 1, 2, or 3)", width / 2, 110);

  for (let i = 0; i < characterOptions.length; i++) {
    const option = characterOptions[i];
    const x = 220 + i * 180;
    const y = 240;

    stroke(i === selectedCharacterIndex ? "#ffd166" : "#555");
    strokeWeight(i === selectedCharacterIndex ? 4 : 2);
    fill(option.color);
    rect(x, y, 90, 50, 8);

    noStroke();
    fill(255);
    textSize(14);
    text(`${i + 1}. ${option.name}`, x, y + 55);
  }

  fill(220);
  textSize(14);
  text(
    "Story: Your turbine exploded. Reach the landing zone as fast as possible!",
    width / 2,
    330
  );
  text("Controls: A = left, D = right, W = up", width / 2, 355);
  text("Press ENTER to start", width / 2, 380);
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
    saveBestTime(elapsedTime);
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
    gameState = GAME_STATE.GAME_OVER;
  }
  if (lightningHits >= 2) {
    gameState = GAME_STATE.GAME_OVER;
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
  if (isStormPhase) {
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
  const selected = characterOptions[selectedCharacterIndex];
  player = {
    x: width / 2,
    y: height - 70,
    w: 55,
    h: 28,
    color: selected.color,
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
  for (let i = 0; i < clouds.length; i++) {
    fill("#dde2e6");
    noStroke();
    rect(clouds[i].x, clouds[i].y, clouds[i].w, clouds[i].h, 16);
  }
  for (let i = 0; i < lightnings.length; i++) {
    fill("#ffe066");
    noStroke();
    rect(lightnings[i].x, lightnings[i].y, lightnings[i].w, lightnings[i].h, 2);
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
  fill(0, 0, 0, 180);
  rect(width / 2, height / 2, width, height);

  fill(255);
  textSize(32);
  text(isWin ? "You Landed Safely!" : "Plane Destroyed!", width / 2, 120);

  textSize(18);
  text(`Your time: ${elapsedTime.toFixed(2)} s`, width / 2, 165);

  textSize(16);
  text("Top 3 best times:", width / 2, 220);
  for (let i = 0; i < 3; i++) {
    const t = bestTimes[i];
    const line = t !== undefined ? `${i + 1}. ${t.toFixed(2)} s` : `${i + 1}. ---`;
    text(line, width / 2, 250 + i * 28);
  }

  textSize(14);
  text("Press R to play again", width / 2, 360);
  text("Press C to return to character selection", width / 2, 385);
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

function keyPressed() {
  if (gameState === GAME_STATE.CHARACTER_SELECT) {
    if (key === "1") selectedCharacterIndex = 0;
    if (key === "2") selectedCharacterIndex = 1;
    if (key === "3") selectedCharacterIndex = 2;

    if (keyCode === ENTER) {
      startNewGame();
    }
    return;
  }

  if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN) {
    if (key === "r" || key === "R") {
      startNewGame();
    }
    if (key === "c" || key === "C") {
      gameState = GAME_STATE.CHARACTER_SELECT;
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
  boostTimer = 0;

  birdHits = 0;
  lightningHits = 0;

  birds = [];
  coins = [];
  clouds = [];
  lightnings = [];

  birdSpawnTimer = 0;
  coinSpawnTimer = 0;
  cloudSpawnTimer = 0;
  lightningSpawnTimer = 0;

  isStormPhase = false;
  cloudBlindTimer = 0;

  gameState = GAME_STATE.PLAYING;
}

function loadBestTimes() {
  const raw = localStorage.getItem(bestTimesStorageKey);
  if (!raw) {
    bestTimes = [];
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      bestTimes = parsed.filter((x) => typeof x === "number").sort((a, b) => a - b).slice(0, 3);
    } else {
      bestTimes = [];
    }
  } catch (_err) {
    bestTimes = [];
  }
}

function saveBestTime(timeValue) {
  bestTimes.push(timeValue);
  bestTimes.sort((a, b) => a - b);
  bestTimes = bestTimes.slice(0, 3);
  localStorage.setItem(bestTimesStorageKey, JSON.stringify(bestTimes));
}
