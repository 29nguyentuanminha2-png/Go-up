export function updateBalloon(state, dt) {
  const ball = state.balloon;
  if (!ball.alive) return;

  const targetX = state.input.active ? state.input.x : ball.x;
  const targetY = ball.y + state.config.targetYOffset;
  const ax = (targetX - ball.x) * state.config.followStrength;
  const ay = (targetY - ball.y) * state.config.followStrength;

  ball.vx += ax * dt;
  ball.vy += ay * dt;

  const damp = Math.pow(state.config.damping, dt * 60);
  ball.vx *= damp;
  ball.vy *= damp;

  const speed = Math.hypot(ball.vx, ball.vy);
  if (speed > state.config.maxSpeed) {
    const scale = state.config.maxSpeed / speed;
    ball.vx *= scale;
    ball.vy *= scale;
  }

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  const dirChange = ball.vx - ball.lastVx;
  ball.wobbleV += dirChange * 0.00085;
  ball.lastVx = ball.vx;
  ball.wobbleV *= Math.pow(0.9, dt * 60);
  ball.wobble += ball.wobbleV * dt * 60;
  ball.wobble *= Math.pow(0.9, dt * 60);

  if (Math.abs(dirChange) > 54) {
    ball.microBounce = Math.min(0.4, ball.microBounce + 0.15);
  }
  ball.microBounce *= Math.pow(0.88, dt * 60);

  if (ball.y < state.highestY) {
    ball.y = state.highestY;
    if (ball.vy < 0) ball.vy = 0;
  } else {
    state.highestY = ball.y;
  }

  const margin = 40;
  const minX = margin;
  const maxX = state.viewport.width - margin;
  ball.x = Math.max(minX, Math.min(maxX, ball.x));
}
