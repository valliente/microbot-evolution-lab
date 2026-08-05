import { EpigeneticMarker } from '../types';

export class EpigeneticEngine {
  private static instance: EpigeneticEngine;
  private globalStressIndex: number = 0;
  
  // High-performance typed array for real-time telemetry rendering (capacity: 1000 data points)
  public stressHistory: Float32Array = new Float32Array(1000);
  public markerBuffer: Float32Array = new Float32Array(3000); // 1000 bots x 3 markers
  private historyIndex: number = 0;
  private maxHistory: number = 1000;
  
  private defaultMarkers: Map<string, EpigeneticMarker> = new Map();
  private activeEpigeneticProfiles: Map<string, EpigeneticMarker[]> = new Map();

  private constructor() {
    this.initDefaultMarkers();
  }

  private initDefaultMarkers(): void {
    this.defaultMarkers.set('STRESS_SPEED_BOOST', {
      geneId: 'SPEED',
      activationLevel: 0.0,
      heritability: 0.75,
      stressThreshold: 0.4
    });
    this.defaultMarkers.set('STRESS_EFFICIENCY_BOOST', {
      geneId: 'EFFICIENCY',
      activationLevel: 0.0,
      heritability: 0.60,
      stressThreshold: 0.5
    });
    this.defaultMarkers.set('RADIATION_DEFENSE', {
      geneId: 'ARMOR',
      activationLevel: 0.0,
      heritability: 0.80,
      stressThreshold: 0.6
    });
  }

  public getDefaultMarkers(): EpigeneticMarker[] {
    return Array.from(this.defaultMarkers.values()).map(m => ({ ...m }));
  }

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
  
  public modulateGeneExpression(bot: import('../types').Microbot, stressIndex: number): void {
    if (!bot.epigenome) {
      bot.epigenome = this.getDefaultMarkers();
    }

    for (const marker of bot.epigenome) {
      if (stressIndex >= marker.stressThreshold) {
        marker.activationLevel = Math.min(1.0, marker.activationLevel + 0.05 * stressIndex);
      } else {
        marker.activationLevel = Math.max(0.0, marker.activationLevel - 0.01);
      }

      // Apply modulation multiplier to microbot physical traits
      if (marker.geneId === 'SPEED' && marker.activationLevel > 0) {
        bot.speed = Math.min(10.0, bot.maxSpeed * (1 + 0.25 * marker.activationLevel));
      } else if (marker.geneId === 'EFFICIENCY' && marker.activationLevel > 0) {
        bot.energyEfficiency = Math.min(3.0, bot.energyEfficiency * (1 + 0.2 * marker.activationLevel));
      } else if (marker.geneId === 'ARMOR' && marker.activationLevel > 0) {
        bot.armorGene = Math.min(0.9, (bot.armorGene || 0) + 0.05 * marker.activationLevel);
      }
    }
  }

  public inheritEpigenome(parentMarkers: EpigeneticMarker[], decayRate: number = 0.85): EpigeneticMarker[] {
    return parentMarkers.map(marker => {
      const passedOn = Math.random() < marker.heritability;
      return {
        ...marker,
        activationLevel: passedOn ? marker.activationLevel * decayRate : 0.0
      };
    });
  }

  public packMarkerBuffer(microbots: import('../types').Microbot[]): Float32Array {
    let offset = 0;
    for (let i = 0; i < microbots.length && offset < 3000; i++) {
      const markers = microbots[i].epigenome || [];
      this.markerBuffer[offset++] = markers[0]?.activationLevel || 0;
      this.markerBuffer[offset++] = markers[1]?.activationLevel || 0;
      this.markerBuffer[offset++] = markers[2]?.activationLevel || 0;
    }
    return this.markerBuffer.subarray(0, offset);
  }

  public getStressHistory(): Float32Array {
    // Return an ordered copy starting from the oldest element
    const ordered = new Float32Array(this.maxHistory);
    ordered.set(this.stressHistory.subarray(this.historyIndex), 0);
    ordered.set(this.stressHistory.subarray(0, this.historyIndex), this.maxHistory - this.historyIndex);
    return ordered;
  }
}
