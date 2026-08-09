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
}
