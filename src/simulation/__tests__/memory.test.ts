import { expect, test, describe } from 'vitest';
import { MicrobotEngine } from '../MicrobotEngine';

describe('Engine Memory & 20-Reset RAM Stability', () => {
  test('resetSimulation maintains RAM stability across 20 consecutive world resets with Organelle & Micro-Biome cleanup', () => {
    const engine = new MicrobotEngine();
    engine.width = 800;
    engine.height = 600;

    for (let i = 0; i < 20; i++) {
      engine.spawnMultipleBots(50);
      engine.resetSimulation();
      expect(engine.microbots.length).toBe(0);
      expect(engine.energyParticles.length).toBe(0);
      expect(engine.hazards.length).toBe(0);
      expect(engine.selectedMicrobotId).toBeNull();
    }
  });
});
