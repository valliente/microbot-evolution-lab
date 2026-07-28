import { QuantumGenome, QuantumAllele } from '../types';

interface DecayMatrix {
  baseDecayRate: number;
  environmentalStressMultiplier: number;
  generationThreshold: number;
}

const defaultDecayMatrix: DecayMatrix = {
  baseDecayRate: 0.05,
  environmentalStressMultiplier: 1.5,
  generationThreshold: 10
};

/**
 * Calculates the probability of a quantum allele decaying based on environmental and temporal factors.
 * @param allele The allele to check
 * @param currentGeneration The generation of the owning bot
 * @param environmentalStress A metric of current environmental hostility (0.0 to 1.0)
 * @returns boolean indicating if decay triggered
 */
export function rollQuantumDecay(allele: QuantumAllele, currentGeneration: number, environmentalStress: number): boolean {
  if (allele.state !== 'ENTANGLED' && allele.state !== 'OBSERVED') {
    return false; // Already decaying or undefined state
  }

  let decayChance = defaultDecayMatrix.baseDecayRate;
  
  if (currentGeneration > defaultDecayMatrix.generationThreshold) {
    decayChance += 0.02 * (currentGeneration - defaultDecayMatrix.generationThreshold);
  }

  if (environmentalStress > 0.5) {
    decayChance *= defaultDecayMatrix.environmentalStressMultiplier;
  }

  return Math.random() < decayChance;
}

/**
 * Applies decay to a genome, putting triggered alleles into a DECAYING state
 * @param genome The genome to process
 * @param generation Bot generation
 * @param stress Environmental stress (0.0 - 1.0)
 */
export function processGenomeDecay(genome: QuantumGenome, generation: number, stress: number): void {
  const keys = Object.keys(genome) as Array<keyof QuantumGenome>;
  for (const key of keys) {
    const allele = genome[key];
    if (rollQuantumDecay(allele, generation, stress)) {
      allele.state = 'DECAYING';
      allele.observationProbability = Math.max(0.1, allele.observationProbability - 0.2);
    }
  }
}
