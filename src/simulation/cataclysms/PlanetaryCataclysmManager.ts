export type CataclysmEventType = 'NONE' | 'TECTONIC_INVERSION' | 'SOLAR_STORM' | 'GAMMA_RAY_BURST' | 'CRYOGALLIC_FREEZE';

export interface CataclysmEvent {
  id: string;
  type: CataclysmEventType;
  durationFrames: number;
  remainingFrames: number;
  intensity: number;
  epicenterX: number;
  epicenterY: number;
  radius: number;
}

export class PlanetaryCataclysmManager {
  private eventQueue: CataclysmEvent[] = [];
  private activeEvent: CataclysmEvent | null = null;

  public triggerCataclysm(type: CataclysmEventType, width: number, height: number, duration: number = 300): CataclysmEvent {
    const event: CataclysmEvent = {
      id: `cataclysm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      durationFrames: duration,
      remainingFrames: duration,
      intensity: 1.0,
      epicenterX: width / 2,
      epicenterY: height / 2,
      radius: Math.min(width, height) * 0.45
    };
    this.eventQueue.push(event);
    if (!this.activeEvent) {
      this.activeEvent = this.eventQueue.shift() || null;
    }
    return event;
  }

  public getActiveEvent(): CataclysmEvent | null {
    return this.activeEvent;
  }

  public update(): void {
    if (!this.activeEvent) {
      if (this.eventQueue.length > 0) {
        this.activeEvent = this.eventQueue.shift() || null;
      }
      return;
    }

    this.activeEvent.remainingFrames--;
    if (this.activeEvent.remainingFrames <= 0) {
      this.activeEvent = this.eventQueue.shift() || null;
    }
  }

  public reset(): void {
    this.eventQueue = [];
    this.activeEvent = null;
  }

  public computeTectonicDeformation(x: number, y: number, event: CataclysmEvent): { dx: number; dy: number; heightShift: number } {
    if (event.type !== 'TECTONIC_INVERSION') return { dx: 0, dy: 0, heightShift: 0 };
    const dist = Math.hypot(x - event.epicenterX, y - event.epicenterY);
    if (dist > event.radius) return { dx: 0, dy: 0, heightShift: 0 };

    const normDist = dist / event.radius;
    const factor = Math.sin(normDist * Math.PI * 2) * event.intensity;
    const angle = Math.atan2(y - event.epicenterY, x - event.epicenterX);

    return {
      dx: Math.cos(angle) * factor * 5.0,
      dy: Math.sin(angle) * factor * 5.0,
      heightShift: (1.0 - normDist) * 20.0 * event.intensity
    };
  }

  public computeSolarStormEffects(event: CataclysmEvent): { energyBlackout: boolean; forceFieldInversion: boolean; visionReduction: number } {
    if (event.type !== 'SOLAR_STORM') return { energyBlackout: false, forceFieldInversion: false, visionReduction: 1.0 };
    return {
      energyBlackout: Math.random() < 0.3 * event.intensity,
      forceFieldInversion: event.remainingFrames % 20 < 10,
      visionReduction: Math.max(0.2, 1.0 - 0.7 * event.intensity)
    };
  }
}
