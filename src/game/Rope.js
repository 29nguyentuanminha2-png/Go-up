export function updateRope(state, dt) {
  const rope = state.rope;
  if (!rope.segments.length) return;

  const gravity = -600;
  const damping = 0.98;
  const wind = Math.sin(state.time * 0.001) * 20;
  const dt2 = dt * dt;

  for (const seg of rope.segments) {
    const vx = (seg.x - seg.px) * damping;
    const vy = (seg.y - seg.py) * damping;
    seg.px = seg.x;
    seg.py = seg.y;
    seg.x += vx + wind * dt;
    seg.y += vy + gravity * dt2;
  }

  const iterations = 5;
  for (let it = 0; it < iterations; it += 1) {
    if (!rope.dead) {
      const anchorX = state.balloon.x;
      const anchorY = state.balloon.y - state.balloon.r;
      rope.segments[0].x = anchorX;
      rope.segments[0].y = anchorY;
    }

    for (let i = 1; i < rope.segments.length; i += 1) {
      const a = rope.segments[i - 1];
      const b = rope.segments[i];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const diff = (dist - rope.segmentLength) / dist;
      const offsetX = dx * diff * 0.5;
      const offsetY = dy * diff * 0.5;
      a.x += offsetX;
      a.y += offsetY;
      b.x -= offsetX;
      b.y -= offsetY;
    }
  }

  if (!rope.dead) {
    const clampY = state.balloon.y - state.balloon.r;
    for (const seg of rope.segments) {
      if (seg.y > clampY) seg.y = clampY;
    }
  }

  if (rope.dead) {
    rope.deadTimer -= dt;
    if (rope.deadTimer <= 0) {
      rope.segments.length = 0;
    }
  }
}
