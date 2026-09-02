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

  public formConjugationBridge(
    donorId: string,
    recipientId: string,
    plasmidGene: string = 'PLASMID-METABOLISM-01'
  ): ConjugationBridge | null {
    if (this.activeBridges.length >= 50) return null; // Capacity cap

    const existing = this.activeBridges.find(
      b => (b.donorId === donorId && b.recipientId === recipientId) ||
           (b.donorId === recipientId && b.recipientId === donorId)
    );
    if (existing) return null;

    const bridge: ConjugationBridge = {
      id: `bridge-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      donorId,
      recipientId,
      progress: 0.0,
      plasmidGene,
      durationLeft: 45, // frames
      tension: 0.1
    };
    this.activeBridges.push(bridge);
    return bridge;
  }
}
