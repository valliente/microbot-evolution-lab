export class EpigeneticEngine {
  private static instance: EpigeneticEngine;
  private globalStressIndex: number = 0;
  
  private constructor() {}

  public static getInstance(): EpigeneticEngine {
    if (!EpigeneticEngine.instance) {
      EpigeneticEngine.instance = new EpigeneticEngine();
    }
    return EpigeneticEngine.instance;
  }

  public getGlobalStress(): number {
    return this.globalStressIndex;
  }

  public updateGlobalStress(newStress: number): void {
    this.globalStressIndex = newStress;
  }
}
