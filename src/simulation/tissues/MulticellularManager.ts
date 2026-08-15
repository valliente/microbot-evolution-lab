export type TissueRole = 'DERMAL_ARMOR' | 'MITOCHONDRIAL_CORE' | 'CILIA' | 'UNDIFFERENTIATED';

export interface CellTissueBinding {
  cellId: string;
  partnerId: string;
  bondStrength: number; // 0.0 - 1.0
  restDistance: number;
  currentDistance: number;
  integrity: number; // 0.0 - 1.0
}

export interface MulticellularCluster {
  clusterId: string;
  memberIds: string[];
  primaryRole: TissueRole;
  sharedEnergyPool: number;
  maxSharedEnergy: number;
  totalIntegrity: number;
  propulsionVector: { x: number; y: number };
}

export class MulticellularManager {
  public clusters: Map<string, MulticellularCluster> = new Map();
  public bindings: CellTissueBinding[] = [];

  constructor() {}

  public getCluster(clusterId: string): MulticellularCluster | undefined {
    return this.clusters.get(clusterId);
  }

  public getMemberCluster(cellId: string): MulticellularCluster | undefined {
    for (const cluster of this.clusters.values()) {
      if (cluster.memberIds.includes(cellId)) {
        return cluster;
      }
    }
    return undefined;
  }
}
