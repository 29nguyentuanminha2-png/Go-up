import { ball, rope, state } from "./state.js";

export function updateRope(dt) {
  const gravity = -6600;
  const damping = 0.95;
  const windForce = Math.sin(state.time * 0.001) * 6;
  const tension = Math.min(0.6, Math.hypot(ball.vx, ball.vy) * 0.0013);

  for (const seg of rope.segments) {
    seg.vy += gravity * dt;
    seg.vx += windForce * dt + ball.vx * 0.015 * dt;
    const damp = Math.pow(damping - tension * 0.08, dt * 60);
    seg.vx *= damp;
    seg.vy *= damp;
    seg.x += seg.vx * dt;
    seg.y += seg.vy * dt;
  }

  const iterations = 5;
  for (let it = 0; it < iterations; it += 1) {
    if (state.ropeDeadTimer <= 0) {
      const anchorX = ball.x;
      const anchorY = ball.y - ball.r;
      const first = rope.segments[0];
      applyConstraintAnchor(anchorX, anchorY, first);
    }

    for (let i = 1; i < rope.segments.length; i += 1) {
      const a = rope.segments[i - 1];
      const b = rope.segments[i];
      applyConstraintPair(a, b);
    }
  }

  for (const seg of rope.segments) {
    if (state.ropeDeadTimer <= 0) {
      if (seg.y > ball.y - ball.r) {
        seg.y = ball.y - ball.r;
      }
    }
    const dx = seg.x - seg.prevX;
    const dy = seg.y - seg.prevY;
    const invDt = dt > 0 ? 1 / dt : 0;
    seg.vx = dx * invDt * 0.9 + seg.vx * 0.1;
    seg.vy = dy * invDt * 0.9 + seg.vy * 0.1;
    seg.prevX = seg.x;
    seg.prevY = seg.y;
  }

  if (state.ropeDeadTimer > 0) {
    state.ropeDeadTimer -= dt;
    if (state.ropeDeadTimer <= 0) {
      rope.segments = [];
    }
  }
}

function applyConstraintAnchor(ax, ay, seg) {
  const dx = seg.x - ax;
  const dy = seg.y - ay;
  const dist = Math.hypot(dx, dy) || 0.0001;
  const diff = (dist - rope.length) / dist;
  seg.x -= dx * diff;
  seg.y -= dy * diff;
}

function applyConstraintPair(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 0.0001;
  const diff = (dist - rope.length) / dist;
  const offsetX = dx * diff * 0.5;
  const offsetY = dy * diff * 0.5;
  a.x += offsetX;
  a.y += offsetY;
  b.x -= offsetX;
  b.y -= offsetY;
}
