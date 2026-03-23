import { particles, sparks, shards, shockwaves } from "./state.js";

export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.life -= dt * 1.6;
    p.r *= 0.96;
    if (p.life <= 0 || p.r <= 0.5) {
      particles.splice(i, 1);
    }
  }
}

export function updateSparks(dt) {
  for (let i = sparks.length - 1; i >= 0; i -= 1) {
    const s = sparks[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life -= dt * 3;
    s.vx *= 0.9;
    s.vy *= 0.9;
    if (s.life <= 0) sparks.splice(i, 1);
  }
}

export function updateShards(dt) {
  for (let i = shards.length - 1; i >= 0; i -= 1) {
    const s = shards[i];
    s.vy -= 120 * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.rot += s.vr * dt;
    s.life -= dt * 1.0;
    s.vx *= 0.98;
    s.vy *= 0.98;
    if (s.life <= 0) shards.splice(i, 1);
  }
}

export function updateShockwaves(dt) {
  for (let i = shockwaves.length - 1; i >= 0; i -= 1) {
    const w = shockwaves[i];
    w.r += w.v * dt;
    w.life -= dt * 2.5;
    if (w.life <= 0) shockwaves.splice(i, 1);
  }
}

export function spawnExplosion(x, y) {
  for (let i = 0; i < 30; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 120 + Math.random() * 220;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      r: 6 + Math.random() * 6,
    });
  }
}

export function spawnSparks(x, y) {
  for (let i = 0; i < 12; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 120;
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.6 + Math.random() * 0.3,
    });
  }
}

export function spawnShards(x, y) {
  const count = 15 + Math.floor(Math.random() * 11);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 160 + Math.random() * 220;
    const size = 6 + Math.random() * 8;
    const tri = [];
    for (let t = 0; t < 3; t += 1) {
      const a = Math.random() * Math.PI * 2;
      const r = size * (0.4 + Math.random() * 0.8);
      tri.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    shards.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() * 2 - 1) * 8,
      life: 1.2,
      tri,
    });
  }
}

export function spawnShockwave(x, y) {
  shockwaves.push({ x, y, r: 10, v: 240, life: 0.4 });
}
