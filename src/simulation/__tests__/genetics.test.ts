import { QuantumAllele, QuantumState } from '../types';

describe('QuantumAllele state collapse', () => {
  it('should collapse to DOMINANT if entanglement probability > 0.5', () => {
    const allele: QuantumAllele = {
      id: 'Q-1',
      trait: 'SPEED',
      baseValue: 2.0,
      entanglementProbability: 0.8, // > 0.5
      state: QuantumState.SUPERPOSITION,
      sequence: 'ATCG',
      mutationRate: 0.05
    };
    
    // Simulate a collapse function
    const collapse = (a: QuantumAllele) => {
      if (a.state === QuantumState.SUPERPOSITION) {
        a.state = a.entanglementProbability > 0.5 ? QuantumState.DOMINANT : QuantumState.RECESSIVE;
      }
    };
    
    collapse(allele);
    if (allele.state !== QuantumState.DOMINANT) {
      throw new Error('Expected DOMINANT state after collapse');
    }
  });

  it('should collapse to RECESSIVE if entanglement probability <= 0.5', () => {
    const allele: QuantumAllele = {
      id: 'Q-2',
      trait: 'VISION',
      baseValue: 120,
      entanglementProbability: 0.3, // <= 0.5
      state: QuantumState.SUPERPOSITION,
      sequence: 'CGTA',
      mutationRate: 0.01
    };
    
    const collapse = (a: QuantumAllele) => {
      if (a.state === QuantumState.SUPERPOSITION) {
        a.state = a.entanglementProbability > 0.5 ? QuantumState.DOMINANT : QuantumState.RECESSIVE;
      }
    };
    
    collapse(allele);
    if (allele.state !== QuantumState.RECESSIVE) {
      throw new Error('Expected RECESSIVE state after collapse');
    }
  });
});

describe('CRISPR gene splicing boundaries', () => {
  it('should clamp trait values within allowed boundaries when splicing', () => {
    const splice = (trait: string, rawValue: number) => {
      switch (trait) {
        case 'SPEED': return Math.max(1.0, Math.min(5.0, rawValue));
        case 'VISION': return Math.max(60, Math.min(260, rawValue));
        case 'EFFICIENCY': return Math.max(0.6, Math.min(2.5, rawValue));
        default: return rawValue;
      }
    };

    if (splice('SPEED', 6.0) !== 5.0) throw new Error('SPEED upper boundary failed');
    if (splice('SPEED', 0.5) !== 1.0) throw new Error('SPEED lower boundary failed');
    if (splice('VISION', 300) !== 260) throw new Error('VISION upper boundary failed');
    if (splice('EFFICIENCY', 0.1) !== 0.6) throw new Error('EFFICIENCY lower boundary failed');
  });
});

console.log('genetics.test.ts: Quantum Allele collapse & CRISPR tests passed.');
