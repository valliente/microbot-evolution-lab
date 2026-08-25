import { describe, it, expect } from 'vitest';
import { EndosymbiosisManager } from '../EndosymbiosisManager';

describe('Cristae Surface Area Boost', () => {
  it('increases cristae folding and energy output', () => {
    const manager = new EndosymbiosisManager();
    manager.registerHost('host-cristae');
    manager.getHostOrganelles('host-cristae').push({
      id: 'org-cristae',
      type: 'PROTO_MITOCHONDRIA',
      hostId: 'host-cristae',
      energyOutput: 2.0,
      atpBoost: 1.5,
      organellarDna: 'mtDNA-FOLD',
      mutationRate: 0.05,
      cristaeSurfaceArea: 1.0
    });

    manager.boostCristaeDensity('host-cristae', 'org-cristae', 0.5);
    const org = manager.getHostOrganelles('host-cristae')[0];
    expect(org.cristaeSurfaceArea).toBeGreaterThan(1.0);
    expect(org.energyOutput).toBeGreaterThan(2.0);
  });
});
