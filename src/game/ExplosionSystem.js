export class ExplosionSystem {
  constructor(particles, sound) {
    this.particles = particles;
    this.sound = sound;
  }

  trigger(state) {
    if (state.mode !== "PLAYING") return;
    state.mode = "DEAD";
    state.balloon.alive = false;
    state.effects.deathTimer = 0;
    state.effects.flashTime = 0.3;
    state.camera.shakeTime = 0.35;
    state.camera.shakeMag = 10;
    this.sound?.playExplosion();
    this.particles.spawnExplosion(state, state.balloon.x, state.balloon.y);
    this.particles.spawnSparks(state, state.balloon.x, state.balloon.y);
    this.particles.spawnShards(state, state.balloon.x, state.balloon.y);
    this.particles.spawnShockwave(state, state.balloon.x, state.balloon.y);
    state.rope.dead = true;
    state.rope.deadTimer = 1.0;
  }
}
