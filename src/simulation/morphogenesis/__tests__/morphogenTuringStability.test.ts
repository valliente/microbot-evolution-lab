import { describe, it, expect } from 'vitest';
import { MorphogenGrid } from '../MorphogenGrid';

describe('Morphogen Turing Pattern Stability', () => {
  it('bounds activator and inhibitor concentrations within [0, 1]', () => {
    const grid = new MorphogenGrid(200, 200, 20);
    grid.updateTuringStep(1.0);

    for (let i = 0; i < grid.activator.length; i++) {
      expect(grid.activator[i]).toBeGreaterThanOrEqual(0);
      expect(grid.activator[i]).toBeLessThanOrEqual(1.0);
      expect(grid.inhibitor[i]).toBeGreaterThanOrEqual(0);
      expect(grid.inhibitor[i]).toBeLessThanOrEqual(1.0);
    }
  });
});
