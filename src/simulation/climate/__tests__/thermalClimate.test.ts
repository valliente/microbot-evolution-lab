import { describe, it, expect } from 'vitest';
import { AtmosphericCycleManager } from '../AtmosphericCycleManager';

describe('Thermal Climate & Insulation Genes', () => {
  it('calculates thermal drag during freezing temperatures', () => {
    const manager = new AtmosphericCycleManager();
    manager.currentCondition.temperatureCelsius = -10;

    const dragSpeed = manager.calculateThermalMobilityDrag(2.0);
    expect(dragSpeed).toBeLessThan(2.0);
  });

  it('calculates insulation gene effectiveness in heatwaves', () => {
    const manager = new AtmosphericCycleManager();
    manager.currentCondition.temperatureCelsius = 40;

    const efficiency = manager.calculateInsulationEfficiency(0.8, 0.2);
    expect(efficiency).toBeGreaterThan(0.5);
  });
});
