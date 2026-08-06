import { MicrobotEngine } from '../MicrobotEngine';

export class AutonomousHarness {
  private engine: MicrobotEngine;
  private isRunning: boolean = false;
  private currentGenerationTarget: number = 1000;
  private completedTicks: number = 0;

  constructor(engine: MicrobotEngine, generationTarget: number = 1000) {
    this.engine = engine;
    this.currentGenerationTarget = generationTarget;
  }

  public runBatch(ticksPerBatch: number = 100): { completed: boolean; currentGen: number; ticks: number } {
    this.isRunning = true;
    for (let i = 0; i < ticksPerBatch; i++) {
      try {
        this.engine.update(1.0);
        this.completedTicks++;
      } catch (err) {
        // Safe catch for unattended runs
        break;
      }
    }
    const currentGen = this.engine.getStats().generationCount;
    const completed = currentGen >= this.currentGenerationTarget;
    if (completed) this.isRunning = false;

    return { completed, currentGen, ticks: this.completedTicks };
  }

  public stop(): void {
    this.isRunning = false;
  }

  public getStatus(): { isRunning: boolean; completedTicks: number } {
    return { isRunning: this.isRunning, completedTicks: this.completedTicks };
  }
}
