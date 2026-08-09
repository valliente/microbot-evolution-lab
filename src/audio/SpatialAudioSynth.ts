export class SpatialAudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Start muted by default to avoid startup noise
  private masterGain: GainNode | null = null;
  private masterVolume: number = 0.3;
  private lastFeedTime: number = 0;
  private feedCooldownMs: number = 80; // Minimum ms between feed sounds to prevent buzzing
  private activeOscCount: number = 0;
  private maxConcurrentOsc: number = 6; // Increased for spatial events
  private spatialPanners: Map<number, StereoPannerNode> = new Map();
  
  // Ring buffers for acoustic telemetry (avoids GC pauses)
  private telemetryBufferIdx: number = 0;
  private readonly telemetrySize: number = 256;
  public velocityMetrics: Float32Array = new Float32Array(256);
  public stressMetrics: Float32Array = new Float32Array(256);

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  public sanitizeReset(): void {
    this.spatialPanners.forEach(panner => {
      try { panner.disconnect(); } catch (e) {}
    });
    this.spatialPanners.clear();
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.05);
      } catch (e) {}
    }
    this.activeOscCount = 0;
    if (this.ctx && this.ctx.state === 'suspended') {
      try { this.ctx.resume(); } catch (e) {}
    }
  }

  // Fix(audio): sanitize audio node cleanup on app exit to prevent ghost hums
  public dispose(): void {
    this.stopAmbientDrone();
    this.spatialPanners.forEach(panner => {
      try { panner.disconnect(); } catch (e) {}
    });
    this.spatialPanners.clear();
    if (this.masterGain) {
      try { this.masterGain.disconnect(); } catch (e) {}
      this.masterGain = null;
    }
    if (this.ctx) {
      try { 
        if (this.ctx.state !== 'closed') {
          this.ctx.close(); 
        }
      } catch (e) {}
      this.ctx = null;
    }
    this.activeOscCount = 0;
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

  // Gets or creates a spatial panner for a given x-coordinate (normalized -1 to 1)
  private getSpatialPanner(xPos: number): StereoPannerNode | null {
    if (!this.ctx) return null;
    // Map x position (assumed 0 to 800 roughly) to -1.0 to +1.0
    const panValue = Math.max(-1, Math.min(1, (xPos - 400) / 400));
    
    // Simple object pooling by rounding pan value to 1 decimal place
    const pannerKey = Math.round(panValue * 10);
    if (!this.spatialPanners.has(pannerKey)) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = panValue;
      panner.connect(this.masterGain!);
      this.spatialPanners.set(pannerKey, panner);
    }
    return this.spatialPanners.get(pannerKey) || null;
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

  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  public playAmbientDrone(velocity: number, stress: number): void {
    // Record telemetry in ring buffers
    this.velocityMetrics[this.telemetryBufferIdx] = velocity;
    this.stressMetrics[this.telemetryBufferIdx] = stress;
    this.telemetryBufferIdx = (this.telemetryBufferIdx + 1) % this.telemetrySize;

    if (this.isMuted) {
      this.stopAmbientDrone();
      return;
    }
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      if (!this.droneOsc || !this.droneGain) {
        this.droneOsc = this.ctx.createOscillator();
        this.droneGain = this.ctx.createGain();
        this.droneOsc.type = 'sine';
        this.droneOsc.connect(this.droneGain);
        this.droneGain.connect(this.masterGain);
        
        // Start very quietly
        this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.droneOsc.start();
      }

      // Map velocity to frequency (e.g., 50Hz to 150Hz)
      const targetFreq = 50 + (velocity * 20);
      // Map stress to volume
      const targetVol = Math.max(0.001, Math.min(0.15, stress * 0.15));

      // Smoothly transition parameters
      this.droneOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.5);
      this.droneGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 1.0);
    } catch (e) {
      // Ignored
    }
  }

  public stopAmbientDrone(): void {
    if (this.droneOsc && this.droneGain) {
      try {
        this.droneOsc.stop();
        this.droneOsc.disconnect();
        this.droneGain.disconnect();
      } catch (e) {}
      this.droneOsc = null;
      this.droneGain = null;
    }
  }

  public playBiomeHum(biomeType: string): void {
    if (this.isMuted) return;
    if (this.activeOscCount >= this.maxConcurrentOsc) return;

    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      if (biomeType === 'TOXIC_SLUDGE') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, this.ctx.currentTime);
      } else if (biomeType === 'CRYO_ZONE') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      } else if (biomeType === 'HIGH_G_FIELD') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(45, this.ctx.currentTime);
      } else {
        return; // NORMAL biome has no extra hum
      }

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.activeOscCount++;
      osc.onended = () => {
        this.activeOscCount = Math.max(0, this.activeOscCount - 1);
        try { gain.disconnect(); } catch (_) {}
      };

      osc.start();
      osc.stop(this.ctx.currentTime + 3.0);
    } catch (e) {
      // Audio autoplay restrictions catch
    }
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

  public playDisasterSound(type: 'METEOR' | 'VOID' | 'VIRUS' | 'STORM' | 'INVERSION' | 'FLARE'): void {
    if (this.isMuted) return;
    if (this.activeOscCount >= this.maxConcurrentOsc) return;

    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      if (type === 'METEOR' || type === 'STORM') {
         osc.type = 'sawtooth';
         osc.frequency.setValueAtTime(150, this.ctx.currentTime);
         osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 1.0);
      } else if (type === 'VOID' || type === 'INVERSION') {
         osc.type = 'triangle';
         osc.frequency.setValueAtTime(40, this.ctx.currentTime);
         osc.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + 0.8);
      } else {
         osc.type = 'square';
         osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      }

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);

      osc.connect(gain);
      gain.connect(this.masterGain);

      this.activeOscCount++;
      osc.onended = () => {
        this.activeOscCount = Math.max(0, this.activeOscCount - 1);
        try { gain.disconnect(); } catch (_) {}
      };

      osc.start();
      osc.stop(this.ctx.currentTime + 1.0);
    } catch (e) {
       // Ignore autoplay policy errors
    }
  }

  public playSpeciationEvent(xPos: number): void {
    if (this.isMuted) return;
    if (this.activeOscCount >= this.maxConcurrentOsc) return;

    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const panner = this.getSpatialPanner(xPos);
      if (!panner) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(panner); // Connect to spatial panner instead of master directly

      this.activeOscCount++;
      osc.onended = () => {
        this.activeOscCount = Math.max(0, this.activeOscCount - 1);
        try { gain.disconnect(); } catch (_) {}
      };

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }

  public playExtinctionEvent(xPos: number): void {
    if (this.isMuted) return;
    if (this.activeOscCount >= this.maxConcurrentOsc) return;

    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const panner = this.getSpatialPanner(xPos);
      if (!panner) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(panner);

      this.activeOscCount++;
      osc.onended = () => {
        this.activeOscCount = Math.max(0, this.activeOscCount - 1);
        try { gain.disconnect(); } catch (_) {}
      };

      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    } catch (e) {}
  }
}

export const spatialAudio = new SpatialAudioSynth();
