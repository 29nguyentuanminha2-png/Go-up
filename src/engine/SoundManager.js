function writeString(view, offset, text) {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

function createWavData(duration, sampleFn) {
  const sampleRate = 22050;
  const samples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples * 2, true);

  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.max(0, 1 - t / duration);
    const value = Math.max(-1, Math.min(1, sampleFn(t, duration) * envelope));
    view.setInt16(44 + i * 2, value * 32767, true);
  }

  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function createAudio(src, volume, loop = false) {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = volume;
  audio.loop = loop;
  audio.load();
  return audio;
}

export class SoundManager {
  constructor() {
    this.lastPlayed = { click: 0, nearMiss: 0, explosion: 0 };
    this.cooldown = 140;
    this.unlocked = false;

    this.bgMusic = createAudio(
      createWavData(2.4, (t) => {
        const notes = [261.63, 329.63, 392.0, 329.63];
        const note = notes[Math.floor(t / 0.6) % notes.length];
        return Math.sin(Math.PI * 2 * note * t) * 0.12;
      }),
      0.3,
      true
    );
    this.nearMiss = createAudio(createWavData(0.16, (t) => Math.sin(Math.PI * 2 * (820 - t * 180) * t) * 0.3), 0.4);
    this.explosion = createAudio(createWavData(0.34, (t, d) => (Math.random() * 2 - 1) * (1 - t / d) * 0.35), 0.45);
    this.click = createAudio(createWavData(0.08, (t) => Math.sin(Math.PI * 2 * 680 * t) * 0.2), 0.35);
  }

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this.bgMusic.play().catch(() => {});
  }

  playClick() {
    this.unlock();
    this.playWithCooldown("click", this.click);
  }

  playNearMiss() {
    this.playWithCooldown("nearMiss", this.nearMiss);
  }

  playExplosion() {
    this.playWithCooldown("explosion", this.explosion);
  }

  playWithCooldown(key, audio) {
    const now = performance.now();
    if (now - this.lastPlayed[key] < this.cooldown) return;
    this.lastPlayed[key] = now;
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}
