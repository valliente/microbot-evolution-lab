import { describe, it, expect } from 'vitest';
import { MulticellularManager } from '../MulticellularManager';

describe('Multicellular Bonding & Force Distribution', () => {
  it('creates cell tissue bindings and calculates restoring force', () => {
    const manager = new MulticellularManager();
    const binding = manager.createBinding('botA', 'botB', 20.0);

    const { forceMagnitude, isBroken } = manager.calculateBondForce(binding, 25.0);
    expect(forceMagnitude).toBeLessThan(0); // Restoring force
    expect(isBroken).toBe(false);
  });
});
