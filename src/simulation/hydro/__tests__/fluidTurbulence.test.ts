import { describe, it, expect } from 'vitest';
import { FluidVectorField } from '../FluidVectorField';

describe('Fluid Vortex & Turbulence Generation', () => {
  it('creates tangential rotational velocities around vortex center', () => {
    const field = new FluidVectorField(1000, 1000, 40);
    field.createVortex(200, 200, 10.0, 60);

    const topCell = field.getVelocity(200, 180);
    const bottomCell = field.getVelocity(200, 220);

    expect(Math.abs(topCell.vx)).toBeGreaterThan(0);
    expect(Math.abs(bottomCell.vx)).toBeGreaterThan(0);
  });
});
