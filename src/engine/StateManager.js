const DEFAULT_CONFIG = {
  cameraOffset: 250,
  slowScale: 1,
  dtCap: 0.033,
  obstacleDelay: 2,
  ropeSegmentCount: 3,
  ropeLengthFactor: 2.2,
  balloonRadius: 16,
  followStrength: 324,
  damping: 0.87,
  maxSpeed: 300,
  targetYOffset: 84,
  dangerChaseBase: 0.04,
  dangerChaseScale: 0.03,
  dangerOffsetBase: 160,
  dangerOffsetScale: 20,
  dangerClampOffset: 80,
  bossSpawnOffset: 900,
  finishMargin: 260,
  finishSpawnOffset: 360,
  levelHeight: 9000,
  spawnStopOffset: 700,
  introDuration: 8,
  baseSpawnInterval: 0.75,
  minGroupSpacing: 280,
  safeGapScale: 1.25,
  extraObstacleOffsetY: 90,
};

export function loadHighScore() {
  const raw = window.localStorage.getItem("go-up-highscore");
  const score = raw ? Number(raw) : 0;
  return Number.isFinite(score) ? score : 0;
}

export function saveHighScore(score) {
  window.localStorage.setItem("go-up-highscore", String(Math.floor(score)));
}

export function loadSettings() {
  const raw = window.localStorage.getItem("go-up-settings");
  let parsed = {};
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    parsed = {};
  }
  return {
    balloonColor: parsed.balloonColor || "#ff4d4d",
    gameSpeed: parsed.gameSpeed || 1,
    difficulty: parsed.difficulty || "normal",
    playerName: "meuu",
  };
}

export function saveSettings(settings) {
  window.localStorage.setItem(
    "go-up-settings",
    JSON.stringify({
      balloonColor: settings.balloonColor,
      gameSpeed: settings.gameSpeed,
      difficulty: settings.difficulty,
    })
  );
}

export function loadLeaderboard() {
  const raw = window.localStorage.getItem("go-up-leaderboard");
  let parsed = [];
  try {
    parsed = raw ? JSON.parse(raw) : [];
  } catch {
    parsed = [];
  }
  return Array.isArray(parsed) ? parsed : [];
}

export function saveLeaderboardEntry(entry) {
  const board = loadLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const trimmed = board.slice(0, 10);
  window.localStorage.setItem("go-up-leaderboard", JSON.stringify(trimmed));
  return trimmed;
}

function createBalloon(width) {
  return {
    x: width * 0.5,
    y: 0,
    vx: 0,
    vy: 0,
    r: DEFAULT_CONFIG.balloonRadius,
    wobble: 0,
    wobbleV: 0,
    microBounce: 0,
    lastVx: 0,
    alive: true,
  };
}

function createRope(balloon) {
  const totalLength = balloon.r * DEFAULT_CONFIG.ropeLengthFactor;
  const count = DEFAULT_CONFIG.ropeSegmentCount;
  const segmentLength = totalLength / count;
  const segments = [];
  for (let i = 0; i < count; i += 1) {
    const y = balloon.y - segmentLength * (i + 1);
    segments.push({
      x: balloon.x,
      y,
      px: balloon.x,
      py: y,
    });
  }
  return {
    segments,
    count,
    segmentLength,
    totalLength,
    dead: false,
    deadTimer: 0,
  };
}

function createObstacles(levelHeight) {
  return {
    spikes: [],
    bars: [],
    falling: [],
    spawnTimer: 0,
    spawnInterval: DEFAULT_CONFIG.baseSpawnInterval,
    speed: 55,
    active: false,
    lastY: 0,
    lastSpawnY: 0,
    spawnStopY: levelHeight - DEFAULT_CONFIG.spawnStopOffset,
    spawningActive: true,
    boss: null,
    bossSpawned: false,
    finishLine: false,
    finishLineY: levelHeight,
  };
}

function createBackgroundState() {
  return {
    starLayers: [
      { speed: 0.2, stars: [] },
      { speed: 0.5, stars: [] },
      { speed: 0.9, stars: [] },
    ],
    clouds: [],
    skyParticles: [],
    factoryLights: [],
    shootingStars: [],
    planets: [],
    mountains: [],
  };
}

export function createInitialState({ width, height, mode = "TITLE" }) {
  const balloon = createBalloon(width);
  const rope = createRope(balloon);
  const levelHeight = DEFAULT_CONFIG.levelHeight;
  const highScore = loadHighScore();
  const settings = loadSettings();
  const leaderboard = loadLeaderboard();

  const state = {
    config: { ...DEFAULT_CONFIG },
    mode,
    time: 0,
    timeAlive: 0,
    level: 1,
    levelHeight,
    endless: false,
    camera: {
      x: 0,
      y: 0,
      shakeTime: 0,
      shakeMag: 0,
      tilt: 0,
    },
    input: {
      x: width * 0.5,
      y: height * 0.5,
      active: false,
    },
    viewport: {
      width,
      height,
    },
    balloon,
    rope,
    obstacles: createObstacles(levelHeight),
    particles: {
      particles: [],
      sparks: [],
      shards: [],
      shockwaves: [],
      danger: [],
    },
    score: 0,
    combo: 0,
    comboTimer: 0,
    highScore,
    lastScoreY: 0,
    highestY: 0,
    perfectRun: true,
    effects: {
      slowTime: 0,
      flashTime: 0,
      nearMissTimer: 0,
      nearMissCooldown: 0,
      zoomTime: 0,
      deathTimer: 0,
    },
    timings: {
      levelStartTime: 0,
      obstacleDelay: DEFAULT_CONFIG.obstacleDelay,
      gameOverDelay: 1.0,
    },
    env: {
      index: 0,
      progress: 0,
      difficulty: 0,
    },
    danger: {
      y: balloon.y - 140,
    },
    background: createBackgroundState(),
    settings,
    leaderboard,
    scoreSubmitted: false,
  };

  if (mode === "PLAYING") {
    state.mode = "PLAYING";
    state.timings.levelStartTime = performance.now();
    state.time = 0;
    state.timeAlive = 0;
    state.highestY = balloon.y;
    state.lastScoreY = balloon.y;
  }
  if (mode === "TITLE") {
    state.balloon.alive = false;
    state.rope.segments.length = 0;
  }

  return state;
}
