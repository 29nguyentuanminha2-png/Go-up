import { ObjectPool } from "../engine/ObjectPool.js";

export class ParticleSystem {
  constructor() {
    this.particlePool = new ObjectPool(() => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, r: 0 }), 120);
    this.sparkPool = new ObjectPool(() => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0 }), 80);
    this.shardPool = new ObjectPool(
      () => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        rot: 0,
        vr: 0,
        life: 0,
        tri: [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
      }),
      40
    );
    this.shockwavePool = new ObjectPool(() => ({ x: 0, y: 0, r: 0, v: 0, life: 0 }), 20);
    this.dangerPool = new ObjectPool(() => ({ x: 0, y: 0, vy: 0, life: 0 }), 40);
  }

  update(state, dt) {
    this.updateParticles(state, dt);
    this.updateSparks(state, dt);
    this.updateShards(state, dt);
    this.updateShockwaves(state, dt);
    this.updateDangerParticles(state, dt);
  }

  updateParticles(state, dt) {
    const list = state.particles.particles;
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const p = list[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= dt * 1.6;
      p.r *= 0.96;
      if (p.life <= 0 || p.r <= 0.5) {
        list.splice(i, 1);
        this.particlePool.release(p);
      }
    }
  }

  updateSparks(state, dt) {
    const list = state.particles.sparks;
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const s = list[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt * 3;
      s.vx *= 0.9;
      s.vy *= 0.9;
      if (s.life <= 0) {
        list.splice(i, 1);
        this.sparkPool.release(s);
      }
    }
  }

  updateShards(state, dt) {
    const list = state.particles.shards;
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const s = list[i];
      s.vy -= 120 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.rot += s.vr * dt;
      s.life -= dt;
      s.vx *= 0.98;
      s.vy *= 0.98;
      if (s.life <= 0) {
        list.splice(i, 1);
        this.shardPool.release(s);
      }
    }
  }

  updateShockwaves(state, dt) {
    const list = state.particles.shockwaves;
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const w = list[i];
      w.r += w.v * dt;
      w.life -= dt * 2.5;
      if (w.life <= 0) {
        list.splice(i, 1);
        this.shockwavePool.release(w);
      }
    }
  }

  updateDangerParticles(state, dt) {
    const list = state.particles.danger;
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const p = list[i];
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        list.splice(i, 1);
        this.dangerPool.release(p);
      }
    }
    if (Math.random() < 0.6 * dt * 60) {
      const p = this.dangerPool.acquire();
      p.x = Math.random() * state.viewport.width;
      p.y = state.danger.y;
      p.vy = 30 + Math.random() * 40;
      p.life = 0.6 + Math.random() * 0.4;
      list.push(p);
    }
  }

  spawnExplosion(state, x, y) {
    const list = state.particles.particles;
    for (let i = 0; i < 30; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 220;
      const p = this.particlePool.acquire();
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = 1;
      p.r = 6 + Math.random() * 6;
      list.push(p);
    }
  }

  spawnSparks(state, x, y) {
    const list = state.particles.sparks;
    for (let i = 0; i < 12; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      const s = this.sparkPool.acquire();
      s.x = x;
      s.y = y;
      s.vx = Math.cos(angle) * speed;
      s.vy = Math.sin(angle) * speed;
      s.life = 0.6 + Math.random() * 0.3;
      list.push(s);
    }
  }

  spawnShards(state, x, y) {
    const list = state.particles.shards;
    const count = 15 + Math.floor(Math.random() * 11);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 160 + Math.random() * 220;
      const size = 6 + Math.random() * 8;
      const s = this.shardPool.acquire();
      s.x = x;
      s.y = y;
      s.vx = Math.cos(angle) * speed;
      s.vy = Math.sin(angle) * speed;
      s.rot = Math.random() * Math.PI * 2;
      s.vr = (Math.random() * 2 - 1) * 8;
      s.life = 1.2;
      for (let t = 0; t < 3; t += 1) {
        const a = Math.random() * Math.PI * 2;
        const r = size * (0.4 + Math.random() * 0.8);
        s.tri[t].x = Math.cos(a) * r;
        s.tri[t].y = Math.sin(a) * r;
      }
      list.push(s);
    }
  }

  spawnShockwave(state, x, y) {
    const list = state.particles.shockwaves;
    const w = this.shockwavePool.acquire();
    w.x = x;
    w.y = y;
    w.r = 10;
    w.v = 240;
    w.life = 0.4;
    list.push(w);
  }
}
