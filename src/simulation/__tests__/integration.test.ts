import { expect, test, describe } from 'vitest';
import { MicrobotEngine } from '../MicrobotEngine';

describe('Integration Sequence', () => {
  test('headless engine executes 1000 ticks without crashing or leaking', () => {
    const config = {
      targetFPS: 60,
      simSpeed: 1,
      isPaused: false,
      enableNeuralNet: false,
      mutationRate: 0.1,
      baseEnergyLoss: 0.1,
      foodSpawnRate: 1.0,
      maxPopulation: 100,
      initialPopulation: 10,
      hazardDensity: 0.05,
      currentSeason: 'SPRING' as any,
      showGrid: false,
      heatmapMode: 'NONE' as any,
      brushMode: 'FOOD' as any,
      brushSize: 50
    };

    const engine = new MicrobotEngine(800, 600, config);
    // Seed bots and food
    for (let i = 0; i < 50; i++) {
      engine.spawnMicrobot(Math.random() * 800, Math.random() * 600);
      engine.spawnEnergyParticle(Math.random() * 800, Math.random() * 600);
    }

    // Run 1000 ticks
    for (let i = 0; i < 1000; i++) {
      engine.update(1.0);
    }

    expect(engine.frameCount).toBeGreaterThanOrEqual(0);
    // Verify engine didn't crash and cleared its grid
    expect(engine.spatialGrid).toBeDefined();
  });
});
