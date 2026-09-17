const GAME_STATE = {
  CHARACTER_SELECT: "character_select",
  PLAYING: "playing",
  GAME_OVER: "game_over",
  WIN: "win",
};

let gameState = GAME_STATE.CHARACTER_SELECT;

const characterOptions = [
  { name: "Red Falcon", imagePath: "assets/avionred.png" },
  { name: "Orange Comet", imagePath: "assets/avionorange.png" },
  { name: "Green Arrow", imagePath: "assets/aviongreen.png" },
];
let planeImages = [];
let lightningImg;
let cloudImg;
let stormCloudImg;
let birdImg;
let dieSound;
let gameOverImg;
let restartImg;
let fondoFinImg;
let fondoImg;
let fondoTormentaImg;
let backgroundScrollY = 0;
const backgroundScrollSpeed = 2;
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
let coinSpawTimer = 0;

let cloud = [];
let cloudSpawnTimer = 0;
let cloudHits = 0;

let lightnings = [];
let lightningSpawnTimer = 0;
let lightningHits = 0;

let bestTimes = [];
const bestTimesStorageKey = "airplane_race_best_times";


function preload() {
  for (let i = 0; i < characterOptions.length; i++) {
    planeImages[i] = loadImage(characterOptions[i].imagePath);
  }
  lightningImg = loadImage("assets/rayo.png");
  cloudImg = loadImage("assets/nubeblanca.png");
  stormCloudImg = loadImage("assets/nubetormenta.png");
  birdImg = loadImage("assets/icons8-pato-volador-100.png");
  //dieSound = loadSound("assets/die.mp3");
  gameOverImg = loadImage("assets/gameOver.png");
  restartImg = loadImage("assets/restart.png");
  fondoFinImg = loadImage("assets/fondoFin.png");
  fondoImg = loadImage("assets/fondo.png");
  fondoTormentaImg = loadImage("assets/fondotormenta.png");
}


function setup() {
  createCanvas(800, 500);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  loadBestTimes();
}

function draw() {
  
  if (gameState === GAME_STATE.GAME_OVER) {
    drawEndScreen(false);
    return;
  }
  if (gameState === GAME_STATE.WIN) {
    drawEndScreen(true);
    return;
  }
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
}

function drawCharacterSelection(){
  fill(255);
  textSize (30);
  text("Los aviones",width/2,70 );
  textSize (18);
  text("Elige tu avión, presiona 1,2 o 3",width/2,110 );

  for( let i=0; i< characterOptions.length; i++ ){
    const option = characterOptions[i];
    const x = 220 + i * 180;
    const y = 240;

    imageMode(CENTER);
    image(planeImages[i], x, y, 90,50);

    noFill();
    stroke(i === selectedCharacterIndex ? "#ffd166" : "#555");
    strokeWeight(i === selectedCharacterIndex ? 4 : 2);
    rect(x, y, 94, 54, 8);

    noStroke();
    fill(255);
    textSize(14);
    text(`${i + 1}. ${option.name}`, x, y + 55);
  }
    fill(220);
    textSize(14);
    text(
      "Hay una bomba en el avion tienes que ser rapido para llegar sanos y salvos",
      width / 2,
      330
    );
    text("Controles: A = izquierda, D = derecha, W = arriba", width / 2, 355);
    text("Presiona ENTER para empezar", width / 2, 380);
}

function updateGame() {
  elapsedTime = (millis() - startTime) / 1000;

  if(!isStormPhase && distanceTravelled >= stormStartDistance){
    isStormPhase = true;
  }

  handleInput();
  updateSpeedEffects();
  distanceTravelled += currentSpeed;

  spawnEntities();
  updateEntities();
  checkCollisions();
  cleanupEntities();

  if(distanceTravelled>=finishDistance){
    gameState=GAME_STATE.WIN;
    saveBestTime(elapsedTime);
  }
}

function updateSpeedEffects(){
  if (boostTimer > 0) boostTimer--;

  if(speedPenaltyTimer>0)  {
    speedPenaltyTimer--;
  }
  currentSpeed = baseSpeed
  if(speedPenaltyTimer>0){
    currentSpeed=baseSpeed*0.6;
  }
  if (boostTimer > 0) {
    currentSpeed = baseSpeed * 1.8;
  }

}

