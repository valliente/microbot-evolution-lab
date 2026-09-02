import { describe, it, expect } from 'vitest';
import { HGTManager } from '../HGTManager';

describe('HGT Pilus Rupture under Fluid Shear', () => {
  it('ruptures conjugation pilus when fluid shear stress exceeds threshold', () => {
    const manager = new HGTManager();
    const bridge = manager.formConjugationBridge('donor-1', 'recipient-1');
    expect(bridge).not.toBeNull();

    const ruptured = manager.checkShearPilusRupture(bridge!.id, 40.0, 3.5);
    expect(ruptured).toBe(true);
    expect(manager.getBridgeCount()).toBe(0);
  });
});
