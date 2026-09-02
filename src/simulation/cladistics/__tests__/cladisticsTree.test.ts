import { describe, it, expect } from 'vitest';
import { CladisticsTree } from '../CladisticsTree';

describe('Cladistics Tree & Ancestral Reconstruction', () => {
  it('deduces inherited synapomorphies across clade lineage', () => {
    const tree = new CladisticsTree();
    tree.registerClade('clade-1', 'root-ancestor', 'DERMAL_ARMOR', 1.2);
    tree.registerClade('clade-2', 'clade-1', 'CILIA_PROPULSION', 1.5);

    const states = tree.reconstructAncestralState('clade-2');
    expect(states).toContain('BASAL_METABOLISM');
    expect(states).toContain('DERMAL_ARMOR');
    expect(states).toContain('CILIA_PROPULSION');
  });
});
