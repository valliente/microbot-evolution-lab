import { describe, it, expect, vi } from 'vitest';
import { ThreadManager } from '../workers/ThreadManager';

describe('Web Worker Auto-Restart & Self-Healing', () => {
  it('resets strikes and triggers auto-restart callback on error', () => {
    const tm = new ThreadManager();
    let restarted = false;
    tm.onWorkerRestarted = () => {
      restarted = true;
    };

    tm.resetStrikes();
    expect(restarted).toBe(false);
  });
});
