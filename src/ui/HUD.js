export function formatHUD(state) {
  return `Level ${state.level} | Score ${Math.floor(state.score)} | Combo ${state.combo} | Best ${state.highScore}`;
}
