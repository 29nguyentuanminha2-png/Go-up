Original prompt: Create a polished browser mini game called "GO UP" using HTML, CSS and Vanilla JavaScript with HTML5 Canvas.

Current status:
- Project refactored into modular architecture under src/engine, src/systems, src/game, src/render, src/ui with a single RAF loop (GameLoop).
- Centralized state reset via createInitialState() in StateManager; restart rebuilds the full state and is repeatable.
- Input unified for mouse/pointer/touch via InputManager; overlay click/tap starts and restarts the game.
- Physics stabilized: balloon movement uses dt, rope uses verlet constraints, camera only follows upward.
- Collision triggers explosion, shards, shockwave; rope falls after death then UI shows restart.
- Visuals cleaned: balloon now simple flat circle; rope color updated for visibility; no trails or debug artifacts.
- Background renderer provides layered sky/factory/space environments.
- HUD/UI separated into UIRenderer + ui modules; README added with architecture + checklist.

Key files:
- src/main.js (single RAF loop + engine bootstrap)
- src/engine/GameEngine.js (state lifecycle + update/render orchestration)
- src/engine/StateManager.js (createInitialState + high score persistence)
- src/render/Renderer.js (balloon/rope/obstacles drawing)

Testing:
- Automated Playwright test not run (Node/npx unavailable in environment).

Known issues/TODO:
- Run manual QA: restart loop 10x, camera never moves downward, rope never detaches.

Latest update:
- Movement retuned to be more responsive: higher follow strength, lower damping, lower vertical target pull, higher max speed, slow motion disabled.
- Difficulty eased: larger safe gaps, slower intro ramp, slower early obstacle speed, longer spawn interval, wider vertical spacing between groups.
- Added lightweight HTML5 Audio sound manager for bg music, click, near miss, and explosion sounds with cooldowns.
- Overlay now fades smoothly and shows the instruction line only on the first title screen.
