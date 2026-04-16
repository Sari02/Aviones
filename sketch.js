// =============================================================================
// HOW TO TEACH (8 classes) — one file, growing code
// =============================================================================
// Two ways to use this with a kid:
//   A) Keep this full file from day 1. Each class: set MILESTONE = N and only *study*
//      the blocks marked DAY N (the game already runs; older days stay off via MILESTONE).
//   B) True “grow the file”: start from empty sketch.js, paste DAY 1 only, run with
//      MILESTONE = 1; next class paste DAY 2’s block, set MILESTONE = 2; … until everything
//      is pasted (same as this file).
//
// Each class:
//   1) Set const MILESTONE = N below (same number as the class day).
//   2) Only teach / type the code between:
//        // >>>>>>>>>>>>>>>>> DAY N START ...
//        // <<<<<<<<<<<<<<<<< DAY N END
//      Search the file for "DAY 1", "DAY 2", ... to jump to that block.
//   3) Some functions are shared: we added small inner markers like
//      // --- DAY 2 --- inside handleInput() so you see what gets added that day.
// At the end of the course: set MILESTONE = 8 (full game).
//
// Class | Focus (what that day’s block adds)
// ------+------------------------------------------------------------------
//   1   | Sky, lane, plane, drift, distance, basic HUD bar
//   2   | A / W / D steering
//   3   | Timer, progress %, finish line, WIN screen, restart with R
//   4   | Birds, hits slow you, too many birds = GAME OVER
//   5   | Coins + 3 second speed boost
//   6   | Clouds + “can’t see ahead” blind effect
//   7   | Storm sky + lightning + 2 strikes = GAME OVER
//   8   | Plane menu (1–3, ENTER) + save top 3 times
//
const MILESTONE = 8;

function milestoneAtLeast(n) {
  return MILESTONE >= n;
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 START — Milestone 1: sky, lane, plane, drift, race distance (search: DAY 1)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

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
let distanceTravelled = 0;
let startTime = 0;
let elapsedTime = 0;

const baseSpeed = 4.5;
let currentSpeed = baseSpeed;
let speedPenaltyTimer = 0;
let boostTimer = 0;

// Empty lists + timers: used from later days; must exist so the game loop never crashes.
let birds = [];
let clouds = [];
let lightnings = [];
let coins = [];
let birdSpawnTimer = 0;
let cloudSpawnTimer = 0;
let lightningSpawnTimer = 0;
let coinSpawnTimer = 0;

let isStormPhase = false;
let stormStartDistance = 4200;
let cloudBlindTimer = 0;

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 END
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 4 START — Milestone 4: bird hit counter (search: DAY 4)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
let birdHits = 0;
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 4 END
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 7 START — Milestone 7: lightning hit counter (search: DAY 7)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
let lightningHits = 0;
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 7 END
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 8 START — Milestone 8: saved best times (search: DAY 8)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
let bestTimes = [];
const bestTimesStorageKey = "airplane_race_best_times";
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 8 END
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 — setup() + draw() game loop (search: DAY 1)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function setup() {
  createCanvas(800, 500);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);

  // --- DAY 8 --- menu first, or jump straight into flying (milestones 1–7).
  if (milestoneAtLeast(8)) {
    loadBestTimes();
    gameState = GAME_STATE.CHARACTER_SELECT;
  } else {
    startNewGame();
  }
}

