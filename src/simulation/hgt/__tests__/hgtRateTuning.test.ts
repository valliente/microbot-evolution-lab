import { describe, it, expect } from 'vitest';
import { HGTManager } from '../HGTManager';

describe('HGT Dynamic Rate Tuning', () => {
  it('updates and clamps conjugation rate multiplier cleanly', () => {
    const manager = new HGTManager();
    manager.setConjugationRateMultiplier(3.5);
    expect(manager.conjugationRateMultiplier).toBe(3.5);

    manager.setConjugationRateMultiplier(15.0);
    expect(manager.conjugationRateMultiplier).toBe(10.0);
  });
});
