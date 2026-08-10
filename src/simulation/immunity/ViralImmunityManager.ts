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
}
