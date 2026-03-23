import { titleText, subtitleText } from "../ui/TitleScreen.js";
import { gameOverTitle, gameOverSubtitle } from "../ui/GameOverScreen.js";
import { formatHUD } from "../ui/HUD.js";

export class UIRenderer {
  constructor({ overlay, title, subtitle, level, hud }) {
    this.overlay = overlay;
    this.title = title;
    this.subtitle = subtitle;
    this.level = level;
    this.hud = hud;
    this.hideTimer = null;
    this.showInstructions = window.localStorage.getItem("go-up-seen-instructions") !== "1";
    this.handlers = {};
    this.bindEvents();
  }

  bindEvents() {
    this.overlay.addEventListener("click", (event) => {
      const action = event.target.closest("[data-ui-action]");
      if (!action) return;
      event.stopPropagation();
      const type = action.dataset.uiAction;
      if (type === "play") this.handlers.onPlay?.();
      if (type === "leaderboard") this.handlers.onLeaderboard?.();
      if (type === "settings") this.handlers.onSettings?.();
      if (type === "back") this.handlers.onBack?.();
    });

    this.overlay.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
      if (!target.dataset.settingKey) return;
      this.handlers.onSettingChange?.(target.dataset.settingKey, target.value);
    });
  }

  setHandlers(handlers) {
    this.handlers = handlers;
  }

  showTitle(state) {
    const subtitle = `
      <span>${subtitleText}</span>
      ${this.showInstructions ? '<span class="overlay-note">Move to avoid obstacles and reach the finish line</span>' : ""}
      <span class="menu-actions">
        <button class="menu-button" data-ui-action="play">Play</button>
        <button class="menu-button" data-ui-action="leaderboard">Leaderboard</button>
        <button class="menu-button" data-ui-action="settings">Settings</button>
      </span>
      <span class="overlay-note">Best ${state?.highScore ?? 0}</span>
    `;
    this.showOverlay(titleText, subtitle);
  }

  showLeaderboard(state) {
    const items = (state?.leaderboard || [])
      .slice(0, 5)
      .map((entry, index) => `<span class="leaderboard-row">${index + 1}. ${entry.name} - ${entry.score}</span>`)
      .join("");
    const subtitle = `
      <span class="leaderboard-list">${items || '<span class="overlay-note">No scores yet</span>'}</span>
      <span class="menu-actions">
        <button class="menu-button" data-ui-action="back">Back</button>
      </span>
    `;
    this.showOverlay("Leaderboard", subtitle);
  }

  showSettings(state) {
    const subtitle = `
      <span class="settings-grid">
        <label class="settings-row">Ball Color <input data-setting-key="balloonColor" type="color" value="${state.settings.balloonColor}" /></label>
        <label class="settings-row">Speed
          <select data-setting-key="gameSpeed">
            <option value="0.9" ${state.settings.gameSpeed === 0.9 ? "selected" : ""}>Slow</option>
            <option value="1" ${state.settings.gameSpeed === 1 ? "selected" : ""}>Normal</option>
            <option value="1.1" ${state.settings.gameSpeed === 1.1 ? "selected" : ""}>Fast</option>
          </select>
        </label>
        <label class="settings-row">Difficulty
          <select data-setting-key="difficulty">
            <option value="easy" ${state.settings.difficulty === "easy" ? "selected" : ""}>Easy</option>
            <option value="normal" ${state.settings.difficulty === "normal" ? "selected" : ""}>Normal</option>
            <option value="hard" ${state.settings.difficulty === "hard" ? "selected" : ""}>Hard</option>
          </select>
        </label>
      </span>
      <span class="menu-actions">
        <button class="menu-button" data-ui-action="back">Back</button>
      </span>
    `;
    this.showOverlay("Settings", subtitle);
  }

  showGameOver() {
    this.showOverlay(gameOverTitle, gameOverSubtitle);
  }

  showVictory() {
    this.showOverlay("Level Complete", "Tap / Click to Continue");
  }

  hideOverlay() {
    if (this.showInstructions) {
      this.showInstructions = false;
      window.localStorage.setItem("go-up-seen-instructions", "1");
    }
    this.overlay.classList.add("hidden");
    clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => {
      if (this.overlay.classList.contains("hidden")) {
        this.overlay.style.display = "none";
      }
    }, 180);
  }

  updateHUD(state) {
    if (this.hud) this.hud.textContent = formatHUD(state);
    if (state.mode === "VICTORY") this.showVictory();
  }

  showOverlay(title, subtitle) {
    clearTimeout(this.hideTimer);
    this.overlay.style.display = "flex";
    this.title.textContent = title;
    this.subtitle.innerHTML = subtitle;
    requestAnimationFrame(() => {
      this.overlay.classList.remove("hidden");
    });
  }
}
