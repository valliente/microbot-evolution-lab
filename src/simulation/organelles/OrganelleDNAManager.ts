import { MitochondrialDNA, Organelle } from '../types';

export interface OrganelleDNASchema {
  sequence: string;
  type: 'CHLOROPLAST' | 'MITOCHONDRIA' | 'FLAGELLA_BOOSTER';
  energyBoostRate: number;
  motorEfficiency: number;
}

export class OrganelleDNAManager {
  private static instance: OrganelleDNAManager;

  public static getInstance(): OrganelleDNAManager {
    if (!OrganelleDNAManager.instance) {
      OrganelleDNAManager.instance = new OrganelleDNAManager();
    }
    return OrganelleDNAManager.instance;
  }

  public createMitochondrialDNA(parentId?: string): MitochondrialDNA {
    return {
      sequence: 'ATCG-MTO-778',
      efficiencyBonus: 1.25,
      mutationRateMultiplier: 1.0,
      inheritedFromId: parentId || 'PRIMITIVE_ANCESTOR'
    };
  }

  public generateWildOrganelle(x: number, y: number, type: 'CHLOROPLAST' | 'MITOCHONDRIA' | 'FLAGELLA_BOOSTER'): Organelle {
    return {
      id: `organelle-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x,
      y,
      type,
      absorptionRadius: 12,
      energyOutput: type === 'CHLOROPLAST' ? 1.5 : type === 'MITOCHONDRIA' ? 2.5 : 0.8,
      mitochondrialDNA: type === 'MITOCHONDRIA' ? this.createMitochondrialDNA() : undefined
    };
  }
}
