function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class SoundManager {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.unlocked = false;
    this.lastPlayed = { click: 0, nearMiss: 0, explosion: 0 };
    this.cooldown = 140;
    this.musicLookAhead = 0.35;
    this.musicInterval = null;
    this.musicNextNoteTime = 0;
    this.musicStep = 0;
    document.addEventListener("visibilitychange", () => {
      if (!this.context) return;
      if (document.hidden) {
        this.masterGain.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.08);
      } else if (this.unlocked) {
        this.context.resume().catch(() => {});
        this.masterGain.gain.setTargetAtTime(0.9, this.context.currentTime, 0.12);
        this.startMusic();
      }
    });
  }

  ensureContext() {
    if (this.context) return this.context;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    this.context = new AudioContextClass();
    this.masterGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.sfxGain = this.context.createGain();

    this.masterGain.gain.value = 0.9;
    this.musicGain.gain.value = 0.22;
    this.sfxGain.gain.value = 0.9;

    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);

    return this.context;
  }

  unlock() {
    const context = this.ensureContext();
    if (!context) return;

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    if (this.unlocked) return;
    this.unlocked = true;
    this.masterGain.gain.cancelScheduledValues(context.currentTime);
    this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), context.currentTime);
    this.masterGain.gain.setTargetAtTime(0.9, context.currentTime, 0.1);
    this.startMusic();
  }

  startMusic() {
    const context = this.ensureContext();
    if (!context || this.musicInterval) return;

    this.musicNextNoteTime = context.currentTime + 0.05;
    this.musicStep = 0;
    this.scheduleMusic();
    this.musicInterval = window.setInterval(() => this.scheduleMusic(), 120);
  }

  scheduleMusic() {
    const context = this.context;
    if (!context || !this.musicGain) return;

    const progression = [
      [220.0, 277.18, 329.63],
      [196.0, 246.94, 293.66],
      [174.61, 220.0, 261.63],
      [196.0, 246.94, 293.66],
    ];
    const noteDurations = [0.85, 0.95, 0.85, 1.1];

    while (this.musicNextNoteTime < context.currentTime + this.musicLookAhead) {
      const chord = progression[this.musicStep % progression.length];
      const duration = noteDurations[this.musicStep % noteDurations.length];
      this.playChord(chord, this.musicNextNoteTime, duration);
      this.playBell(chord[2] * 2, this.musicNextNoteTime + 0.18, Math.min(0.5, duration * 0.55));
      this.musicNextNoteTime += duration;
      this.musicStep += 1;
    }
  }

  playChord(chord, startTime, duration) {
    const context = this.context;
    if (!context || !this.musicGain) return;

    chord.forEach((frequency, index) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();

      osc.type = index === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(frequency, startTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(index === 0 ? 900 : 1400, startTime);
      filter.Q.value = 0.6;

      const attack = 0.08;
      const release = duration * 0.9;
      const peak = index === 0 ? 0.08 : 0.05;

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(peak, startTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + release);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });
  }

  playBell(frequency, startTime, duration) {
    const context = this.context;
    if (!context || !this.musicGain) return;

    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, startTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.995, startTime + duration);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.025, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  playClick() {
    this.unlock();
    this.playWithCooldown("click", () => {
      const start = this.context.currentTime;
      this.playTone({
        frequency: 680,
        endFrequency: 760,
        start,
        duration: 0.08,
        volume: 0.08,
        type: "triangle",
      });
    });
  }

  playNearMiss() {
    this.unlock();
    this.playWithCooldown("nearMiss", () => {
      const start = this.context.currentTime;
      this.playTone({
        frequency: 720,
        endFrequency: 1180,
        start,
        duration: 0.15,
        volume: 0.09,
        type: "triangle",
      });
      this.playNoise({
        start,
        duration: 0.12,
        volume: 0.028,
        highpass: 1200,
      });
    });
  }

  playExplosion() {
    this.unlock();
    this.playWithCooldown("explosion", () => {
      const start = this.context.currentTime;
      this.playTone({
        frequency: 110,
        endFrequency: 58,
        start,
        duration: 0.32,
        volume: 0.16,
        type: "sine",
      });
      this.playTone({
        frequency: 240,
        endFrequency: 120,
        start,
        duration: 0.18,
        volume: 0.06,
        type: "sawtooth",
      });
      this.playNoise({
        start,
        duration: 0.24,
        volume: 0.06,
        lowpass: 1800,
      });
    });
  }

  playWithCooldown(key, fn) {
    const context = this.ensureContext();
    if (!context || !this.sfxGain) return;
    const now = performance.now();
    if (now - this.lastPlayed[key] < this.cooldown) return;
    this.lastPlayed[key] = now;
    fn();
  }

  playTone({ frequency, endFrequency, start, duration, volume, type }) {
    const context = this.context;
    if (!context || !this.sfxGain) return;

    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(clamp(volume, 0.001, 0.3), start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  playNoise({ start, duration, volume, lowpass, highpass }) {
    const context = this.context;
    if (!context || !this.sfxGain) return;

    const buffer = context.createBuffer(1, Math.max(1, Math.floor(context.sampleRate * duration)), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    let node = source;

    source.buffer = buffer;

    if (highpass) {
      const filter = context.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(highpass, start);
      node.connect(filter);
      node = filter;
    }

    if (lowpass) {
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(lowpass, start);
      node.connect(filter);
      node = filter;
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(clamp(volume, 0.001, 0.2), start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    node.connect(gain);
    gain.connect(this.sfxGain);

    source.start(start);
    source.stop(start + duration + 0.02);
  }
}
