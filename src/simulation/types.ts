export interface Vector2D {
  x: number;
  y: number;
}

export type BehaviorState = 'WANDERING' | 'SEEKING_ENERGY' | 'EVADING_HAZARD' | 'REPRODUCING';

export interface Microbot {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number; // Angle in radians
  speed: number; // Trait: max speed (units/frame)
  turnSpeed: number; // Trait: max rotation rate (rad/frame)
  visionRadius: number; // Trait: vision distance
  maxBattery: number; // Trait: battery capacity
  battery: number; // Current battery level
  energyEfficiency: number; // Trait: multiplier reducing battery loss per unit movement (0.5 - 2.0)
  age: number; // Frames lived
  generation: number;
  parentId: string | null;
  offspringCount: number;
  hue: number; // Visual color hue (0 - 360)
  color: string; // HSL formatted string
  trail: Vector2D[];
  behaviorState: BehaviorState;
  energyCollected: number; // Total energy collected in life
}

export interface EnergyParticle {
  id: string;
  x: number;
  y: number;
  value: number; // Energy restored upon collection
  radius: number;
}

export interface HazardZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  pulsePhase: number;
}

export interface SimulationConfig {
  isPaused: boolean;
  simSpeed: number;
  startPopulation: number;
  maxPopulation: number;
  mutationRate: number; // 0.01 - 0.5
  energySpawnRate: number; // 1 - 20 particles per second
  batteryDrainMultiplier: number; // 0.2 - 3.0
  hazardCount: number; // 0 - 15
  showVision: boolean;
  showTrails: boolean;
}

export interface HistoryDataPoint {
  time: number;
  population: number;
  births: number;
  deaths: number;
  avgSpeed: number;
  avgVision: number;
  avgEfficiency: number;
}

export interface SimulationStats {
  currentPopulation: number;
  highestGen: number;
  totalBirths: number;
  totalDeaths: number;
  avgSpeed: number;
  avgVisionRadius: number;
  avgEnergyEfficiency: number;
  history: HistoryDataPoint[];
}
