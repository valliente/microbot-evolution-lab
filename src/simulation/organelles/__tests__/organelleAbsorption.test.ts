import { describe, it, expect } from 'vitest';
import { OrganelleEngine } from '../OrganelleEngine';
import { Microbot, Organelle } from '../../types';

describe('Organelle Absorption and Energy Generation', () => {
  it('absorbs organelle on node contact and processes photosynthetic energy', () => {
    const bot: Partial<Microbot> = {
      id: 'bot-1',
      x: 100,
      y: 100,
      organelles: []
    };

    const organelle: Organelle = {
      id: 'org-1',
      type: 'CHLOROPLAST',
      x: 105,
      y: 105,
      energyOutput: 2.0,
      absorptionRadius: 10
    };

    const isAbsorbed = OrganelleEngine.checkAbsorption(bot as Microbot, organelle);
    expect(isAbsorbed).toBe(true);

    OrganelleEngine.absorbOrganelle(bot as Microbot, organelle);
    expect(bot.organelles?.length).toBe(1);

    const effects = OrganelleEngine.processOrganelleEffects(bot as Microbot);
    expect(effects.energyMod).toBeGreaterThan(0);
  });
});
