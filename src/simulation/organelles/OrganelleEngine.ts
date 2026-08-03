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
    bot.organelles.push(organelle);

    if (organelle.mitochondrialDNA) {
      bot.mitochondrialDNA = { ...organelle.mitochondrialDNA };
    }
  }
}
