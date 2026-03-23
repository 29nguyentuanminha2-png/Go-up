import { state } from "./state.js";

export function setOverlay(overlay, titleEl, subtitleEl, title, subtitle) {
  titleEl.textContent = title;
  subtitleEl.textContent = subtitle;
  overlay.classList.remove("hidden");
}

export function hideOverlay(overlay) {
  overlay.classList.add("hidden");
}

export function updateHUD(hudEl) {
  if (!hudEl) return;
  const score = Math.floor(state.score);
  const combo = state.combo > 0 ? ` x${state.combo}` : "";
  const mode = state.endless ? "Endless" : `Level ${state.level}`;
  const hi = ` | Best ${state.highScore}`;
  const nearMissText = state.nearMissTimer > 0 ? " | Near Miss" : "";
  hudEl.textContent = `${mode} | Score ${score}${combo}${hi}${nearMissText}`;
}
