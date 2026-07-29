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
  targetFPS: 60,
  isPaused: false,
  showSensoryRings: true,
  showMovementTrails: true,
  showTargetVectors: true,
  showEnergyForceLines: true,
  showSensoryRaycasts: true,
  showPheromoneTrails: true,
  isSplitView: false,
  weatherEvent: 'CLEAR',
  brushMode: 'NONE',
  heatmapMode: 'OFF',
  currentSeason: 'SPRING',
  autoSeasonCycle: false,
  enableFrameInterpolation: true,
  headlessMode: false,
  showTerrainContour: false
};

export function loadConfigFromStorage(): SimulationConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const sanitized: any = { ...defaultConfig };
      for (const key in parsed) {
        if (key in defaultConfig && typeof parsed[key] === typeof (defaultConfig as any)[key]) {
          sanitized[key] = parsed[key];
        }
      }
      sanitized.isPaused = false;
      return sanitized as SimulationConfig;
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
