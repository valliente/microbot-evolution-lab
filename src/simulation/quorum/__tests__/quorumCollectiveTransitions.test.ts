import { describe, it, expect } from 'vitest';
import { QuorumManager } from '../QuorumManager';

describe('Quorum Collective State Transitions', () => {
  it('triggers swarming, defensive wall, and sporulation correctly', () => {
    const manager = new QuorumManager();

    expect(manager.evaluateCollectiveBehavior(0.2)).toBe('SOLITARY');
    expect(manager.evaluateCollectiveBehavior(0.7)).toBe('SWARMING');
    expect(manager.evaluateCollectiveBehavior(0.95, 0.5)).toBe('DEFENSIVE_WALL');
    expect(manager.evaluateCollectiveBehavior(1.3, 0.1, 0.8)).toBe('SPORULATION');
  });
});
