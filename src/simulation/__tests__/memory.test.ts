import { expect, test, describe } from 'vitest';
import { MicrobotEngine } from '../MicrobotEngine';
import { SimulationConfig } from '../types';

describe('Engine Memory Deallocation', () => {
  test('resetSimulation clears all entity arrays and tracks', () => {
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
    engine.spawnMicrobot(400, 300);
    engine.update(1.0);

    expect(engine.microbots.length).toBeGreaterThan(0);
    
    engine.resetSimulation();

    expect(engine.microbots.length).toBe(0);
    expect(engine.energyParticles.length).toBe(0);
    expect(engine.hazards.length).toBe(0);
    expect(engine.selectedMicrobotId).toBeNull();
  });
});
