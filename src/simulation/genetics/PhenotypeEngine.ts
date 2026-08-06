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

  public static renderPhenotype(ctx: CanvasRenderingContext2D, bot: any, phenotype: StructuralPhenotype): void {
    ctx.save();
    ctx.translate(bot.x, bot.y);
    ctx.rotate(bot.heading || 0);

    // Draw Thrust Fins
    if (phenotype.thrustFinsLength > 0) {
      ctx.fillStyle = bot.color || '#00E5FF';
      ctx.beginPath();
      ctx.moveTo(-bot.radius, -bot.radius * 0.5);
      ctx.lineTo(-bot.radius - phenotype.thrustFinsLength, -bot.radius * 0.8);
      ctx.lineTo(-bot.radius - phenotype.thrustFinsLength * 0.5, 0);
      ctx.lineTo(-bot.radius - phenotype.thrustFinsLength, bot.radius * 0.8);
      ctx.lineTo(-bot.radius, bot.radius * 0.5);
      ctx.fill();
    }

    // Draw Armor Plates
    if (phenotype.armorPlatesCount > 0) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = phenotype.armorThickness;
      for (let i = 0; i < phenotype.armorPlatesCount; i++) {
        const angle = (i / phenotype.armorPlatesCount) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(0, 0, bot.radius + phenotype.armorThickness * 0.5, angle, angle + Math.PI / phenotype.armorPlatesCount * 0.8);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
