import { describe, it, expect } from 'vitest';
import { clamp } from '../simulation/utils';

describe('Genetic Catalyst Engine', () => {
  it('should strictly enforce chromosome mutation boundaries', () => {
    // SPEED is clamped between 1.0 and 5.0
    const startSpeed = 4.9;
    const mutationAmount = 0.5; // positive mutation
    const endSpeed = clamp(startSpeed + mutationAmount, 1.0, 5.0);
    
    expect(endSpeed).toBe(5.0); // Should not exceed 5.0
    
    const startSpeed2 = 1.2;
    const mutationAmount2 = -0.5; // negative mutation
    const endSpeed2 = clamp(startSpeed2 + mutationAmount2, 1.0, 5.0);
    
    expect(endSpeed2).toBe(1.0); // Should not drop below 1.0
  });
});
