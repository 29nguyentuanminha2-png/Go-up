export function initInput({ screenToWorld, input, state, onStart, onRestart, onContinue }) {
  window.addEventListener("mousemove", (event) => {
    const pos = screenToWorld(event.clientX, event.clientY);
    input.x = pos.x;
    input.y = pos.y;
    input.active = true;
  });

  window.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      const pos = screenToWorld(touch.clientX, touch.clientY);
      input.x = pos.x;
      input.y = pos.y;
      input.active = true;
      event.preventDefault();
    },
    { passive: false }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      const pos = screenToWorld(touch.clientX, touch.clientY);
      input.x = pos.x;
      input.y = pos.y;
      input.active = true;
      event.preventDefault();
    },
    { passive: false }
  );

  window.addEventListener("touchend", () => {
    input.active = false;
    if ((state.mode === "gameover" || state.mode === "dead") && state.gameOverTimer <= 0) {
      onRestart();
    }
  });

  window.addEventListener("mouseleave", () => {
    input.active = false;
  });

  window.addEventListener("click", () => {
    if (state.mode === "start") return onStart();
    if ((state.mode === "gameover" || state.mode === "dead") && state.gameOverTimer <= 0) return onRestart();
    if (state.mode === "victory") return onContinue();
  });

  window.addEventListener("pointerdown", () => {
    if ((state.mode === "gameover" || state.mode === "dead") && state.gameOverTimer <= 0) onRestart();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "f") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
    if (event.key.toLowerCase() === "r" && (state.mode === "gameover" || state.mode === "dead") && state.gameOverTimer <= 0) {
      onRestart();
    }
    if (event.key.toLowerCase() === "e") {
      state.endless = !state.endless;
      state.highScore = Math.max(state.highScore, Math.floor(state.score));
    }
  });
}
