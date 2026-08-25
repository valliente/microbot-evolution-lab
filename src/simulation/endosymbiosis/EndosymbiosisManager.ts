export type EndosymbiontType = 'PROTO_MITOCHONDRIA' | 'CHLOROPLAST' | 'HYDROGENOSOME' | 'PEROXISOME';

export interface EndosymbioticOrganelle {
  id: string;
  type: EndosymbiontType;
  hostId: string;
  energyOutput: number;
  atpBoost: number;
  organellarDna: string; // Independent mtDNA/cpDNA sequence
  mutationRate: number;
  cristaeSurfaceArea: number; // specialized metabolic trait
}

export class EndosymbiosisManager {
  public organelles: Map<string, EndosymbioticOrganelle[]> = new Map();

  public registerHost(hostId: string): void {
    if (!this.organelles.has(hostId)) {
      this.organelles.set(hostId, []);
    }
  }

  public getHostOrganelles(hostId: string): EndosymbioticOrganelle[] {
    return this.organelles.get(hostId) || [];
  }

  public attemptEngulfment(
    hostId: string,
    hostSymbiosisGene: number = 0.5,
    preyType: EndosymbiontType = 'PROTO_MITOCHONDRIA',
    preyDna: string = 'ATGC-MITO-01'
  ): { success: boolean; organelle?: EndosymbioticOrganelle } {
    this.registerHost(hostId);
    const existing = this.getHostOrganelles(hostId);
    if (existing.length >= 6) {
      return { success: false }; // Organelle capacity reached
    }

    const survivalProb = Math.max(0.05, Math.min(0.95, hostSymbiosisGene * 0.8 + 0.1));
    if (Math.random() < survivalProb) {
      const organelle: EndosymbioticOrganelle = {
        id: `organelle-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: preyType,
        hostId,
        energyOutput: 1.5,
        atpBoost: 1.25,
        organellarDna: preyDna,
        mutationRate: 0.08,
        cristaeSurfaceArea: 1.0
      };
      existing.push(organelle);
      return { success: true, organelle };
    }

    return { success: false };
  }

  public calculateOrganelleMetabolicYield(hostId: string): { totalEnergy: number; atpMultiplier: number } {
    const organelles = this.getHostOrganelles(hostId);
    let totalEnergy = 0;
    let atpMultiplier = 1.0;

    for (const organelle of organelles) {
      // Cristae folding multiplies energetic yield
      const yieldBoost = organelle.energyOutput * Math.max(1.0, organelle.cristaeSurfaceArea);
      totalEnergy += yieldBoost;
      atpMultiplier *= (1.0 + (organelle.atpBoost - 1.0) * 0.5);
    }

    return { totalEnergy, atpMultiplier };
  }
}
