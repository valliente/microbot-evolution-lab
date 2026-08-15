import { describe, it, expect } from 'vitest';
import { OpticalSignatureManager } from '../OpticalSignatureManager';

describe('Optical Signal Emission & Reception', () => {
  it('updates pulse intensity and calculates attenuated reception', () => {
    const manager = new OpticalSignatureManager();
    const sig = manager.createSignature(520, 2.0, 'PULSE');
    sig.phase = Math.PI / 2; // Peak intensity
    manager.updateSignature(sig, 0.0);

    const reception = manager.calculatePerceivedOpticalSignal(sig, 50.0, 1.0);
    expect(reception.perceivedIntensity).toBeGreaterThan(0);
    expect(reception.perceivedIntensity).toBeLessThanOrEqual(sig.intensity);
  });
});
