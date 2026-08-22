export type QuorumState = 'SOLITARY' | 'SWARMING' | 'DEFENSIVE_WALL' | 'SPORULATION';

export interface ElectricalPulse {
  emitterId: string;
  x: number;
  y: number;
  voltageMv: number; // 10.0 - 150.0 mV
  frequencyHz: number;
  radius: number;
  durationLeft: number;
}

export class QuorumManager {
  public pulses: ElectricalPulse[] = [];
  public gridResolution: number = 32;
  public pulseDensityGrid: Float32Array;
  public gridWidth: number;
  public gridHeight: number;
  public quorumThreshold: number = 0.65;
  public refractoryPeriod: number = 60; // frames

  constructor(worldWidth: number = 2000, worldHeight: number = 2000) {
    this.gridWidth = Math.ceil(worldWidth / this.gridResolution);
    this.gridHeight = Math.ceil(worldHeight / this.gridResolution);
    this.pulseDensityGrid = new Float32Array(this.gridWidth * this.gridHeight);
  }

  public emitPulse(emitterId: string, x: number, y: number, voltageMv: number = 50.0): ElectricalPulse {
    const pulse: ElectricalPulse = {
      emitterId,
      x,
      y,
      voltageMv: Math.max(10.0, Math.min(150.0, voltageMv)),
      frequencyHz: 2.5,
      radius: 60.0,
      durationLeft: 30
    };
    this.pulses.push(pulse);
    return pulse;
  }
}
