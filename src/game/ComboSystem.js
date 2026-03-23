export class ComboSystem {
  constructor(sound) {
    this.sound = sound;
  }

  triggerNearMiss(state, particles) {
    if (state.effects.nearMissCooldown > 0 || state.mode !== "PLAYING") return;
    state.effects.nearMissCooldown = 0.4;
    state.effects.nearMissTimer = 0.25;
    state.effects.flashTime = Math.max(state.effects.flashTime, 0.22);
    state.effects.zoomTime = Math.max(state.effects.zoomTime, 0.18);
    state.camera.shakeTime = Math.max(state.camera.shakeTime, 0.12);
    state.camera.shakeMag = Math.max(state.camera.shakeMag, 4);
    state.combo += 1;
    state.comboTimer = 1.2;
    state.perfectRun = false;
    state.score += 80 * (1 + state.combo * 0.2);
    this.sound?.playNearMiss();
    particles.spawnSparks(state, state.balloon.x, state.balloon.y);
    particles.spawnShockwave(state, state.balloon.x, state.balloon.y);
  }

  update(state, dt) {
    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
    } else {
      state.combo = 0;
    }
  }
}
