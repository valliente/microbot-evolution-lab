import { describe, it, expect } from 'vitest';
import { FluidShearField } from '../FluidShearField';

describe('Fluid Boundary Layer Shear Calculations', () => {
  it('calculates spatial velocity shear gradients cleanly', () => {
    const field = new FluidShearField(200, 200, 20);
    const vx = new Float32Array(field.cols * field.rows).fill(2.0);
    const vy = new Float32Array(field.cols * field.rows).fill(0.0);

    // Add gradient in middle
    vx[field.cols * 3 + 3] = 6.0;

    field.calculateBoundaryLayerShear(vx, vy);
    const stress = field.getShearStress(60, 60);

    expect(stress.shear).toBeGreaterThanOrEqual(0);
    expect(stress.eddyTorque).toBeDefined();
  });
});
