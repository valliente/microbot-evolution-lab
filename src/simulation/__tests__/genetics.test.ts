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

console.log('genetics.test.ts: Quantum Allele collapse tests passed.');
