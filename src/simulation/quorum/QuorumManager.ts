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

  public calculateLocalDensity(x: number, y: number, sampleRadius: number = 100.0): number {
    let totalVoltage = 0;
    for (const pulse of this.pulses) {
      const dx = pulse.x - x;
      const dy = pulse.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= sampleRadius + pulse.radius) {
        const falloff = Math.max(0, 1.0 - dist / (sampleRadius + pulse.radius));
        totalVoltage += pulse.voltageMv * falloff;
      }
    }
    return totalVoltage / 200.0; // Normalized density index
  }

  public updatePulseGrid(dt: number): void {
    this.pulseDensityGrid.fill(0);

    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      p.durationLeft -= dt;
      if (p.durationLeft <= 0) {
        this.pulses.splice(i, 1);
        continue;
      }

      const cellX = Math.floor(p.x / this.gridResolution);
      const cellY = Math.floor(p.y / this.gridResolution);
      if (cellX >= 0 && cellX < this.gridWidth && cellY >= 0 && cellY < this.gridHeight) {
        const index = cellY * this.gridWidth + cellX;
        this.pulseDensityGrid[index] += p.voltageMv * (p.durationLeft / 30.0);
      }
    }
  }

  public evaluateCollectiveBehavior(
    density: number,
    environmentalThreat: number = 0.0,
    starvationRate: number = 0.0
  ): QuorumState {
    if (density >= 1.2 && starvationRate > 0.6) {
      return 'SPORULATION';
    }
    if (density >= 0.9 && environmentalThreat > 0.4) {
      return 'DEFENSIVE_WALL';
    }
    if (density >= this.quorumThreshold) {
      return 'SWARMING';
    }
    return 'SOLITARY';
  }

  public packPulseDensitiesToFloat32(targetBuffer?: Float32Array): Float32Array {
    const buffer = targetBuffer && targetBuffer.length >= this.pulseDensityGrid.length
      ? targetBuffer
      : new Float32Array(this.pulseDensityGrid.length);
    buffer.set(this.pulseDensityGrid);
    return buffer;
  }
}
