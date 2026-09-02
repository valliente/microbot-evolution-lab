import { describe, it, expect } from 'vitest';
import { HGTManager } from '../HGTManager';

describe('HGT Conjugation Pilus & Plasmid Transfer', () => {
  it('creates conjugation bridge and executes plasmid transfer cycle', () => {
    const manager = new HGTManager();
    const bridge = manager.formConjugationBridge('bot-A', 'bot-B', 'PLASMID-KINETICS');

    expect(bridge).not.toBeNull();
    expect(manager.getBridgeCount()).toBe(1);

    let completed = false;
    manager.updateConjugationCycles(45, () => {
      completed = true;
    });

    expect(completed).toBe(true);
    expect(manager.transferSuccessCount).toBe(1);
    expect(manager.getBridgeCount()).toBe(0);
  });
});
