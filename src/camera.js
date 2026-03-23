import { state, ball } from "./state.js";

const CAMERA_OFFSET = 250;

export function updateCamera() {
  const target = ball.y - CAMERA_OFFSET;
  if (target > state.cameraY) {
    state.cameraY = target;
  }
  const tilt = Math.max(-4, Math.min(4, (ball.vx / 60) * 0.02));
  state.cameraX = tilt;
}
