export type BehaviorState = 'WANDERING' | 'SEEKING_ENERGY' | 'EVADING_HAZARD' | 'REPRODUCING';

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
  historyTimeline: {
    time: number;
    population: number;
    avgSpeed: number;
    avgVision: number;
  }[];
}
