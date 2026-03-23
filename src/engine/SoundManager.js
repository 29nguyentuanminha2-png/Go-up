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

function layeredTone(frequencies, t, amplitude = 1) {
  let value = 0;
  for (let i = 0; i < frequencies.length; i += 1) {
    value += Math.sin(Math.PI * 2 * frequencies[i] * t) / frequencies.length;
  }
  return value * amplitude;
}

export class SoundManager {
  constructor() {
    this.lastPlayed = { click: 0, nearMiss: 0, explosion: 0 };
    this.cooldown = 160;
    this.unlocked = false;

    this.bgMusic = createAudio(
      createWavData(7.2, (t, duration) => {
        const progression = [
          [220.0, 277.18, 329.63],
          [196.0, 246.94, 293.66],
          [174.61, 220.0, 261.63],
          [196.0, 246.94, 293.66],
        ];
        const chord = progression[Math.floor(t / 1.8) % progression.length];
        const pad = layeredTone(chord, t, 0.12);
        const shimmer = layeredTone([chord[1] * 2, chord[2] * 2], t + 0.03, 0.035);
        const pulse = Math.sin(Math.PI * 2 * 0.22 * t) * 0.012;
        const fade = 0.86 + 0.14 * Math.sin(Math.PI * 2 * t / duration);
        return (pad + shimmer + pulse) * fade;
      }),
      0.38,
      true
    );
    this.nearMiss = createAudio(
      createWavData(0.22, (t, duration) => {
        const rise = 720 + t * 640;
        const sparkle = Math.sin(Math.PI * 2 * rise * t) * 0.2;
        const air = Math.sin(Math.PI * 2 * (rise * 1.5) * t + 0.4) * 0.08;
        return (sparkle + air) * (1 - t / duration);
      }),
      0.42
    );
    this.explosion = createAudio(
      createWavData(0.42, (t, duration) => {
        const burst = (Math.random() * 2 - 1) * 0.22 * (1 - t / duration);
        const thump = Math.sin(Math.PI * 2 * (72 - t * 18) * t) * 0.28;
        const crack = Math.sin(Math.PI * 2 * (240 - t * 80) * t) * 0.12;
        return burst + thump + crack;
      }),
      0.5
    );
    this.click = createAudio(
      createWavData(0.1, (t, duration) => {
        const tone = Math.sin(Math.PI * 2 * (620 + t * 120) * t) * 0.16;
        return tone * (1 - t / duration);
      }),
      0.3
    );
  }

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this.bgMusic.currentTime = 0;
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
