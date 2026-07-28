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
  showSensoryRings: false,
  showMovementTrails: true,
  showTargetVectors: false,
  showEnergyForceLines: false,
  showSensoryRaycasts: false,
  showPheromoneTrails: false,
  isSplitView: false,
  weatherEvent: 'CLEAR',
  brushMode: 'NONE',
  heatmapMode: 'OFF',
  currentSeason: 'SPRING',
  autoSeasonCycle: true,
  enableFrameInterpolation: true,
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
