import { describe, it, expect } from 'vitest';
import { MorphogenGrid } from '../MorphogenGrid';

describe('Morphogen-Induced Cellular Differentiation', () => {
  it('determines ectoderm/mesoderm/endoderm fates based on local concentrations', () => {
    const grid = new MorphogenGrid();
    const fate = grid.getDifferentiationFate(100, 100);

    expect(['ECTODERM', 'MESODERM', 'ENDODERM']).toContain(fate);

    const symmetry = grid.calculateSymmetryOffset(100, 100, 10);
    expect(symmetry.offsetX).toBeDefined();
    expect(symmetry.offsetY).toBeDefined();
  });
});
