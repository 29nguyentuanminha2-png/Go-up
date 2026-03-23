export class InputManager {
  constructor({ canvas, getState, screenToWorld, onInteract, onStart, onRestart, onContinue }) {
    this.canvas = canvas;
    this.getState = getState;
    this.screenToWorld = screenToWorld;
    this.onInteract = onInteract;
    this.onStart = onStart;
    this.onRestart = onRestart;
    this.onContinue = onContinue;
    this.pointerDown = false;
    this.attach();
  }

  attach() {
    this.canvas.style.touchAction = "none";

    window.addEventListener("click", () => {
      this.onInteract?.();
      this.handleTap();
    });

    window.addEventListener("touchend", () => {
      this.onInteract?.();
      this.handleTap();
    });

    this.canvas.addEventListener("pointerdown", (event) => {
      this.pointerDown = true;
      this.onInteract?.();
      this.handlePointer(event);
      this.handleTap();
    });

    this.canvas.addEventListener("pointermove", (event) => {
      if (event.pointerType === "mouse" || this.pointerDown) {
        this.handlePointer(event);
      }
    });

    this.canvas.addEventListener("pointerup", () => {
      this.pointerDown = false;
      const state = this.getState();
      if (state) state.input.active = false;
    });

    window.addEventListener("mouseleave", () => {
      const state = this.getState();
      if (state) state.input.active = false;
    });

    this.canvas.addEventListener("pointercancel", () => {
      this.pointerDown = false;
      const state = this.getState();
      if (state) state.input.active = false;
    });

    this.canvas.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.touches[0];
        if (!touch) return;
        this.onInteract?.();
        this.handlePointer(touch);
        this.handleTap();
        event.preventDefault();
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      "touchmove",
      (event) => {
        const touch = event.touches[0];
        if (!touch) return;
        this.handlePointer(touch);
        event.preventDefault();
      },
      { passive: false }
    );

    this.canvas.addEventListener("touchend", () => {
      const state = this.getState();
      if (state) state.input.active = false;
      this.handleTap();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "r") {
        const state = this.getState();
        if (state && state.mode === "GAME_OVER") this.onRestart?.();
      }
      if (event.key.toLowerCase() === "f") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    });
  }

  handlePointer(event) {
    const state = this.getState();
    if (!state) return;
    const pos = this.screenToWorld(event.clientX, event.clientY, state);
    state.input.x = pos.x;
    state.input.y = pos.y;
    state.input.active = true;
  }

  handleTap() {
    const state = this.getState();
    if (!state) return;
    if (state.mode === "GAME_OVER") return this.onRestart?.();
    if (state.mode === "VICTORY") return this.onContinue?.();
  }
}