function spawnEntities(){
  birdSpawnTimer++;
  coinSpawnTimer++;
  cloudSpawnTimer++;
  lightningSpawnTimer++;
  
  if(birdSpawnTimer >= 60){
    birdSpawnTimer=0;
    birds.push({
      x: laneLeft-30,
      y:random(80,height-120),
      w:28,
      h:18,
      vx:random(3.5,5.5),
    })
  }

  if(coinSpawnTimer >= 130){
    coinSpawnTimer=0;
    coins.push({
      x: random(laneLeft+40 , laneRight-40),
      y: -20,
      size: 20,
      vy:random(2.4,3.4),
    })
  }

   if(cloudSpawnTimer >= 60){
    cloudSpawnTimer=0;
    clouds.push({
      x: laneLeft-80,
      y:random(0,height-170),
      w:90,
      h:45,
      vx:random(1.8,2.8),
    })
  }

  if(isStormPhase){
    if(lightningSpawnTimer >= 75){
        lightningSpawnTimer=0;
        lightnings.push({
          x: random(laneLeft + 20, laneRight - 20),
          y: -30,
          w:14,
          h:44,
          vy:random(5.5,7.2),
        })
    }    
  }
}

function updateEntities(){
  for(let i = 0 ; i<birds.length ; i++ ){
    birds[i].x += birds[i].vx
  } 
  
  for(let i = 0 ; i<coins.length ; i++ ){
    coins[i].y += coins[i].vy
  } 

  for(let i = 0 ; i<clouds.length ; i++ ){
    clouds[i].x += clouds[i].vx
  } 
  if (cloudBlindTimer > 0) {
    cloudBlindTimer--;
  }
  for(let i = 0 ; i<lightnings.length ; i++ ){
    lightnings[i].y += lightnings[i].vy
  } 
}

function checkCollisions(){
  for(let i = birds.length -1; i >= 0; i--){
    if (isCollidingRect(player, birds[i])){
      birds.splice(i, 1);
      birdHits++;
      speedPenaltyTimer = 90;
    }
  }
  for(let i = coins.length -1; i >= 0; i--){
    if (isCollidingCircleRect(coins[i], player)){
      coins.splice(i, 1);
      boostTimer = 180;
    }
  }
  for(let i = clouds.length -1; i >= 0; i--){
    if (isCollidingRect(player, clouds[i])){
      clouds.splice(i, 1);
      cloudBlindTimer = 95;
    }
  }
  for(let i = lightnings.length -1; i >= 0; i--){
    if (isCollidingRect(player, lightnings[i])){
      lightnings.splice(i, 1);
      lightningHits++;
      speedPenaltyTimer = 120;
    }
  }
  if(birdHits >= 4) {
    setGameOver();
  }
  if(lightningHits >= 2) {
    setGameOver();
  }
}


function cleanupEntities() {
  birds = birds.filter((b) => b.x < laneRight + 50);
  coins = coins.filter((c) => c.y < height + 30);
  clouds = clouds.filter((c) => c.x < laneRight + 120);
  lightnings = lightnings.filter((l) => l.x < height + 40);
}

//funcion que tiene los controles del jugador
function handleInput() {
  const horizontalSpeed = 6;
  const verticalSpeed = 4;
  if(keyIsDown(65)) player.x -= horizontalSpeed;
  if(keyIsDown(68)) player.x += horizontalSpeed;
  if(keyIsDown(87)) {
    player.y -= verticalSpeed;
  } else {
    player.y += 1.4
    }

  player.x = constrain(player.x, laneLeft + player.w / 2, laneRight - player.w / 2);
  player.y = constrain(player.y, 50, height - 50);
}
  
function drawGame() {
  drawPlayer();
  drawEntities();
  drawHUD();
  drawCloudBlindEffect();
}

function drawScrollingBackground(img) {
  backgroundScrollY += backgroundScrollSpeed;
  const tileH = (img.height / img.width) * width;
  if (backgroundScrollY >= tileH) {
    backgroundScrollY -= tileH;
  }

  imageMode(CORNER);
  let y = backgroundScrollY - tileH;
  while (y < height) {
    image(img, 0, y, width, tileH);
    y += tileH;
  }
}

function drawBackground() {
  const bgImg = isStormPhase ? fondoTormentaImg : fondoImg;
  drawScrollingBackground(bgImg);
}


function createPlayer (){
  player = {
    x: width / 2,
    y: height - 70,
    w:55,
    h:28,
    img: planeImages[selectedCharacterIndex],
  };
}

function drawPlayer(){
  imageMode(CENTER);
  image(player.img, player.x, player.y, player.w, player.h);
}

function drawEntities (){
  for(let i = 0 ; i<birds.length; i++){
      imageMode(CENTER);
      image(birdImg, birds[i].x, birds[i].y, birds[i].w + 12, birds[i].h + 12);
  }
  for(let i = 0 ; i<clouds.length; i++){
      imageMode(CENTER);
      image(cloudImg, clouds[i].x, clouds[i].y, clouds[i].w + 12, clouds[i].h + 12);
  }
  for(let i = 0 ; i<coins.length; i++){
    fill("#ffd166");
    stroke("#b08900");
    strokeWeight(2);
    ellipse(coins[i].x, coins[i].y, coins[i].size, coins[i].size);
  }
  for(let i = 0 ; i<lightnings.length; i++){
      imageMode(CENTER);
      image(lightningImg, 
        lightnings[i].x, 
       lightnings[i].y, 
        lightnings[i].w, 
        lightnings[i].h );
  }
}


