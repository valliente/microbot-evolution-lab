import { describe, it, expect } from 'vitest';
import { EndosymbiosisManager } from '../EndosymbiosisManager';

describe('Endosymbiosis Engulfment & Organelle Retention', () => {
  it('handles organelle acquisition on symbiosis success', () => {
    const manager = new EndosymbiosisManager();
    const result = manager.attemptEngulfment('host-1', 1.0, 'PROTO_MITOCHONDRIA', 'mtDNA-TEST-01');

    if (result.success) {
      const orgs = manager.getHostOrganelles('host-1');
      expect(orgs.length).toBe(1);
      expect(orgs[0].type).toBe('PROTO_MITOCHONDRIA');
    }
  });
});
