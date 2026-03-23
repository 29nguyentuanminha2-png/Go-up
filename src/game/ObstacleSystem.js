export class ObstacleSystem {
  update(state, dt) {
    const obs = state.obstacles;
    if (state.timeAlive < state.timings.obstacleDelay) {
      obs.active = false;
      obs.spawnTimer = 0;
    } else {
      obs.active = true;
    }

    if (obs.active && obs.spawningActive) {
      obs.spawnTimer += dt;
      while (obs.spawnTimer >= obs.spawnInterval) {
        obs.spawnTimer -= obs.spawnInterval;
        this.spawnObstacle(state);
      }
    }

    this.updateSpikes(state, dt);
    this.updateBars(state, dt);
    this.updateFalling(state, dt);

    this.cleanup(state);
    this.updateBoss(state, dt);
    this.updateFinishLine(state);
  }

  spawnObstacle(state) {
    const obs = state.obstacles;
    const width = state.viewport.width;
    const laneWidth = Math.max(240, width * 0.4);
    const introFactor = Math.min(1, state.timeAlive / state.config.introDuration);
    const gapScale = state.settings.difficulty === "easy" ? 1.12 : state.settings.difficulty === "hard" ? 0.92 : 1;
    const baseSpawnY = state.camera.y + state.viewport.height + (280 + Math.random() * 320);
    const spawnY = Math.max(baseSpawnY, obs.lastSpawnY + state.config.minGroupSpacing);
    obs.lastSpawnY = spawnY;
    const speed = -(obs.speed + state.env.difficulty * 20);
    const safeGap =
      (state.balloon.r * 3 + (1 - state.env.difficulty) * state.balloon.r * 1.5) * state.config.safeGapScale * gapScale;
    const padding = 8;
    const leftBound = 70;
    const rightBound = width - 70;

    const gapCenter = leftBound + safeGap * 0.5 + Math.random() * (rightBound - leftBound - safeGap);
    const leftX = Math.max(leftBound, gapCenter - safeGap * 0.5 - 40 - padding);
    const rightX = Math.min(rightBound, gapCenter + safeGap * 0.5 + 40 + padding);

    let roll = Math.random();
    if (state.env.index === 0) roll *= 0.6;
    if (state.env.index === 1) roll *= 0.85;

    if (roll < 0.3) {
      obs.spikes.push({ x: leftX, y: spawnY, w: 70, h: 60, vy: speed });
      obs.spikes.push({ x: rightX, y: spawnY, w: 70, h: 60, vy: speed });
      obs.lastY = Math.max(obs.lastY, spawnY);
    } else if (roll < 0.55) {
      obs.bars.push({
        x: leftX,
        y: spawnY,
        len: 160,
        angle: Math.random() * Math.PI,
        speed: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.6),
        thickness: 14,
        vy: speed,
        spikeBar: true,
      });
      obs.bars.push({
        x: rightX,
        y: spawnY,
        len: 160,
        angle: Math.random() * Math.PI,
        speed: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.6),
        thickness: 14,
        vy: speed,
        spikeBar: true,
      });
      obs.lastY = Math.max(obs.lastY, spawnY);
    } else {
      const wallGap = safeGap + 20;
      const wallLeft = Math.max(leftBound, gapCenter - wallGap * 0.5 - laneWidth * 0.25);
      const wallRight = Math.min(rightBound, gapCenter + wallGap * 0.5 + laneWidth * 0.25);
      const amp = 22 + state.env.difficulty * 18;
      obs.bars.push({
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
      obs.bars.push({
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
      obs.lastY = Math.max(obs.lastY, spawnY);
    }

    if (Math.random() < (0.2 + introFactor * 0.35)) {
      const sideX = Math.random() < 0.5 ? leftX : rightX;
      if (Math.random() < 0.5 || state.env.index === 0) {
        obs.spikes.push({ x: sideX, y: spawnY + state.config.extraObstacleOffsetY, w: 60, h: 50, vy: speed });
        obs.lastY = Math.max(obs.lastY, spawnY + state.config.extraObstacleOffsetY);
      } else {
        obs.bars.push({
          x: sideX,
          y: spawnY + state.config.extraObstacleOffsetY,
          len: 140,
          angle: Math.random() * Math.PI,
          speed: (Math.random() < 0.5 ? 1 : -1) * (1.0 + Math.random() * 0.7),
          thickness: 12,
          vy: speed,
          pipe: true,
        });
        obs.lastY = Math.max(obs.lastY, spawnY + state.config.extraObstacleOffsetY);
      }
    }

    if (state.env.index >= 1 && Math.random() < (0.25 + introFactor * 0.35)) {
      this.spawnFalling(state);
    }
  }

  spawnFalling(state) {
    const obs = state.obstacles;
    const x = 60 + Math.random() * (state.viewport.width - 120);
    const y = state.camera.y + state.viewport.height + (200 + Math.random() * 200);
    obs.falling.push({
      x,
      y,
      r: 18 + Math.random() * 10,
      vy: -(obs.speed + 40 + Math.random() * 60),
      shape: state.env.index >= 1 ? "block" : "orb",
    });
    obs.lastY = Math.max(obs.lastY, y);
  }

  updateSpikes(state, dt) {
    for (const spike of state.obstacles.spikes) {
      spike.y += spike.vy * dt;
    }
  }

  updateBars(state, dt) {
    for (const bar of state.obstacles.bars) {
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

  updateFalling(state, dt) {
    const falling = state.obstacles.falling;
    for (let i = falling.length - 1; i >= 0; i -= 1) {
      const obj = falling[i];
      obj.y += obj.vy * dt;
      if (obj.y < state.camera.y - 200) {
        falling.splice(i, 1);
      }
    }
  }

  cleanup(state) {
    const obs = state.obstacles;
    for (let i = obs.spikes.length - 1; i >= 0; i -= 1) {
      if (obs.spikes[i].y < state.camera.y - 240) obs.spikes.splice(i, 1);
    }
    for (let i = obs.bars.length - 1; i >= 0; i -= 1) {
      if (obs.bars[i].y < state.camera.y - 240) obs.bars.splice(i, 1);
    }
  }

  updateBoss(state, dt) {
    const obs = state.obstacles;
    if (!state.endless && !obs.bossSpawned && state.balloon.y >= state.levelHeight - state.config.bossSpawnOffset) {
      obs.bossSpawned = true;
      obs.boss = {
        x: state.viewport.width * 0.5,
        y: state.levelHeight - 420,
        r: 90,
        angle: 0,
        speed: 1.6,
      };
    }
    if (obs.boss) {
      obs.boss.angle += obs.boss.speed * dt;
      obs.lastY = Math.max(obs.lastY, obs.boss.y + obs.boss.r);
    }
  }

  updateFinishLine(state) {
    const obs = state.obstacles;
    if (!state.endless && !obs.finishLine && !obs.spawningActive && state.balloon.y > obs.lastY + state.config.finishMargin) {
      obs.finishLineY = Math.max(state.levelHeight, obs.lastY + state.config.finishSpawnOffset);
      obs.finishLine = true;
    }
  }
}
