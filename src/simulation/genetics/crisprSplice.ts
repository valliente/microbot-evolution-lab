import { QuantumGenome, QuantumAllele } from '../types';

export interface SpliceOperation {
  targetGene: keyof QuantumGenome;
  newValue: number;
  varianceOverride?: number;
}

/**
 * Applies a set of CRISPR splice operations to a target QuantumGenome.
 * Splicing forces the targeted alleles out of superposition into an OBSERVED state.
 * 
 * @param genome The genome to mutate
 * @param operations Array of splice operations to apply
 * @returns A new spliced genome instance
 */
export function applyCrisprSplice(genome: QuantumGenome, operations: SpliceOperation[]): QuantumGenome {
  const newGenome = JSON.parse(JSON.stringify(genome)) as QuantumGenome;

  for (const op of operations) {
    const target = newGenome[op.targetGene] as QuantumAllele;
    
    // Splicing instantly collapses the wave function and overrides values
    target.state = 'OBSERVED';
    target.baseValue = op.newValue;
    
    if (op.varianceOverride !== undefined) {
      target.quantumVariance = op.varianceOverride;
    }
    
    // Clear entanglement if any existed
    target.entanglementPartnerId = undefined;
  }

  return newGenome;
}

/**
 * Creates a default starter genome.
 */
export function createDefaultGenome(): QuantumGenome {
  return {
    speedAllele: { geneId: 'spd', baseValue: 2.0, quantumVariance: 0.5, state: 'OBSERVED', observationProbability: 0.5 },
    visionAllele: { geneId: 'vis', baseValue: 120, quantumVariance: 30, state: 'OBSERVED', observationProbability: 0.5 },
    efficiencyAllele: { geneId: 'eff', baseValue: 1.0, quantumVariance: 0.4, state: 'OBSERVED', observationProbability: 0.5 },
    mutationTendency: { geneId: 'mut', baseValue: 0.1, quantumVariance: 0.05, state: 'OBSERVED', observationProbability: 0.5 }
  };
}
