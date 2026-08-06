export interface StructuralPhenotype {
  armorPlatesCount: number;
  armorThickness: number;
  thrustFinsLength: number;
  thrustFinsAngle: number;
  bioluminescentLureGlow: number;
  lureHue: number;
}

export class PhenotypeEngine {
  public static mapGenomeToPhenotype(genome: any): StructuralPhenotype {
    const defense = genome?.defenseAllele?.baseValue || 1.0;
    const speed = genome?.speedAllele?.baseValue || 1.0;
    const vision = genome?.visionAllele?.baseValue || 100.0;

    return {
      armorPlatesCount: Math.min(8, Math.max(0, Math.floor(defense * 2))),
      armorThickness: Math.min(6, Math.max(1, defense * 1.5)),
      thrustFinsLength: Math.min(15, Math.max(3, speed * 3)),
      thrustFinsAngle: Math.PI / 4,
      bioluminescentLureGlow: Math.min(1.0, vision / 250),
      lureHue: (genome?.hueAllele?.baseValue || 180) % 360
    };
  }
}
