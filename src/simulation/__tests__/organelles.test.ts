import { describe, it, expect } from 'vitest';
import { OrganelleEngine } from '../organelles/OrganelleEngine';
import { Microbot, Organelle } from '../types';

describe('OrganelleEngine', () => {
  it('should detect organelle absorption on contact', () => {
    const mockBot: Microbot = {
      id: 'bot1',
      x: 10,
      y: 10,
      vx: 0,
      vy: 0,
      heading: 0,
      speed: 1,
      maxSpeed: 3,
      turnRate: 0.1,
      visionRadius: 40,
      battery: 100,
      maxBattery: 100,
      energyEfficiency: 1,
      hue: 120,
      color: '#34d399',
      generation: 1,
      parentId: null,
      offspringCount: 0,
      age: 10,
      behaviorState: 'WANDERING',
      energyCollected: 0,
      isPredator: false,
      trail: [],
      batteryHistory: []
    };

    const mockOrganelle: Organelle = {
      id: 'org1',
      type: 'MITOCHONDRIA',
      x: 12,
      y: 12,
      energyOutput: 10,
      absorptionRadius: 15,
      mitochondrialDNA: {
        sequence: 'ATCG',
        efficiencyBonus: 1.25,
        mutationRateMultiplier: 1.0,
        inheritedFromId: null
      }
    };

    const isContact = OrganelleEngine.checkAbsorption(mockBot, mockOrganelle);
    expect(isContact).toBe(true);

    OrganelleEngine.absorbOrganelle(mockBot, mockOrganelle);
    expect(mockBot.organelles?.length).toBe(1);
    expect(mockBot.mitochondrialDNA?.sequence).toBe('ATCG');
  });

  it('should correctly inherit and transmit mitochondrial DNA', () => {
    const parentBot: Microbot = {
      id: 'parent1',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      heading: 0,
      speed: 1,
      maxSpeed: 3,
      turnRate: 0.1,
      visionRadius: 40,
      battery: 100,
      maxBattery: 100,
      energyEfficiency: 1,
      hue: 120,
      color: '#34d399',
      generation: 1,
      parentId: null,
      offspringCount: 1,
      age: 50,
      behaviorState: 'REPRODUCING',
      energyCollected: 100,
      isPredator: false,
      trail: [],
      batteryHistory: [],
      mitochondrialDNA: {
        sequence: 'GCTA',
        efficiencyBonus: 1.5,
        mutationRateMultiplier: 1.0,
        inheritedFromId: null
      }
    };

    const childMtDNA = OrganelleEngine.transmitMitochondrialDNA(parentBot, 0.05);
    expect(childMtDNA).toBeDefined();
    expect(childMtDNA?.inheritedFromId).toBe('parent1');
  });
});
