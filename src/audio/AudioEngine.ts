/**
 * AudioEngine — the ASMR of the workshop (GDD §11).
 * Everything is synthesized with the Web Audio API: material-pair impacts,
 * magnetic merge snaps on a pentatonic ladder, UI clicks, and a generative
 * four-layer ambient score. Zero samples; the entire soundtrack is code.
 */

import type { SoundMaterial } from "../data/products";

const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]; // semitones over C4, per tier
const C4 = 261.63;

/** Bandpass center per material — the "voice" of a body. */
const MATERIAL_FREQ: Record<SoundMaterial, number> = {
  plastic: 1800,
  wood: 700,
  metal: 3200,
  glass: 2500,
  fabric: 450,
  ceramic: 1200,
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private sfxGain!: GainNode;
  private musicGain!: GainNode;
  private master!: DynamicsCompressorNode;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private musicStep = 0;
  private duckUntil = 0;

  sfxOn = true;
  musicOn = true;

  /** Must be called from a user gesture. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createDynamicsCompressor();
    this.master.threshold.value = -18;
    this.master.ratio.value = 4;
    this.master.connect(this.ctx.destination);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.9;
    this.sfxGain.connect(this.master);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.32;
    this.musicGain.connect(this.master);
  }

  setSfx(on: boolean): void {
    this.sfxOn = on;
  }

  setMusic(on: boolean): void {
    this.musicOn = on;
    if (!on) this.stopMusic();
  }

  suspend(): void {
    void this.ctx?.suspend();
  }
  resume(): void {
    void this.ctx?.resume();
  }

  private get t(): number {
    return this.ctx!.currentTime;
  }

  private env(node: GainNode, t0: number, peak: number, attack: number, decay: number): void {
    const g = node.gain;
    g.setValueAtTime(0.0001, t0);
    g.exponentialRampToValueAtTime(Math.max(0.0001, peak), t0 + attack);
    g.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
  }

  private noiseBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /* ── SFX ───────────────────────────────────────────────────────── */

  /** Material-pair impact: filtered noise + low thump. Pitch drops with mass. */
  impact(matA: SoundMaterial, matB: SoundMaterial, energy: number, avgTier: number): void {
    if (!this.ctx || !this.sfxOn || energy < 0.05) return;
    const t0 = this.t;
    const massDrop = 1 - (avgTier / 11) * 0.55;

    // noise click voiced by the two materials
    for (const mat of [matA, matB]) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer();
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = MATERIAL_FREQ[mat] * massDrop;
      bp.Q.value = mat === "metal" ? 14 : mat === "glass" ? 10 : 4;
      const g = this.ctx.createGain();
      this.env(g, t0, 0.22 * energy, 0.002, 0.05 + energy * 0.05);
      src.connect(bp).connect(g).connect(this.sfxGain);
      src.start(t0);
      src.stop(t0 + 0.2);
    }
    // sub thump for weight
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120 * massDrop, t0);
    osc.frequency.exponentialRampToValueAtTime(45 * massDrop, t0 + 0.09);
    const og = this.ctx.createGain();
    this.env(og, t0, 0.3 * energy, 0.003, 0.09);
    osc.connect(og).connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + 0.15);
  }

  /** Magnetic snap + warm pentatonic blip, a degree per tier (GDD §11). */
  merge(tier: number): void {
    if (!this.ctx || !this.sfxOn) return;
    const t0 = this.t;

    // layer 1: magnet clack (two short noise ticks)
    for (const [dt, f] of [
      [0, 2600],
      [0.028, 1900],
    ] as const) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer();
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = f;
      bp.Q.value = 9;
      const g = this.ctx.createGain();
      this.env(g, t0 + dt, 0.28, 0.001, 0.035);
      src.connect(bp).connect(g).connect(this.sfxGain);
      src.start(t0 + dt);
      src.stop(t0 + dt + 0.1);
    }

    // layer 2: warm blip — pitch steps up the pentatonic per tier
    const semis = PENTATONIC[Math.min(tier - 1, PENTATONIC.length - 1)];
    const f0 = C4 * Math.pow(2, semis / 12) * (tier >= 10 ? 0.5 : 1); // big objects land deep
    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = f0;
    const osc2 = this.ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = f0 * 2;
    const g = this.ctx.createGain();
    const g2 = this.ctx.createGain();
    this.env(g, t0 + 0.03, 0.22, 0.008, 0.28 + tier * 0.02);
    this.env(g2, t0 + 0.03, 0.06, 0.008, 0.2);
    osc.connect(g).connect(this.sfxGain);
    osc2.connect(g2).connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + 0.6);
    osc2.start(t0);
    osc2.stop(t0 + 0.5);
  }

  /** Chain step — subtle tape-relay click that rises with the chain. */
  combo(chain: number): void {
    if (!this.ctx || !this.sfxOn) return;
    const t0 = this.t;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer();
    const bp = this.ctx.createBiquadFilter();
    bp.type = "highpass";
    bp.frequency.value = 3000 + chain * 500;
    const g = this.ctx.createGain();
    this.env(g, t0, 0.12, 0.001, 0.03);
    src.connect(bp).connect(g).connect(this.sfxGain);
    src.start(t0);
    src.stop(t0 + 0.06);
  }

  /** Launch: fingertip flick + felt slide. */
  launch(): void {
    if (!this.ctx || !this.sfxOn) return;
    const t0 = this.t;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer();
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(900, t0);
    bp.frequency.exponentialRampToValueAtTime(300, t0 + 0.16);
    bp.Q.value = 1.5;
    const g = this.ctx.createGain();
    this.env(g, t0, 0.16, 0.004, 0.15);
    src.connect(bp).connect(g).connect(this.sfxGain);
    src.start(t0);
    src.stop(t0 + 0.2);
  }

  /** UI sounds: PushKey click, SlideSwitch clunk, Dial tick. */
  ui(kind: "key" | "switch" | "tick" | "denied"): void {
    if (!this.ctx || !this.sfxOn) return;
    const t0 = this.t;
    if (kind === "switch") {
      for (const [dt, f] of [
        [0, 700],
        [0.05, 500],
      ] as const) {
        const o = this.ctx.createOscillator();
        o.type = "square";
        o.frequency.value = f;
        const g = this.ctx.createGain();
        this.env(g, t0 + dt, 0.05, 0.001, 0.03);
        o.connect(g).connect(this.sfxGain);
        o.start(t0 + dt);
        o.stop(t0 + dt + 0.05);
      }
      return;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer();
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = kind === "key" ? 2200 : kind === "tick" ? 4200 : 320;
    bp.Q.value = 8;
    const g = this.ctx.createGain();
    this.env(g, t0, kind === "denied" ? 0.2 : 0.14, 0.001, kind === "denied" ? 0.12 : 0.025);
    src.connect(bp).connect(g).connect(this.sfxGain);
    src.start(t0);
    src.stop(t0 + 0.15);
  }

  /** Rams Moment: everything ducks −6 dB, one soft vibraphone note. */
  ramsMoment(): void {
    if (!this.ctx) return;
    const t0 = this.t;
    // duck
    this.musicGain.gain.cancelScheduledValues(t0);
    this.musicGain.gain.setTargetAtTime(0.16, t0, 0.08);
    this.musicGain.gain.setTargetAtTime(0.32, t0 + 1.1, 0.4);
    this.duckUntil = performance.now() + 1500;
    if (!this.sfxOn) return;
    // vibraphone-ish: sine + 4th harmonic, long decay, slight tremolo
    const f = C4 * 2; // C5
    const o1 = this.ctx.createOscillator();
    o1.type = "sine";
    o1.frequency.value = f;
    const o2 = this.ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.value = f * 4;
    const g1 = this.ctx.createGain();
    const g2 = this.ctx.createGain();
    this.env(g1, t0, 0.18, 0.01, 1.4);
    this.env(g2, t0, 0.03, 0.01, 0.5);
    const trem = this.ctx.createOscillator();
    trem.frequency.value = 5;
    const tremG = this.ctx.createGain();
    tremG.gain.value = 0.06;
    trem.connect(tremG).connect(g1.gain);
    o1.connect(g1).connect(this.sfxGain);
    o2.connect(g2).connect(this.sfxGain);
    o1.start(t0);
    o1.stop(t0 + 1.6);
    o2.start(t0);
    o2.stop(t0 + 0.6);
    trem.start(t0);
    trem.stop(t0 + 1.6);
  }

  /* ── generative music: light electronic piano, slow jazz ─────────── */

  /** A soft e-piano note — sine stack with tremolo and a felt attack. */
  private ePiano(freq: number, t0: number, dur: number, vel: number): void {
    if (!this.ctx) return;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    lp.connect(this.musicGain);
    const trem = this.ctx.createOscillator();
    trem.frequency.value = 4.6;
    const tremDepth = this.ctx.createGain();
    tremDepth.gain.value = vel * 0.22;
    trem.connect(tremDepth);
    for (const [mult, amt] of [
      [1, 1],
      [2, 0.28],
      [4, 0.07],
    ] as const) {
      const o = this.ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq * mult;
      o.detune.value = (Math.random() - 0.5) * 4;
      const g = this.ctx.createGain();
      this.env(g, t0, vel * amt, 0.006, dur);
      if (mult === 1) tremDepth.connect(g.gain);
      o.connect(g).connect(lp);
      o.start(t0);
      o.stop(t0 + dur + 0.3);
    }
    trem.start(t0);
    trem.stop(t0 + dur + 0.3);
  }

  /** ~66 BPM ii–V–I–vi, swung brushes, sparse pentatonic melody. */
  startMusic(intensity: "zen" | "focus" | "speed" = "focus"): void {
    if (!this.ctx || !this.musicOn || this.musicTimer) return;
    const beatS = 60 / 66;
    const C3 = C4 / 2;
    const C2 = C4 / 4;
    // Dm9 → G13 → Cmaj9 → Am9 (voicings in semitones over C3; bass over C2)
    const CHORDS: { notes: number[]; bass: number }[] = [
      { notes: [14, 17, 21, 24], bass: 14 },
      { notes: [11, 17, 21, 26], bass: 7 },
      { notes: [16, 19, 23, 26], bass: 12 },
      { notes: [12, 16, 19, 23], bass: 9 },
    ];
    const PENTA = [24, 26, 28, 31, 33, 36]; // melody range, over C3
    this.musicStep = 0;

    this.musicTimer = setInterval(() => {
      if (!this.ctx || this.ctx.state !== "running") return;
      const t0 = this.t + 0.06;
      const beat = this.musicStep++;
      const bar = Math.floor(beat / 4) % 4;
      const inBar = beat % 4;
      const chord = CHORDS[bar];

      // comping: chord on beat 1, soft push on the swung "and" of 2
      if (inBar === 0) {
        chord.notes.forEach((s, i) =>
          this.ePiano(C3 * Math.pow(2, s / 12), t0 + i * 0.012, beatS * 3.2, 0.055)
        );
      }
      if (inBar === 2 && intensity !== "zen" && Math.random() < 0.5) {
        chord.notes.slice(1).forEach((s, i) =>
          this.ePiano(C3 * Math.pow(2, s / 12), t0 + beatS * 0.66 + i * 0.01, beatS * 1.2, 0.03)
        );
      }

      // bass: root on 1, fifth on 3 — round and quiet
      if (inBar === 0 || inBar === 2) {
        const s = inBar === 0 ? chord.bass : chord.bass + 7;
        const o = this.ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = C2 * Math.pow(2, s / 12);
        const g = this.ctx.createGain();
        this.env(g, t0, 0.11, 0.015, beatS * 1.6);
        o.connect(g).connect(this.musicGain);
        o.start(t0);
        o.stop(t0 + beatS * 2);
      }

      // melody: a swung pentatonic phrase note, sparse
      const mel = intensity === "zen" ? 0.18 : intensity === "speed" ? 0.45 : 0.3;
      if (Math.random() < mel) {
        const s = PENTA[Math.floor(Math.random() * PENTA.length)];
        const swing = Math.random() < 0.5 ? 0 : beatS * 0.66;
        this.ePiano(C3 * Math.pow(2, s / 12), t0 + swing, beatS * 1.4, 0.045);
      }
    }, beatS * 1000);
  }

  stopMusic(): void {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

/** Singleton — audio is a service (GDD §14). */
export const audio = new AudioEngine();
