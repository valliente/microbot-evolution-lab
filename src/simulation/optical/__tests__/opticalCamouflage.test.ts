import { describe, it, expect } from 'vitest';
import { OpticalSignatureManager } from '../OpticalSignatureManager';

describe('Optical Camouflage Mechanics', () => {
  it('calculates higher camouflage factor when wavelength matches background biome', () => {
    const manager = new OpticalSignatureManager();
    const matchedFactor = manager.calculateCamouflageFactor(520, 520, 0.8);
    const mismatchedFactor = manager.calculateCamouflageFactor(700, 520, 0.8);

    expect(matchedFactor).toBeGreaterThan(mismatchedFactor);
    expect(matchedFactor).toBeGreaterThan(0.7);
  });
});
