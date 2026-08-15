export type TissueRole = 'DERMAL_ARMOR' | 'MITOCHONDRIAL_CORE' | 'CILIA' | 'UNDIFFERENTIATED';

export interface TissueRoleProperties {
  role: TissueRole;
  armorMultiplier: number;
  propulsionMultiplier: number;
  energyGenerationRate: number;
  energyStorageBonus: number;
  tensileStrength: number;
}

export const TISSUE_ROLE_SCHEMAS: Record<TissueRole, TissueRoleProperties> = {
  DERMAL_ARMOR: {
    role: 'DERMAL_ARMOR',
    armorMultiplier: 3.5,
    propulsionMultiplier: 0.7,
    energyGenerationRate: 0.0,
    energyStorageBonus: 50,
    tensileStrength: 2.5
  },
  MITOCHONDRIAL_CORE: {
    role: 'MITOCHONDRIAL_CORE',
    armorMultiplier: 0.8,
    propulsionMultiplier: 0.5,
    energyGenerationRate: 0.4,
    energyStorageBonus: 200,
    tensileStrength: 1.0
  },
  CILIA: {
    role: 'CILIA',
    armorMultiplier: 0.9,
    propulsionMultiplier: 2.8,
    energyGenerationRate: -0.05,
    energyStorageBonus: 20,
    tensileStrength: 1.2
  },
  UNDIFFERENTIATED: {
    role: 'UNDIFFERENTIATED',
    armorMultiplier: 1.0,
    propulsionMultiplier: 1.0,
    energyGenerationRate: 0.0,
    energyStorageBonus: 0,
    tensileStrength: 1.0
  }
};

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

  public createBinding(cellAId: string, cellBId: string, restDistance: number = 18.0): CellTissueBinding {
    const existing = this.bindings.find(b => 
      (b.cellId === cellAId && b.partnerId === cellBId) ||
      (b.cellId === cellBId && b.partnerId === cellAId)
    );
    if (existing) return existing;

    const newBinding: CellTissueBinding = {
      cellId: cellAId,
      partnerId: cellBId,
      bondStrength: 0.9,
      restDistance,
      currentDistance: restDistance,
      integrity: 1.0
    };
    this.bindings.push(newBinding);
    return newBinding;
  }

  public calculateBondForce(binding: CellTissueBinding, currentDist: number): { forceMagnitude: number; isBroken: boolean } {
    binding.currentDistance = currentDist;
    const delta = currentDist - binding.restDistance;
    const springConstant = 0.05 * binding.bondStrength;
    const forceMagnitude = -springConstant * delta;

    if (Math.abs(delta) > binding.restDistance * 2.5) {
      binding.integrity = Math.max(0, binding.integrity - 0.1);
    } else {
      binding.integrity = Math.min(1.0, binding.integrity + 0.01);
    }

    const isBroken = binding.integrity <= 0;
    return { forceMagnitude, isBroken };
  }

  public calculateSynchronizedCiliaThrust(
    memberHeadings: number[],
    memberWeights: number[]
  ): { vx: number; vy: number; totalThrust: number } {
    let sumVx = 0;
    let sumVy = 0;
    let totalWeight = 0;

    for (let i = 0; i < memberHeadings.length; i++) {
      const heading = memberHeadings[i];
      const weight = memberWeights[i] || 1.0;
      sumVx += Math.cos(heading) * weight;
      sumVy += Math.sin(heading) * weight;
      totalWeight += weight;
    }

    if (totalWeight <= 0) return { vx: 0, vy: 0, totalThrust: 0 };
    const avgVx = sumVx / totalWeight;
    const avgVy = sumVy / totalWeight;
    const totalThrust = Math.sqrt(avgVx * avgVx + avgVy * avgVy) * 1.5;

    return { vx: avgVx, vy: avgVy, totalThrust };
  }

  public redistributeClusterEnergy(
    cluster: MulticellularCluster,
    memberBatteries: number[],
    maxMemberBatteries: number[]
  ): number[] {
    let totalEnergy = cluster.sharedEnergyPool;
    for (let i = 0; i < memberBatteries.length; i++) {
      totalEnergy += memberBatteries[i];
    }

    const memberCount = memberBatteries.length;
    if (memberCount === 0) return [];

    const targetEnergyPerMember = totalEnergy / (memberCount + 0.5);
    const updatedBatteries: number[] = [];

    let distributed = 0;
    for (let i = 0; i < memberCount; i++) {
      const maxCap = maxMemberBatteries[i] || 100;
      const allocated = Math.min(maxCap, targetEnergyPerMember);
      updatedBatteries.push(allocated);
      distributed += allocated;
    }

    cluster.sharedEnergyPool = Math.max(0, Math.min(cluster.maxSharedEnergy || 500, totalEnergy - distributed));
    return updatedBatteries;
  }

  public calculateDeflectedDamage(
    incomingDamage: number,
    dermalArmorLayers: number,
    membraneHardness: number
  ): { mitigatedDamage: number; absorbedByArmor: number; deflectedPercentage: number } {
    if (incomingDamage <= 0) return { mitigatedDamage: 0, absorbedByArmor: 0, deflectedPercentage: 1.0 };

    const effectiveArmor = Math.min(10.0, dermalArmorLayers * (1.0 + membraneHardness));
    const mitigationFactor = effectiveArmor / (effectiveArmor + 4.0);
    const absorbedByArmor = incomingDamage * mitigationFactor;
    const mitigatedDamage = incomingDamage - absorbedByArmor;
    const deflectedPercentage = mitigationFactor;

    return { mitigatedDamage, absorbedByArmor, deflectedPercentage };
  }

  public packBondVectorsToFloat32(outBuffer: Float32Array): void {
    let offset = 0;
    for (let i = 0; i < this.bindings.length && offset + 4 <= outBuffer.length; i++) {
      const b = this.bindings[i];
      outBuffer[offset] = b.bondStrength;
      outBuffer[offset + 1] = b.restDistance;
      outBuffer[offset + 2] = b.currentDistance;
      outBuffer[offset + 3] = b.integrity;
      offset += 4;
    }
  }
}
