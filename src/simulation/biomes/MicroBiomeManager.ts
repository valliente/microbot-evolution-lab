export type BiomeType = 'VISCOUS_SWAMP' | 'RADIATION_ZONE' | 'THERMAL_VENT' | 'CRYSTAL_SHALLOWS';

export interface MicroBiomeRegion {
  id: string;
  type: BiomeType;
  x: number;
  y: number;
  width: number;
  height: number;
  frictionMultiplier: number;
  mutationMultiplier: number;
  energyDrainRate: number;
  thermalRechargeRate: number;
}

export class MicroBiomeManager {
  private regions: MicroBiomeRegion[] = [];

  constructor(worldWidth: number = 800, worldHeight: number = 600) {
    this.initializeDefaultBiomes(worldWidth, worldHeight);
  }

  public initializeDefaultBiomes(width: number, height: number): void {
    const hw = width * 0.5;
    const hh = height * 0.5;

    this.regions = [
      {
        id: 'biome-swamp-1',
        type: 'VISCOUS_SWAMP',
        x: 0,
        y: 0,
        width: hw,
        height: hh,
        frictionMultiplier: 1.8,
        mutationMultiplier: 1.0,
        energyDrainRate: 1.4,
        thermalRechargeRate: 0
      },
      {
        id: 'biome-rad-1',
        type: 'RADIATION_ZONE',
        x: hw,
        y: 0,
        width: hw,
        height: hh,
        frictionMultiplier: 1.0,
        mutationMultiplier: 2.5,
        energyDrainRate: 1.8,
        thermalRechargeRate: 0
      },
      {
        id: 'biome-vent-1',
        type: 'THERMAL_VENT',
        x: 0,
        y: hh,
        width: hw,
        height: hh,
        frictionMultiplier: 0.9,
        mutationMultiplier: 1.2,
        energyDrainRate: 0,
        thermalRechargeRate: 0.25
      },
      {
        id: 'biome-shallows-1',
        type: 'CRYSTAL_SHALLOWS',
        x: hw,
        y: hh,
        width: hw,
        height: hh,
        frictionMultiplier: 1.0,
        mutationMultiplier: 0.8,
        energyDrainRate: 0.8,
        thermalRechargeRate: 0.1
      }
    ];
  }

  public getBiomeAt(x: number, y: number): MicroBiomeRegion | undefined {
    return this.regions.find(
      (r) => x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height
    );
  }

  public calculateViscousSwampEffects(vx: number, vy: number, energy: number): { vx: number; vy: number; energy: number } {
    const dragFactor = 0.65;
    const energyBurn = 0.15;
    return {
      vx: vx * dragFactor,
      vy: vy * dragFactor,
      energy: Math.max(0, energy - energyBurn)
    };
  }

  public calculateRadiationZoneEffects(baseMutationRate: number, energy: number): { mutationRate: number; energy: number } {
    const elevatedMutationRate = baseMutationRate * 2.5;
    const radEnergyDrain = 0.25;
    return {
      mutationRate: Math.min(0.8, elevatedMutationRate),
      energy: Math.max(0, energy - radEnergyDrain)
    };
  }

  public getRegions(): MicroBiomeRegion[] {
    return this.regions;
  }
}
