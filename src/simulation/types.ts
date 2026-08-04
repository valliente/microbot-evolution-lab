export type BehaviorState = 'WANDERING' | 'SEEKING_ENERGY' | 'EVADING_HAZARD' | 'REPRODUCING' | 'HUNTING_PREY' | 'INFECTED';
export type WeatherEvent = 'CLEAR' | 'SOLAR_FLARE' | 'TOXIC_DRIFT' | 'RESOURCE_BLOOM';
export type CatastropheType = 'NONE' | 'METEOR_STRIKE' | 'VOID_RIFT' | 'RADIATION_STORM' | 'MAGNETIC_INVERSION' | 'SOLAR_FLARE';
export type BrushMode = 'NONE' | 'PAINT_FOOD' | 'PAINT_HAZARD' | 'PAINT_SPEED_FIELD';
export type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
export type ResourceType = 'NUTRIENT_DOT' | 'SUPER_CHARGER' | 'MUTAGEN_ORB';
export type HeatmapOverlayMode = 'OFF' | 'MORTALITY' | 'FOOD_DENSITY' | 'TRAFFIC';

export type BiomeType = 'NORMAL' | 'TOXIC_SLUDGE' | 'CRYO_ZONE' | 'HIGH_G_FIELD';

export interface SectorBiome {
  id: string;
  type: BiomeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface EnvironmentalDisaster {
  type: CatastropheType;
  active: boolean;
  intensity: number;
  durationLeft: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export type SuperpositionState = 'OBSERVED' | 'ENTANGLED' | 'DECAYING';

export interface QuantumAllele {
  geneId: string;
  baseValue: number;
  quantumVariance: number; // Potential variance range when in superposition
  state: SuperpositionState;
  entanglementPartnerId?: string; // ID of another microbot this gene is entangled with
  observationProbability: number; // Chance to collapse to a beneficial state
}

export interface QuantumGenome {
  speedAllele: QuantumAllele;
  visionAllele: QuantumAllele;
  efficiencyAllele: QuantumAllele;
  mutationTendency: QuantumAllele;
  adhesionGene?: QuantumAllele;
}

export interface EpigeneticMarker {
  geneId: string;
  activationLevel: number; // 0.0 to 1.0 (modulation scale)
  heritability: number; // 0.0 to 1.0 (chance to pass to offspring)
  stressThreshold: number; // Environmental stress index required to trigger
}

export interface PheromonePoint {
  x: number;
  y: number;
  intensity: number;
  color: string;
}

export interface MeteorStrike {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  progress: number; // 0 to 1
}

export interface VoidRift {
  id: string;
  x: number;
  y: number;
  radius: number;
  pullForce: number;
}

export interface PortalNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  linkedId: string;
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
  enzymeType?: 'SUGRASE' | 'LIPASE' | 'MUTAGENASE';
  epigeneticStress?: number;
  radiationExposure?: number;
  temperature?: number;
  symbiontPartnerId?: string | null;
  isParasite?: boolean;
  mass?: number;
  drag?: number;
  hue: number;
  color: string;
  generation: number;
  parentId: string | null;
  offspringCount: number;
  age: number;
  behaviorState: BehaviorState;
  energyCollected: number;
  isPredator: boolean;
  isInfected?: boolean;
  infectionTimer?: number;
  hasAntibodies?: boolean;
  trail: Vector2D[];
  batteryHistory: number[];
  genome?: QuantumGenome;
  epigenome?: EpigeneticMarker[];
  carnivoreGene?: number;
  huntingSkill?: number;
  pheromoneLevel?: number;
  symbiosisGene?: number;
  biomeAdaptation?: BiomeType;
  teleportCooldown?: number;
  armorGene?: number;
  inkGlandGene?: number;
  inkCooldown?: number;
  panicGene?: number;
  panicTimer?: number;
  clusterId?: string;
  boundTo?: string[];
  clusterOffset?: { x: number; y: number };
  nasBrain?: import('./genetics/NASBrainManager').NASBrainGenome;
  organelles?: Organelle[];
  mitochondrialDNA?: MitochondrialDNA;
  speciesId?: number;
  isHybrid?: boolean;
  fertility?: number;
}

export type OrganelleType = 'MITOCHONDRIA' | 'CHLOROPLAST' | 'FLAGELLA_BOOSTER';

export interface MitochondrialDNA {
  sequence: string;
  efficiencyBonus: number;
  mutationRateMultiplier: number;
  inheritedFromId: string | null;
}

export interface Organelle {
  id: string;
  type: OrganelleType;
  x: number;
  y: number;
  energyOutput: number;
  absorptionRadius: number;
  mitochondrialDNA?: MitochondrialDNA;
}

export interface EnergyParticle {
  id: string;
  x: number;
  y: number;
  value: number;
  radius: number;
  type: ResourceType;
  color: string;
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

export interface GravityWell {
  id: string;
  x: number;
  y: number;
  radius: number;
  force: number;
}

export interface FluidZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  baseDrag: number;
  isNonNewtonian: boolean;
}

export interface CatalystZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  targetGene: string;
  mutationDirection: number;
}

export interface ParasiticSpore {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hostId: string | null;
  life: number;
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
  targetFPS: number;
  isPaused: boolean;
  showSensoryRings: boolean;
  showMovementTrails: boolean;
  showTargetVectors: boolean;
  showEnergyForceLines: boolean;
  showSensoryRaycasts: boolean;
  showPheromoneTrails: boolean;
  isSplitView: boolean;
  weatherEvent: WeatherEvent;
  brushMode: BrushMode;
  heatmapMode: HeatmapOverlayMode;
  currentSeason: Season;
  autoSeasonCycle: boolean;
  enableFrameInterpolation: boolean;
  headlessMode: boolean;
  showTerrainContour: boolean;
  autoDisastersEnabled: boolean;
  disasterScheduleInterval: number; // Interval in frames
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
  predatorCount: number;
  infectedCount: number;
  shannonDiversityIndex: number;
  currentSeason: Season;
  seasonProgressPct: number;
  actualTPS: number;
  populationHistory: number[];
  birthHistory: number[];
  deathHistory: number[];
  stressHistory: Float32Array;
  trophicEnergyRingBuffer?: Float32Array;
  speedHistogram: number[];
  visionHistogram: number[];
  efficiencyHistogram: number[];
  diversityBuckets: number[];
  speciationDiversityRingBuffer?: Float32Array;
  biomePopulation: Record<string, number>;
  historyTimeline: {
    time: number;
    population: number;
    avgSpeed: number;
    avgVision: number;
    diversity: number;
  }[];
}
