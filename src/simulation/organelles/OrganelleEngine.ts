import { Microbot, Organelle } from '../types';

export class OrganelleEngine {
  public static checkAbsorption(bot: Microbot, organelle: Organelle): boolean {
    const dx = bot.x - organelle.x;
    const dy = bot.y - organelle.y;
    const distSq = dx * dx + dy * dy;
    const botRadius = 8;
    const combinedRadius = botRadius + organelle.absorptionRadius;
    
    return distSq < combinedRadius * combinedRadius;
  }

  public static absorbOrganelle(bot: Microbot, organelle: Organelle): void {
    if (!bot.organelles) {
      bot.organelles = [];
    }
    if (organelle.mitochondrialDNA) {
      bot.mitochondrialDNA = { ...organelle.mitochondrialDNA };
    }
  }

  public static transmitMitochondrialDNA(parent: Microbot, mutationRate: number): import('../types').MitochondrialDNA | undefined {
    if (!parent.mitochondrialDNA) return undefined;
    
    let seq = parent.mitochondrialDNA.sequence;
    if (Math.random() < mutationRate * parent.mitochondrialDNA.mutationRateMultiplier) {
      const bases = ['A', 'C', 'G', 'T'];
      const pos = Math.floor(Math.random() * seq.length);
      seq = seq.substring(0, pos) + bases[Math.floor(Math.random() * bases.length)] + seq.substring(pos + 1);
    }

    return {
      sequence: seq,
      efficiencyBonus: Math.min(2.0, parent.mitochondrialDNA.efficiencyBonus * (1 + (Math.random() - 0.5) * 0.05)),
      mutationRateMultiplier: parent.mitochondrialDNA.mutationRateMultiplier,
      inheritedFromId: parent.id
    };
  }

  public static processOrganelleEffects(bot: Microbot): { energyMod: number; speedMod: number } {
    let energyMod = 0;
    let speedMod = 1.0;

    if (!bot.organelles || bot.organelles.length === 0) {
      return { energyMod, speedMod };
    }

    for (const organelle of bot.organelles) {
      if (organelle.type === 'CHLOROPLAST') {
        energyMod += organelle.energyOutput * 0.05; // Photosynthetic energy generation
      } else if (organelle.type === 'MITOCHONDRIA') {
        const mtBonus = bot.mitochondrialDNA ? bot.mitochondrialDNA.efficiencyBonus : 1.0;
        energyMod += organelle.energyOutput * 0.08 * mtBonus;
      } else if (organelle.type === 'FLAGELLA_BOOSTER') {
        speedMod += 0.25; // Speed multiplier boost
      }
    }

    return { energyMod, speedMod };
  }
}
