import { describe, it, expect } from 'vitest';
import { ViralImmunityManager, ViralSpore, ImmunityProfile } from '../ViralImmunityManager';

describe('Viral Infection & Chromosome Splicing', () => {
  it('calculates infection odds with resistance', () => {
    const manager = new ViralImmunityManager();
    const spore: ViralSpore = {
      id: 'v1',
      x: 10,
      y: 10,
      vx: 0,
      vy: 0,
      viralLoad: 1.0,
      genomeSequence: 'ATCG',
      lifetimeFrames: 100
    };
    const immunity: ImmunityProfile = {
      antibodyLevels: { 'ATCG': 0.5 },
      infectionHistory: [],
      isInfected: false,
      viralLoad: 0
    };

    const prob = manager.calculateInfectionProbability(spore, immunity);
    expect(prob).toBeLessThan(0.05);
  });
});
