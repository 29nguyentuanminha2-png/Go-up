export class EffectsRenderer {
  drawParticles(ctx, state) {
    for (const p of state.particles.particles) {
      const pos = this.worldToScreen(state, p.x, p.y);
      ctx.fillStyle = `rgba(120, 220, 255, ${Math.max(p.life, 0)})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(120, 220, 255, 0.9)";
    for (const s of state.particles.sparks) {
      const pos = this.worldToScreen(state, s.x, s.y);
      ctx.fillRect(pos.x, pos.y, 2, 2);
    }

    for (const s of state.particles.shards) {
      const pos = this.worldToScreen(state, s.x, s.y);
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
      ctx.globalAlpha = 1;
    }
  }

  drawShockwaves(ctx, state) {
    for (const w of state.particles.shockwaves) {
      const pos = this.worldToScreen(state, w.x, w.y);
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

  worldToScreen(state, x, y) {
    return {
      x,
      y: state.viewport.height - (y - state.camera.y),
    };
  }
}
