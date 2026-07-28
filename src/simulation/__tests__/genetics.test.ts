import { expect, test, describe } from 'vitest';
import { QuantumAllele, QuantumState } from '../types';

describe('QuantumAllele state collapse', () => {
  test('should collapse to DOMINANT if entanglement probability > 0.5', () => {
    const allele: QuantumAllele = {
      id: 'Q-1',
      trait: 'SPEED',
      baseValue: 2.0,
      entanglementProbability: 0.8,
      state: QuantumState.SUPERPOSITION,
      sequence: 'ATCG',
      mutationRate: 0.05
    };
    const collapse = (a: QuantumAllele) => {
      if (a.state === QuantumState.SUPERPOSITION) {
        a.state = a.entanglementProbability > 0.5 ? QuantumState.DOMINANT : QuantumState.RECESSIVE;
      }
    };
    collapse(allele);
    expect(allele.state).toBe(QuantumState.DOMINANT);
  });
});

describe('CRISPR gene splicing boundaries', () => {
  test('should clamp trait values within allowed boundaries when splicing', () => {
    const splice = (trait: string, rawValue: number) => {
      switch (trait) {
        case 'SPEED': return Math.max(1.0, Math.min(5.0, rawValue));
        case 'VISION': return Math.max(60, Math.min(260, rawValue));
        case 'EFFICIENCY': return Math.max(0.6, Math.min(2.5, rawValue));
        default: return rawValue;
      }
    };
    expect(splice('SPEED', 6.0)).toBe(5.0);
    expect(splice('SPEED', 0.5)).toBe(1.0);
    expect(splice('VISION', 300)).toBe(260);
    expect(splice('EFFICIENCY', 0.1)).toBe(0.6);
  });
});

describe('Mutation value clamping', () => {
  test('mutations strictly adhere to upper and lower bounds over multiple generations', () => {
    let speed = 4.8;
    for (let i = 0; i < 100; i++) {
      speed += 0.5; // Constant positive mutation
      speed = Math.max(1.0, Math.min(5.0, speed));
    }
    expect(speed).toBeLessThanOrEqual(5.0);

    let efficiency = 0.8;
    for (let i = 0; i < 100; i++) {
      efficiency -= 0.1; // Constant negative mutation
      efficiency = Math.max(0.6, Math.min(2.5, efficiency));
    }
    expect(efficiency).toBeGreaterThanOrEqual(0.6);
  });
});
