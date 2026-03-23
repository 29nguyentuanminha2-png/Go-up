import { ball, obstacles, state } from "./state.js";
import { triggerGameOver, triggerNearMiss } from "./effects.js";

export function checkCollisions() {
  if (!state.obstaclesActive) return;
  for (const spike of obstacles.spikes) {
    const nearDist = distanceToTriangle(ball.x, ball.y, spike);
    if (nearDist < ball.r + 6 && nearDist > ball.r + 2) {
      triggerNearMiss();
    }
    if (nearDist < ball.r + 2) {
      triggerGameOver();
      return;
    }
  }

  for (const bar of obstacles.bars) {
    const half = bar.len * 0.5;
    const ax = bar.x + Math.cos(bar.angle) * half;
    const ay = bar.y + Math.sin(bar.angle) * half;
    const bx = bar.x - Math.cos(bar.angle) * half;
    const by = bar.y - Math.sin(bar.angle) * half;
    const dist = distanceToSegment(ball.x, ball.y, ax, ay, bx, by);
    if (dist < ball.r + 6 && dist > ball.r + bar.thickness * 0.5) {
      triggerNearMiss();
    }
    if (dist < ball.r + bar.thickness * 0.5) {
      triggerGameOver();
      return;
    }
  }

  for (const obj of obstacles.falling) {
    const dx = ball.x - obj.x;
    const dy = ball.y - obj.y;
    const dist = Math.hypot(dx, dy);
    if (dist < ball.r + 6 && dist > ball.r + obj.r) {
      triggerNearMiss();
    }
    if (dist < ball.r + obj.r) {
      triggerGameOver();
      return;
    }
  }

  if (state.boss) {
    const dx = ball.x - state.boss.x;
    const dy = ball.y - state.boss.y;
    const dist = Math.hypot(dx, dy);
    if (dist < ball.r + 6 && dist > ball.r + state.boss.r) {
      triggerNearMiss();
    }
    if (dist < ball.r + state.boss.r) {
      triggerGameOver();
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
