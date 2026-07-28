import { SimulationStats } from '../simulation/types';
import { MicrobotEngine } from '../simulation/MicrobotEngine';

type TelemetryListener = (stats: SimulationStats) => void;

class TelemetryManager {
  private listeners: Set<TelemetryListener> = new Set();
  private lastStats: SimulationStats | null = null;
  private intervalId: number | null = null;

  public subscribe(listener: TelemetryListener) {
    this.listeners.add(listener);
    if (this.lastStats) {
      listener(this.lastStats);
    }
    return () => this.listeners.delete(listener);
  }

  public startPolling(engine: MicrobotEngine, frequencyMs: number = 80) {
    if (this.intervalId) this.stopPolling();
    this.intervalId = window.setInterval(() => {
      this.lastStats = engine.getStats();
      this.listeners.forEach((listener) => listener(this.lastStats!));
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
