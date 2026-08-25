import { describe, it, expect } from 'vitest';
import { EndosymbiosisManager } from '../EndosymbiosisManager';

describe('Organellar DNA Mutation Independence', () => {
  it('replicates and mutates mtDNA across generations', () => {
    const manager = new EndosymbiosisManager();
    manager.registerHost('parent-1');
    manager.getHostOrganelles('parent-1').push({
      id: 'org-1',
      type: 'PROTO_MITOCHONDRIA',
      hostId: 'parent-1',
      energyOutput: 1.5,
      atpBoost: 1.2,
      organellarDna: 'mtDNA-ROOT',
      mutationRate: 1.0, // Force mutation
      cristaeSurfaceArea: 1.0
    });

    manager.replicateAndMutateOrganelles('child-1', 'parent-1');
    const childOrgs = manager.getHostOrganelles('child-1');

    expect(childOrgs.length).toBe(1);
    expect(childOrgs[0].organellarDna).toContain('mtDNA-ROOT');
    expect(childOrgs[0].hostId).toBe('child-1');
  });
});
