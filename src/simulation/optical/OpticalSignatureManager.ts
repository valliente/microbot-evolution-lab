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

  public updateSignature(sig: OpticalSignature, dt: number): void {
    sig.emissionTimer += dt;
    const angularFreq = sig.frequencyHz * 2 * Math.PI;
    
    if (sig.pattern === 'PULSE') {
      sig.intensity = Math.max(0, Math.sin(sig.emissionTimer * angularFreq + sig.phase));
    } else if (sig.pattern === 'STROBE') {
      sig.intensity = Math.sin(sig.emissionTimer * angularFreq) > 0.6 ? 1.0 : 0.0;
    } else if (sig.pattern === 'CONTINUOUS') {
      sig.intensity = 0.85;
    } else if (sig.pattern === 'PHASE_SHIFT') {
      sig.phase += 0.02;
      sig.intensity = (Math.sin(sig.emissionTimer * angularFreq + sig.phase) + 1.0) * 0.5;
    }
  }

  public modulateWavelength(sig: OpticalSignature, deltaNm: number): void {
    sig.wavelengthNm = Math.max(380, Math.min(750, sig.wavelengthNm + deltaNm));
  }

  public calculatePerceivedOpticalSignal(
    sourceSig: OpticalSignature,
    distance: number,
    receiverOpticSensitivity: number = 1.0
  ): { perceivedIntensity: number; perceivedHueDelta: number } {
    if (distance <= 0) return { perceivedIntensity: sourceSig.intensity, perceivedHueDelta: 0 };
    
    // Inverse square law with fluid optical absorption
    const fluidAbsorption = Math.exp(-0.005 * distance);
    const attenuation = Math.max(0, (1.0 / (1.0 + 0.002 * distance * distance))) * fluidAbsorption;
    const perceivedIntensity = sourceSig.intensity * attenuation * receiverOpticSensitivity * (1.0 - sourceSig.camouflageFactor);
    const perceivedHueDelta = (sourceSig.wavelengthNm - 520) / 230;

    return { perceivedIntensity, perceivedHueDelta };
  }
}
