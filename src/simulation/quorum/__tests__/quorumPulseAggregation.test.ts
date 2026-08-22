import { describe, it, expect } from 'vitest';
import { QuorumManager } from '../QuorumManager';

describe('Quorum Pulse Aggregation & Thresholds', () => {
  it('correctly aggregates electrical pulses across spatial coordinates', () => {
    const manager = new QuorumManager(1000, 1000);
    manager.emitPulse('bot-1', 100, 100, 50);
    manager.emitPulse('bot-2', 110, 105, 75);

    const density = manager.calculateLocalDensity(105, 102, 50);
    expect(density).toBeGreaterThan(0.2);

    manager.updatePulseGrid(1.0);
    expect(manager.pulses.length).toBe(2);
  });
});
