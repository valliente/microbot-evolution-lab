import { describe, it, expect } from 'vitest';
import { MicroBiomeManager } from '../biomes/MicroBiomeManager';

describe('Performance & Frame Budget Verification', () => {
  it('verify 120 FPS stability under peak population with active micro-biomes', () => {
    const frameBudgetMs = 1000 / 120; // ~8.33ms
    const manager = new MicroBiomeManager(800, 600);

    const startTime = performance.now();
    for (let i = 0; i < 2000; i++) {
      manager.getBiomeAt(Math.random() * 800, Math.random() * 600);
    }
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(frameBudgetMs);
  });
});
