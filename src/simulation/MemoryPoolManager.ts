import { Microbot, EnergyParticle, HazardZone } from './types';

export class MemoryPoolManager {
  private static instance: MemoryPoolManager;
  
  public microbotsPool: Microbot[] = [];
  public energyPool: EnergyParticle[] = [];
  public hazardPool: HazardZone[] = [];
  
  private constructor() {}

  public static getInstance(): MemoryPoolManager {
    if (!MemoryPoolManager.instance) {
      MemoryPoolManager.instance = new MemoryPoolManager();
    }
    return MemoryPoolManager.instance;
  }

  public getMicrobot(): Partial<Microbot> {
    return this.microbotsPool.pop() || {};
  }

  public releaseMicrobot(bot: Microbot) {
    this.microbotsPool.push(bot);
  }
}
