import { GameEngine } from "./engine/GameEngine.js";
import { GameLoop } from "./engine/GameLoop.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const level = document.getElementById("level");
const hud = document.getElementById("hud");

const uiElements = { overlay, title, subtitle, level, hud };

const engine = new GameEngine(canvas, ctx, uiElements);

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  engine.resize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", resize);
window.addEventListener("fullscreenchange", resize);

resize();
engine.ui.showTitle(engine.state);

const loop = new GameLoop((dt) => engine.update(dt), () => engine.render());
loop.start();

window.render_game_to_text = () => {
  const state = engine.state;
  const payload = {
    mode: state.mode,
    level: state.level,
    score: Math.floor(state.score),
    combo: state.combo,
    cameraY: Math.round(state.camera.y),
    player: {
      x: Math.round(state.balloon.x),
      y: Math.round(state.balloon.y),
      r: state.balloon.r,
      vx: Math.round(state.balloon.vx),
      vy: Math.round(state.balloon.vy),
    },
    obstacles: {
      spikes: state.obstacles.spikes.slice(0, 12).map((s) => ({ x: Math.round(s.x), y: Math.round(s.y), w: s.w, h: s.h })),
      bars: state.obstacles.bars.slice(0, 12).map((b) => ({ x: Math.round(b.x), y: Math.round(b.y), len: b.len })),
      falling: state.obstacles.falling.slice(0, 12).map((o) => ({ x: Math.round(o.x), y: Math.round(o.y), r: o.r })),
    },
    meta: {
      coords: "origin bottom-left, +y up",
    },
  };
  return JSON.stringify(payload);
};

window.advanceTime = (ms) => {
  const step = 1 / 60;
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i += 1) engine.update(step);
  engine.render();
};
