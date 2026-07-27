import { SimulationConfig } from '../simulation/types';

const STORAGE_KEY = 'microbot_evolution_lab_config';

export const defaultConfig: SimulationConfig = {
  startPopulation: 45,
  maxPopulation: 250,
  mutationRate: 0.15,
  energySpawnRate: 4.0,
  maxEnergyParticles: 120,
  hazardCount: 3,
  batteryDrainMultiplier: 1.0,
  simSpeed: 1.0,
  isPaused: false,
  showSensoryRings: true,
  showMovementTrails: true,
  showTargetVectors: true,
  showEnergyForceLines: true,
  showSensoryRaycasts: true,
  weatherEvent: 'CLEAR',
  brushMode: 'NONE'
};

export function loadConfigFromStorage(): SimulationConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return { ...defaultConfig, ...JSON.parse(data), isPaused: false };
    }
  } catch (e) {
    console.error('Failed to load config from storage:', e);
  }
  return { ...defaultConfig };
}

export function saveConfigToStorage(config: SimulationConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config to storage:', e);
  }
}
