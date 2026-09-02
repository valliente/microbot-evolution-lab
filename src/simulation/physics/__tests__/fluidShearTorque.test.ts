import { describe, it, expect } from 'vitest';
import { FluidShearField } from '../FluidShearField';

describe('Turbulent Micro-Eddy Torque', () => {
  it('modulates microbot heading and applies kinetic drag', () => {
    const field = new FluidShearField();
    field.vorticity[0] = 3.0;
    field.shearMagnitude[0] = 5.0;

    const bot = { x: 5, y: 5, heading: 0.0 };
    field.applyShearTorqueToBot(bot);

    expect(bot.heading).not.toBe(0.0);

    const { damage, dragMultiplier } = field.calculateShearDamageAndDrag(bot);
    expect(damage).toBeGreaterThan(0);
    expect(dragMultiplier).toBeGreaterThan(1.0);
  });
});
