import { describe, it, expect } from 'vitest';
import { ViralImmunityManager, ImmunityProfile } from '../ViralImmunityManager';

describe('Antibody Production & Immunity Decay', () => {
  it('builds antibodies during infection and clears virus upon threshold', () => {
    const manager = new ViralImmunityManager();
    const immunity: ImmunityProfile = {
      antibodyLevels: { 'v1': 0.84 },
      infectionHistory: [],
      isInfected: true,
      activeVirusId: 'v1',
      viralLoad: 0.5
    };

    manager.updateImmunityProfile(immunity);
    expect(immunity.antibodyLevels['v1']).toBeGreaterThanOrEqual(0.81);
    expect(immunity.isInfected).toBe(false);
  });
});
