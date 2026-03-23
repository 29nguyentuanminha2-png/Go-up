export class CollisionSystem {
  constructor(explosionSystem, comboSystem) {
    this.explosionSystem = explosionSystem;
    this.comboSystem = comboSystem;
  }

  update(state) {
    if (!state.obstacles.active || state.mode !== "PLAYING") return;
    const ball = state.balloon;
    const obs = state.obstacles;
    const nearMissOuter = ball.r + 8;
    const spikeHit = ball.r + 1;

    for (const spike of obs.spikes) {
      const nearDist = distanceToTriangle(ball.x, ball.y, spike);
      if (nearDist < nearMissOuter && nearDist > spikeHit) {
        this.comboSystem.triggerNearMiss(state, this.explosionSystem.particles);
      }
      if (nearDist < spikeHit) {
        this.explosionSystem.trigger(state);
        return;
      }
    }

    for (const bar of obs.bars) {
      const half = bar.len * 0.5;
      const ax = bar.x + Math.cos(bar.angle) * half;
      const ay = bar.y + Math.sin(bar.angle) * half;
      const bx = bar.x - Math.cos(bar.angle) * half;
      const by = bar.y - Math.sin(bar.angle) * half;
      const dist = distanceToSegment(ball.x, ball.y, ax, ay, bx, by);
      const hitThreshold = ball.r + Math.max(2, bar.thickness * 0.5 - 2);
      if (dist < nearMissOuter && dist > hitThreshold) {
        this.comboSystem.triggerNearMiss(state, this.explosionSystem.particles);
      }
      if (dist < hitThreshold) {
        this.explosionSystem.trigger(state);
        return;
      }
    }

    for (const obj of obs.falling) {
      const dx = ball.x - obj.x;
      const dy = ball.y - obj.y;
      const dist = Math.hypot(dx, dy);
      const hitThreshold = ball.r + Math.max(4, obj.r - 2);
      if (dist < nearMissOuter + obj.r * 0.2 && dist > hitThreshold) {
        this.comboSystem.triggerNearMiss(state, this.explosionSystem.particles);
      }
      if (dist < hitThreshold) {
        this.explosionSystem.trigger(state);
        return;
      }
    }

    if (obs.boss) {
      const dx = ball.x - obs.boss.x;
      const dy = ball.y - obs.boss.y;
      const dist = Math.hypot(dx, dy);
      const hitThreshold = ball.r + obs.boss.r - 4;
      if (dist < ball.r + obs.boss.r + 8 && dist > hitThreshold) {
        this.comboSystem.triggerNearMiss(state, this.explosionSystem.particles);
      }
      if (dist < hitThreshold) {
        this.explosionSystem.trigger(state);
        return;
      }
    }

    if (ball.y - ball.r <= state.danger.y) {
      this.explosionSystem.trigger(state);
    }
  }
}

function distanceToTriangle(cx, cy, tri) {
  const half = tri.w * 0.5;
  const p1 = { x: tri.x, y: tri.y + tri.h };
  const p2 = { x: tri.x - half, y: tri.y };
  const p3 = { x: tri.x + half, y: tri.y };
  const d1 = distanceToSegment(cx, cy, p1.x, p1.y, p2.x, p2.y);
  const d2 = distanceToSegment(cx, cy, p2.x, p2.y, p3.x, p3.y);
  const d3 = distanceToSegment(cx, cy, p3.x, p3.y, p1.x, p1.y);
  return Math.min(d1, d2, d3);
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const c1 = vx * wx + vy * wy;
  if (c1 <= 0) return Math.hypot(px - ax, py - ay);
  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return Math.hypot(px - bx, py - by);
  const t = c1 / c2;
  const projX = ax + t * vx;
  const projY = ay + t * vy;
  return Math.hypot(px - projX, py - projY);
}
