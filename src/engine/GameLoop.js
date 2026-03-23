export class GameLoop {
  constructor(update, render) {
    this.update = update;
    this.render = render;
    this.lastTime = performance.now();
    this.running = false;
    this.bound = this.loop.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.bound);
  }

  loop(time) {
    if (!this.running) return;
    const dt = Math.min(0.033, (time - this.lastTime) / 1000);
    this.lastTime = time;
    this.update(dt, time);
    this.render();
    requestAnimationFrame(this.bound);
  }
}
