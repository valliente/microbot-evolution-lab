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

  public updateConjugationCycles(
    dt: number = 1.0,
    onSuccess?: (bridge: ConjugationBridge) => void
  ): void {
    for (let i = this.activeBridges.length - 1; i >= 0; i--) {
      const bridge = this.activeBridges[i];
      bridge.progress += (dt / 45) * this.conjugationRateMultiplier;
      bridge.durationLeft -= dt;

      if (bridge.progress >= 1.0) {
        this.transferSuccessCount++;
        if (onSuccess) onSuccess(bridge);
        this.activeBridges.splice(i, 1);
      } else if (bridge.durationLeft <= 0) {
        this.activeBridges.splice(i, 1); // Expired/failed
      }
    }
  }

  public transduceViralPayload(
    targetBot: any,
    viralPayload: string
  ): { integrated: boolean; modifiedTrait?: string } {
    const successRate = 0.65;
    if (Math.random() < successRate && targetBot.genome) {
      this.transferSuccessCount++;
      // Transduce beneficial or novel metabolic allele
      targetBot.genome.efficiency = Math.min(2.0, (targetBot.genome.efficiency || 1.0) * 1.1);
      return { integrated: true, modifiedTrait: viralPayload };
    }
    return { integrated: false };
  }

  public packBridgeCoordsToFloat32(targetBuffer?: Float32Array): Float32Array {
    const needed = this.activeBridges.length * 4;
    const buffer = targetBuffer && targetBuffer.length >= needed
      ? targetBuffer
      : new Float32Array(needed);
    return buffer;
  }
}
