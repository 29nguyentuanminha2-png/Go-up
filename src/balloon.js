import { ball, input, state } from "./state.js";

export function updateBall(dt) {
  const targetX = input.active ? input.x : ball.x;
  const targetY = ball.y + 120;

  const followStrength = 82.8;
  const damping = 0.93;
  const ax = (targetX - ball.x) * followStrength;
  const ay = (targetY - ball.y) * followStrength;

  ball.vx += ax * dt;
  ball.vy += ay * dt;
  const damp = Math.pow(damping, dt * 60);
  ball.vx *= damp;
  ball.vy *= damp;
  const maxSpeed = 222;
  const speed = Math.hypot(ball.vx, ball.vy);
  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
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
  const maxX = window.innerWidth - margin;
  ball.x = Math.max(minX, Math.min(maxX, ball.x));
}
