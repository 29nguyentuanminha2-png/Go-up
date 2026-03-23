export class CameraSystem {
  update(state) {
    const target = state.balloon.y - state.config.cameraOffset;
    if (target > state.camera.y) {
      state.camera.y += (target - state.camera.y) * 0.08;
    }
    state.camera.x = Math.max(-4, Math.min(4, (state.balloon.vx / 60) * 0.02));
  }
}
