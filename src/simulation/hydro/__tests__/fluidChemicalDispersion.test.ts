import { describe, it, expect } from 'vitest';
import { FluidVectorField } from '../FluidVectorField';

describe('Fluid Chemical Dispersion', () => {
  it('disperses particles along fluid current trajectories', () => {
    const field = new FluidVectorField(1000, 1000, 50);
    field.addForce(200, 200, 20, 0, 100);

    const particles = [{ x: 200, y: 200, vx: 0, vy: 0 }];
    field.disperseParticles(particles, 0.5);

    expect(particles[0].x).toBeGreaterThan(200);
  });
});
