import { expect, test, describe } from 'vitest';
import { SpeciationManager } from '../SpeciationManager';
import { Microbot } from '../../types';

describe('SpeciationManager', () => {
  test('Allele Distance checks for exact identical bots', () => {
    const p1 = {
      id: '1', genome: {
        speed: { value: 1.0, isDominant: true, state: 'ACTIVE' },
        size: { value: 2.0, isDominant: true, state: 'ACTIVE' },
        metabolism: { value: 0.5, isDominant: true, state: 'ACTIVE' },
        aggression: { value: 0.1, isDominant: true, state: 'ACTIVE' }
      }
    } as Microbot;

    const p2 = {
      id: '2', genome: {
        speed: { value: 1.0, isDominant: true, state: 'ACTIVE' },
        size: { value: 2.0, isDominant: true, state: 'ACTIVE' },
        metabolism: { value: 0.5, isDominant: true, state: 'ACTIVE' },
        aggression: { value: 0.1, isDominant: true, state: 'ACTIVE' }
      }
    } as Microbot;

    const manager = SpeciationManager.getInstance();
    const distance = manager.calculateAlleleDistance(p1, p2);
    expect(distance).toBe(0);
    expect(manager.canMate(p1, p2)).toBe(true);
  });

  test('Allele Distance rejects mating when threshold exceeded', () => {
    const p1 = {
      id: '1', genome: {
        speed: { value: 1.0, isDominant: true, state: 'ACTIVE' },
        size: { value: 2.0, isDominant: true, state: 'ACTIVE' },
        metabolism: { value: 0.5, isDominant: true, state: 'ACTIVE' },
        aggression: { value: 0.1, isDominant: true, state: 'ACTIVE' }
      }
    } as Microbot;

    // Vastly different genome
    const p2 = {
      id: '2', genome: {
        speed: { value: 5.0, isDominant: true, state: 'ACTIVE' },
        size: { value: 10.0, isDominant: true, state: 'ACTIVE' },
        metabolism: { value: 2.5, isDominant: true, state: 'ACTIVE' },
        aggression: { value: 1.0, isDominant: true, state: 'ACTIVE' }
      }
    } as Microbot;

    const manager = SpeciationManager.getInstance();
    const distance = manager.calculateAlleleDistance(p1, p2);
    expect(distance).toBeGreaterThan(manager.config.speciationThreshold);
    expect(manager.canMate(p1, p2)).toBe(false);
  });

  test('Hybrid infertility applies penalty correctly', () => {
    const manager = SpeciationManager.getInstance();
    
    // Normal bot
    const p1 = {
      id: '1', 
      isHybrid: false,
      fertility: 1.0,
      genome: {}
    } as Microbot;

    // Hybrid bot
    const p2 = {
      id: '2', 
      isHybrid: true,
      fertility: manager.config.hybridInfertilityPenalty,
      genome: {}
    } as Microbot;

    expect(manager.getFertilityFactor(p1)).toBe(1.0);
    expect(manager.getFertilityFactor(p2)).toBeLessThan(1.0);
  });
});
