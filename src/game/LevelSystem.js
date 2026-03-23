export class LevelSystem {
  prepareLevel(state) {
    state.levelHeight = state.config.levelHeight;
    state.obstacles.spawnStopY = state.levelHeight - state.config.spawnStopOffset;
    state.obstacles.spawningActive = true;
    state.obstacles.spawnTimer = 0;
    state.obstacles.active = false;
    state.obstacles.lastY = state.balloon.y;
    state.obstacles.finishLine = false;
    state.obstacles.finishLineY = state.levelHeight;
    state.obstacles.boss = null;
    state.obstacles.bossSpawned = false;
  }

  update(state, dt) {
    state.env.progress = Math.min(1, state.highestY / state.levelHeight);
    if (state.env.progress < 0.34) state.env.index = 0;
    else if (state.env.progress < 0.67) state.env.index = 1;
    else state.env.index = 2;
    const introFactor = Math.min(1, state.timeAlive / state.config.introDuration);
    const difficultyMode =
      state.settings.difficulty === "easy" ? 0.82 : state.settings.difficulty === "hard" ? 1.18 : 1;
    const spawnBonus =
      state.settings.difficulty === "easy" ? 0.12 : state.settings.difficulty === "hard" ? -0.08 : 0;
    const speedScale =
      state.settings.difficulty === "easy" ? 0.88 : state.settings.difficulty === "hard" ? 1.08 : 1;

    state.env.difficulty = Math.min(1, (state.env.progress * 0.8 + state.timeAlive / 180) * difficultyMode);
    state.obstacles.spawnInterval = Math.max(0.55, state.config.baseSpawnInterval + spawnBonus - state.env.difficulty * 0.12);
    state.obstacles.speed = (50 + state.env.difficulty * 25) * (0.8 + introFactor * 0.2) * speedScale;

    if (!state.endless && state.highestY >= state.obstacles.spawnStopY) {
      state.obstacles.spawningActive = false;
    }

    if (!state.endless && state.obstacles.finishLine && state.balloon.y >= state.obstacles.finishLineY) {
      state.mode = "VICTORY";
    }
  }
}
