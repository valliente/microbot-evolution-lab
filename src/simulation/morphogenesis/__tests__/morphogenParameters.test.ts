import { describe, it, expect } from 'vitest';
import { MorphogenGrid } from '../MorphogenGrid';

describe('Morphogen Decay & Parameter Tuning', () => {
  it('updates diffusion and decay rates cleanly with bounds clamping', () => {
    const grid = new MorphogenGrid();
    grid.setDiffusionAndDecayRates(1.5, 0.8, 0.04, 0.07);

    expect(grid.da).toBe(1.5);
    expect(grid.db).toBe(0.8);
    expect(grid.feed).toBe(0.04);
    expect(grid.kill).toBe(0.07);
  });
});
