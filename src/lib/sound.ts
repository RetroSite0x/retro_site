class SoundEngine {
  private ctx: AudioContext | null = null;
  private volume = 0.5;

  private gain(base: number): number {
    return base * this.volume;
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
  }

  unlock(): void {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx) return null;
    return this.ctx;
  }

  /** Short square wave frequency sweep (800→1200Hz, 150ms) */
  bootChirp(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(this.gain(0.1), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  /** 1ms white noise burst at low volume */
  keyClick(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.01;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.03;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.gain(0.03), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  }

  /** Random low-passed noise, 80ms — sounds like HDD seeking */
  diskSeek(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.gain(0.08), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  }

  /** Rising sine ping (400→600Hz, 80ms) */
  windowOpen(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(this.gain(0.08), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  /** Falling sine ping (600→300Hz, 80ms) */
  windowClose(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(this.gain(0.08), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  /** 200Hz square wave, 100ms */
  errorBuzz(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    gain.gain.setValueAtTime(this.gain(0.1), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  /** CRT degauss/power-on hum: 60 Hz sine fading in then out (~0.8s) with a faint 15.7 kHz whine */
  crtPowerOn(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // 60 Hz hum
    const hum = ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.setValueAtTime(60, t);
    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0.001, t);
    humGain.gain.linearRampToValueAtTime(this.gain(0.12), t + 0.15);
    humGain.gain.linearRampToValueAtTime(this.gain(0.08), t + 0.5);
    humGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    hum.connect(humGain);
    humGain.connect(ctx.destination);
    hum.start(t);
    hum.stop(t + 0.8);

    // Faint high-frequency whine (15.7 kHz — classic CRT line frequency)
    const whine = ctx.createOscillator();
    whine.type = 'sine';
    whine.frequency.setValueAtTime(15700, t);
    const whineGain = ctx.createGain();
    whineGain.gain.setValueAtTime(0.001, t);
    whineGain.gain.linearRampToValueAtTime(this.gain(0.02), t + 0.2);
    whineGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    whine.connect(whineGain);
    whineGain.connect(ctx.destination);
    whine.start(t);
    whine.stop(t + 0.7);
  }

  /** Tri-tone boot chime: C5 (523) → E5 (659) → G5 (784) as sine waves, ~0.4s */
  bootChime(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes: [number, number][] = [
      [523, 0],      // C5 at 0s
      [659, 0.12],   // E5 at 120ms
      [784, 0.24],   // G5 at 240ms
    ];
    for (const [freq, delay] of notes) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t + delay);
      g.gain.linearRampToValueAtTime(this.gain(0.07), t + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.16);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.16);
    }
  }

  /** Very short soft "accepted" blip (~40ms) */
  commandOk(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(this.gain(0.06), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  /** Orchestrated boot sound: bootChirp → 200ms pause → diskSeek → 300ms pause → bootChirp */
  bootSequence(): void {
    this.bootChirp();
    setTimeout(() => this.diskSeek(), 200);
    setTimeout(() => this.bootChirp(), 500);
  }
}

export const soundEngine = new SoundEngine();
