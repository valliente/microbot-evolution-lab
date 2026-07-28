import { expect, test, describe } from 'vitest';
import { ccdSubstep, sanitizeVector, clamp } from '../physics';

describe('Physics Utils', () => {
  test('clamp correctly limits values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  test('sanitizeVector prevents NaNs', () => {
    expect(sanitizeVector(NaN)).toBe(0);
    expect(sanitizeVector(Infinity)).toBe(0);
    expect(sanitizeVector(-Infinity)).toBe(0);
    expect(sanitizeVector(5.5)).toBe(5.5);
  });

  test('ccdSubstep catches fast collision boundaries', () => {
    const pos = { x: 5, y: 5 };
    const vel = { x: 50, y: 0 };
    const radius = 2;
    const boundary = { x: 0, y: 0, width: 20, height: 10 };

    // At step 1, pos + vel = (55, 5) which is way out of bounds.
    const hasCollision = ccdSubstep(pos, vel, radius, boundary, 1.0);
    expect(hasCollision).toBe(true);
    
    // Position should be clamped to boundary
    expect(pos.x).toBe(18); // 20 - radius
  });
});
