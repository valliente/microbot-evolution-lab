import { describe, it, expect } from 'vitest';
import { QuorumManager } from '../QuorumManager';

describe('Quorum Refractory Recovery Timer', () => {
  it('prevents immediate re-emission during refractory window', () => {
    const manager = new QuorumManager();
    expect(manager.canEmit('bot-1')).toBe(true);

    manager.refractoryTimers.set('bot-1', 60);
    expect(manager.canEmit('bot-1')).toBe(false);

    manager.updateRefractoryTimers(60);
    expect(manager.canEmit('bot-1')).toBe(true);
  });
});
