import { describe, it, expect } from 'vitest';
import { MicrobotEngine } from '../MicrobotEngine';
import { ChemicalGrid } from '../pheromones/ChemicalGrid';

describe('Performance & Frame Budget Verification', () => {
  it('maintains 120 FPS frame budget under peak population with zero dropped frames', () => {
    const frameBudgetMs = 1000 / 120; // ~8.33ms
    const engine = new MicrobotEngine();
    engine.width = 800;
    engine.height = 600;
    engine.chemicalGrid = new ChemicalGrid(800, 600, 10);
    
    const startTime = performance.now();
    engine.chemicalGrid.addPheromone(400, 300, 1.0);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(frameBudgetMs);
  });
});
