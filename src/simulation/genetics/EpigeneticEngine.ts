export class EpigeneticEngine {
  private static instance: EpigeneticEngine;
  private globalStressIndex: number = 0;
  
  // High-performance typed array for real-time telemetry rendering (capacity: 1000 data points)
  public stressHistory: Float32Array = new Float32Array(1000);
  private historyIndex: number = 0;
  private maxHistory: number = 1000;
  
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

  public recordStressFrame(): void {
    this.stressHistory[this.historyIndex] = this.globalStressIndex;
    this.historyIndex = (this.historyIndex + 1) % this.maxHistory;
  }
  
  public getStressHistory(): Float32Array {
    // Return an ordered copy starting from the oldest element
    const ordered = new Float32Array(this.maxHistory);
    ordered.set(this.stressHistory.subarray(this.historyIndex), 0);
    ordered.set(this.stressHistory.subarray(0, this.historyIndex), this.maxHistory - this.historyIndex);
    return ordered;
  }
}
