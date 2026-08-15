export interface OpticalSignature {
  wavelengthNm: number; // 380 - 750 nm
  frequencyHz: number;  // 0.1 - 20.0 Hz
  intensity: number;    // 0.0 - 1.0
  phase: number;        // 0.0 - 2PI
  emissionTimer: number;
  pattern: 'PULSE' | 'CONTINUOUS' | 'STROBE' | 'PHASE_SHIFT';
  camouflageFactor: number; // 0.0 - 1.0
}

export class OpticalSignatureManager {
  public defaultWavelength: number = 520; // Emerald Green (nm)

  constructor() {}

  public createSignature(
    wavelengthNm: number = 520,
    frequencyHz: number = 1.0,
    pattern: 'PULSE' | 'CONTINUOUS' | 'STROBE' | 'PHASE_SHIFT' = 'PULSE'
  ): OpticalSignature {
    return {
      wavelengthNm: Math.max(380, Math.min(750, wavelengthNm)),
      frequencyHz: Math.max(0.1, Math.min(20.0, frequencyHz)),
      intensity: 0.8,
      phase: Math.random() * Math.PI * 2,
      emissionTimer: 0,
      pattern,
      camouflageFactor: 0.0
    };
  }
}
