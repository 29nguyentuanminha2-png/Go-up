import { ball, state, dangerParticles } from "./state.js";
import { spawnExplosion, spawnSparks, spawnShards, spawnShockwave } from "./particles.js";

export function triggerNearMiss() {
  if (state.nearMissCooldown > 0) return;
  state.nearMissCooldown = 0.4;
  state.nearMissTimer = 0.25;
  state.flashTime = Math.max(state.flashTime, 0.22);
  state.zoomTime = Math.max(state.zoomTime, 0.18);
  state.shakeTime = Math.max(state.shakeTime, 0.12);
  state.shakeMag = Math.max(state.shakeMag, 4);
  state.slowTime = Math.max(state.slowTime, 0.12);
  state.combo += 1;
  state.comboTimer = 1.2;
  state.perfectRun = false;
  state.score += 80 * (1 + state.combo * 0.2);
  spawnSparks(ball.x, ball.y);
  spawnShockwave(ball.x, ball.y);
}

export function triggerGameOver() {
  if (state.gameOverTimer > 0) return;
  state.mode = "dead";
  state.shakeTime = 0.35;
  state.shakeMag = 10;
  state.flashTime = 0.3;
  state.slowTime = 0.15;
  state.perfectRun = false;
  spawnExplosion(ball.x, ball.y);
  spawnSparks(ball.x, ball.y);
  spawnShards(ball.x, ball.y);
  spawnShockwave(ball.x, ball.y);
  state.ropeDeadTimer = 1.0;
  state.deathPause = 0;
  state.gameOverTimer = -1;
}

export function triggerVictory() {
  state.mode = "victory";
  if (state.perfectRun) {
    state.score += 500;
  }
}

export function updateDangerFloor(dt) {
  const chase = 0.04 + state.difficulty * 0.03;
  const targetDangerY = ball.y - (160 - state.difficulty * 20);
  state.dangerFloorY += (targetDangerY - state.dangerFloorY) * chase * dt * 60;
  if (state.dangerFloorY > ball.y - 80) {
    state.dangerFloorY = ball.y - 80;
  }
  if (Math.random() < 0.6 * dt * 60) {
    dangerParticles.push({
      x: Math.random() * window.innerWidth,
      y: state.dangerFloorY,
      vy: 30 + Math.random() * 40,
      life: 0.6 + Math.random() * 0.4,
    });
  }
  if (ball.y - ball.r <= state.dangerFloorY) {
    triggerGameOver();
  }
}
