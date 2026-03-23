import { state, starLayers, clouds, factoryLights, shootingStars, skyParticles, planets } from "./state.js";

export function initBackground() {
  initStars();
  clouds.length = 0;
  factoryLights.length = 0;
  shootingStars.length = 0;
  skyParticles.length = 0;
  planets.length = 0;

  for (let i = 0; i < 16; i += 1) {
    clouds.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      w: 120 + Math.random() * 180,
      h: 40 + Math.random() * 60,
      speed: 6 + Math.random() * 8,
    });
  }

  for (let i = 0; i < 40; i += 1) {
    skyParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 1 + Math.random() * 2,
      speed: 10 + Math.random() * 20,
    });
  }

  for (let i = 0; i < 18; i += 1) {
    factoryLights.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      h: 80 + Math.random() * 160,
      speed: 30 + Math.random() * 40,
    });
  }

  for (let i = 0; i < 3; i += 1) {
    planets.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.5 + window.innerHeight * 0.2,
      r: 40 + Math.random() * 70,
      hue: 200 + Math.random() * 100,
    });
  }
}

function initStars() {
  for (const layer of starLayers) {
    layer.stars = [];
    const count = 60;
    for (let i = 0; i < count; i += 1) {
      layer.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 0.6 + Math.random() * 1.4,
      });
    }
  }
}

export function updateStars(dt) {
  for (const layer of starLayers) {
    for (const star of layer.stars) {
      star.y += layer.speed * 60 * dt;
      if (star.y > window.innerHeight) {
        star.y = -4;
        star.x = Math.random() * window.innerWidth;
      }
    }
  }
}

export function updateBackground(dt) {
  for (const cloud of clouds) {
    cloud.y -= cloud.speed * dt;
    if (cloud.y + cloud.h < -40) {
      cloud.y = window.innerHeight + 40;
      cloud.x = Math.random() * window.innerWidth;
    }
  }

  for (const p of skyParticles) {
    p.y -= p.speed * dt;
    if (p.y < -10) {
      p.y = window.innerHeight + 10;
      p.x = Math.random() * window.innerWidth;
    }
  }

  for (const light of factoryLights) {
    light.y -= light.speed * dt;
    if (light.y + light.h < -40) {
      light.y = window.innerHeight + 40;
      light.x = Math.random() * window.innerWidth;
    }
  }

  if (Math.random() < 0.01 && state.envIndex === 2) {
    shootingStars.push({
      x: Math.random() * window.innerWidth,
      y: -20,
      vx: -120 - Math.random() * 80,
      vy: 140 + Math.random() * 100,
      life: 0.8,
    });
  }

  for (let i = shootingStars.length - 1; i >= 0; i -= 1) {
    const s = shootingStars[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life -= dt;
    if (s.life <= 0) shootingStars.splice(i, 1);
  }
}
