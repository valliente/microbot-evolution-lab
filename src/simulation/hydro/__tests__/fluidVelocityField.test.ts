import { describe, it, expect } from 'vitest';
import { FluidVectorField } from '../FluidVectorField';

describe('Fluid Velocity Field Calculations & Drag', () => {
  it('correctly calculates force additions and drag interactions', () => {
    const field = new FluidVectorField(1000, 1000, 50);
    field.addForce(100, 100, 10, 5, 80);

    const vel = field.getVelocity(100, 100);
    expect(vel.vx).toBeGreaterThan(0);
    expect(vel.vy).toBeGreaterThan(0);

    const influence = field.calculateFluidInfluence(100, 100, 0, 0, 0.1);
    expect(influence.forceX).toBeGreaterThan(0);
  });
});