function draw() {
  drawBackground();

  if (gameState === GAME_STATE.CHARACTER_SELECT && milestoneAtLeast(8)) {
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
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 END (setup + draw)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 8 START — Milestone 8: plane picker screen (search: DAY 8)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
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
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 8 END (drawCharacterSelection)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 — updateGame() base loop (search: DAY 1)
// DAY 3 adds win rule inside updateGame (search: DAY 3)
// DAY 7 adds storm switch (search: DAY 7)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function updateGame() {
  elapsedTime = (millis() - startTime) / 1000;

  // --- DAY 7 --- storm starts after you fly far enough.
  if (
    milestoneAtLeast(7) &&
    !isStormPhase &&
    distanceTravelled >= stormStartDistance
  ) {
    isStormPhase = true;
  }

  handleInput();
  updateSpeedEffects();
  distanceTravelled += currentSpeed;

  spawnEntities();
  updateEntities();
  checkCollisions();
  cleanupEntities();

  // --- DAY 3 --- cross the finish line (DAY 8 saves best time).
  if (milestoneAtLeast(3) && distanceTravelled >= finishDistance) {
    gameState = GAME_STATE.WIN;
    if (milestoneAtLeast(8)) {
      saveBestTime(elapsedTime);
    }
  }
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 END (updateGame shell; inner DAY 3 / DAY 7 marked above)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 — drawGame() + world drawing (search: DAY 1)
// DAY 6 adds drawCloudBlindEffect (search: DAY 6)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function drawGame() {
  drawTrack();
  drawPlayer();
  drawEntities();
  drawHUD();
  drawCloudBlindEffect();
  drawMilestoneHint();
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 END (drawGame)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function drawBackground() {
  // --- DAY 7 --- dark storm sky (milestones 1–6 stay light blue).
  const inStorm =
    milestoneAtLeast(7) && isStormPhase && gameState !== GAME_STATE.CHARACTER_SELECT;
  if (!inStorm) {
    background("#87ceeb");
  } else {
    background("#4f5d75");
  }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 — track + player (search: DAY 1)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function drawTrack() {
  // A simple vertical race lane.
  noStroke();
  fill("#4a4e69");
  rect((laneLeft + laneRight) / 2, height / 2, laneRight - laneLeft, height);

  // Lane borders.
  stroke("#f1faee");
  strokeWeight(3);
  line(laneLeft, 0, laneLeft, height);
  line(laneRight, 0, laneRight, height);

  // Destination marker (progress only shown in HUD).
  noStroke();
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 END (drawTrack)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

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

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 — gentle drift only   |   DAY 2 — add A / W / D (search: DAY 2)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function handleInput() {
  const horizontalSpeed = 6;
  const verticalSpeed = 4;

  // --- DAY 2 --- steering (milestone 1 skips this branch — only drift below).
  if (milestoneAtLeast(2)) {
    if (keyIsDown(65)) {
      player.x -= horizontalSpeed; // A
    }
    if (keyIsDown(68)) {
      player.x += horizontalSpeed; // D
    }
    if (keyIsDown(87)) {
      player.y -= verticalSpeed; // W (up only)
    } else {
      player.y += 1.4;
    }
  } else {
    // --- DAY 1 --- drift only.
    player.y += 0.8;
  }

  player.x = constrain(player.x, laneLeft + player.w / 2, laneRight - player.w / 2);
  player.y = constrain(player.y, 50, height - 50);
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 / DAY 2 END (handleInput)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 5 — boost & slowdown timers (used by coins + hits) (search: DAY 5)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function updateSpeedEffects() {
  // Speed boosts and penalties stack by priority.
  if (boostTimer > 0) {
    boostTimer--;
  }
  if (speedPenaltyTimer > 0) {
    speedPenaltyTimer--;
  }

  currentSpeed = baseSpeed;
  if (speedPenaltyTimer > 0) {
    currentSpeed = baseSpeed * 0.6;
  }
  if (boostTimer > 0) {
    currentSpeed = baseSpeed * 1.8;
  }
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 5 END (updateSpeedEffects)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 — timer ticks for spawn system (search: DAY 1)
// DAY 4 — birds   DAY 5 — coins   DAY 6 — clouds   DAY 7 — lightning
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function spawnEntities() {
  birdSpawnTimer++;
  cloudSpawnTimer++;
  coinSpawnTimer++;
  lightningSpawnTimer++;

  // --- DAY 4 --- birds (left to right).
  if (milestoneAtLeast(4)) {
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
  }

  // --- DAY 6 --- clouds (left to right).
  if (milestoneAtLeast(6) && cloudSpawnTimer >= 170) {
    cloudSpawnTimer = 0;
    clouds.push({
      x: laneLeft - 80,
      y: random(70, height - 170),
      w: 90,
      h: 45,
      vx: random(1.8, 2.8),
    });
  }

  // --- DAY 5 --- coins (falling boost pickups).
  if (milestoneAtLeast(5) && coinSpawnTimer >= 130) {
    coinSpawnTimer = 0;
    coins.push({
      x: random(laneLeft + 40, laneRight - 40),
      y: -20,
      size: 20,
      vy: random(2.4, 3.4),
    });
  }

  // --- DAY 7 --- lightning (top to bottom, only during storm).
  if (milestoneAtLeast(7) && isStormPhase) {
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
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 END (spawnEntities shell + day-specific spawns)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function updateEntities() {
  for (let i = 0; i < birds.length; i++) {
    birds[i].x += birds[i].vx;
  }
  for (let i = 0; i < clouds.length; i++) {
    clouds[i].x += clouds[i].vx;
  }
  for (let i = 0; i < coins.length; i++) {
    coins[i].y += coins[i].vy;
  }
  for (let i = 0; i < lightnings.length; i++) {
    lightnings[i].y += lightnings[i].vy;
  }

  if (cloudBlindTimer > 0) {
    cloudBlindTimer--;
  }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 4 — bird hits   DAY 5 — coins   DAY 6 — clouds   DAY 7 — lightning + lose
// (search: DAY 4, DAY 5, DAY 6, DAY 7)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function checkCollisions() {
  // --- DAY 4 --- birds: slow you + count toward destroy.
  if (milestoneAtLeast(4)) {
    for (let i = birds.length - 1; i >= 0; i--) {
      if (isCollidingRect(player, birds[i])) {
        birds.splice(i, 1);
        birdHits++;
        speedPenaltyTimer = 90; // around 1.5 sec at 60fps
      }
    }
  }

  // --- DAY 6 --- clouds: blind effect.
  if (milestoneAtLeast(6)) {
    for (let i = clouds.length - 1; i >= 0; i--) {
      if (isCollidingRect(player, clouds[i])) {
        clouds.splice(i, 1);
        cloudBlindTimer = 95;
      }
    }
  }

  // --- DAY 5 --- coins: 3-second boost.
  if (milestoneAtLeast(5)) {
    for (let i = coins.length - 1; i >= 0; i--) {
      if (isCollidingCircleRect(coins[i], player)) {
        coins.splice(i, 1);
        boostTimer = 180; // 3 sec at 60fps
      }
    }
  }

  // --- DAY 7 --- lightning strikes.
  if (milestoneAtLeast(7)) {
    for (let i = lightnings.length - 1; i >= 0; i--) {
      if (isCollidingRect(player, lightnings[i])) {
        lightnings.splice(i, 1);
        lightningHits++;
        speedPenaltyTimer = 120;
      }
    }
  }

  // --- DAY 4 / DAY 7 --- lose if too many birds or lightning hits.
  if (milestoneAtLeast(4) && birdHits >= 4) {
    gameState = GAME_STATE.GAME_OVER;
  }
  if (milestoneAtLeast(7) && lightningHits >= 2) {
    gameState = GAME_STATE.GAME_OVER;
  }
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 4–7 END (checkCollisions)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function cleanupEntities() {
  birds = birds.filter((b) => b.x < laneRight + 50);
  clouds = clouds.filter((c) => c.x < laneRight + 120);
  coins = coins.filter((c) => c.y < height + 30);
  lightnings = lightnings.filter((l) => l.y < height + 40);
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 — plane placeholder drawing (search: DAY 1)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function drawPlayer() {
  // Placeholder airplane rectangle.
  noStroke();
  fill(player.color);
  rect(player.x, player.y, player.w, player.h, 6);

  // Small nose indicator.
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
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 END (drawPlayer)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function drawEntities() {
  // --- DAY 4 --- birds.
  for (let i = 0; i < birds.length; i++) {
    fill("#222");
    noStroke();
    rect(birds[i].x, birds[i].y, birds[i].w, birds[i].h, 4);
  }

  // --- DAY 6 --- clouds.
  for (let i = 0; i < clouds.length; i++) {
    fill("#dde2e6");
    noStroke();
    rect(clouds[i].x, clouds[i].y, clouds[i].w, clouds[i].h, 16);
  }

  // --- DAY 7 --- lightning.
  for (let i = 0; i < lightnings.length; i++) {
    fill("#ffe066");
    noStroke();
    rect(lightnings[i].x, lightnings[i].y, lightnings[i].w, lightnings[i].h, 2);
  }

  // --- DAY 5 --- coins.
  for (let i = 0; i < coins.length; i++) {
    fill("#ffd166");
    stroke("#b08900");
    strokeWeight(2);
    ellipse(coins[i].x, coins[i].y, coins[i].size, coins[i].size);
  }
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 — top bar + speed   |   DAY 3 — time + progress   |   DAY 4–7 — extra HUD
// (search: DAY 1, DAY 3)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function drawHUD() {
  // --- DAY 1 --- dark bar + speed.
  noStroke();
  fill(0, 0, 0, 110);
  rect(width / 2, 25, width, 50);

  fill(255);
  textSize(14);
  textAlign(LEFT, CENTER);
  // --- DAY 3 --- timer + race progress.
  if (milestoneAtLeast(3)) {
    text(`Time: ${elapsedTime.toFixed(2)} s`, 15, 24);
  } else {
    text("Time: — (milestone 3)", 15, 24);
  }
  text(`Speed: ${currentSpeed.toFixed(1)}`, 140, 24);
  if (milestoneAtLeast(4)) {
    text(`Bird hits: ${birdHits}/4`, 245, 24);
  }
  if (milestoneAtLeast(7)) {
    text(`Lightning hits: ${lightningHits}/2`, 360, 24);
  }
  if (milestoneAtLeast(5)) {
    text(`Boost: ${boostTimer > 0 ? "ON" : "OFF"}`, 510, 24);
  }

  if (milestoneAtLeast(3)) {
    const progress = constrain(distanceTravelled / finishDistance, 0, 1);
    text(`Progress: ${Math.floor(progress * 100)}%`, 620, 24);
  }
  textAlign(CENTER, CENTER);

  // --- DAY 7 --- storm label.
  if (milestoneAtLeast(7) && isStormPhase) {
    fill("#ffe066");
    text("STORM PHASE", width / 2, 55);
  }
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 / DAY 3 END (drawHUD)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 6 — fog in front of the plane after hitting a cloud (search: DAY 6)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function drawCloudBlindEffect() {
  if (!milestoneAtLeast(6)) return;
  if (cloudBlindTimer > 0) {
    noStroke();
    fill(230, 230, 230, 210);
    const blindHeight = max(120, player.y - 60);
    rect(width / 2, blindHeight / 2, laneRight - laneLeft, blindHeight);
  }
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 6 END (drawCloudBlindEffect)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 3 — end screens (WIN / GAME OVER) (search: DAY 3)
// DAY 8 — top 3 times on win (search: DAY 8)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function drawEndScreen(isWin) {
  fill(0, 0, 0, 180);
  rect(width / 2, height / 2, width, height);

  fill(255);
  textSize(32);
  text(isWin ? "You Landed Safely!" : "Plane Destroyed!", width / 2, 120);

  textSize(18);
  // --- DAY 3 --- show your time.
  if (milestoneAtLeast(3)) {
    text(`Your time: ${elapsedTime.toFixed(2)} s`, width / 2, 165);
  }

  // --- DAY 8 --- leaderboard.
  if (milestoneAtLeast(8)) {
    textSize(16);
    text("Top 3 best times:", width / 2, 220);
    for (let i = 0; i < 3; i++) {
      const t = bestTimes[i];
      const line = t !== undefined ? `${i + 1}. ${t.toFixed(2)} s` : `${i + 1}. ---`;
      text(line, width / 2, 250 + i * 28);
    }
  }

  textSize(14);
  text("Press R to play again", width / 2, 360);
  if (milestoneAtLeast(8)) {
    text("Press C to return to character selection", width / 2, 385);
  }
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 3 / DAY 8 END (drawEndScreen)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 — footer hint for milestones 1–7 (hidden when MILESTONE is 8)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function drawMilestoneHint() {
  if (milestoneAtLeast(8)) return;
  noStroke();
  fill(0, 0, 0, 140);
  rect(width / 2, height - 22, width, 36);
  fill(255);
  textSize(13);
  textAlign(CENTER, CENTER);
  text(
    `MILESTONE ${MILESTONE} — set MILESTONE to 8 when the project is finished`,
    width / 2,
    height - 22
  );
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 END (drawMilestoneHint)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 4 — rectangle hit test   |   DAY 5 — circle vs rectangle (coins)
// (search: DAY 4, DAY 5)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
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
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 4 / DAY 5 END (collision helpers)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 3 — R to restart after win/game over
// DAY 8 — 1–3, ENTER on menu, C back to menu (search: DAY 3, DAY 8)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function keyPressed() {
  // --- DAY 8 --- character menu.
  if (gameState === GAME_STATE.CHARACTER_SELECT && milestoneAtLeast(8)) {
    if (key === "1") selectedCharacterIndex = 0;
    if (key === "2") selectedCharacterIndex = 1;
    if (key === "3") selectedCharacterIndex = 2;

    if (keyCode === ENTER) {
      startNewGame();
    }
    return;
  }

  // --- DAY 3 --- play again / back (C only on day 8).
  if (gameState === GAME_STATE.GAME_OVER || gameState === GAME_STATE.WIN) {
    if (key === "r" || key === "R") {
      startNewGame();
    }
    if (milestoneAtLeast(8) && (key === "c" || key === "C")) {
      gameState = GAME_STATE.CHARACTER_SELECT;
    }
  }
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 3 / DAY 8 END (keyPressed)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 — reset flight (search: DAY 1)   |   DAY 8 — keep chosen plane color
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function startNewGame() {
  // --- DAY 8 --- milestones 1–7 always use plane #1 until the menu exists.
  if (!milestoneAtLeast(8)) {
    selectedCharacterIndex = 0;
  }
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
  clouds = [];
  lightnings = [];
  coins = [];

  birdSpawnTimer = 0;
  cloudSpawnTimer = 0;
  lightningSpawnTimer = 0;
  coinSpawnTimer = 0;

  isStormPhase = false;
  cloudBlindTimer = 0;

  gameState = GAME_STATE.PLAYING;
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 1 / DAY 8 END (startNewGame)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 8 — load / save best 3 times (search: DAY 8)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
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
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// DAY 8 END (loadBestTimes, saveBestTime)
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
