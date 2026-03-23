import { createInitialState, saveHighScore, saveSettings, saveLeaderboardEntry } from "./StateManager.js";
import { InputManager } from "./InputManager.js";
import { PhysicsSystem } from "../systems/PhysicsSystem.js";
import { CollisionSystem } from "../systems/CollisionSystem.js";
import { CameraSystem } from "../systems/CameraSystem.js";
import { ParticleSystem } from "../systems/ParticleSystem.js";
import { BackgroundRenderer } from "../render/BackgroundRenderer.js";
import { Renderer } from "../render/Renderer.js";
import { UIRenderer } from "../render/UIRenderer.js";
import { SoundManager } from "./SoundManager.js";
import { LevelSystem } from "../game/LevelSystem.js";
import { ObstacleSystem } from "../game/ObstacleSystem.js";
import { ExplosionSystem } from "../game/ExplosionSystem.js";
import { ComboSystem } from "../game/ComboSystem.js";

export class GameEngine {
  constructor(canvas, ctx, uiElements) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.ui = new UIRenderer(uiElements);
    this.state = createInitialState({ width: canvas.clientWidth, height: canvas.clientHeight, mode: "TITLE" });
    this.background = new BackgroundRenderer();
    this.background.init(this.state);
    this.sound = new SoundManager();
    this.particles = new ParticleSystem();
    this.cameraSystem = new CameraSystem();
    this.physicsSystem = new PhysicsSystem();
    this.levelSystem = new LevelSystem();
    this.obstacleSystem = new ObstacleSystem();
    this.comboSystem = new ComboSystem(this.sound);
    this.explosionSystem = new ExplosionSystem(this.particles, this.sound);
    this.collisionSystem = new CollisionSystem(this.explosionSystem, this.comboSystem);
    this.renderer = new Renderer(this.background, this.ui);
    this.ui.setHandlers({
      onPlay: () => this.startGame(),
      onLeaderboard: () => this.ui.showLeaderboard(this.state),
      onSettings: () => this.ui.showSettings(this.state),
      onBack: () => this.ui.showTitle(this.state),
      onSettingChange: (key, value) => this.updateSetting(key, value),
    });

    this.input = new InputManager({
      canvas,
      getState: () => this.state,
      screenToWorld: (x, y, state) => ({
        x,
        y: state.camera.y + (state.viewport.height - y),
      }),
      onInteract: () => this.sound.unlock(),
      onStart: () => this.startGame(),
      onRestart: () => this.restartGame(),
      onContinue: () => this.advanceLevel(),
    });
  }

  resize(width, height) {
    this.state.viewport.width = width;
    this.state.viewport.height = height;
    this.background.init(this.state);
  }

  startGame(playClick = true) {
    if (playClick) this.sound.playClick();
    this.state = createInitialState({ width: this.state.viewport.width, height: this.state.viewport.height, mode: "PLAYING" });
    this.background.init(this.state);
    this.ui.hideOverlay();
  }

  restartGame() {
    this.startGame();
  }

  advanceLevel() {
    this.sound.playClick();
    if (this.state.level < 3) {
      const nextLevel = this.state.level + 1;
      this.state = createInitialState({ width: this.state.viewport.width, height: this.state.viewport.height, mode: "PLAYING" });
      this.state.level = nextLevel;
      this.levelSystem.prepareLevel(this.state);
      this.background.init(this.state);
      this.ui.hideOverlay();
    } else {
      this.state = createInitialState({ width: this.state.viewport.width, height: this.state.viewport.height, mode: "TITLE" });
      this.background.init(this.state);
      this.ui.showTitle(this.state);
    }
  }

  update(dt) {
    const state = this.state;
    if (state.mode === "TITLE") {
      this.background.update(state, dt);
      return;
    }

    if (state.mode === "GAME_OVER") {
      this.background.update(state, dt);
      this.particles.update(state, dt);
      return;
    }

    if (state.mode === "DEAD") {
      state.effects.deathTimer += dt;
      this.particles.update(state, dt);
      this.physicsSystem.updateRope(state, dt);
      this.background.update(state, dt);
      if (state.camera.shakeTime > 0) {
        state.camera.shakeTime -= dt;
        if (state.camera.shakeTime <= 0) state.camera.shakeMag = 0;
      }
      if (state.rope.deadTimer <= 0 && state.effects.deathTimer >= 2.0) {
        this.finalizeRun();
        state.mode = "GAME_OVER";
        this.ui.showGameOver();
      }
      return;
    }

    state.effects.slowTime = 0;
    const stepDt = dt * state.settings.gameSpeed;

    state.time += dt;
    state.timeAlive += dt;

    this.levelSystem.update(state, stepDt);
    if (state.mode === "VICTORY") {
      this.finalizeRun();
      this.ui.showVictory();
      return;
    }
    this.obstacleSystem.update(state, stepDt);
    this.physicsSystem.update(state, stepDt);
    this.cameraSystem.update(state, stepDt);
    this.particles.update(state, stepDt);
    this.background.update(state, stepDt);
    this.collisionSystem.update(state, stepDt);
    this.comboSystem.update(state, stepDt);

    if (state.effects.flashTime > 0) state.effects.flashTime -= dt;
    if (state.effects.zoomTime > 0) state.effects.zoomTime -= dt;
    if (state.effects.nearMissTimer > 0) state.effects.nearMissTimer -= dt;
    if (state.effects.nearMissCooldown > 0) state.effects.nearMissCooldown -= dt;

    this.scoreUpdate(state, dt);
    this.ui.updateHUD(state);
  }

  scoreUpdate(state, dt) {
    if (state.highestY > state.lastScoreY) {
      const delta = state.highestY - state.lastScoreY;
      const mult = 1 + state.combo * 0.2;
      state.score += delta * mult;
      state.lastScoreY = state.highestY;
    }
    state.score += dt * (8 + state.env.difficulty * 6);
    if (state.score > state.highScore) {
      state.highScore = Math.floor(state.score);
      saveHighScore(state.highScore);
    }
  }

  render() {
    this.renderer.render(this.ctx, this.state);
  }

  updateSetting(key, value) {
    if (key === "balloonColor") this.state.settings.balloonColor = value;
    if (key === "gameSpeed") this.state.settings.gameSpeed = Number(value) || 1;
    if (key === "difficulty") this.state.settings.difficulty = value;
    saveSettings(this.state.settings);
    this.ui.showSettings(this.state);
  }

  finalizeRun() {
    if (this.state.scoreSubmitted) return;
    this.state.scoreSubmitted = true;
    this.state.leaderboard = saveLeaderboardEntry({
      name: this.state.settings.playerName,
      score: Math.floor(this.state.score),
      level: this.state.level,
    });
  }
}
