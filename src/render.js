import { colors, state, ball, rope, obstacles, particles, sparks, shards, shockwaves, dangerParticles, starLayers, clouds, factoryLights, shootingStars, skyParticles, planets } from "./state.js";

export function worldToScreen(x, y) {
  const screenX = x;
  const screenY = window.innerHeight - (y - state.cameraY);
  return { x: screenX, y: screenY };
}

export function drawBackground(ctx) {
  ctx.fillStyle = "rgba(6, 8, 16, 0.08)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  const t = state.envProgress;
  const envT = state.envIndex === 0 ? t / 0.34 : state.envIndex === 1 ? (t - 0.34) / 0.33 : (t - 0.67) / 0.33;
  const nextEnv = Math.min(2, state.envIndex + 1);
  const blend = Math.max(0, Math.min(1, envT));

  drawEnvBackground(ctx, state.envIndex, 1 - blend * 0.5);
  if (blend > 0.6) {
    drawEnvBackground(ctx, nextEnv, (blend - 0.6) / 0.4);
  }
}

function drawEnvBackground(ctx, env, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (env === 0) {
    const g = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
    g.addColorStop(0, "rgba(70, 160, 255, 0.9)");
    g.addColorStop(1, "rgba(120, 220, 255, 0.6)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    for (const cloud of clouds) {
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.w, cloud.h, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    for (const p of skyParticles) {
      ctx.fillRect(p.x, p.y, p.r, p.r);
    }
  } else if (env === 1) {
    const g = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
    g.addColorStop(0, "rgba(10, 10, 24, 0.95)");
    g.addColorStop(1, "rgba(5, 5, 16, 0.8)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.fillStyle = "rgba(90, 240, 255, 0.18)";
    for (const light of factoryLights) {
      ctx.fillRect(light.x, light.y, 8, light.h);
    }
  } else {
    const g = ctx.createRadialGradient(
      window.innerWidth * 0.6,
      window.innerHeight * 0.4,
      40,
      window.innerWidth * 0.5,
      window.innerHeight * 0.5,
      window.innerWidth * 0.9
    );
    g.addColorStop(0, "rgba(40, 20, 90, 0.8)");
    g.addColorStop(1, "rgba(5, 5, 15, 0.9)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.fillStyle = "rgba(160, 210, 255, 0.2)";
    for (const layer of starLayers) {
      for (const star of layer.stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const planet of planets) {
      ctx.fillStyle = `rgba(${planet.hue}, ${planet.hue - 40}, 255, 0.25)`;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(160, 220, 255, 0.6)";
    for (const s of shootingStars) {
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - 40, s.y - 40);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawRope(ctx) {
  if (rope.segments.length === 0) return;
  ctx.strokeStyle = colors.rope;
  ctx.lineWidth = 3;
  ctx.shadowColor = colors.rope;
  ctx.shadowBlur = 12;

  ctx.beginPath();
  if (state.ropeDeadTimer <= 0) {
    const start = worldToScreen(ball.x, ball.y - ball.r);
    ctx.moveTo(start.x, start.y);
  } else {
    const head = worldToScreen(rope.segments[0].x, rope.segments[0].y);
    ctx.moveTo(head.x, head.y);
  }
  for (const seg of rope.segments) {
    const pos = worldToScreen(seg.x, seg.y);
    ctx.lineTo(pos.x, pos.y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
}

export function drawBall(ctx) {
  const pos = worldToScreen(ball.x, ball.y);
  const speed = Math.hypot(ball.vx, ball.vy) / 60;
  const stretch = Math.min(0.06, (Math.abs(ball.vy) / 60) * 0.015);
  const squash = Math.min(0.05, (Math.abs(ball.vx) / 60) * 0.015);
  const rx = ball.r * (1 + squash);
  const ry = ball.r * (1 + stretch);
  const baseColor = state.nearMissTimer > 0 ? "#ff6b6b" : colors.ball;

  ctx.shadowColor = baseColor;
  ctx.shadowBlur = 18;
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.ellipse(pos.x, pos.y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.ellipse(pos.x - rx * 0.2, pos.y - ry * 0.2, rx * 0.14, ry * 0.1, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

export function drawSpikes(ctx) {
  ctx.fillStyle = colors.spike;
  ctx.shadowColor = colors.spike;
  ctx.shadowBlur = 14;
  for (const spike of obstacles.spikes) {
    const half = spike.w * 0.5;
    const p1 = worldToScreen(spike.x, spike.y + spike.h);
    const p2 = worldToScreen(spike.x - half, spike.y);
    const p3 = worldToScreen(spike.x + half, spike.y);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

export function drawBars(ctx) {
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  for (const bar of obstacles.bars) {
    const barColor = bar.spikeBar ? colors.spike : bar.pipe ? "#7c5cff" : colors.bar;
    ctx.strokeStyle = barColor;
    ctx.shadowColor = barColor;
    ctx.shadowBlur = 16;
    const half = bar.len * 0.5;
    const ax = bar.x + Math.cos(bar.angle) * half;
    const ay = bar.y + Math.sin(bar.angle) * half;
    const bx = bar.x - Math.cos(bar.angle) * half;
    const by = bar.y - Math.sin(bar.angle) * half;
    const a = worldToScreen(ax, ay);
    const b = worldToScreen(bx, by);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

export function drawFalling(ctx) {
  for (const obj of obstacles.falling) {
    const color = obj.shape === "block" ? "#ff7cfb" : colors.fall;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 22;
    const pos = worldToScreen(obj.x, obj.y);
    if (obj.shape === "block") {
      ctx.fillRect(pos.x - obj.r, pos.y - obj.r, obj.r * 2, obj.r * 2);
    } else {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, obj.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.shadowBlur = 0;
}

export function drawParticles(ctx) {
  for (const p of particles) {
    const pos = worldToScreen(p.x, p.y);
    ctx.fillStyle = `rgba(120, 220, 255, ${Math.max(p.life, 0)})`;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawSparks(ctx) {
  ctx.fillStyle = "rgba(120, 220, 255, 0.9)";
  for (const s of sparks) {
    const pos = worldToScreen(s.x, s.y);
    ctx.fillRect(pos.x, pos.y, 2, 2);
  }
}

export function drawShards(ctx) {
  for (const s of shards) {
    const pos = worldToScreen(s.x, s.y);
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(s.rot);
    ctx.globalAlpha = Math.max(0, s.life);
    ctx.fillStyle = "rgba(120, 220, 255, 0.9)";
    ctx.beginPath();
    ctx.moveTo(s.tri[0].x, s.tri[0].y);
    ctx.lineTo(s.tri[1].x, s.tri[1].y);
    ctx.lineTo(s.tri[2].x, s.tri[2].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

export function drawShockwaves(ctx) {
  for (const w of shockwaves) {
    const pos = worldToScreen(w.x, w.y);
    ctx.strokeStyle = `rgba(120, 220, 255, ${w.life})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(120, 220, 255, 0.8)";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, w.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

export function drawDangerFloor(ctx) {
  const pos = worldToScreen(0, state.dangerFloorY);
  ctx.strokeStyle = "rgba(255, 80, 110, 0.9)";
  ctx.lineWidth = 5;
  ctx.shadowColor = "rgba(255, 80, 110, 0.8)";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(0, pos.y);
  ctx.lineTo(window.innerWidth, pos.y);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255, 80, 120, 0.8)";
  for (const p of dangerParticles) {
    const pPos = worldToScreen(p.x, p.y);
    ctx.fillRect(pPos.x, pPos.y, 2, 4);
  }
}

export function drawBoss(ctx) {
  if (!state.boss) return;
  const pos = worldToScreen(state.boss.x, state.boss.y);
  ctx.shadowColor = "#ff3bff";
  ctx.shadowBlur = 25;
  ctx.strokeStyle = "#ff3bff";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, state.boss.r, 0, Math.PI * 2);
  ctx.stroke();

  const spikes = 10;
  for (let i = 0; i < spikes; i += 1) {
    const ang = state.boss.angle + (i * Math.PI * 2) / spikes;
    const sx = pos.x + Math.cos(ang) * (state.boss.r + 10);
    const sy = pos.y + Math.sin(ang) * (state.boss.r + 10);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(sx, sy);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

export function drawFinishLine(ctx) {
  if (!state.finishLine || state.endless) return;
  const pos = worldToScreen(0, state.finishLineY);
  ctx.strokeStyle = "#3df5ff";
  ctx.lineWidth = 4;
  ctx.shadowColor = "#3df5ff";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(0, pos.y);
  ctx.lineTo(window.innerWidth, pos.y);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

export function drawSpeedLines(ctx) {
  const speed = Math.abs(ball.vy) / 60;
  if (speed < 1.6) return;
  ctx.strokeStyle = "rgba(120, 220, 255, 0.25)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i += 1) {
    const x = (i * 97 + state.time * 120) % window.innerWidth;
    const y = (i * 73 + state.time * 200) % window.innerHeight;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 20 + speed * 4);
    ctx.stroke();
  }
}

export function render(ctx) {
  ctx.save();
  drawBackground(ctx);

  if (state.shakeMag > 0) {
    const shakeX = (Math.random() * 2 - 1) * state.shakeMag;
    const shakeY = (Math.random() * 2 - 1) * state.shakeMag;
    ctx.translate(shakeX, shakeY);
  }
  ctx.translate(state.cameraX, 0);
  const zoom = state.zoomTime > 0 ? 1.06 : 1;
  if (zoom !== 1) {
    ctx.translate(window.innerWidth * 0.5, window.innerHeight * 0.5);
    ctx.scale(zoom, zoom);
    ctx.translate(-window.innerWidth * 0.5, -window.innerHeight * 0.5);
  }

  drawDangerFloor(ctx);
  drawSpeedLines(ctx);
  if (state.obstaclesActive) {
    drawSpikes(ctx);
    drawBars(ctx);
    drawFalling(ctx);
  }
  drawBoss(ctx);
  drawFinishLine(ctx);
  drawRope(ctx);
  if (state.mode === "playing") {
    drawBall(ctx);
  }
  drawParticles(ctx);
  drawSparks(ctx);
  drawShards(ctx);
  drawShockwaves(ctx);

  if (state.flashTime > 0) {
    ctx.globalCompositeOperation = "screen";
    const flashColor = state.nearMissTimer > 0 ? "rgba(255, 60, 60, " : "rgba(120, 220, 255, ";
    ctx.fillStyle = `${flashColor}${state.flashTime * 1.8})`;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.restore();
}
