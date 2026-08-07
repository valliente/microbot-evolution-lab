import { describe, it, expect } from 'vitest';
import { OrganelleEngine } from '../OrganelleEngine';
import { Microbot } from '../../types';

describe('Mitochondrial DNA Inheritance Transmission', () => {
  it('transmits mitochondrial DNA to offspring with efficiency bonus persistence', () => {
    const parent: Partial<Microbot> = {
      id: 'parent-1',
      mitochondrialDNA: {
        sequence: 'ATCG-MTO-999',
        efficiencyBonus: 1.3,
        mutationRateMultiplier: 1.0,
        inheritedFromId: 'ANCESTOR'
      }
    };

    const child: Partial<Microbot> = { id: 'child-1' };
    OrganelleEngine.inheritOrganellesToOffspring(parent as Microbot, child as Microbot, 0.05);

    expect(child.mitochondrialDNA).toBeDefined();
    expect(child.mitochondrialDNA?.inheritedFromId).toBe('parent-1');
    expect(child.mitochondrialDNA?.efficiencyBonus).toBeGreaterThan(1.0);
  });
});
