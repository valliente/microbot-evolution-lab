export class SpatialAudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Start muted by default to avoid startup noise
  private masterGain: GainNode | null = null;
  private masterVolume: number = 0.3;
  private lastFeedTime: number = 0;
  private feedCooldownMs: number = 80; // Minimum ms between feed sounds to prevent buzzing
  private activeOscCount: number = 0;
  private maxConcurrentOsc: number = 4; // Hard cap on simultaneous oscillators

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  private initCtx(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        try {
          this.ctx = new AudioContextClass();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        } catch (e) {
          this.ctx = null;
          this.masterGain = null;
        }
      }
    }
  }

  public setVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public playFeedSound(freq: number = 440): void {
    if (this.isMuted) return;

    // Rate-limit: skip if too soon after last feed sound
    const now = performance.now();
    if (now - this.lastFeedTime < this.feedCooldownMs) return;
    this.lastFeedTime = now;

    // Cap concurrent oscillators to prevent audio stack overflow
    if (this.activeOscCount >= this.maxConcurrentOsc) return;

    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      // Clamp frequency to a sane audible range to prevent harsh pitches
      const clampedFreq = Math.max(220, Math.min(880, freq));

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(clampedFreq, this.ctx.currentTime);

      // Gentle envelope: quick fade-in, smooth fade-out
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.activeOscCount++;
      osc.onended = () => {
        this.activeOscCount = Math.max(0, this.activeOscCount - 1);
        try { gain.disconnect(); } catch (_) {}
      };

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {
      // Audio autoplay restrictions catch — fail silently
    }
  }

  public playAmbientDrone(_avgEnergyPct: number = 0.5): void {
    // Ambient drone removed — it was a source of persistent background buzzing
    // Kept as no-op for API compatibility
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    // Immediately silence master output when muting
    if (this.isMuted && this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    } else if (!this.isMuted && this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const spatialAudio = new SpatialAudioSynth();
