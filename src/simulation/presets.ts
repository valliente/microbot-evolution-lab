import { SimulationConfig } from './types';

const BaseConfig: SimulationConfig = {
  startPopulation: 100,
  maxPopulation: 500,
  mutationRate: 0.05,
  energySpawnRate: 15,
  maxEnergyParticles: 300,
  hazardCount: 12,
  batteryDrainMultiplier: 1.0,
  simSpeed: 1,
  targetFPS: 60,
  isPaused: false,
  showMovementTrails: true,
  showTargetVectors: false,
  showEnergyForceLines: false,
  showSensoryRaycasts: false,
  showPheromoneTrails: false,
  showSensoryRings: false,
  isSplitView: false,
  showTerrainContour: true,
  enableFrameInterpolation: true,
  headlessMode: false,
  brushMode: 'NONE',
  heatmapMode: 'OFF',
  weatherEvent: 'CLEAR',
  currentSeason: 'SPRING',
  autoSeasonCycle: true,
  autoDisastersEnabled: false,
  disasterScheduleInterval: 1800
};

export const QuantumApexPreset: SimulationConfig = {
  ...BaseConfig,
  startPopulation: 150,
  maxPopulation: 600,
  mutationRate: 0.15,
  energySpawnRate: 20,
  maxEnergyParticles: 400,
  hazardCount: 5, // Lower hazards to focus on pure genetic apex climbing
  batteryDrainMultiplier: 0.8, // Slightly easier survival to encourage advanced traits
};

export const DisasterSandboxPreset: SimulationConfig = {
  ...BaseConfig,
  startPopulation: 80,
  maxPopulation: 300,
  mutationRate: 0.3, // High mutation for adaptation
  energySpawnRate: 10,
  maxEnergyParticles: 200, // Scarce food
  hazardCount: 25, // Extreme hazards
  batteryDrainMultiplier: 1.5, // Harsh environment
};

export const WASMMorphingPreset: SimulationConfig = {
  ...BaseConfig,
  startPopulation: 200,
  maxPopulation: 1000,
  mutationRate: 0.1,
  energySpawnRate: 30,
  maxEnergyParticles: 600,
  hazardCount: 8,
  batteryDrainMultiplier: 1.0
};
  maxEnergyParticles: 300,
  hazardCount: 15, 
  batteryDrainMultiplier: 1.2,
  showPheromoneTrails: true,
  autoDisastersEnabled: true,
  disasterScheduleInterval: 1200
};

export const SyntheticChaosPreset: SimulationConfig = {
  ...BaseConfig,
  startPopulation: 200,
  maxPopulation: 500,
  mutationRate: 0.25,
  energySpawnRate: 20,
  maxEnergyParticles: 400,
  hazardCount: 15,
  batteryDrainMultiplier: 1.2,
};

export const NASOrganelleSwarmPreset: SimulationConfig = {
  ...BaseConfig,
  startPopulation: 180,
  maxPopulation: 600,
  mutationRate: 0.2,
  energySpawnRate: 25,
  maxEnergyParticles: 450,
  hazardCount: 10,
  batteryDrainMultiplier: 1.0,
};

export const SpeciationSymbiosisPreset: SimulationConfig = {
  ...BaseConfig,
  startPopulation: 250,
  maxPopulation: 800,
  mutationRate: 0.25,
  energySpawnRate: 30,
  maxEnergyParticles: 500,
  hazardCount: 12,
  batteryDrainMultiplier: 1.1,
  showPheromoneTrails: true,
};

export const ZeroFailureEpigeneticsPreset: SimulationConfig = {
  ...BaseConfig,
  startPopulation: 200,
  maxPopulation: 750,
  mutationRate: 0.18,
  energySpawnRate: 25,
  maxEnergyParticles: 450,
  hazardCount: 18,
  batteryDrainMultiplier: 1.05,
  showPheromoneTrails: true,
  autoDisastersEnabled: true,
  disasterScheduleInterval: 1500
};
