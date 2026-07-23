import { SimulationConfig } from '../simulation/types';

const STORAGE_KEY = 'microbot_simulation_config_v2';

export const DEFAULT_CONFIG: SimulationConfig = {
  isPaused: false,
  simSpeed: 1.2,
  startPopulation: 45,
  maxPopulation: 300,
  mutationRate: 0.18,
  energySpawnRate: 8.0,
  batteryDrainMultiplier: 1.0,
  hazardCount: 4,
  showVision: true,
  showTrails: true
};

export function loadConfigFromStorage(): SimulationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed, isPaused: false };
  } catch (err) {
    console.warn('Failed to load simulation settings from localStorage:', err);
    return DEFAULT_CONFIG;
  }
}

export function saveConfigToStorage(config: SimulationConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save simulation settings to localStorage:', err);
  }
}
