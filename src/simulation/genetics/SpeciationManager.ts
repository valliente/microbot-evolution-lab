import { Microbot } from '../types';

export class SpeciationManager {
  private static instance: SpeciationManager;
  private nextSpeciesId: number = 1;

  private constructor() {}

  public static getInstance(): SpeciationManager {
    if (!SpeciationManager.instance) {
      SpeciationManager.instance = new SpeciationManager();
    }
    return SpeciationManager.instance;
  }

  public evaluateMatingCompatibility(botA: Microbot, botB: Microbot): { compatible: boolean; distance: number; isHybrid: boolean; fertilityFactor: number } {
    const distance = this.calculateAlleleDistance(botA, botB);
    const speciationThreshold = 0.4;
    
    if (distance > speciationThreshold) {
      return { compatible: false, distance, isHybrid: false, fertilityFactor: 0 };
    }
    
    // If they are from different species IDs but are genetically close enough, they form a hybrid
    const isHybrid = botA.speciesId !== botB.speciesId;
    let fertilityFactor = 1.0;

    // Apply hybrid infertility penalty based on distance
    if (isHybrid) {
      fertilityFactor = Math.max(0.1, 1.0 - (distance / speciationThreshold));
    }

    return { compatible: true, distance, isHybrid, fertilityFactor };
  }

  public calculateAlleleDistance(botA: Microbot, botB: Microbot): number {
    if (!botA.genome || !botB.genome) return 0;
    
    let distance = 0;
    distance += Math.abs(botA.genome.speedAllele.baseValue - botB.genome.speedAllele.baseValue);
    distance += Math.abs(botA.genome.visionAllele.baseValue - botB.genome.visionAllele.baseValue);
    distance += Math.abs(botA.genome.efficiencyAllele.baseValue - botB.genome.efficiencyAllele.baseValue);
    
    // Normalize by number of checked alleles (3)
    return distance / 3.0;
  }

  public getSpeciesId(): number {
    return this.nextSpeciesId++;
  }
}