function drawHUD (){
  stroke("#000000ff");
  fill(0,0,0,100);
  rect(width / 2,25,width,50);
  fill("#db7f06ff");
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`Tiempo: ${elapsedTime.toFixed(2)} s`, 15, 24);
  text(`Velocidad: ${currentSpeed.toFixed(1)}`, 140, 24);
  text(`Golpes de Pajaro: ${birdHits}/4`, 250, 24);
  text(`Rayos: ${lightningHits}/2`, 415, 24);
  text(`Aceleracion: ${boostTimer > 0 ? "ON" : "OFF"}`, 500, 24);
  const progress = constrain(distanceTravelled/finishDistance,0,1);
  text(`Progreso: ${Math.floor(progress*100)}%`, 640, 24);
  textAlign(CENTER , CENTER);
  if (isStormPhase) {
    fill("#090de0ff");
    textSize(16);
    text("TORMENTA!", width / 2, 52);
  }
}

function drawCloudBlindEffect(){
 if(cloudBlindTimer > 0){
    const fogHeight = height;
    const ctx = drawingContext;
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, 0, fogHeight);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.82)");
    gradient.addColorStop(0.55, "rgba(238, 240, 248, 0.72)");
    gradient.addColorStop(1, "rgba(225, 230, 242, 0.5)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, fogHeight);
    ctx.restore();
 } 
}

function drawEndScreen(isWin){
  imageMode(CORNER);
  image(fondoFinImg, 0, 0, width, height);
  imageMode(CENTER);

  if (!isWin) {
    image(gameOverImg, width / 2, 95, 320, 100);
  }
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text(isWin ? "volaste muy bien gracias!" : "morimos eres malisimo no vuelvas a volarx!", width / 2, isWin ? 120 : 165);
  
  textSize(18);
  text(`Tu tiempo: ${elapsedTime.toFixed(2)} s`, width / 2, isWin ? 165 : 210);

  textSize(16);
  text("Top 3 best times:", width / 2, isWin ? 220 : 255);
  for (let i = 0; i < 3; i++) {
    const t = bestTimes[i];
    const line = t !== undefined ? `${i + 1}. ${t.toFixed(2)} s` : `${i + 1}. ---`;
    text(line, width / 2, (isWin ? 250 : 285) + i * 28);
  }

  
  textSize(14);
  textAlign(LEFT, CENTER);
  const restartLabel = "Presiona R para jugar de nuevo";
  const iconSize = 40;
  const gap = 10;
  const labelW = textWidth(restartLabel);
  const startX = width / 2 - (iconSize + gap + labelW) / 2;
  imageMode(CENTER);
  image(restartImg, startX + iconSize / 2, 360, iconSize, iconSize);
  fill(255);
  text(restartLabel, startX + iconSize + gap, 360);
  textAlign(CENTER, CENTER);
  text("presiona C para volver a elegir tu avion", width / 2, 420);
}


function isCollidingRect(a,b){
  return(
    abs(a.x - b.x) * 2 < a.w + b.w &&
    abs(a.y - b.y) * 2 < a.w + b.w 
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


function setGameOver() {
  if (gameState === GAME_STATE.GAME_OVER) return;
  gameState = GAME_STATE.GAME_OVER;
  //dieSound.play();
}


function startNewGame (){
  createPlayer();
  
  distanceTravelled = 0 ;
  startTime = millis();
  elapsedTime = 0;

  currentSpeed = baseSpeed;
  speedPenaltyTimer = 0;
  boostTimer = 0;

  birdHits = 0;
  lightningHits = 0
  isStormPhase = false

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


function loadBestTimes() {
 const raw = localStorage.getItem(bestTimesStorageKey);
 if(!raw){
  bestTimes = [];
  return;
 }
 try{
  const parsed = JSON.parse(raw);
  if(Array.isArray(parsed)){
    bestTimes = parsed.filter((x)=> typeof x === "number").sort((a, b) => a - b).slice(0,3);
  }else{
    bestTimes = [];
  }
 }catch(_err){
  bestTimes = [];
 }
}

function saveBestTime (timeValue){
  bestTimes.push(timeValue);
  bestTimes.sort((a,b) => a - b);
  bestTimes = bestTimes.slice(0, 3);
  localStorage.setItem(bestTimesStorageKey, JSON.stringify(bestTimes));
}