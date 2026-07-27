export type BehaviorState = 'WANDERING' | 'SEEKING_ENERGY' | 'EVADING_HAZARD' | 'REPRODUCING';
export type WeatherEvent = 'CLEAR' | 'SOLAR_FLARE' | 'TOXIC_DRIFT' | 'RESOURCE_BLOOM';
export type BrushMode = 'NONE' | 'PAINT_FOOD' | 'PAINT_HAZARD' | 'PAINT_SPEED_FIELD';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Microbot {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number;
  speed: number;
  maxSpeed: number;
  turnRate: number;
  visionRadius: number;
  battery: number;
  maxBattery: number;
  energyEfficiency: number;
  hue: number;
  color: string;
  generation: number;
  parentId: string | null;
  offspringCount: number;
  age: number;
  behaviorState: BehaviorState;
  energyCollected: number;
  trail: Vector2D[];
  batteryHistory: number[]; // Ring buffer for selected bot battery trend
}

export interface EnergyParticle {
  id: string;
  x: number;
  y: number;
  value: number;
  radius: number;
}

export interface HazardZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  damageRate: number;
  vx?: number;
  vy?: number;
}

export interface SpeedField {
  id: string;
  x: number;
  y: number;
  radius: number;
  multiplier: number;
}

export interface SimulationConfig {
  startPopulation: number;
  maxPopulation: number;
  mutationRate: number;
  energySpawnRate: number;
  maxEnergyParticles: number;
  hazardCount: number;
  batteryDrainMultiplier: number;
  simSpeed: number;
  isPaused: boolean;
  showSensoryRings: boolean;
  showMovementTrails: boolean;
  showTargetVectors: boolean;
  showEnergyForceLines: boolean;
  showSensoryRaycasts: boolean;
  weatherEvent: WeatherEvent;
  brushMode: BrushMode;
}

export interface SimulationStats {
  currentPopulation: number;
  generationCount: number;
  energyParticleCount: number;
  avgSpeed: number;
  avgVision: number;
  avgEfficiency: number;
  totalDeaths: number;
  totalBirths: number;
  populationHistory: number[];
  birthHistory: number[];
  deathHistory: number[];
  speedHistogram: number[];
  visionHistogram: number[];
  efficiencyHistogram: number[];
  diversityBuckets: number[];
  historyTimeline: {
    time: number;
    population: number;
    avgSpeed: number;
    avgVision: number;
  }[];
}
