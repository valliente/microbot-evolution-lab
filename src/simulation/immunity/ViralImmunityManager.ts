export interface ViralSpore {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  viralLoad: number;
  genomeSequence: string;
  lifetimeFrames: number;
}

export interface ImmunityProfile {
  antibodyLevels: Record<string, number>;
  infectionHistory: string[];
  isInfected: boolean;
  activeVirusId?: string;
  viralLoad: number;
}

export class ViralImmunityManager {
  public viralSpores: ViralSpore[] = [];
  public baseInfectionRate: number = 0.05;
  public antibodyDecayRate: number = 0.002;

  public updateSpores(width: number, height: number): void {
    for (let i = this.viralSpores.length - 1; i >= 0; i--) {
      const spore = this.viralSpores[i];
      spore.x += spore.vx;
      spore.y += spore.vy;
      spore.lifetimeFrames--;

      if (spore.x < 0 || spore.x > width || spore.y < 0 || spore.y > height || spore.lifetimeFrames <= 0) {
        this.viralSpores.splice(i, 1);
      }
    }
  }

  public calculateInfectionProbability(spore: ViralSpore, immunity: ImmunityProfile): number {
    const existingAntibody = immunity.antibodyLevels[spore.genomeSequence] || 0;
    const baseProb = Math.min(1.0, this.baseInfectionRate * spore.viralLoad);
    const resistedProb = baseProb * (1.0 - Math.min(0.95, existingAntibody));
    return Math.max(0.001, resistedProb);
  }

  public spliceViralGenes(hostGenome: any, viralSequence: string): any {
    if (!hostGenome) return hostGenome;
    const spliced = { ...hostGenome };
    if (spliced.speedAllele) {
      spliced.speedAllele = {
        ...spliced.speedAllele,
        baseValue: Math.max(0.5, Math.min(10.0, spliced.speedAllele.baseValue * (1.0 + (viralSequence.length % 5) * 0.05)))
      };
    }
    return spliced;
  }

  public updateImmunityProfile(immunity: ImmunityProfile): void {
    if (!immunity) return;
    for (const key of Object.keys(immunity.antibodyLevels)) {
      immunity.antibodyLevels[key] = Math.max(0, immunity.antibodyLevels[key] - this.antibodyDecayRate);
    }
    if (immunity.isInfected && immunity.activeVirusId) {
      const current = immunity.antibodyLevels[immunity.activeVirusId] || 0;
      immunity.antibodyLevels[immunity.activeVirusId] = Math.min(1.0, current + 0.015);
      if (immunity.antibodyLevels[immunity.activeVirusId] >= 0.85) {
        immunity.isInfected = false;
        immunity.viralLoad = 0;
      }
    }
  }
}
