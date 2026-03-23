export class BackgroundRenderer {
  init(state) {
    const bg = state.background;
    const { width, height } = state.viewport;

    for (const layer of bg.starLayers) {
      layer.stars = [];
      for (let i = 0; i < 60; i += 1) {
        layer.stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.6 + Math.random() * 1.4,
        });
      }
    }

    bg.clouds.length = 0;
    for (let i = 0; i < 16; i += 1) {
      bg.clouds.push({
        x: Math.random() * width,
        y: Math.random() * height,
        w: 120 + Math.random() * 180,
        h: 40 + Math.random() * 60,
        speed: 6 + Math.random() * 8,
      });
    }

    bg.skyParticles.length = 0;
    for (let i = 0; i < 40; i += 1) {
      bg.skyParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1 + Math.random() * 2,
        speed: 10 + Math.random() * 20,
      });
    }

    bg.factoryLights.length = 0;
    for (let i = 0; i < 18; i += 1) {
      bg.factoryLights.push({
        x: Math.random() * width,
        y: Math.random() * height,
        h: 80 + Math.random() * 160,
        speed: 30 + Math.random() * 40,
      });
    }

    bg.planets.length = 0;
    for (let i = 0; i < 3; i += 1) {
      bg.planets.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.5 + height * 0.2,
        r: 40 + Math.random() * 70,
        hue: 200 + Math.random() * 100,
      });
    }

    bg.mountains.length = 0;
    const baseY = height * 0.9;
    for (let i = 0; i < 5; i += 1) {
      const x = (i / 4) * width;
      bg.mountains.push({
        x,
        y: baseY,
        w: width * 0.4,
        h: 120 + Math.random() * 80,
      });
    }
  }

  update(state, dt) {
    const bg = state.background;
    const { width, height } = state.viewport;

    for (const layer of bg.starLayers) {
      for (const star of layer.stars) {
        star.y += layer.speed * dt * 60;
        if (star.y > height) {
          star.y = -4;
          star.x = Math.random() * width;
        }
      }
    }

    for (const cloud of bg.clouds) {
      cloud.y -= cloud.speed * dt;
      if (cloud.y + cloud.h < -40) {
        cloud.y = height + 40;
        cloud.x = Math.random() * width;
      }
    }

    for (const p of bg.skyParticles) {
      p.y -= p.speed * dt;
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
    }

    for (const light of bg.factoryLights) {
      light.y -= light.speed * dt;
      if (light.y + light.h < -40) {
        light.y = height + 40;
        light.x = Math.random() * width;
      }
    }
  }

  draw(ctx, state) {
    const { width, height } = state.viewport;
    const t = state.env.progress;
    const envT = state.env.index === 0 ? t / 0.34 : state.env.index === 1 ? (t - 0.34) / 0.33 : (t - 0.67) / 0.33;
    const nextEnv = Math.min(2, state.env.index + 1);
    const blend = Math.max(0, Math.min(1, envT));

    this.drawEnv(ctx, state, state.env.index, 1 - blend * 0.5);
    if (blend > 0.6) this.drawEnv(ctx, state, nextEnv, (blend - 0.6) / 0.4);
  }

  drawEnv(ctx, state, env, alpha) {
    const { width, height } = state.viewport;
    const bg = state.background;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (env === 0) {
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, "rgba(70, 160, 255, 0.9)");
      g.addColorStop(1, "rgba(120, 220, 255, 0.6)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(70, 100, 160, 0.5)";
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (const m of bg.mountains) {
        ctx.lineTo(m.x, m.y);
        ctx.lineTo(m.x + m.w, m.y - m.h);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      for (const cloud of bg.clouds) {
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.w, cloud.h, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      for (const p of bg.skyParticles) ctx.fillRect(p.x, p.y, p.r, p.r);
    } else if (env === 1) {
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, "rgba(10, 10, 24, 0.95)");
      g.addColorStop(1, "rgba(5, 5, 16, 0.8)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "rgba(90, 240, 255, 0.18)";
      for (const light of bg.factoryLights) ctx.fillRect(light.x, light.y, 8, light.h);
    } else {
      const g = ctx.createRadialGradient(width * 0.6, height * 0.4, 40, width * 0.5, height * 0.5, width * 0.9);
      g.addColorStop(0, "rgba(40, 20, 90, 0.8)");
      g.addColorStop(1, "rgba(5, 5, 15, 0.9)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "rgba(160, 210, 255, 0.2)";
      for (const layer of bg.starLayers) {
        for (const star of layer.stars) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      for (const planet of bg.planets) {
        ctx.fillStyle = `rgba(${planet.hue}, ${planet.hue - 40}, 255, 0.25)`;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}
