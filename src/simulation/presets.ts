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
