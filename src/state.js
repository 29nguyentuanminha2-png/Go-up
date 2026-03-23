export const colors = {
  ball: "#39f3ff",
  ballCore: "#d8feff",
  rope: "#5fe6ff",
  spike: "#ff4cff",
  bar: "#5aff8a",
  fall: "#ffd13a",
};

export const state = {
  mode: "start", // start | playing | dead | gameover | restarting | victory
  level: 1,
  levelHeight: 9000,
  time: 0,
  timeAlive: 0,
  cameraY: 0,
  cameraX: 0,
  highestY: 0,
  autoScrollSpeed: 1.8,
  obstacleDelay: 2,
  levelStartTime: 0,
  obstaclesActive: false,
  spawnInterval: 0.5,
  spawnTimer: 0,
  obstacleSpeed: 55,
  dangerFloorY: 0,
  dangerSpeed: 0.3,
  score: 0,
  combo: 0,
  comboTimer: 0,
  highScore: 0,
  lastScoreY: 0,
  lastObstacleY: 0,
  endless: false,
  boss: null,
  bossSpawned: false,
  finishLine: false,
  finishLineY: 0,
  spawningActive: true,
  spawnStopY: 0,
  envIndex: 0,
  envProgress: 0,
  difficulty: 0,
  perfectRun: true,
  slowTime: 0,
  flashTime: 0,
  nearMissCooldown: 0,
  zoomTime: 0,
  gameOverTimer: 0,
  nearMissTimer: 0,
  ropeDeadTimer: 0,
  deathPause: 0,
  shakeTime: 0,
  shakeMag: 0,
};

export const input = {
  x: 0,
  y: 0,
  active: false,
};

export const ball = {
  x: 0,
  y: 0,
  r: 16,
  vx: 0,
  vy: 0,
  wobble: 0,
  wobbleV: 0,
  microBounce: 0,
  lastVx: 0,
};

export const rope = {
  segments: [],
  count: 3,
  length: ball.r * 0.6,
  totalLength: 0,
};

export const obstacles = {
  spikes: [],
  bars: [],
  falling: [],
};

export const particles = [];
export const sparks = [];
export const shards = [];
export const shockwaves = [];
export const dangerParticles = [];

export const starLayers = [
  { speed: 0.2, stars: [] },
  { speed: 0.5, stars: [] },
  { speed: 0.9, stars: [] },
];

export const clouds = [];
export const factoryLights = [];
export const shootingStars = [];
export const skyParticles = [];
export const planets = [];

export function resetBall() {
  ball.x = window.innerWidth * 0.5;
  ball.y = 0;
  ball.vx = 0;
  ball.vy = 0;
  ball.wobble = 0;
  ball.wobbleV = 0;
  ball.microBounce = 0;
  ball.lastVx = 0;
}

export function initRope() {
  rope.segments = [];
  rope.totalLength = ball.r * 2.2;
  rope.length = rope.totalLength / rope.count;
  for (let i = 0; i < rope.count; i += 1) {
    rope.segments.push({
      x: ball.x,
      y: ball.y - rope.length * (i + 1),
      prevX: ball.x,
      prevY: ball.y - rope.length * (i + 1),
      vx: 0,
      vy: 0,
    });
  }
}

export function buildLevel(level) {
  obstacles.spikes = [];
  obstacles.bars = [];
  obstacles.falling = [];
  state.levelHeight = 9000;
  state.spawnStopY = state.levelHeight - 700;
  state.spawningActive = true;
}

export function startLevel() {
  particles.length = 0;
  sparks.length = 0;
  shards.length = 0;
  shockwaves.length = 0;
  dangerParticles.length = 0;
  rope.segments = [];
  obstacles.spikes = [];
  obstacles.bars = [];
  obstacles.falling = [];

  resetBall();
  initRope();
  buildLevel(state.level);
  state.time = 0;
  state.timeAlive = 0;
  state.levelStartTime = performance.now();
  state.cameraY = 0;
  state.spawnTimer = 0;
  state.obstaclesActive = false;
  state.dangerFloorY = ball.y - 140;
  state.highestY = ball.y;
  state.score = 0;
  state.combo = 0;
  state.comboTimer = 0;
  state.lastScoreY = ball.y;
  state.lastObstacleY = ball.y;
  state.perfectRun = true;
  state.boss = null;
  state.bossSpawned = false;
  state.finishLine = false;
  state.finishLineY = state.levelHeight;
  state.slowTime = 0;
  state.flashTime = 0;
  state.nearMissCooldown = 0;
  state.zoomTime = 0;
  state.gameOverTimer = 0;
  state.nearMissTimer = 0;
  state.ropeDeadTimer = 0;
  state.deathPause = 0;
  state.spawningActive = true;
  state.spawnTimer = 0;
  state.obstaclesActive = false;
  state.cameraX = 0;
  input.active = false;
  state.mode = "playing";
}

export function resetGame() {
  particles.length = 0;
  sparks.length = 0;
  shards.length = 0;
  shockwaves.length = 0;
  dangerParticles.length = 0;
  obstacles.spikes = [];
  obstacles.bars = [];
  obstacles.falling = [];
  rope.segments = [];

  state.level = 1;
  state.endless = false;
  state.mode = "restarting";
  state.gameOverTimer = 0;
  state.ropeDeadTimer = 0;
  state.deathPause = 0;
  state.nearMissCooldown = 0;
  state.nearMissTimer = 0;
  startLevel();
  state.mode = "playing";
}
