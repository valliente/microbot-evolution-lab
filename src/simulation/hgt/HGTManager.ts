export interface ConjugationBridge {
  id: string;
  donorId: string;
  recipientId: string;
  progress: number; // 0 to 1
  plasmidGene: string;
  durationLeft: number;
  tension: number;
}

export class HGTManager {
  public activeBridges: ConjugationBridge[] = [];
  public transferSuccessCount: number = 0;
  public conjugationRateMultiplier: number = 1.0;

  constructor() {}

  public getBridgeCount(): number {
    return this.activeBridges.length;
  }
}
