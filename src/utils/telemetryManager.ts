import { SimulationStats } from '../simulation/types';
import { MicrobotEngine } from '../simulation/MicrobotEngine';

type TelemetryListener = (stats: SimulationStats) => void;

class TelemetryManager {
  private listeners: Set<TelemetryListener> = new Set();
  private lastStats: SimulationStats | null = null;
  private intervalId: number | null = null;
  private organelleRingBuffer: Float32Array = new Float32Array(50);

  public subscribe(listener: TelemetryListener) {
    this.listeners.add(listener);
    if (this.lastStats) {
      listener(this.lastStats);
    }
    return () => this.listeners.delete(listener);
  }

  private pendingUpdate: boolean = false;

  public startPolling(engine: MicrobotEngine, frequencyMs: number = 80) {
    if (this.intervalId) this.stopPolling();
    this.intervalId = window.setInterval(() => {
      if (this.pendingUpdate) return;
      this.pendingUpdate = true;
      requestAnimationFrame(() => {
        this.lastStats = engine.getStats();
        this.listeners.forEach((listener) => listener(this.lastStats!));
        this.pendingUpdate = false;
      });
    }, frequencyMs);
  }

  public stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public forceUpdate(engine: MicrobotEngine) {
    this.lastStats = engine.getStats();
    this.listeners.forEach((listener) => listener(this.lastStats!));
  }
}

export const telemetryManager = new TelemetryManager();
