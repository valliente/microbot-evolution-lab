import { describe, it, expect } from 'vitest';
import { OpticalSignatureManager } from '../OpticalSignatureManager';

describe('Optical Diffraction & Fluid Scattering', () => {
  it('calculates spectral scattering and diffraction angle in fluid', () => {
    const manager = new OpticalSignatureManager();
    const result = manager.calculateFluidDiffraction(500, 1.2);

    expect(result.diffractionAngle).toBeGreaterThan(0);
    expect(result.spectralScattering).toBeGreaterThan(0);
  });
});
