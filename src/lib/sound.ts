import { useSystemStore } from '../store/useSystem';

type WaveformType = OscillatorType;

interface ThemeSoundProfile {
  waveform: WaveformType;
  freqMul: number;
}

const THEME_PROFILES: Record<string, ThemeSoundProfile> = {
  green:    { waveform: 'sine',     freqMul: 1.0 },
  white:    { waveform: 'sine',     freqMul: 1.0 },
  blue:     { waveform: 'sine',     freqMul: 1.0 },
  dracula:  { waveform: 'sawtooth', freqMul: 1.15 },
  nord:     { waveform: 'sawtooth', freqMul: 1.15 },
  amber:    { waveform: 'triangle', freqMul: 0.95 },
  solarized:{ waveform: 'triangle', freqMul: 0.95 },
  ubuntu:   { waveform: 'sine',     freqMul: 1.0 },
};

const DEFAULT_PROFILE: ThemeSoundProfile = { waveform: 'sine', freqMul: 1.0 };

class SoundEngine {
  private ctx: AudioContext | null = null;
  private volume = 0.5;
  private unlocked = false;

  private gain(base: number): number {
    return base * this.volume;
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
  }

  isUnlocked(): boolean {
    return this.unlocked && this.ctx?.state === 'running';
  }

  unlock(): void {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => {
        console.warn('AudioContext resume failed:', err);
      });
    }
    this.unlocked = true;
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx) return null;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getThemeSoundProfile(): ThemeSoundProfile {
    const theme = useSystemStore.getState().theme;
    return THEME_PROFILES[theme] ?? DEFAULT_PROFILE;
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  bootChirp(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const timeOfDay = this.getTimeOfDay();
    const multipliers: Record<string, { freq: number; vol: number }> = {
      morning: { freq: 1.2, vol: 1.0 },
      afternoon: { freq: 1.0, vol: 1.0 },
      evening: { freq: 0.9, vol: 0.9 },
      night: { freq: 0.8, vol: 0.7 },
    };
    const m = multipliers[timeOfDay];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800 * m.freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200 * m.freq, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(this.gain(0.1 * m.vol), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  keyClick(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const profile = this.getThemeSoundProfile();
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
    const osc = ctx.createOscillator();
    osc.type = profile.waveform;
    osc.frequency.setValueAtTime(1200 * profile.freqMul, ctx.currentTime);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(this.gain(0.015), ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.008);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.008);
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

  technoGlitchSound(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.linearRampToValueAtTime(8000, t + 0.15);
    filter.frequency.linearRampToValueAtTime(500, t + 0.3);
    filter.Q.setValueAtTime(5, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(this.gain(0.1), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    source.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    source.start(t);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, t);
    osc.frequency.exponentialRampToValueAtTime(4000, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.25);
    const og = ctx.createGain();
    og.gain.setValueAtTime(this.gain(0.06), t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(og);
    og.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
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

  commandOk(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const profile = this.getThemeSoundProfile();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = profile.waveform;
    osc.frequency.setValueAtTime(880 * profile.freqMul, t);
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

  successChime(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes: [number, number][] = [
      [523, 0],
      [659, 0.08],
      [784, 0.16],
      [1047, 0.24],
    ];
    for (const [freq, delay] of notes) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t + delay);
      g.gain.linearRampToValueAtTime(this.gain(0.08), t + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.12);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.12);
    }
  }

  failTone(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(this.gain(0.08), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  navBlip(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(this.gain(0.04), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.03);
  }

  dataTick(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(this.gain(0.05), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.02);
  }
}

export const soundEngine = new SoundEngine();
