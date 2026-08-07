import { describe, it, expect } from 'vitest';
import { MicroBiomeManager } from '../MicroBiomeManager';

describe('Micro-Biome Friction and Mutation Multipliers', () => {
  it('applies viscous swamp drag and radiation zone elevated mutation', () => {
    const manager = new MicroBiomeManager(800, 600);
    const swamp = manager.calculateViscousSwampEffects(10, 10, 50);
    expect(swamp.vx).toBeLessThan(10);
    expect(swamp.energy).toBeLessThan(50);

    const rad = manager.calculateRadiationZoneEffects(0.05, 50);
    expect(rad.mutationRate).toBeGreaterThan(0.05);
  });
});
