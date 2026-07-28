import { QuantumAllele } from '../types';

/**
 * Evaluates the collapse of a quantum allele from superposition.
 * When in superposition (ENTANGLED or DECAYING), an allele's effective value 
 * can fluctuate based on its quantum variance.
 * 
 * @param allele The quantum allele to evaluate
 * @returns The resolved scalar value of the allele after probability collapse
 */
export function evaluateQuantumCollapse(allele: QuantumAllele): number {
  if (allele.state === 'OBSERVED') {
    return allele.baseValue;
  }

  // Roll observation probability
  const observationRoll = Math.random();
  
  if (observationRoll <= allele.observationProbability) {
    // Favorable collapse: positive variance shift
    const collapseShift = Math.random() * allele.quantumVariance;
    return allele.baseValue + collapseShift;
  } else {
    // Unfavorable collapse / decay: negative variance shift
    const decayShift = Math.random() * allele.quantumVariance;
    return Math.max(0.1, allele.baseValue - decayShift);
  }
}

/**
 * Entangles two alleles, putting them in an ENTANGLED state.
 * @param allele1 The first allele
 * @param bot1Id The ID of the bot owning the first allele
 * @param allele2 The second allele
 * @param bot2Id The ID of the bot owning the second allele
 */
export function entangleAlleles(allele1: QuantumAllele, bot1Id: string, allele2: QuantumAllele, bot2Id: string): void {
  allele1.state = 'ENTANGLED';
  allele1.entanglementPartnerId = bot2Id;
  
  allele2.state = 'ENTANGLED';
  allele2.entanglementPartnerId = bot1Id;
}
