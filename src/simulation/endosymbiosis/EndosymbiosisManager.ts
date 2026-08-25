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
}
