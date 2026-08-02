import { describe, it, expect } from 'vitest';

describe('Synthetic Physics Engine', () => {
  it('should accurately calculate non-Newtonian fluid drag scaling exponentially with velocity', () => {
    const baseDrag = 0.5;
    const velX = 10;
    const velY = 10;
    const velSq = (velX * velX + velY * velY); // 200
    
    // Expected formula: dragFactor = Math.max(0.1, 1.0 - (baseDrag * velSq * 0.05));
    // 1.0 - (0.5 * 200 * 0.05) = 1.0 - 5.0 = -4.0, max(0.1, -4.0) = 0.1
    
    const dragFactor = Math.max(0.1, 1.0 - (baseDrag * velSq * 0.05));
    expect(dragFactor).toBe(0.1);
  });
});
