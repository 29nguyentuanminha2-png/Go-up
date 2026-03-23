import { state, ball, obstacles } from "./state.js";

export function spawnFalling() {
  const x = 60 + Math.random() * (window.innerWidth - 120);
  const y = state.cameraY + window.innerHeight + (200 + Math.random() * 200);
  obstacles.falling.push({
    x,
    y,
    r: 18 + Math.random() * 10,
    vy: -(state.obstacleSpeed + 40 + Math.random() * 60),
    shape: state.envIndex >= 1 ? "block" : "orb",
  });
  state.lastObstacleY = Math.max(state.lastObstacleY, y);
}

export function spawnObstacle() {
  const laneWidth = Math.max(240, window.innerWidth * 0.4);
  const centerX = window.innerWidth * 0.5;
  const spawnY = state.cameraY + window.innerHeight + (220 + Math.random() * 260);
  const speed = -(state.obstacleSpeed + state.difficulty * 20);
  const safeGap = ball.r * 3 + (1 - state.difficulty) * ball.r * 1.5;
  const padding = 8;
  const leftBound = 70;
  const rightBound = window.innerWidth - 70;

  const gapCenter = leftBound + safeGap * 0.5 + Math.random() * (rightBound - leftBound - safeGap);
  const leftX = Math.max(leftBound, gapCenter - safeGap * 0.5 - 40 - padding);
  const rightX = Math.min(rightBound, gapCenter + safeGap * 0.5 + 40 + padding);

  let roll = Math.random();
  if (state.envIndex === 0) roll *= 0.6;
  if (state.envIndex === 1) roll *= 0.85;

  if (roll < 0.3) {
    obstacles.spikes.push({ x: leftX, y: spawnY, w: 70, h: 60, vy: speed });
    obstacles.spikes.push({ x: rightX, y: spawnY, w: 70, h: 60, vy: speed });
    state.lastObstacleY = Math.max(state.lastObstacleY, spawnY);
  } else if (roll < 0.55) {
    obstacles.bars.push({
      x: leftX,
      y: spawnY,
      len: 160,
      angle: Math.random() * Math.PI,
      speed: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.6),
      thickness: 14,
      vy: speed,
      spikeBar: true,
    });
    obstacles.bars.push({
      x: rightX,
      y: spawnY,
      len: 160,
      angle: Math.random() * Math.PI,
      speed: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.6),
      thickness: 14,
      vy: speed,
      spikeBar: true,
    });
    state.lastObstacleY = Math.max(state.lastObstacleY, spawnY);
  } else {
    const wallGap = safeGap + 20;
    const wallLeft = Math.max(leftBound, gapCenter - wallGap * 0.5 - laneWidth * 0.25);
    const wallRight = Math.min(rightBound, gapCenter + wallGap * 0.5 + laneWidth * 0.25);
    const amp = 22 + state.difficulty * 18;
    obstacles.bars.push({
      x: wallLeft,
      y: spawnY,
      len: laneWidth * 0.6,
      angle: Math.PI / 2,
      speed: 0,
      thickness: 18,
      vy: speed,
      wall: true,
      baseX: wallLeft,
      zigzag: true,
      amp,
      phase: Math.random() * Math.PI * 2,
    });
    obstacles.bars.push({
      x: wallRight,
      y: spawnY,
      len: laneWidth * 0.6,
      angle: Math.PI / 2,
      speed: 0,
      thickness: 18,
      vy: speed,
      wall: true,
      baseX: wallRight,
      zigzag: true,
      amp,
      phase: Math.random() * Math.PI * 2,
    });
    state.lastObstacleY = Math.max(state.lastObstacleY, spawnY);
  }

  if (Math.random() < 0.55) {
    const sideX = Math.random() < 0.5 ? leftX : rightX;
    if (Math.random() < 0.5 || state.envIndex === 0) {
      obstacles.spikes.push({ x: sideX, y: spawnY + 40, w: 60, h: 50, vy: speed });
      state.lastObstacleY = Math.max(state.lastObstacleY, spawnY + 40);
    } else {
      obstacles.bars.push({
        x: sideX,
        y: spawnY + 40,
        len: 140,
        angle: Math.random() * Math.PI,
        speed: (Math.random() < 0.5 ? 1 : -1) * (1.0 + Math.random() * 0.7),
        thickness: 12,
        vy: speed,
        pipe: true,
      });
      state.lastObstacleY = Math.max(state.lastObstacleY, spawnY + 40);
    }
  }

  if (state.envIndex >= 1 && Math.random() < 0.6) {
    spawnFalling();
  }
}

export function updateBars(dt) {
  for (const bar of obstacles.bars) {
    bar.angle += bar.speed * dt;
    bar.y += bar.vy * dt;
    if (bar.wall) {
      const wiggle = bar.zigzag ? bar.amp : 18;
      bar.x = bar.baseX + Math.sin(state.time * 0.002 + bar.y * 0.01 + (bar.phase || 0)) * wiggle;
      bar.angle = Math.PI / 2;
    }
    if (bar.pipe) {
      bar.angle += bar.speed * dt * 0.6;
    }
  }
}

export function updateSpikes(dt) {
  for (const spike of obstacles.spikes) {
    spike.y += spike.vy * dt;
  }
}

export function updateFalling(dt) {
  for (let i = obstacles.falling.length - 1; i >= 0; i -= 1) {
    const obj = obstacles.falling[i];
    obj.y += obj.vy * dt;
    if (obj.y < state.cameraY - 200) {
      obstacles.falling.splice(i, 1);
    }
  }
}

export function getLastObstacleY() {
  let maxY = 0;
  for (const spike of obstacles.spikes) maxY = Math.max(maxY, spike.y);
  for (const bar of obstacles.bars) maxY = Math.max(maxY, bar.y);
  for (const obj of obstacles.falling) maxY = Math.max(maxY, obj.y);
  if (state.boss) maxY = Math.max(maxY, state.boss.y + state.boss.r);
  return maxY;
}

export function updateObstacles(dt) {
  if (!state.obstaclesActive) return;
  updateSpikes(dt);
  updateBars(dt);
  updateFalling(dt);

  for (let i = obstacles.spikes.length - 1; i >= 0; i -= 1) {
    if (obstacles.spikes[i].y < state.cameraY - 240) {
      obstacles.spikes.splice(i, 1);
    }
  }
  for (let i = obstacles.bars.length - 1; i >= 0; i -= 1) {
    if (obstacles.bars[i].y < state.cameraY - 240) {
      obstacles.bars.splice(i, 1);
    }
  }

  if (!state.endless && !state.bossSpawned && ball.y >= state.levelHeight - 900) {
    state.bossSpawned = true;
    state.boss = {
      x: window.innerWidth * 0.5,
      y: state.levelHeight - 420,
      r: 90,
      angle: 0,
      speed: 1.6,
    };
  }

  if (state.boss) {
    state.boss.angle += state.boss.speed * dt;
    const lastObsY = getLastObstacleY();
    state.lastObstacleY = Math.max(state.lastObstacleY, lastObsY);
  }

  if (!state.endless && !state.finishLine && !state.spawningActive && ball.y > state.lastObstacleY + 260) {
    state.finishLineY = Math.max(state.levelHeight, state.lastObstacleY + 360);
    state.finishLine = true;
  }
}
