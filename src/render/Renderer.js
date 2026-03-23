import { EffectsRenderer } from "./EffectsRenderer.js";

const colors = {
  ball: "#39f3ff",
  rope: "#a6f7ff",
  spike: "#ff4cff",
  bar: "#5aff8a",
  fall: "#ffd13a",
};

export class Renderer {
  constructor(background, ui) {
    this.background = background;
    this.ui = ui;
    this.effectsRenderer = new EffectsRenderer();
  }

  render(ctx, state) {
    const { width, height } = state.viewport;
    ctx.save();
    this.background.draw(ctx, state);

    if (state.camera.shakeMag > 0) {
      const shakeX = (Math.random() * 2 - 1) * state.camera.shakeMag;
      const shakeY = (Math.random() * 2 - 1) * state.camera.shakeMag;
      ctx.translate(shakeX, shakeY);
    }
    ctx.translate(state.camera.x, 0);

    if (state.effects.zoomTime > 0) {
      ctx.translate(width * 0.5, height * 0.5);
      ctx.scale(1.06, 1.06);
      ctx.translate(-width * 0.5, -height * 0.5);
    }

    this.drawDanger(ctx, state);
    this.drawObstacles(ctx, state);
    this.drawBoss(ctx, state);
    this.drawFinishLine(ctx, state);
    this.drawRope(ctx, state);
    if (state.mode === "PLAYING") this.drawBalloon(ctx, state);
    this.effectsRenderer.drawParticles(ctx, state);
    this.effectsRenderer.drawShockwaves(ctx, state);

    if (state.effects.flashTime > 0) {
      ctx.globalCompositeOperation = "screen";
      const flashColor = state.effects.nearMissTimer > 0 ? "rgba(255, 60, 60, " : "rgba(120, 220, 255, ";
      ctx.fillStyle = `${flashColor}${state.effects.flashTime * 1.8})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.restore();
  }

  worldToScreen(state, x, y) {
    return {
      x,
      y: state.viewport.height - (y - state.camera.y),
    };
  }

  drawBalloon(ctx, state) {
    const ball = state.balloon;
    const pos = this.worldToScreen(state, ball.x, ball.y);
    const stretch = Math.min(0.06, (Math.abs(ball.vy) / 60) * 0.015);
    const squash = Math.min(0.05, (Math.abs(ball.vx) / 60) * 0.015);
    const rx = ball.r * (1 + squash);
    const ry = ball.r * (1 + stretch);
    const baseColor = state.settings.balloonColor;

    ctx.shadowBlur = 0;
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawRope(ctx, state) {
    const rope = state.rope;
    if (!rope.segments.length) return;
    ctx.strokeStyle = colors.rope;
    ctx.lineWidth = 3;
    ctx.shadowColor = colors.rope;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    if (!rope.dead) {
      const start = this.worldToScreen(state, state.balloon.x, state.balloon.y - state.balloon.r);
      ctx.moveTo(start.x, start.y);
    } else {
      const head = this.worldToScreen(state, rope.segments[0].x, rope.segments[0].y);
      ctx.moveTo(head.x, head.y);
    }
    for (const seg of rope.segments) {
      const pos = this.worldToScreen(state, seg.x, seg.y);
      ctx.lineTo(pos.x, pos.y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  drawObstacles(ctx, state) {
    if (!state.obstacles.active) return;
    this.drawSpikes(ctx, state);
    this.drawBars(ctx, state);
    this.drawFalling(ctx, state);
  }

  drawSpikes(ctx, state) {
    ctx.fillStyle = colors.spike;
    ctx.shadowColor = colors.spike;
    ctx.shadowBlur = 14;
    for (const spike of state.obstacles.spikes) {
      const half = spike.w * 0.5;
      const p1 = this.worldToScreen(state, spike.x, spike.y + spike.h);
      const p2 = this.worldToScreen(state, spike.x - half, spike.y);
      const p3 = this.worldToScreen(state, spike.x + half, spike.y);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  drawBars(ctx, state) {
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    for (const bar of state.obstacles.bars) {
      const barColor = bar.spikeBar ? colors.spike : bar.pipe ? "#7c5cff" : colors.bar;
      ctx.strokeStyle = barColor;
      ctx.shadowColor = barColor;
      ctx.shadowBlur = 16;
      const half = bar.len * 0.5;
      const ax = bar.x + Math.cos(bar.angle) * half;
      const ay = bar.y + Math.sin(bar.angle) * half;
      const bx = bar.x - Math.cos(bar.angle) * half;
      const by = bar.y - Math.sin(bar.angle) * half;
      const a = this.worldToScreen(state, ax, ay);
      const b = this.worldToScreen(state, bx, by);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  drawFalling(ctx, state) {
    for (const obj of state.obstacles.falling) {
      const color = obj.shape === "block" ? "#ff7cfb" : colors.fall;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 22;
      const pos = this.worldToScreen(state, obj.x, obj.y);
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

  drawBoss(ctx, state) {
    const boss = state.obstacles.boss;
    if (!boss) return;
    const pos = this.worldToScreen(state, boss.x, boss.y);
    ctx.shadowColor = "#ff3bff";
    ctx.shadowBlur = 25;
    ctx.strokeStyle = "#ff3bff";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, boss.r, 0, Math.PI * 2);
    ctx.stroke();
    const spikes = 10;
    for (let i = 0; i < spikes; i += 1) {
      const ang = boss.angle + (i * Math.PI * 2) / spikes;
      const sx = pos.x + Math.cos(ang) * (boss.r + 10);
      const sy = pos.y + Math.sin(ang) * (boss.r + 10);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(sx, sy);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  drawFinishLine(ctx, state) {
    if (!state.obstacles.finishLine || state.endless) return;
    const pos = this.worldToScreen(state, 0, state.obstacles.finishLineY);
    ctx.strokeStyle = "#3df5ff";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#3df5ff";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(0, pos.y);
    ctx.lineTo(state.viewport.width, pos.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  drawDanger(ctx, state) {
    const pos = this.worldToScreen(state, 0, state.danger.y);
    ctx.strokeStyle = "rgba(255, 80, 110, 0.9)";
    ctx.lineWidth = 5;
    ctx.shadowColor = "rgba(255, 80, 110, 0.8)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(0, pos.y);
    ctx.lineTo(state.viewport.width, pos.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 80, 120, 0.8)";
    for (const p of state.particles.danger) {
      const pPos = this.worldToScreen(state, p.x, p.y);
      ctx.fillRect(pPos.x, pPos.y, 2, 4);
    }
  }
}
