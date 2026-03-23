# GO UP — Architecture & Stability Notes

## Overview
GO UP is a 2D Canvas balloon game with a single deterministic loop, centralized state, and clean module boundaries. Restarting the game always rebuilds state from scratch to avoid stale references or corrupted state.

## Project Structure
```
src/
  engine/
    GameEngine.js       // orchestration + state lifecycle
    GameLoop.js         // single RAF loop
    StateManager.js     // createInitialState() and score persistence
    InputManager.js     // unified mouse/pointer/touch input
    ObjectPool.js       // pooled particles/shards
  systems/
    PhysicsSystem.js    // balloon + rope + danger line updates
    CollisionSystem.js  // near-miss + collision handling
    CameraSystem.js     // upward-only camera follow + tilt
    ParticleSystem.js   // pooled particles/sparks/shards/shockwaves
  game/
    Balloon.js          // balloon physics
    Rope.js             // verlet rope
    ObstacleSystem.js   // spawn/update obstacles + boss + finish line
    ExplosionSystem.js  // collision explosions
    ComboSystem.js      // near miss + combo logic
    LevelSystem.js      // difficulty + progression
  render/
    Renderer.js         // render orchestration
    BackgroundRenderer.js
    EffectsRenderer.js
    UIRenderer.js
  ui/
    TitleScreen.js
    GameOverScreen.js
    HUD.js
  main.js
```

## Stability Guarantees
- Exactly one `requestAnimationFrame` loop (GameLoop).
- Restart uses `createInitialState()` to fully rebuild state.
- No per-run event listener churn; InputManager attaches once.
- Rope uses deterministic verlet constraints and clamps.
- Physics uses dt for consistent speed across frame rates.

## Run
Open `index.html` in a modern browser. No build step required.

## Manual Test Checklist
- Restart test: Lose → Restart → Play (repeat 10 times).
- Camera test: camera only moves upward and never snaps down.
- Physics test: balloon never detaches from rope.
- Loop test: only one RAF loop (search `requestAnimationFrame`).
- Render test: no trails, debug helpers, or ghost artifacts.

## Automated Test Hooks
The game exposes:
- `window.render_game_to_text()` for state capture.
- `window.advanceTime(ms)` for deterministic stepping.
