import { expect, test, describe } from 'vitest';
import { PheromoneGrid } from '../PheromoneGrid';

describe('PheromoneGrid', () => {
  test('Pheromone emits and updates correctly', () => {
    const grid = new PheromoneGrid(100, 100, 10);
    grid.emitPheromone(50, 50, 1.0);
    expect(grid.getPheromone(50, 50)).toBeCloseTo(1.0);
  });

  test('Pheromone decays over time', () => {
    const grid = new PheromoneGrid(100, 100, 10);
    grid.emitPheromone(50, 50, 1.0);
    grid.update(1.0); // 1 frame
    expect(grid.getPheromone(50, 50)).toBeLessThan(1.0);
  });

  test('Pheromone diffuses to neighbors', () => {
    const grid = new PheromoneGrid(100, 100, 10);
    grid.emitPheromone(50, 50, 1.0);
    grid.update(1.0); // Diffuse and decay
    
    // Check neighbor at (60, 50) since resolution is 10
    expect(grid.getPheromone(60, 50)).toBeGreaterThan(0);
  });
});
