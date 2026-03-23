import { updateBalloon } from "../game/Balloon.js";
import { updateRope } from "../game/Rope.js";

export class PhysicsSystem {
  update(state, dt) {
    updateBalloon(state, dt);
    updateRope(state, dt);
    this.updateDanger(state, dt);
    if (state.camera.shakeTime > 0) {
      state.camera.shakeTime -= dt;
      if (state.camera.shakeTime <= 0) state.camera.shakeMag = 0;
    }
  }

  updateRope(state, dt) {
    updateRope(state, dt);
  }

  updateDanger(state, dt) {
    const chase = state.config.dangerChaseBase + state.env.difficulty * state.config.dangerChaseScale;
    const target = state.balloon.y - (state.config.dangerOffsetBase - state.env.difficulty * state.config.dangerOffsetScale);
    state.danger.y += (target - state.danger.y) * chase * dt * 60;
    if (state.danger.y > state.balloon.y - state.config.dangerClampOffset) {
      state.danger.y = state.balloon.y - state.config.dangerClampOffset;
    }
  }
}
